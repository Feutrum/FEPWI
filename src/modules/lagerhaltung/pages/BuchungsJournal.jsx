import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { artikelService } from "@/modules/lagerhaltung/services/ArtikelService";
import { lagerService } from "@/modules/lagerhaltung/services/LagerService";
import { buchungService } from "@/modules/lagerhaltung/services/BuchungService";

export default function BuchungsJournal() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [items, setItems] = useState([]);        // Buchungen
    const [artikelOpts, setArtikelOpts] = useState([]);
    const [lagerOpts, setLagerOpts] = useState([]);

    // URL-Parameter -> State
    const article = searchParams.get("article") || "";
    const lager = searchParams.get("lager") || "";
    const from = searchParams.get("from") || "";   // YYYY-MM-DD
    const to = searchParams.get("to") || "";       // YYYY-MM-DD

    // Helper: URL-Parameter setzen/entfernen
    const updateParam = (key, val) => {
        const next = new URLSearchParams(searchParams);
        if (!val) next.delete(key);
        else next.set(key, val);
        setSearchParams(next);
    };

    // Stammdaten (Artikel/Lagerorte) laden
    useEffect(() => {
        const loadMeta = async () => {
            try {
                const [arts, lgs] = await Promise.all([
                    artikelService.list({}),   // nur aktive, falls so im Service implementiert
                    lagerService.getAll()
                ]);
                const artsOpts = (Array.isArray(arts) ? arts : []).map(a => ({
                    value: a.id ?? a?.attributes?.id ?? a?.artikelId,
                    label:
                        a.artikelname ??
                        a.name ??
                        a?.attributes?.artikelname ??
                        a?.attributes?.name ??
                        String(a.id ?? "")
                })).filter(x => x.value != null);

                const lgsOpts = (Array.isArray(lgs) ? lgs : []).map(l => ({
                    value: l.id,
                    label: l.lagername ?? l.name ?? String(l.id)
                })).filter(x => x.value != null);

                setArtikelOpts([{ value: "", label: "Alle Artikel" }, ...artsOpts]);
                setLagerOpts([{ value: "", label: "Alle Lagerorte" }, ...lgsOpts]);
            } catch (e) {
                // Stammdaten-Fehler nicht blockierend behandeln
                console.warn("Stammdaten konnten nicht geladen werden:", e);
            }
        };
        loadMeta();
    }, []);

    // Buchungen laden bei Filteränderung
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErr(null);
            try {
                const data = await buchungService.list({
                    articleId: article || undefined,
                    lagerortId: lager || undefined,
                    from: from || undefined,
                    to: to || undefined
                });
                setItems(Array.isArray(data) ? data : (data?.data ?? []));
            } catch (e) {
                setErr(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [article, lager, from, to]);

    // CSV-Export (Client-seitig) – exportiert die aktuell gefilterte Tabelle
    const onExportCsv = () => {
        const headers = [
            "Datum",
            "Typ",
            "Artikel",
            "Lagerort",
            "Menge",
            "Einheit",
            "Kommentar"
        ];

        const rows = items.map(b => {
            const d = getDate(b);
            const t = getType(b);
            const a = getArticleName(b);
            const l = getLagerName(b);
            const q = getQty(b);
            const u = getUnit(b);
            const c = getComment(b);
            return [d, t, a, l, q, u, c];
        });

        // Semikolon-getrennt (Excel-DE) + BOM
        const csv = [headers, ...rows]
            .map(line => line.map(escapeCsv).join(";"))
            .join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });

        const ts = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const fname = `buchungen_${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}.csv`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const filteredCountText = useMemo(() => `${items.length} Buchung(en)`, [items]);

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 12 }}>Buchungsjournal</h2>

            {/* Filterleiste */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr auto",
                    gap: 12,
                    marginBottom: 12,
                    alignItems: "end"
                }}
            >
                <div>
                    <label style={label}>Artikel</label>
                    <select
                        value={article}
                        onChange={(e) => updateParam("article", e.target.value)}
                        style={input}
                    >
                        {artikelOpts.map(o => (
                            <option key={String(o.value)} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={label}>Lagerort</label>
                    <select
                        value={lager}
                        onChange={(e) => updateParam("lager", e.target.value)}
                        style={input}
                    >
                        {lagerOpts.map(o => (
                            <option key={String(o.value)} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={label}>Von</label>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => updateParam("from", e.target.value)}
                        style={input}
                    />
                </div>

                <div>
                    <label style={label}>Bis</label>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => updateParam("to", e.target.value)}
                        style={input}
                    />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onExportCsv} style={{ padding: "8px 12px" }}>
                        Export CSV
                    </button>
                    <button onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        ["article","lager","from","to"].forEach(k => next.delete(k));
                        setSearchParams(next);
                    }} style={{ padding: "8px 12px" }}>
                        Zurücksetzen
                    </button>
                </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom: 8, opacity: 0.8 }}>{filteredCountText}</div>
            {loading && <p>Lade Buchungen…</p>}
            {err && <p style={{ color: "crimson" }}>Fehler: {String(err?.message || err)}</p>}

            {/* Tabelle */}
            {!loading && !err && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th style={th}>Datum</th>
                        <th style={th}>Typ</th>
                        <th style={th}>Artikel</th>
                        <th style={th}>Lagerort</th>
                        <th style={th}>Menge</th>
                        <th style={th}>Einheit</th>
                        <th style={th}>Kommentar</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ padding: 12, textAlign: "center" }}>
                                Keine Buchungen gefunden.
                            </td>
                        </tr>
                    ) : (
                        items.map((b) => (
                            <tr key={getRowKey(b)} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={td}>{getDate(b)}</td>
                                <td style={td}>{getType(b)}</td>
                                <td style={td}>{getArticleName(b)}</td>
                                <td style={td}>{getLagerName(b)}</td>
                                <td style={td}>{getQty(b)}</td>
                                <td style={td}>{getUnit(b)}</td>
                                <td style={td}>{getComment(b)}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// ===== Helpers =====
const th = { border: "1px solid #ddd", padding: 8, textAlign: "left" };
const td = { border: "1px solid #ddd", padding: 8 };
const label = { display: "block", marginBottom: 6, fontSize: 12, opacity: 0.8 };
const input = { padding: 8, width: "100%" };

function escapeCsv(v) {
    const s = String(v ?? "");
    if (s.includes(";") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

function getRowKey(b) {
    return b.id ?? b?.attributes?.id ?? [
        getDate(b),
        getType(b),
        getArticleName(b),
        getLagerName(b),
        getQty(b)
    ].join("|");
}

function getDate(b) {
    const raw =
        b?.datum ??
        b?.date ??
        b?.attributes?.datum ??
        b?.attributes?.date ??
        b?.createdAt ??
        b?.attributes?.createdAt ??
        "";
    if (!raw) return "";
    try {
        // Zeige nur Datum (lokal)
        const d = new Date(raw);
        if (isNaN(d)) return String(raw);
        return d.toLocaleDateString();
    } catch {
        return String(raw);
    }
}

function getType(b) {
    const t = b?.typ ?? b?.type ?? b?.attributes?.typ ?? b?.attributes?.type ?? "";
    // Optionale “schönere” Labels
    if (String(t).toLowerCase() === "eingang") return "Eingang";
    if (String(t).toLowerCase() === "ausgang") return "Ausgang";
    if (String(t).toLowerCase() === "korrektur") return "Korrektur";
    return t;
}

function getArticleName(b) {
    //Strukturen (plain, Strapi relational)
    return (
        b?.artikel?.artikelname ??
        b?.artikelname ??
        b?.attributes?.artikel?.data?.attributes?.artikelname ??
        b?.attributes?.artikelname ??
        b?.attributes?.artikel?.data?.attributes?.name ??
        b?.artikel?.name ??
        ""
    );
}

function getLagerName(b) {
    return (
        b?.lagerort?.lagername ??
        b?.lagername ??
        b?.attributes?.lagerort?.data?.attributes?.lagername ??
        b?.attributes?.lagername ??
        b?.lagerort?.name ??
        ""
    );
}

function getQty(b) {
    return b?.menge ?? b?.quantity ?? b?.attributes?.menge ?? b?.attributes?.quantity ?? "";
}

function getUnit(b) {
    return b?.einheit ?? b?.unit ?? b?.attributes?.einheit ?? b?.attributes?.unit ?? "";
}

function getComment(b) {
    return b?.kommentar ?? b?.comment ?? b?.attributes?.kommentar ?? b?.attributes?.comment ?? "";
}
