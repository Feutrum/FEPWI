import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { lagerService } from "@/modules/lagerhaltung/services/lagerService";
import { bestandService } from "@/modules/lagerhaltung/services/bestandService";

export default function LagerortDetails() {
    const { state } = useLocation(); // erwartet optional state.preselectId

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [lagerorte, setLagerorte] = useState([]);     // [{id,lagername,standort,beschreibung}]
    const [bestandsRows, setBestandsRows] = useState([]); // [{lagerortId,artikelId,artikelname,einheit,menge,lagername}]
    const [selectedId, setSelectedId] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErr(null);
            try {
                const [l, b] = await Promise.all([
                    lagerService.getAll(),
                    bestandService.getAll()
                ]);
                setLagerorte(Array.isArray(l) ? l : []);
                setBestandsRows(Array.isArray(b) ? b : []);
            } catch (e) {
                setErr(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!lagerorte.length) return;
        if (selectedId) return;

        const fromState = state?.preselectId ? String(state.preselectId) : "";
        const exists = fromState && lagerorte.some(l => String(l.id) === fromState);

        setSelectedId(exists ? fromState : String(lagerorte[0].id));
    }, [lagerorte, state, selectedId]);

    const selected = useMemo(() => {
        if (!selectedId) return null;
        return lagerorte.find(l => String(l.id) === String(selectedId)) || null;
    }, [lagerorte, selectedId]);

    const rowsForSelected = useMemo(() => {
        if (!selectedId) return [];
        return bestandsRows
            .filter(r => String(r.lagerortId) === String(selectedId))
            .sort((a, b) =>
                (a.artikelname || "").localeCompare(b.artikelname || "")
            );
    }, [bestandsRows, selectedId]);

    const sumByUnit = useMemo(() => {
        const m = new Map();
        for (const r of rowsForSelected) {
            const unit = r.einheit || "";
            const qty = Number(r.menge || 0);
            m.set(unit, (m.get(unit) || 0) + qty);
        }
        return Array.from(m.entries())
            .map(([u, s]) => `${Number.isInteger(s) ? s : String(s).replace(".", ",")} ${u}`.trim())
            .join(", ");
    }, [rowsForSelected]);

    return (
        <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 12, opacity: 0.8 }}>
                    Lagerort auswählen
                </label>
                <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    style={{ padding: 8, minWidth: 260 }}
                >
                    {lagerorte.map(l => (
                        <option key={String(l.id)} value={String(l.id)}>
                            {l.lagername}
                        </option>
                    ))}
                </select>
            </div>

            {loading && <p>Lade Daten…</p>}
            {err && <p style={{ color: "crimson" }}>Fehler: {String(err?.message || err)}</p>}
            {!loading && !err && !selected && <p>Kein Lager ausgewählt.</p>}

            {!loading && !err && selected && (
                <>
                    <h2 style={{ marginBottom: 8 }}>{selected.lagername}</h2>
                    <div style={{ marginBottom: 16, opacity: 0.9 }}>
                        <div><strong>Standort:</strong> {selected.standort || "—"}</div>
                        <div><strong>Beschreibung:</strong> {selected.beschreibung || "—"}</div>
                        <div style={{ marginTop: 6 }}>
                            <strong>Bestands-Summe:</strong>{" "}
                            {rowsForSelected.length} Position(en){sumByUnit ? ` • ${sumByUnit}` : ""}
                        </div>
                    </div>

                    <h3 style={{ marginBottom: 8 }}>Artikelbestand</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr style={{ backgroundColor: "#f5f5f5" }}>
                            <th style={th}>Artikel</th>
                            <th style={th}>Menge</th>
                            <th style={th}>Einheit</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rowsForSelected.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ padding: 12, textAlign: "center" }}>
                                    Keine Bestandspositionen an diesem Lagerort.
                                </td>
                            </tr>
                        ) : (
                            rowsForSelected.map(r => (
                                <tr key={`${r.lagerortId}-${r.artikelId}`} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={td}>{r.artikelname}</td>
                                    <td style={td}>{r.menge}</td>
                                    <td style={td}>{r.einheit}</td>
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

const th = { border: "1px solid #ddd", padding: 8, textAlign: "left" };
const td = { border: "1px solid #ddd", padding: 8 };
