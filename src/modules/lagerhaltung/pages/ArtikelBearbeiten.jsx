import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artikelService } from "@/modules/lagerhaltung/services/ArtikelService";

export default function ArtikelBearbeiten() {
    const { id } = useParams(); // Artikel-ID aus der URL
    const navigate = useNavigate();

    const [artikel, setArtikel] = useState({
        artikelname: "",
        einheit: "",
        kategorie: "",
        zustand: 0,
        beschreibung: "",
        mindestbestand: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Artikel laden beim Start
    useEffect(() => {
        const loadArtikel = async () => {
            try {
                const data = await artikelService.getById(id);
                setArtikel(data);
            } catch (err) {
                console.error("Fehler beim Laden des Artikels:", err);
                setError("Artikel konnte nicht geladen werden.");
            } finally {
                setLoading(false);
            }
        };
        loadArtikel();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setArtikel({ ...artikel, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await artikelService.update(id, artikel);
            alert("Artikel erfolgreich aktualisiert!");
            navigate("/lager-uebersicht");
        } catch (err) {
            console.error("Fehler beim Aktualisieren des Artikels:", err);
            setError("Aktualisierung fehlgeschlagen.");
        }
    };

    if (loading) return <p>Lade Artikel...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>Artikel bearbeiten</h1>
            <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Artikelname:</label>
                    <input
                        type="text"
                        name="artikelname"
                        value={artikel.artikelname}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Einheit:</label>
                    <select
                        name="einheit"
                        value={artikel.einheit}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px" }}
                    >
                        <option value="kg">kg</option>
                        <option value="Liter">Liter</option>
                        <option value="Stück">Stück</option>
                    </select>
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Kategorie:</label>
                    <select
                        name="kategorie"
                        value={artikel.kategorie}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px" }}
                    >
                        <option value="Dünger">Dünger</option>
                        <option value="Ersatzteile">Ersatzteile</option>
                        <option value="Sonstiges">Sonstiges</option>
                    </select>
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Zustand:</label>
                    <select
                        name="zustand"
                        value={artikel.zustand}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px" }}
                    >
                        <option value={0}>Flüssig</option>
                        <option value={1}>Fest</option>
                        <option value={2}>Gas</option>
                    </select>
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Beschreibung:</label>
                    <textarea
                        name="beschreibung"
                        value={artikel.beschreibung}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Mindestbestand:</label>
                    <input
                        type="number"
                        name="mindestbestand"
                        value={artikel.mindestbestand}
                        onChange={handleChange}
                        min="0"
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <button type="submit" style={{ padding: "10px 20px" }}>
                    Speichern
                </button>
            </form>
        </div>
    );
}
