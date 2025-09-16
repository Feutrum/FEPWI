import React, { useState } from "react";
import { artikelService } from "@/modules/lagerhaltung/services/artikelService";

const KATEGORIEN = ["Dünger", "Ersatzteil", "Saatgut"];
const ZUSTAENDE = [
    { value: "fest", label: "Fest" },
    { value: "fluessig", label: "Flüssig" },
    { value: "gas", label: "Gas" },
];
const EINHEITEN = ["kg", "l", "Stk", "Kisten", "Rollen"];

export default function ArtikelAnlegen() {
    const [form, setForm] = useState({
        artikelname: "",
        einheit: "",
        kategorie: "",
        zustand: "",
        beschreibung: "",
        mindestbestand: 0,
        // active wird nicht mehr im UI angezeigt; default immer true
    });

    const [msg, setMsg] = useState(null);
    const [isErr, setIsErr] = useState(false);
    const [saving, setSaving] = useState(false);

    const onChange = (e) => {
        const { name, value} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "mindestbestand" ? Number(value) : value,
        }));
    };

    async function saveFallbackLocal(newItem) {
        try {
            // existierende Artikel für ID-Ermittlung laden
            let maxId = 0;
            try {
                const existing = await artikelService.getAll();
                if (Array.isArray(existing)) {
                    for (const it of existing) {
                        const idNum = Number(it?.id ?? 0);
                        if (!Number.isNaN(idNum) && idNum > maxId) maxId = idNum;
                    }
                }
            } catch {/* ignore */}
            const localRaw = localStorage.getItem("mock:artikels:custom");
            const localList = localRaw ? JSON.parse(localRaw) : [];
            for (const it of localList) {
                const idNum = Number(it?.id ?? 0);
                if (!Number.isNaN(idNum) && idNum > maxId) maxId = idNum;
            }

            const itemToStore = { id: maxId + 1, ...newItem, active: true };
            localList.push(itemToStore);
            localStorage.setItem("mock:artikels:custom", JSON.stringify(localList));

            setIsErr(false);
            setMsg("✅ Artikel lokal gespeichert (Mockmodus).");
            setForm({
                artikelname: "",
                einheit: "",
                kategorie: "",
                zustand: "",
                beschreibung: "",
                mindestbestand: 0,
            });
            window.dispatchEvent(new Event("mock-artikels-updated"));
        } catch (e) {
            setIsErr(true);
            setMsg("❌ Konnte weder anlegen noch lokal speichern.");
            console.error("Fallback-LocalSave fehlgeschlagen:", e);
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg(null);
        setIsErr(false);

        if (!form.artikelname || !form.einheit || !form.kategorie || !form.zustand) {
            setIsErr(true);
            setMsg("Bitte alle Pflichtfelder ausfüllen (Name, Einheit, Kategorie, Zustand).");
            return;
        }
        if (form.mindestbestand < 0) {
            setIsErr(true);
            setMsg("Mindestbestand darf nicht negativ sein.");
            return;
        }

        setSaving(true);
        try {
            // Immer aktiv speichern:
            await artikelService.create({
                artikelname: form.artikelname,
                einheit: form.einheit,
                kategorie: form.kategorie,
                zustand: form.zustand,
                beschreibung: form.beschreibung,
                mindestbestand: Number(form.mindestbestand) || 0,
                active: true, // <— erzwungen
            });

            setIsErr(false);
            setMsg("✅ Artikel erfolgreich angelegt!");
            setForm({
                artikelname: "",
                einheit: "",
                kategorie: "",
                zustand: "",
                beschreibung: "",
                mindestbestand: 0,
            });
        } catch (err) {
            console.warn("artikelService.create schlug fehl – Fallback localStorage:", err);
            await saveFallbackLocal({
                artikelname: form.artikelname,
                einheit: form.einheit,
                kategorie: form.kategorie,
                zustand: form.zustand,
                beschreibung: form.beschreibung,
                mindestbestand: Number(form.mindestbestand) || 0,
                active: true, // <— erzwungen
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={pageLayout}>
            <div style={formContainer}>
                <h2 style={{ marginBottom: 12 }}>Neuen Artikel anlegen</h2>

                <form onSubmit={onSubmit} style={gridStyle}>
                    <div>
                        <label style={label}>Artikelname *</label>
                        <input
                            name="artikelname"
                            value={form.artikelname}
                            onChange={onChange}
                            placeholder="z. B. Hydrauliköl HLP 46"
                            style={inputStyle}
                            required
                        />

                        <label style={label}>Einheit *</label>
                        <select
                            name="einheit"
                            value={form.einheit}
                            onChange={onChange}
                            style={inputStyle}
                            required
                        >
                            <option value="">-- bitte wählen --</option>
                            {EINHEITEN.map((e) => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>

                        <label style={label}>Kategorie *</label>
                        <select
                            name="kategorie"
                            value={form.kategorie}
                            onChange={onChange}
                            style={inputStyle}
                            required
                        >
                            <option value="">-- bitte wählen --</option>
                            {KATEGORIEN.map((k) => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={label}>Zustand *</label>
                        <select
                            name="zustand"
                            value={form.zustand}
                            onChange={onChange}
                            style={inputStyle}
                            required
                        >
                            <option value="">-- bitte wählen --</option>
                            {ZUSTAENDE.map((z) => (
                                <option key={z.value} value={z.value}>{z.label}</option>
                            ))}
                        </select>

                        <label style={label}>Beschreibung</label>
                        <textarea
                            name="beschreibung"
                            value={form.beschreibung}
                            onChange={onChange}
                            rows={4}
                            style={{ ...inputStyle, resize: "vertical" }}
                            placeholder="optional"
                        />

                        <label style={label}>Mindestbestand</label>
                        <input
                            type="number"
                            name="mindestbestand"
                            min={0}
                            value={form.mindestbestand}
                            onChange={onChange}
                            style={inputStyle}
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
        </div>
    );
}

/* Styles */
const pageLayout = {
    display: "flex",
    justifyContent: "center",
    maxWidth: 820,
    margin: "20px auto",
    padding: 20,
};
const formContainer = {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
};
const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
};
const label = {
    display: "block",
    fontWeight: 600,
    marginBottom: 6,
    fontSize: 13,
    opacity: 0.9,
};
const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 15,
    marginBottom: 14,
};
const buttonStyle = {
    marginTop: 6,
    width: "100%",
    padding: "14px 16px",
    fontSize: 16,
    fontWeight: 700,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    gridColumn: "span 2",
};
