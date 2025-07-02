/**
 * KALENDER AKTIVITÄTEN PAGE - Container Component
 *
 * Verwaltet State und Business Logic
 * Lädt Daten über Service Layer
 * Delegiert Rendering an UI Components
 */

import React, { useState, useEffect } from 'react';
import FieldList from '../components/kalender-aktivitaeten-utils/FieldList.jsx';
import { fieldService } from '../services/pflanzen-service.js';
import CalendarComponent from '../components/kalender-aktivitaeten-utils/CalendarComponent.jsx';


const KalenderAktivitaeten = () => {
    // Component State
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data Loading Effect
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

    // Main Render
    return (
        <div style={{ padding: '20px' }}>
            <h1>Kalender & Aktivitäten</h1>
            <h2>Pflanzenmanagement</h2>

            {/* UI Component mit Props */}
            <FieldList
                fields={fields}
                loading={loading}
                error={error}
            />

            {/* Debug Info */}
            <details style={{ marginTop: '20px' }}>
                <summary>Debug Info</summary>
                <pre>{JSON.stringify({ fields, loading, error }, null, 2)}</pre>
            </details>
        </div>
    );
};

export default KalenderAktivitaeten;