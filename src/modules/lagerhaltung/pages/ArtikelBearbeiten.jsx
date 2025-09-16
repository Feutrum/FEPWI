// src/modules/lagerhaltung/pages/ArtikelBearbeiten.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { artikelService } from "@/modules/lagerhaltung/services/artikelService";

const input = {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 15,
};

const label = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, opacity: 0.9 };

function flatArticle(x) {
    if (!x) return null;
    const id = x.id ?? x?.data?.id ?? null;
    const a  = x.attributes ?? x?.data?.attributes ?? x ?? {};
    return {
        id,
        artikelname: a.artikelname ?? "",
        einheit: a.einheit ?? "",
        kategorie: a.kategorie ?? "",
        zustand: a.zustand ?? "",
        beschreibung: a.beschreibung ?? "",
        mindestbestand: Number(a.mindestbestand ?? 0) || 0,
        active: a.active !== false, // default true
    };
}

function mergeOverlay(base) {
    const list = [...base];
    try {
        const overlay = JSON.parse(localStorage.getItem("mock:artikels:custom") || "[]");
        // Fallback für Artikel ohne ID
        const getId = (obj) => String(obj?.id ?? obj?.attributes?.id ?? "");
        const byId = new Map(list.map(it => [getId(it), it]));
        for (const o of overlay) {
            const oid = getId(o);
            if (!oid) continue; // Artikel ohne ID überspringen
            byId.set(oid, { ...byId.get(oid), ...o });
        }
        return Array.from(byId.values());
    } catch (err) {
        console.warn("mergeOverlay failed:", err);
        return list;
    }
}


export default function ArtikelBearbeiten() {
    const { id: routeId } = useParams();

    const [all, setAll] = useState([]);        // alle Artikel (flach)
    const [selectedId, setSelectedId] = useState(""); // Auswahl im Dropdown
    const [form, setForm] = useState({
        artikelname: "", einheit: "", kategorie: "",
        zustand: "", beschreibung: "", mindestbestand: 0, active: true
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving]   = useState(false);
    const [msg, setMsg]         = useState(null);
    const [isErr, setIsErr]     = useState(false);

    // einmalig laden
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const raw = await artikelService.getAll();
                const base = (Array.isArray(raw) ? raw : raw?.data ?? []).map(flatArticle).filter(Boolean);
                const merged = mergeOverlay(base);
                merged.sort((a,b) => (a.artikelname||"").localeCompare(b.artikelname||""));
                setAll(merged);
                // Route-ID vorwählen, falls vorhanden
                if (routeId && !selectedId) {
                    const has = merged.some(x => String(x.id) === String(routeId));
                    if (has) setSelectedId(String(routeId));
                }
            } finally {
                setLoading(false);
            }
        };
        load();
        // Kein Event-Listener => vermeidet unnötige Reloads
    }, [routeId, selectedId]); // nur bei Routenwechsel neu laden

    // bei Auswahl Formular befüllen
    useEffect(() => {
        if (!selectedId) {
            setForm({ artikelname: "", einheit: "", kategorie: "", zustand: "", beschreibung: "", mindestbestand: 0, active: true });
            return;
        }
        const cur = all.find(a => String(a.id) === String(selectedId));
        if (cur) setForm({ ...cur });
    }, [selectedId, all]);

    // Dropdown-Optionen
    const options = useMemo(() => {
        return all.map(a => ({
            value: String(a.id),
            label: `${a.artikelname || "(ohne Namen)"} — ${a.einheit || "?"}`
        }));
    }, [all]);

    const onField = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(p => ({
            ...p,
            [name]: name === "mindestbestand" ? Number(value)
                : type === "checkbox" ? !!checked
                    : value
        }));
    };

    // Overlay-Helpers (Mock-Fallback)
    const readOverlay  = () => JSON.parse(localStorage.getItem("mock:artikels:custom") || "[]");
    const writeOverlay = (arr) => {
        localStorage.setItem("mock:artikels:custom", JSON.stringify(arr));
        // optionales Event, falls du anderswo lauschen willst:
        // window.dispatchEvent(new Event("mock-articles-updated"));
    };

    const onSave = async (e) => {
        e.preventDefault();
        setMsg(null);
        setIsErr(false);

        if (!selectedId) {
            setIsErr(true);
            setMsg("Bitte zuerst einen Artikel auswählen.");
            return;
        }
        if (!form.artikelname || !form.einheit || !form.kategorie || !form.zustand) {
            setIsErr(true);
            setMsg("Bitte alle Pflichtfelder ausfüllen.");
            return;
        }

        setSaving(true);

        if (typeof artikelService.update === "function") {
            try {
                await artikelService.update(selectedId, form);
                // lokale Liste aktualisieren (kein Reload)
                setAll(prev =>
                    prev.map(a =>
                        String(a.id) === String(selectedId) ? { ...a, ...form } : a
                    )
                );
                setMsg("✅ Änderungen gespeichert.");
                return;
            } catch (err) {
                console.warn("artikelService.update failed – gehe in Fallback:", err);
            }
        }

        // ---- Fallback: LocalStorage ----
        const overlay = readOverlay();
        const idx = overlay.findIndex(x => String(x.id) === String(selectedId));
        if (idx >= 0) overlay[idx] = { ...overlay[idx], ...form };
        else overlay.push({ id: Number(selectedId), ...form });
        writeOverlay(overlay);

        setAll(prev =>
            prev.map(a =>
                String(a.id) === String(selectedId) ? { ...a, ...form } : a
            )
        );
        setMsg("✅ Änderungen lokal gespeichert (Mockmodus).");

        setSaving(false);
    };


    const onDelete = async () => {
        if (!selectedId) return;
        if (!window.confirm("Diesen Artikel wirklich löschen?")) return;

        setMsg(null);
        setIsErr(false);

        if (typeof artikelService.delete === "function") {
            try {
                await artikelService.delete(selectedId);
                setAll(prev => prev.filter(a => String(a.id) !== String(selectedId)));
                setSelectedId("");
                setMsg("🗑️ Artikel gelöscht.");
                return;
            } catch (err) {
                console.warn("artikelService.delete failed – gehe in Fallback:", err);
            }
        }

        // ---- Fallback: LocalStorage ----
        const overlay = readOverlay().filter(x => String(x.id) !== String(selectedId));
        writeOverlay(overlay);
        setAll(prev => prev.filter(a => String(a.id) !== String(selectedId)));
        setSelectedId("");
        setMsg("🗑️ Artikel lokal gelöscht (Mockmodus).");
    };


    const onRevert = () => {
        if (!selectedId) return;
        const cur = all.find(a => String(a.id) === String(selectedId));
        if (cur) setForm({ ...cur });
    };

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ marginBottom: 12 }}>Artikel bearbeiten</h2>

            {/* Auswahl */}
            <div style={{ marginBottom: 16 }}>
                <label style={label}>Artikel auswählen</label>
                <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={input}>
                    <option value="">-- Artikel wählen --</option>
                    {options.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p>Lade…</p>
            ) : (
                <form onSubmit={onSave} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                        <label style={label}>Artikelname *</label>
                        <input name="artikelname" value={form.artikelname} onChange={onField} style={input} required disabled={!selectedId} />

                        <label style={label}>Einheit *</label>
                        <select name="einheit" value={form.einheit} onChange={onField} style={input} required disabled={!selectedId}>
                            <option value="">-- wählen --</option>
                            <option value="kg">kg</option>
                            <option value="l">Liter</option>
                            <option value="Stk">Stück</option>
                            <option value="Kisten">Kisten</option>
                            <option value="Rollen">Rollen</option>
                        </select>

                        <label style={label}>Kategorie *</label>
                        <select name="kategorie" value={form.kategorie} onChange={onField} style={input} required disabled={!selectedId}>
                            <option value="">-- wählen --</option>
                            <option value="Dünger">Dünger</option>
                            <option value="Ersatzteil">Ersatzteil</option>
                            <option value="Saatgut">Saatgut</option>
                        </select>
                    </div>

                    <div>
                        <label style={label}>Zustand *</label>
                        <select name="zustand" value={form.zustand} onChange={onField} style={input} required disabled={!selectedId}>
                            <option value="">-- wählen --</option>
                            <option value="fest">Fest</option>
                            <option value="fluessig">Flüssig</option>
                            <option value="gas">Gas</option>
                        </select>

                        <label style={label}>Mindestbestand</label>
                        <input type="number" name="mindestbestand" min="0" value={form.mindestbestand} onChange={onField} style={input} disabled={!selectedId} />

                        <label style={{ ...label, display: "flex", gap: 8, alignItems: "center" }}>
                            <input type="checkbox" name="active" checked={!!form.active} onChange={onField} disabled={!selectedId} />
                            Aktiv
                        </label>
                    </div>

                    <div style={{ gridColumn: "1 / span 2" }}>
                        <label style={label}>Beschreibung</label>
                        <textarea name="beschreibung" rows={4} value={form.beschreibung} onChange={onField} style={{ ...input, resize: "vertical" }} disabled={!selectedId} />
                    </div>

                    <div style={{ gridColumn: "1 / span 2", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                        <button type="button" onClick={onRevert} style={btnGhost} disabled={!selectedId}>
                            Änderungen verwerfen
                        </button>
                        <button type="button" onClick={onDelete} style={btnDanger} disabled={!selectedId}>
                            Löschen
                        </button>
                        <button type="submit" style={btnPrimary} disabled={!selectedId || saving}>
                            {saving ? "Speichere…" : "Speichern"}
                        </button>
                    </div>
                </form>
            )}

            {msg && (
                <div
                    style={{
                        marginTop: 14,
                        padding: 10,
                        borderRadius: 6,
                        border: "1px solid",
                        background: isErr ? "#fff3cd" : "#d4edda",
                        borderColor: isErr ? "#ffeeba" : "#c3e6cb",
                        color: isErr ? "#856404" : "#155724",
                    }}
                >
                    {msg}
                </div>
            )}
        </div>
    );
}


const btnPrimary = {
    padding: "14px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "white",
    cursor: "pointer",
};

const btnDanger = {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid #c62828",
    background: "#ef5350",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
};

const btnGhost = {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "#f5f5f5",
    color: "#333",
    fontWeight: 600,
    cursor: "pointer",
};