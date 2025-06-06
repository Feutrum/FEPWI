/**
 * FIELD LIST COMPONENT - Wiederverwendbare Feld-Liste
 *
 * Reine UI-Component ohne Business Logic
 * Erhält Daten als Props, macht keine API-Calls
 */

import React from 'react';

const FieldList = ({ fields, loading, error }) => {
    // Loading State
    if (loading) {
        return <div>Lade Felder...</div>;
    }

    // Error State
    if (error) {
        return <div style={{ color: 'red' }}>Fehler: {error.message}</div>;
    }

    // Empty State
    if (!fields || fields.length === 0) {
        return <div>Keine Felder gefunden.</div>;
    }

    // Main Render
    return (
        <div>
            <h3>Feld-Übersicht</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {fields.map(field => (
                    <li key={field.id} style={{
                        border: '1px solid #ccc',
                        margin: '10px 0',
                        padding: '10px',
                        borderRadius: '4px'
                    }}>
                        <strong>{field.name}</strong>
                        <div>Fläche: {field.area} ha</div>
                        <div>Frucht: {field.crop}</div>
                        <div>Status: {field.status}</div>
                        <div>Letzte Aktivität: {field.lastActivity}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FieldList;