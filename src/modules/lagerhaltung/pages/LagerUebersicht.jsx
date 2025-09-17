import React, { useEffect, useMemo, useState } from "react";
import { lagerService } from "@/modules/lagerhaltung/services/lagerService";
import { bestandService } from "@/modules/lagerhaltung/services/bestandService";
import { artikelService } from "@/modules/lagerhaltung/services/artikelService";

export default function LagerUebersicht() {
    const [lagerorte, setLagerorte] = useState([]);
    const [stock, setStock] = useState([]);     // [{lagerortId, artikelId, artikelname, einheit, menge, lagername}]
    const [artikel, setArtikel] = useState([]); // [{id, mindestbestand, einheit, ...}]
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [q, setQ] = useState(""); // Suche

    // Initial laden
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErr(null);
            try {
                const [l, s, a] = await Promise.all([
                    lagerService.getAll(),
                    bestandService.getAll(),
                    artikelService.getAll()
                ]);
                setLagerorte(Array.isArray(l) ? l : []);
                setStock(Array.isArray(s) ? s : []);
                setArtikel(Array.isArray(a) ? a : []);
            } catch (e) {
                setErr(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Map: Artikel-ID -> Mindestbestand/Einheit
    const artikelMinById = useMemo(() => {
        const m = new Map();
        for (const a of artikel) {
            m.set(String(a.id), {
                min: Number(a.mindestbestand ?? 0) || 0,
                einheit: a.einheit || ""
            });
        }
        return m;
    }, [artikel]);

    // Aggregation: je Lager
    const summaryByLager = useMemo(() => {
        const map = new Map();
        for (const r of stock) {
            const id = String(r.lagerortId);
            if (!map.has(id)) map.set(id, { positions: 0, unitSums: new Map(), warnCount: 0 });
            const entry = map.get(id);

            entry.positions += 1;

            const unit = r.einheit || "";
            const qty  = Number(r.menge || 0);
            entry.unitSums.set(unit, (entry.unitSums.get(unit) || 0) + qty);

            const artMeta = artikelMinById.get(String(r.artikelId));
            if (artMeta && qty < Number(artMeta.min || 0)) {
                entry.warnCount += 1;
            }
        }
        return map;
    }, [stock, artikelMinById]);

    // Gesamtsummen (Fußzeile)
    const totalSummary = useMemo(() => {
        const unitSums = new Map();
        let positions = 0;
        for (const r of stock) {
            positions += 1;
            const unit = r.einheit || "";
            const qty  = Number(r.menge || 0);
            unitSums.set(unit, (unitSums.get(unit) || 0) + qty);
        }
        return { positions, unitSums };
    }, [stock]);

    // Suche/Filter
    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return lagerorte;
        return lagerorte.filter(l =>
            String(l.lagername || "").toLowerCase().includes(needle) ||
            String(l.standort || "").toLowerCase().includes(needle)
        );
    }, [lagerorte, q]);

    const renderBestandSummaryFor = (lagerId) => {
        const entry = summaryByLager.get(String(lagerId));
        if (!entry) return "—";
        const parts = Array.from(entry.unitSums.entries()).map(([unit, sum]) =>
            `${Number.isInteger(sum) ? sum : String(sum).replace(".", ",")} ${unit || ""}`.trim()
        );
        return `${entry.positions} Positionen • ${parts.join(", ")}`;
    };

    const renderTotalSummary = () => {
        const parts = Array.from(totalSummary.unitSums.entries()).map(([unit, sum]) =>
            `${Number.isInteger(sum) ? sum : String(sum).replace(".", ",")} ${unit || ""}`.trim()
        );
        return `${totalSummary.positions} Positionen • ${parts.join(", ")}`;
    };

    // CSV-Export der aktuell gefilterten Tabelle
    const onExportCsv = () => {
        const headers = ["Lagername", "Standort", "Beschreibung", "Positionen", "Summen", "Warnungen"];
        const rows = filtered.map((l) => {
            const entry = summaryByLager.get(String(l.id));
            const positions = entry?.positions ?? 0;
            const sums = entry
                ? Array.from(entry.unitSums.entries()).map(([u, s]) => `${s} ${u}`).join(", ")
                : "";
            const warns = entry?.warnCount ?? 0;
            return [l.lagername || "", l.standort || "", l.beschreibung || "", positions, sums, warns];
        });
        const escape = (v) => {
            const s = String(v ?? "");
            return s.includes(";") || s.includes('"') || s.includes("\n")
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        };
        const csv = [headers, ...rows].map(r => r.map(escape).join(";")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "lageruebersicht.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 12 }}>Lagerorte</h2>

            {/* Toolbar (ohne Neu laden) */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <input
                    type="text"
                    placeholder="Suchen… (Name, Standort)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{ padding: 8, minWidth: 280 }}
                />
                <button onClick={onExportCsv} style={{ padding: "8px 12px" }}>
                    Export CSV
                </button>
            </div>

            {loading && <p>Lade Lagerorte…</p>}
            {err && <p style={{ color: "crimson" }}>Fehler: {String(err?.message || err)}</p>}

            {!loading && !err && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th style={th}>Lagername</th>
                        <th style={th}>Standort</th>
                        <th style={th}>Beschreibung</th>
                        <th style={th}>Bestand</th>
                        <th style={th}>Warnungen</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ padding: 12, textAlign: "center" }}>
                                Keine Lagerorte gefunden.
                            </td>
                        </tr>
                    ) : (
                        filtered.map((l) => {
                            const entry = summaryByLager.get(String(l.id));
                            const warnCount = entry?.warnCount ?? 0;
                            return (
                                <tr
                                    key={l.id}
                                    style={{
                                        borderBottom: "1px solid #eee",
                                        background: warnCount > 0 ? "#fff8f8" : "transparent"
                                    }}
                                >
                                    <td style={td}>{l.lagername}</td>
                                    <td style={td}>{l.standort}</td>
                                    <td style={td}>{l.beschreibung}</td>
                                    <td style={td}>{renderBestandSummaryFor(l.id)}</td>
                                    <td style={td}>
                                        {warnCount > 0 ? (
                                            <span style={badgeWarn}>⚠ {warnCount}</span>
                                        ) : (
                                            <span style={{ opacity: 0.6 }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    {/* Gesamtsummen-Fuß */}
                    {filtered.length > 0 && (
                        <tr style={{ background: "#fafafa", fontWeight: 600 }}>
                            <td style={td} colSpan={3}>Gesamt</td>
                            <td style={td}>{renderTotalSummary()}</td>
                            <td style={td}></td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const th = { border: "1px solid #ddd", padding: 8, textAlign: "left" };
const td = { border: "1px solid #ddd", padding: 8 };
const badgeWarn = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 12,
    background: "#ffebee",
    color: "#c62828",
    border: "1px solid #ffcdd2",
    fontWeight: 600
};
