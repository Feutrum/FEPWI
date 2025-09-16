import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { bestandService } from "@/modules/lagerhaltung/services/bestandService";
import { artikelService } from "@/modules/lagerhaltung/services/artikelService";

export default function BestandUebersicht() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [rowsAll, setRowsAll] = useState([]);   // <- flache Bestandszeilen
    const [artikel, setArtikel] = useState([]);   // optional für Mindestbestand

    const selArticle = searchParams.get("article") || ""; // artikelId als String
    const selLager   = searchParams.get("lager") || "";   // lagerortId als String

    const updateParam = (k, v) => {
        const next = new URLSearchParams(searchParams);
        if (!v) next.delete(k); else next.set(k, v);
        setSearchParams(next);
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErr(null);
            try {
                const [best, arts] = await Promise.all([
                    bestandService.getAll(),   // <- nutzt jetzt Strapi korrekt
                    artikelService.list({})    // für mindestbestand/einheit (optional)
                ]);
                setRowsAll(best);            // [{ artikelId, lagerortId, artikelname, einheit, lagername, menge }]
                setArtikel(Array.isArray(arts) ? arts : (arts?.data ?? []));
            } catch (e) {
                setErr(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const artById = useMemo(() => {
        const m = new Map();
        for (const a of artikel) {
            const id = a?.id ?? a?.attributes?.id ?? null;
            if (id != null) m.set(String(id), a?.attributes ?? a);
        }
        return m;
    }, [artikel]);

    // Filter anwenden
    const filtered = rowsAll.filter(r => {
        const byArt   = !selArticle || String(r.artikelId) === selArticle;
        const byLager = !selLager   || String(r.lagerortId) === selLager;
        return byArt && byLager;
    });

    // Optionen
    const artikelOptions = useMemo(() => {
        const seen = new Map();
        for (const r of rowsAll) {
            const label = r.einheit ? `${r.artikelname} (${r.einheit})` : r.artikelname;
            if (!seen.has(String(r.artikelId))) {
                seen.set(String(r.artikelId), { value: String(r.artikelId), label });
            }
        }
        return [{ value: "", label: "Alle Artikel" }, ...Array.from(seen.values())];
    }, [rowsAll]);

    const lagerOptions = useMemo(() => {
        const seen = new Map();
        for (const r of rowsAll) {
            if (!seen.has(String(r.lagerortId))) {
                seen.set(String(r.lagerortId), { value: String(r.lagerortId), label: r.lagername });
            }
        }
        return [{ value: "", label: "Alle Lagerorte" }, ...Array.from(seen.values())];
    }, [rowsAll]);

    // Summen je Einheit (über gefilterte Zeilen)
    const sumByUnit = useMemo(() => {
        const m = new Map();
        for (const r of filtered) {
            m.set(r.einheit, (m.get(r.einheit) || 0) + Number(r.menge || 0));
        }
        return Array.from(m.entries())
            .map(([u, s]) => `${Number.isInteger(s) ? s : String(s).replace(".", ",")} ${u || ""}`.trim())
            .join(", ");
    }, [filtered]);

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 12 }}>Bestand – Übersicht</h2>

            {/* Filter */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr auto", gap: 12, marginBottom: 12, alignItems: "end", maxWidth: 900 }}>
                <div>
                    <label style={label}>Artikel</label>
                    <select value={selArticle} onChange={(e) => updateParam("article", e.target.value)} style={input}>
                        {artikelOptions.map(o => <option key={o.value || "all"} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                <div>
                    <label style={label}>Lagerort</label>
                    <select value={selLager} onChange={(e) => updateParam("lager", e.target.value)} style={input}>
                        {lagerOptions.map(o => <option key={o.value || "all"} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { const next = new URLSearchParams(searchParams); ["article","lager"].forEach(k => next.delete(k)); setSearchParams(next); }} style={{ padding: "8px 12px" }}>
                        Zurücksetzen
                    </button>
                </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom: 8, opacity: 0.8 }}>
                {filtered.length} Position(en){sumByUnit ? ` • Summe: ${sumByUnit}` : ""}
            </div>
            {loading && <p>Lade Bestand…</p>}
            {err && <p style={{ color: "crimson" }}>Fehler: {String(err?.message || err)}</p>}

            {/* Tabelle */}
            {!loading && !err && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th style={th}>Artikel</th>
                        <th style={th}>Lagerort</th>
                        <th style={th}>Menge</th>
                        <th style={th}>Einheit</th>
                        <th style={th}>Mindestbestand</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: 12, textAlign: "center" }}>Keine Bestandspositionen.</td></tr>
                    ) : (
                        filtered.map((r) => {
                            const stammdat = artById.get(String(r.artikelId));
                            const min = stammdat?.mindestbestand ?? stammdat?.attributes?.mindestbestand ?? "–";
                            return (
                                <tr key={`${r.lagerortId}-${r.artikelId}`} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={td}>{r.artikelname}</td>
                                    <td style={td}>{r.lagername}</td>
                                    <td style={td}>{r.menge}</td>
                                    <td style={td}>{r.einheit}</td>
                                    <td style={td}>{min}</td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const th = { border: "1px solid #ddd", padding: 8, textAlign: "left" };
const td = { border: "1px solid #ddd", padding: 8 };
const label = { display: "block", marginBottom: 6, fontSize: 12, opacity: 0.8 };
const input = { padding: 8, width: "100%" };
