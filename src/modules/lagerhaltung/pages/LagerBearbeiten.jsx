import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { lagerService } from "@/modules/lagerhaltung/services/lagerService";

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

const dangerBtn = {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid #c62828",
    background: "#ef5350",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
};

const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 15,
};

const label = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, opacity: 0.9 };

function flatObj(x) {
    if (!x) return null;
    const id = x.id ?? x?.data?.id ?? null;
    const a  = x.attributes ?? x?.data?.attributes ?? x ?? {};
    return {
        id,
        lagername: a.lagername ?? "",
        standort: a.standort ?? "",
        beschreibung: a.beschreibung ?? "",
    };
}

function mergeOverlay(base) {
    const list = [...base];
    try {
        const overlay = JSON.parse(localStorage.getItem("mock:storage:custom") || "[]");
        const byId = new Map();
        for (const it of list) {
            if (it?.id != null) {
                byId.set(String(it.id), it);
            }
        }
        for (const o of overlay) {
            if (o?.id != null) {
                byId.set(String(o.id), { ...byId.get(String(o.id)), ...o });
            }
        }
        return Array.from(byId.values());
    } catch {
        return list;
    }
}


export default function LagerBearbeiten() {
    const { id: routeId } = useParams();
    const [alle, setAlle] = useState([]);          // alle Lagerorte (vereinfacht)
    const [selectedId, setSelectedId] = useState(""); // ID aus Dropdown
    const [form, setForm] = useState({ lagername: "", standort: "", beschreibung: "" });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [isErr, setIsErr] = useState(false);

    // Laden + auf Overlay-Events reagieren
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const raw = await lagerService.getAll();
                const base = (Array.isArray(raw) ? raw : raw?.data ?? []).map(flatObj).filter(Boolean);
                const merged = mergeOverlay(base);
                merged.sort((a,b) => (a.lagername||"").localeCompare(b.lagername||"") || (a.standort||"").localeCompare(b.standort||""));
                setAlle(merged);
                // Route-ID vorwählen
                if (routeId && !selectedId) {
                    const has = merged.some(x => String(x.id) === String(routeId));
                    if (has) setSelectedId(String(routeId));
                }
            } finally {
                setLoading(false);
            }
        };
        load();
        const onOverlay = () => load();
        window.addEventListener("mock-storage-updated", onOverlay);
        return () => window.removeEventListener("mock-storage-updated", onOverlay);
    }, [routeId, selectedId]);

    // Auswahl -> Formular füllen
    useEffect(() => {
        if (!selectedId) {
            setForm({ lagername: "", standort: "", beschreibung: "" });
            return;
        }
        const cur = alle.find(x => String(x.id) === String(selectedId));
        if (cur) {
            setForm({ lagername: cur.lagername, standort: cur.standort, beschreibung: cur.beschreibung });
        }
    }, [selectedId, alle]);

    const options = useMemo(() => {
        return alle.map(l => ({
            value: String(l.id),
            label: `${l.lagername || "(ohne Namen)"} -- ${l.standort || "(ohne Standort)"}`
        }));
    }, [alle]);

    const onChangeField = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
    };

    // Overlay-Helpers für Mock-Fallback
    const readOverlay = () => JSON.parse(localStorage.getItem("mock:storage:custom") || "[]");
    const writeOverlay = (arr) => {
        localStorage.setItem("mock:storage:custom", JSON.stringify(arr));
        window.dispatchEvent(new Event("mock-storage-updated"));
    };

    const onSave = async (e) => {
        e.preventDefault();
        setMsg(null); setIsErr(false);
        if (!selectedId) { setIsErr(true); setMsg("Bitte zuerst ein Lager im Dropdown auswählen."); return; }
        if (!form.lagername || !form.standort) {
            setIsErr(true); setMsg("Bitte Lagername und Standort ausfüllen."); return;
        }

        setSaving(true);
        try {
            if (typeof lagerService.update === "function") {
                await lagerService.update(selectedId, form);
            }
            setMsg("✅ Änderungen gespeichert.");
        } catch (err) {
            console.warn("lagerService.update failed – fallback to LocalStorage:", err);
            const overlay = readOverlay();
            const idx = overlay.findIndex(x => String(x.id) === String(selectedId));
            if (idx >= 0) overlay[idx] = { ...overlay[idx], ...form };
            else overlay.push({ id: Number(selectedId), ...form });
            writeOverlay(overlay);
            setMsg("✅ Änderungen lokal gespeichert (Mockmodus).");
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (!selectedId) return;
        if (!window.confirm("Diesen Lagerort wirklich löschen?")) return;

        setMsg(null); setIsErr(false);
        try {
            if (typeof lagerService.delete === "function") {
                await lagerService.delete(selectedId);
            } else {
                console.warn("delete() nicht implementiert – benutze Fallback");
                const overlay = readOverlay().filter(x => String(x.id) !== String(selectedId));
                writeOverlay(overlay);
                setMsg("🗑️ Lagerort lokal gelöscht (Mockmodus).");
            }
            setMsg("🗑️ Lagerort gelöscht.");
            setSelectedId("");
        } catch (err) {
            console.warn("lagerService.delete failed – fallback to LocalStorage:", err);
            const overlay = readOverlay().filter(x => String(x.id) !== String(selectedId));
            writeOverlay(overlay);
            setMsg("🗑️ Lagerort lokal gelöscht (Mockmodus).");
            setSelectedId("");
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 860, margin: "0 auto" }}>
            <h2 style={{ marginBottom: 12 }}>Lagerort bearbeiten</h2>

            {/* Dropdown zur Auswahl des Lagerorts */}
            <div style={{ marginBottom: 16 }}>
                <label style={label}>Lager auswählen</label>
                <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    style={inputStyle}
                >
                    <option value="">-- Lager wählen --</option>
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
                        <label style={label}>Lagername *</label>
                        <input
                            name="lagername"
                            value={form.lagername}
                            onChange={onChangeField}
                            style={inputStyle}
                            required
                            disabled={!selectedId}
                        />

                        <label style={label}>Standort *</label>
                        <input
                            name="standort"
                            value={form.standort}
                            onChange={onChangeField}
                            style={inputStyle}
                            required
                            disabled={!selectedId}
                        />
                    </div>

                    <div>
                        <label style={label}>Beschreibung</label>
                        <textarea
                            name="beschreibung"
                            rows={5}
                            value={form.beschreibung}
                            onChange={onChangeField}
                            style={{ ...inputStyle, resize: "vertical" }}
                            placeholder="optional"
                            disabled={!selectedId}
                        />
                    </div>

                    <div style={{ gridColumn: "1 / span 2", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                        <button type="button" onClick={onDelete} style={dangerBtn} disabled={!selectedId}>
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
