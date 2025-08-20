import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bestandService } from "@/modules/lagerhaltung/services/BestandService";
import { artikelService } from "@/modules/lagerhaltung/services/artikelService";
import { lagerService } from "@/modules/lagerhaltung/services/lagerService";

export default function BestandBearbeiten() {
    const { id } = useParams(); // ID aus URL
    const navigate = useNavigate();

    const [artikel, setArtikel] = useState([]);
    const [lagerorte, setLagerorte] = useState([]);
    const [bestand, setBestand] = useState({
        artikel: "",
        lagerort: "",
        menge: 0
    });

    useEffect(() => {
        // Artikel & Lagerorte laden
        const loadData = async () => {
            try {
                const artikelData = await artikelService.getAll();
                const lagerData = await lagerService.getAll();
                setArtikel(artikelData);
                setLagerorte(lagerData);

                if (id) {
                    // bestehenden Bestand laden
                    const existing = await bestandService.getById(id);
                    setBestand({
                        artikel: existing.attributes.artikel?.data?.id || "",
                        lagerort: existing.attributes.lagerort?.data?.id || "",
                        menge: existing.attributes.menge || 0
                    });
                }
            } catch (err) {
                console.error("Fehler beim Laden:", err);
            }
        };
        loadData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBestand((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await bestandService.update(id, bestand);
            } else {
                await bestandService.create(bestand);
            }
            // Nach Speichern zurück zur Übersicht
            navigate("/lagerhaltung/lager-uebersicht");
        } catch (err) {
            console.error("Fehler beim Speichern:", err);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>{id ? "Bestand bearbeiten" : "Bestand anlegen"}</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>

                <label>Artikel</label>
                <select name="artikel" value={bestand.artikel} onChange={handleChange} required>
                    <option value="">-- bitte wählen --</option>
                    {artikel.map((a) => (
                        <option key={a.id} value={a.id}>{a.attributes.artikelname}</option>
                    ))}
                </select>

                <label>Lagerort</label>
                <select name="lagerort" value={bestand.lagerort} onChange={handleChange} required>
                    <option value="">-- bitte wählen --</option>
                    {lagerorte.map((l) => (
                        <option key={l.id} value={l.id}>{l.attributes.lagername}</option>
                    ))}
                </select>

                <label>Menge</label>
                <input
                    type="number"
                    name="menge"
                    value={bestand.menge}
                    onChange={handleChange}
                    min="0"
                    required
                />

                <button type="submit">Speichern</button>
            </form>
        </div>
    );
}
