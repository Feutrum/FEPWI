import React, { useState } from "react";
import { lagerService } from "@/modules/lagerhaltung/services/lagerService";

const buttonStyle = {
    marginTop: "20px",
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "white",
    cursor: "pointer",
    gridColumn: "span 2",
};

const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 15,
    marginBottom: 14,
};

const label = { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, opacity: 0.9 };

export default function LagerAnlegen() {
    const [form, setForm] = useState({
        lagername: "",
        standort: "",
        beschreibung: "",
    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [isErr, setIsErr] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    async function saveLocalStorageFallback(newItem) {
        // Ermittele nächste ID (aus Service-Daten + Custom-Overlay)
        let maxId = 0;
        try {
            const existing = await lagerService.getAll();
            const list = Array.isArray(existing) ? existing : existing?.data || [];
            for (const it of list) {
                const id = Number(it?.id ?? 0);
                if (!Number.isNaN(id) && id > maxId) maxId = id;
            }
        } catch (err) {
            console.warn("Fehler beim Laden der Lagerorte in saveLocalStorageFallback:", err);
        }
        const raw = localStorage.getItem("mock:storage:custom");
        const overlay = raw ? JSON.parse(raw) : [];
        for (const it of overlay) {
            const id = Number(it?.id ?? 0);
            if (!Number.isNaN(id) && id > maxId) maxId = id;
        }
        const toStore = { id: maxId + 1, ...newItem };
        overlay.push(toStore);
        localStorage.setItem("mock:storage:custom", JSON.stringify(overlay));
        window.dispatchEvent(new Event("mock-storage-updated"));
        return toStore;
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg(null); setIsErr(false);
        if (!form.lagername || !form.standort) {
            setIsErr(true);
            setMsg("Bitte Lagername und Standort angeben.");
            return;
        }

        setSaving(true);
        try {
            // 1) normal über Service
            if (typeof lagerService.create === "function") {
                await lagerService.create(form);
                setMsg("✅ Lagerort angelegt.");
            } else {
                console.warn("create() nicht implementiert – benutze Fallback");
                await saveLocalStorageFallback(form);
                setMsg("✅ Lagerort lokal gespeichert (Mockmodus).");
            }
            setForm({ lagername: "", standort: "", beschreibung: "" });
        } catch (err) {
            // 2) Fallback: LocalStorage
            console.warn("lagerService.create failed – fallback to localStorage:", err);
            await saveLocalStorageFallback(form);
            setMsg("✅ Lagerort lokal gespeichert (Mockmodus).");
            setForm({ lagername: "", standort: "", beschreibung: "" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 820, margin: "0 auto" }}>
            <h2 style={{ marginBottom: 12 }}>Lagerort anlegen</h2>

            <form
                onSubmit={onSubmit}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
            >
                <div>
                    <label style={label}>Lagername *</label>
                    <input name="lagername" value={form.lagername} onChange={onChange} style={inputStyle} required />
                    <label style={label}>Standort *</label>
                    <input name="standort" value={form.standort} onChange={onChange} style={inputStyle} required />
                </div>

                <div>
                    <label style={label}>Beschreibung</label>
                    <textarea
                        name="beschreibung"
                        rows={5}
                        value={form.beschreibung}
                        onChange={onChange}
                        style={{ ...inputStyle, resize: "vertical" }}
                        placeholder="optional"
                    />
                </div>

                <button type="submit" style={buttonStyle} disabled={saving}>
                    {saving ? "Speichere…" : "Speichern"}
                </button>
            </form>

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
