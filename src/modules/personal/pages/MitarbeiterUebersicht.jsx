import React, { useState, useEffect } from 'react';
import { mitarbeiterService } from "@/modules/personal/services/mitarbeiterService";

export default function MitarbeiterUebersicht() {
    const [mitarbeiter, setMitarbeiter] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await mitarbeiterService.getAll(); // API-Aufruf
                setMitarbeiter(data);
            } catch (err) {
                console.error('Fehler beim Laden der Mitarbeiter:', err);
            }
        };
        loadData();
    }, []);


    return (
        <div style={{ padding: '20px' }}>
            <h2>Mitarbeiter-Übersicht</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Geburtsdatum</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Adresse</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Eintrittsdatum</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Gehalt</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Arbeitszeiten</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Qualifikation</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Rolle</th>
                </tr>
                </thead>
                <tbody>
                {mitarbeiter.map(m => (
                    <tr key={m.id}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.birthdate}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.adress}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.entryDate}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.salary}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.workTime}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.qualification}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.role}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
