import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { artikelService } from "@/modules/lagerhaltung/services/artikelService";

export default function ArtikelUebersicht() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [items, setItems] = useState([]);

    // URL -> State
    const category = searchParams.get("category") || "";
    const state = searchParams.get("state") || "";
    const q = searchParams.get("q") || "";

    // Fixe Kategorien
    const categoryOptions = [
        { value: "", label: "Alle Kategorien" },
        { value: "Dünger", label: "Dünger" },
        { value: "Ersatzteil", label: "Ersatzteil" },
        { value: "Saatgut", label: "Saatgut" },
    ];

    // Fixe Zustände (Aggregatzustand)
    const zustandOptions = [
        { value: "", label: "Alle Zustände" },
        { value: "fest", label: "Fest" },
        { value: "fluessig", label: "Flüssig" },
        { value: "gas", label: "Gas" },
    ];

    // Daten laden
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErr(null);
            try {
                const data = await artikelService.list({ category, state, q });
                setItems(data);
            } catch (e) {
                setErr(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [category, state, q]);

    // URL-Parameter aktualisieren
    const updateParam = (key, val) => {
        const next = new URLSearchParams(searchParams);
        if (val === "" || val == null) next.delete(key);
        else next.set(key, val);
        setSearchParams(next);
    };

    // Suche mit Delay
    const [qInput, setQInput] = useState(q);
    useEffect(() => setQInput(q), [q]);
    useEffect(() => {
        const t = setTimeout(() => {
            if (qInput !== q) updateParam("q", qInput.trim());
        }, 300);
        return () => clearTimeout(t);
    }, [qInput]); // eslint-disable-line react-hooks/exhaustive-deps

    const resetFilters = () => {
        const next = new URLSearchParams(searchParams);
        ["category", "state", "q"].forEach((k) => next.delete(k));
        setSearchParams(next);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 16 }}>Artikel-Übersicht</h2>

            {/* Filter */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 2fr auto",
                    gap: 12,
                    marginBottom: 16,
                }}
            >
                <select
                    aria-label="Kategorie filtern"
                    value={category}
                    onChange={(e) => updateParam("category", e.target.value)}
                    style={{ padding: 8 }}
                >
                    {categoryOptions.map((o) => (
                        <option key={o.value || "all"} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Zustand filtern"
                    value={state}
                    onChange={(e) => updateParam("state", e.target.value)}
                    style={{ padding: 8 }}
                >
                    {zustandOptions.map((o) => (
                        <option key={o.value || "all"} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    aria-label="Artikelname suchen"
                    placeholder="Artikelname suchen…"
                    value={qInput}
                    onChange={(e) => setQInput(e.target.value)}
                    style={{ padding: 8 }}
                />

                <button onClick={resetFilters} style={{ padding: "8px 12px" }}>
                    Zurücksetzen
                </button>
            </div>

            {/* Status */}
            {loading && <p>Lade Artikel…</p>}
            {err && <p style={{ color: "crimson" }}>Fehler: {String(err?.message || err)}</p>}

            {/* Tabelle */}
            {!loading && !err && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th style={th}>Artikelname</th>
                        <th style={th}>Kategorie</th>
                        <th style={th}>Zustand</th>
                        <th style={th}>Einheit</th>
                        <th style={th}>Mindestbestand</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ padding: 12, textAlign: "center" }}>
                                Keine Artikel gefunden.
                            </td>
                        </tr>
                    ) : (
                        items.map((it) => {
                            const name =
                                it.artikelname ??
                                it.name ??
                                it.attributes?.artikelname ??
                                it.attributes?.name ??
                                "";
                            const kat =
                                it.kategorie ??
                                it.attributes?.kategorie ??
                                it.attributes?.kategorie?.name ??
                                "";
                            const zustandVal =
                                it.zustand ?? it.attributes?.zustand ?? it.state ?? "";
                            const einheit =
                                it.einheit ?? it.attributes?.einheit ?? it.unit ?? "";
                            const min =
                                it.mindestbestand ??
                                it.attributes?.mindestbestand ??
                                it.minStock ??
                                "";

                            // Label für Aggregatzustand
                            let zustandLabel;
                            switch (String(zustandVal).toLowerCase()) {
                                case "fest":
                                    zustandLabel = "Fest";
                                    break;
                                case "fluessig":
                                case "flüssig":
                                    zustandLabel = "Flüssig";
                                    break;
                                case "gas":
                                    zustandLabel = "Gas";
                                    break;
                                default:
                                    zustandLabel = zustandVal || "";
                            }

                            return (
                                <tr key={it.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={td}>{name}</td>
                                    <td style={td}>{kat}</td>
                                    <td style={td}>{zustandLabel}</td>
                                    <td style={td}>{einheit}</td>
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

