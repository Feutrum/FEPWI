import React, { useEffect, useMemo, useState } from "react";
import { artikelService } from "@/modules/lagerhaltung/services/ArtikelService";
import { bestandService } from "@/modules/lagerhaltung/services/BestandService";

export default function Warnungen() {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [artikel, setArtikel] = useState([]); // [{id, artikelname, einheit, mindestbestand, ...}]
    const [bestandsRows, setBestandsRows] = useState([]); // [{artikelId, menge, einheit, lagerortId, ...}]

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErr(null);
            try {
                const [arts, stocks] = await Promise.all([
                    artikelService.getAll(),
                    bestandService.getAll()
                ]);
                console.debug("[Warnungen] artikel.count", arts.length, arts[0]);
                console.debug("[Warnungen] bestand.count", stocks.length, stocks[0]);
                setArtikel(Array.isArray(arts) ? arts : []);
                setBestandsRows(Array.isArray(stocks) ? stocks : []);
            } catch (e) {
                setErr(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Summe pro Artikel-ID (String-Key, damit Vergleiche sicher funktionieren)
    const sumByArtikelId = useMemo(() => {
        const m = new Map(); // key: String(artikelId) -> { sum: number, einheit: string }
        for (const r of bestandsRows) {
            const key = r?.artikelId != null ? String(r.artikelId) : null;
            if (!key) continue; // ohne Artikel-ID ignorieren
            const prev = m.get(key) || { sum: 0, einheit: r.einheit || "" };
            const qty = Number(r.menge || 0) || 0;
            // Einheit beibehalten, falls gesetzt
            if (!prev.einheit && r.einheit) prev.einheit = r.einheit;
            m.set(key, { sum: prev.sum + qty, einheit: prev.einheit });
        }
        // Debug: erste 5 Keys
        for (const [k, v] of Array.from(m.entries()).slice(0, 5)) {
            console.debug("[Warnungen] sumByArtikelId", k, v);
        }
        return m;
    }, [bestandsRows]);

    // Zeilen für Tabelle: nur Artikel unter Mindestbestand
    const rows = useMemo(() => {
        const out = [];
        for (const a of artikel) {
            const key = String(a.id);
            const agg = sumByArtikelId.get(key) || { sum: 0, einheit: a.einheit || "" };
            const current = Number(agg.sum || 0);
            const min = Number(a.mindestbestand || 0);
            const unit = a.einheit || agg.einheit || "";

            if (current < min) {
                out.push({
                    id: a.id,
                    artikelname: a.artikelname,
                    einheit: unit,
                    mindestbestand: min,
                    aktuellerBestand: current,
                    differenz: current - min
                });
            }
        }
        // sortiere: größte Unterschreitung zuerst
        out.sort((x, y) => (x.differenz) - (y.differenz));
        console.debug("[Warnungen] unterMindestbestand.count", out.length, out[0]);
        return out;
    }, [artikel, sumByArtikelId]);

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 12 }}>Mindestbestand – Warnungen</h2>

            {loading && <p>Lade Daten…</p>}
            {err && <p style={{ color: "crimson" }}>Fehler: {String(err?.message || err)}</p>}

            {!loading && !err && (
                <>
                    <div style={{ marginBottom: 8, opacity: 0.85 }}>
                        {rows.length} Artikel unter Mindestbestand
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr style={{ backgroundColor: "#fff2f2" }}>
                            <th style={th}>Artikel</th>
                            <th style={th}>Aktueller Bestand</th>
                            <th style={th}>Mindestbestand</th>
                            <th style={th}>Einheit</th>
                            <th style={th}>Diff.</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: 12, textAlign: "center" }}>
                                    Keine Warnungen – alle Mindestbestände erfüllt.
                                </td>
                            </tr>
                        ) : (
                            rows.map(r => (
                                <tr key={r.id} style={{ borderBottom: "1px solid #eee", background: "#fffafa" }}>
                                    <td style={td}><strong>{r.artikelname}</strong></td>
                                    <td style={{ ...td, color: "#c62828" }}>{fmt(r.aktuellerBestand)}</td>
                                    <td style={td}>{fmt(r.mindestbestand)}</td>
                                    <td style={td}>{r.einheit}</td>
                                    <td style={{ ...td, color: "#c62828" }}>{fmt(r.differenz)}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}

function fmt(n) {
    return Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
}

const th = { border: "1px solid #ddd", padding: 8, textAlign: "left" };
const td = { border: "1px solid #ddd", padding: 8 };
