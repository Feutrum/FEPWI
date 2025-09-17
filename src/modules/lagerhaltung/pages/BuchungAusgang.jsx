import React, { useEffect, useMemo, useState } from "react";
import { artikelService } from "@/modules/lagerhaltung/services/artikelService";
import { lagerService } from "@/modules/lagerhaltung/services/lagerService";
import { buchungService } from "@/modules/lagerhaltung/services/buchungService";
import { bestandService } from "@/modules/lagerhaltung/services/bestandService";

export default function BuchungAusgang() {
    const [form, setForm] = useState({
        artikelId: "",
        lagerortId: "",
        menge: "",
        datum: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        kommentar: "",
    });

    const [artikelOpts, setArtikelOpts] = useState([]);
    const [lagerOpts, setLagerOpts] = useState([]);
    const [stock, setStock] = useState([]);

    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [isErr, setIsErr] = useState(false);

    // Stammdaten laden
    useEffect(() => {
        (async () => {
            try {
                const [arts, lgs] = await Promise.all([
                    artikelService.getAll(),
                    lagerService.getAll(),
                ]);

                const aktiveArtikel = Array.isArray(arts)
                    ? arts.filter((a) => a.active !== false)
                    : [];

                setArtikelOpts(
                    aktiveArtikel.map((a) => ({
                        value: String(a.id),
                        label: a.artikelname || String(a.id),
                    }))
                );

                setLagerOpts(
                    (Array.isArray(lgs) ? lgs : []).map((l) => ({
                        value: String(l.id),
                        label: l.lagername || String(l.id),
                    }))
                );
            } catch (e) {
                console.error("Stammdaten konnten nicht geladen werden:", e);
            }
        })();
    }, []);

    // Bestand (für Filter + Prüfungen)
    useEffect(() => {
        bestandService
            .getAll()
            .then((s) => setStock(Array.isArray(s) ? s : []))
            .catch(() => {});
    }, []);

    // Artikel nach Lagerort filtern
    const allowedIds = useMemo(() => {
        if (!form.lagerortId) return null;
        return new Set(
            stock
                .filter(
                    (r) => String(r.lagerortId) === String(form.lagerortId)
                )
                .map((r) => String(r.artikelId))
        );
    }, [stock, form.lagerortId]);

    const visibleArtikelOpts = useMemo(() => {
        if (!allowedIds) return artikelOpts;
        return artikelOpts.filter((o) => allowedIds.has(String(o.value)));
    }, [artikelOpts, allowedIds]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "menge" ? value.replace(",", ".") : value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg(null);
        setIsErr(false);

        if (!form.lagerortId || !form.artikelId || !form.menge) {
            setIsErr(true);
            setMsg("Bitte Lagerort, Artikel und Menge angeben.");
            return;
        }

        const qty = parseFloat(String(form.menge));
        if (!isFinite(qty) || qty <= 0) {
            setIsErr(true);
            setMsg("Menge muss eine positive Zahl sein.");
            return;
        }

        // Verfügbaren Bestand am Lager prüfen
        const available = stock
            .filter(
                (r) =>
                    String(r.lagerortId) === String(form.lagerortId) &&
                    String(r.artikelId) === String(form.artikelId)
            )
            .reduce((s, r) => s + (Number(r.menge) || 0), 0);

        if (qty > available) {
            setIsErr(true);
            setMsg(`Nicht genug Bestand am Lager (verfügbar: ${available}).`);
            return;
        }

        setSaving(true);
        try {
            await buchungService.createOutgoing({
                artikelId: Number(form.artikelId),
                lagerortId: Number(form.lagerortId),
                menge: qty, // positiv – Backend/Service macht ggf. Minus
                datum: form.datum || new Date().toISOString().slice(0, 10),
                kommentar: form.kommentar || "",
            });

            setIsErr(false);
            setMsg("✅ Warenausgang gebucht.");
            // Nur Menge & Kommentar zurücksetzen – Auswahl beibehalten
            setForm((prev) => ({ ...prev, menge: "", kommentar: "" }));

            // Events für Live-Reload anderer Seiten (optional)
            window.dispatchEvent(new Event("mock-buchungen-updated"));
            window.dispatchEvent(new Event("mock-bestands-updated"));
        } catch (err) {
            console.error("Fehler beim Buchen:", err);
            const backendMsg =
                err?.response?.data?.error?.message ||
                err?.response?.data?.message ||
                err?.message;
            setIsErr(true);
            setMsg(backendMsg || "❌ Warenausgang konnte nicht gebucht werden.");
        } finally {
            setSaving(false);
        }
    };

    // Hinweistext, wenn Lagerort gewählt, aber dort keine Artikel
    const showNoArticlesHint =
        !!form.lagerortId && visibleArtikelOpts.length === 0;

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 12 }}>Warenausgang buchen</h2>

            <form
                onSubmit={onSubmit}
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    maxWidth: 900,
                    alignItems: "end",
                }}
            >
                <div>
                    <label style={label}>Lagerort</label>
                    <select
                        name="lagerortId"
                        value={form.lagerortId}
                        onChange={(e) => {
                            // Lagerwechsel leert ggf. Artikel, wenn der nicht am Lager vorhanden ist
                            const nextLager = e.target.value;
                            setForm((prev) => ({
                                ...prev,
                                lagerortId: nextLager,
                                artikelId:
                                    prev.artikelId &&
                                    allowedIds &&
                                    !new Set(
                                        stock
                                            .filter((r) => String(r.lagerortId) === String(nextLager))
                                            .map((r) => String(r.artikelId))
                                    ).has(String(prev.artikelId))
                                        ? ""
                                        : prev.artikelId,
                            }));
                        }}
                        style={input}
                        required
                    >
                        <option value="">-- bitte wählen --</option>
                        {lagerOpts.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={label}>Artikel</label>
                    <select
                        name="artikelId"
                        value={form.artikelId}
                        onChange={onChange}
                        style={input}
                        disabled={!form.lagerortId}
                        required
                    >
                        <option value="">
                            {form.lagerortId ? "-- bitte wählen --" : "erst Lagerort wählen"}
                        </option>
                        {visibleArtikelOpts.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                    {showNoArticlesHint && (
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                            Am gewählten Lagerort sind keine Artikel mit Bestand vorhanden.
                        </div>
                    )}
                </div>

                <div>
                    <label style={label}>Menge</label>
                    <input
                        name="menge"
                        type="number"
                        min="0"
                        step="any"
                        value={form.menge}
                        onChange={onChange}
                        style={input}
                        placeholder="z. B. 5"
                        required
                    />
                </div>

                {/* Zeile 2 */}
                <div>
                    <label style={label}>Buchungsdatum</label>
                    <input
                        name="datum"
                        type="date"
                        value={form.datum}
                        onChange={onChange}
                        style={input}
                    />
                </div>

                <div style={{ gridColumn: "2 / span 2" }}>
                    <label style={label}>Kommentar</label>
                    <input
                        name="kommentar"
                        value={form.kommentar}
                        onChange={onChange}
                        style={input}
                        placeholder="optional"
                    />
                </div>

                {/* Zeile 3: Button separat */}
                <div
                    style={{
                        gridColumn: "1 / span 3",
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <button type="submit" disabled={saving} style={btnPrimary}>
                        {saving ? "Buchen…" : "Buchen"}
                    </button>
                </div>
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
                        maxWidth: 900,
                    }}
                >
                    {msg}
                </div>
            )}
        </div>
    );
}

const label = { display: "block", marginBottom: 6, fontSize: 12, opacity: 0.85 };
const input = { padding: 8, width: "100%" };
const btnPrimary = {
    padding: "10px 16px",
    border: "none",
    borderRadius: 8,
    background: "#1976d2",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
};
