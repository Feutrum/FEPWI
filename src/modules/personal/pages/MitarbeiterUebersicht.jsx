import React, { useState } from 'react';
//import { mitarbeiterService } from "@/modules/personal/services/mitarbeiterService";

export default function MitarbeiterUebersicht() {
    //const [mitarbeiter, setMitarbeiter] = useState([]);

    // useEffect(() => {
    //     const loadData = async () => {
    //         try {
    //             const data = await mitarbeiterService.getAll(); // API-Aufruf
    //             setMitarbeiter(data);
    //         } catch (err) {
    //             console.error('Fehler beim Laden der Mitarbeiter:', err);
    //         }
    //     };
    //     loadData();
    // }, []);

    const [mitarbeiter] = useState([
        {
            id: 1,
            name: 'Max Mustermann',
            geburtsdatum: '1985-03-12',
            adresse: 'Musterstraße 1, 12345 Musterstadt',
            eintrittsdatum: '2010-06-01',
            gehalt: '3.500 €',
            arbeitszeiten: '40 Std/Woche',
            qualifikation: 'Bachelor BWL',
            rolle: 'Projektmanager'
        },
        {
            id: 2,
            name: 'Anna Schmidt',
            geburtsdatum: '1990-07-21',
            adresse: 'Beispielweg 5, 54321 Beispielstadt',
            eintrittsdatum: '2015-09-15',
            gehalt: '3.200 €',
            arbeitszeiten: '35 Std/Woche',
            qualifikation: 'Master Informatik',
            rolle: 'Softwareentwicklerin'
        }
    ]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Mitarbeiter-Übersicht</h1>
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
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.geburtsdatum}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.adresse}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.eintrittsdatum}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.gehalt}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.arbeitszeiten}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.qualifikation}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.rolle}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
