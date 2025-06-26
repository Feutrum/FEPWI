
import React, { useState, useEffect } from 'react';
import { fieldService } from '../services/pflanzen-service.js';

export default function SchlagUebersicht() {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadFields = async () => {
            try {
                setLoading(true);
                setError(null);

                // Service Call - nicht direkt API
                const fieldData = await fieldService.getAllFields();
                setFields(fieldData);

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadFields();
    }, []); // Lädt einmalig beim Mount

    if (loading) return <div>Lade Daten...</div>;
    if (error) return <div>Fehler: {error.message}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Schlag-Übersicht</h1>
            <h2>Pflanzenmanagement</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Fläche (ha)</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Frucht</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Letzte Aktivität</th>
                </tr>
                </thead>
                <tbody>
                {fields.map(field => (
                    <tr key={field.id}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{field.id}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{field.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{field.area}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{field.crop}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{field.status}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{field.lastActivity}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Debug Info */}
            <details style={{ marginTop: '20px' }}>
                <summary>Debug Info</summary>
                <pre>{JSON.stringify({ fields, loading, error }, null, 2)}</pre>
            </details>
        </div>
    );
}