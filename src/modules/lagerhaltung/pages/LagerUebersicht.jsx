import React, { useState, useEffect } from 'react';
import { lagerService } from "@/modules/lagerhaltung/services/lagerService";

export default function LagerortUebersicht() {
    const [lagerorte, setLagerorte] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await lagerService.getAll(); // API-Aufruf für Lagerorte + Artikel
                setLagerorte(data);
            } catch (err) {
                console.error('Fehler beim Laden der Lagerorte:', err);
            }
        };
        loadData();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Lagerort-Übersicht</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Lagername</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Standort</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Beschreibung</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Artikel</th>
                </tr>
                </thead>
                <tbody>
                {lagerorte.map(l => (
                    <tr key={l.id}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{l.lagername}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{l.standort}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{l.beschreibung}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <ul>
                                {l.artikel && l.artikel.map(a => (
                                    <li key={a.id}>
                                        {a.artikelname} – {a.menge} {a.einheit}
                                    </li>
                                ))}
                            </ul>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
