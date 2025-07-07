import React, { useEffect, useState } from 'react';
import './Eigentümer.css';
import { eigentuemerService } from '../../services/eigentuemerService';

export default function Eigentümer() {
  const [daten, setDaten] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEigentuemer = async () => {
      try {
        const result = await eigentuemerService.getEigentuemer();
        setDaten(result);
      } catch (err) {
        console.error('Fehler beim Laden der Eigentümerdaten:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEigentuemer();// Startet die Datenabfrage
  }, []);

  if (loading) return <div>Lade Eigentümerdaten...</div>;
  if (error) return <div style={{ color: 'red' }}>Fehler: {error.message}</div>;
  if (!daten) return <div>Keine Daten verfügbar.</div>;

  // Anzeige der geladenen Eigentümerdaten
  return (
    <div className="eigentuemer-container">
      <h3>Eigentümer</h3>
      <ul className="eigentuemer-list">
        <li><strong>Name:</strong> {daten.name}</li>
        <li><strong>Adresse:</strong> {daten.adresse}</li>
        <li><strong>Pacht:</strong> {daten.pacht}</li>
        <li><strong>Notiz:</strong> {daten.notiz}</li>
      </ul>
    </div>
  );
}
