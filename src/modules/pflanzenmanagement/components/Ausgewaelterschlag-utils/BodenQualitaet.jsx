import React, { useEffect, useState } from 'react';
import './BodenQualitaet.css';
import { bodenService } from '../../services/bodenService';

export default function BodenQualitaet() {
  // React State zum Speichern der abgerufenen Daten
  const [daten, setDaten] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await bodenService.getQualitaet();
        setDaten(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Lade Bodenqualität...</div>;
  if (error) return <div style={{ color: 'red' }}>Fehler: {error.message}</div>;

  // Gibt die Liste der Bodenqualitätswerte zurück
  return (
    <div className="bodenqualitaet-container">
      <h2>Bodenqualität</h2>
      <ul className="bodenqualitaet-liste">
        <li><strong>Stickstoff:</strong> {daten.stickstoff}</li>
        <li><strong>Phosphor:</strong> {daten.phosphor}</li>
        <li><strong>Kalium:</strong> {daten.kalium}</li>
        <li><strong>pH-Wert:</strong> {daten.phWert}</li>
        <li><strong>Magnesium:</strong> {daten.magnesium}</li>
        <li><strong>Schwefel:</strong> {daten.schwefel}</li>
        <li><strong>Humusgehalt:</strong> {daten.humusgehalt}</li>
        <li><strong>Organische Substanz:</strong> {daten.organischeSubstanz}</li>
        <li><strong>Sonstiges:</strong> {daten.sonstiges}</li>
      </ul>
    </div>
  );
}
