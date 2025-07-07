import React, { useEffect, useState } from 'react';
import './AnbauTabelle.css';
import { anbauService } from '@/modules/pflanzenmanagement/services/anbauService';

export default function AnbauTabelle() {
  const [daten, setDaten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect lädt die Daten beim ersten Rendern der Komponente
  useEffect(() => {
    const fetchDaten = async () => {
      try {
        // API-Call über den Service
        const result = await anbauService.getAnbauDaten();
        setDaten(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDaten();
  }, []);

  if (loading) return <div>Lade Anbaudaten...</div>;
  if (error) return <div style={{ color: 'red' }}>Fehler: {error.message}</div>;
  if (!daten || daten.length === 0) return <div>Keine Daten gefunden.</div>;

  //Rendering der Tabelle mit Daten
  return (
    <div className="anbau-tabelle-container">
      <h2>Anbau Übersicht</h2>
      <table className="anbau-tabelle">
        <thead>
          <tr>
            <th>Erntejahr</th>
            <th>Kultur</th>
            <th>Sorte</th>
            <th>Gesäht</th>
            <th>Geerntet</th>
          </tr>
        </thead>
        <tbody>
          {daten.map((eintrag, index) => (
            <tr key={index}>
              <td>{eintrag.jahr}</td>
              <td>{eintrag.kultur}</td>
              <td>{eintrag.sorte}</td>
              <td>{eintrag.gesaeht}</td>
              <td>{eintrag.geerntet}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
