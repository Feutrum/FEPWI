import React, { useEffect, useState } from 'react';
import './AnbauTabelle2.css';
import { anbauTabelle2Service } from '../../services/anbauTabelle2Service';

export default function AnbauTabelle2() {
  const [eintraege, setEintraege] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect lädt die Daten beim ersten Rendern der Komponente
  useEffect(() => {
    const fetchEintraege = async () => {
      try {
        // API-Call über den Service
        const data = await anbauTabelle2Service.getData();
        setEintraege(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEintraege();
  }, []);

  if (loading) return <div>Lade Aktivitäten...</div>;
  if (error) return <div style={{ color: 'red' }}>Fehler: {error.message}</div>;
  if (!eintraege || eintraege.length === 0) return <div>Keine Aktivitäten gefunden.</div>;

  //Rendering der Tabelle mit Daten
  return (
    <div className="anbau-tabelle2-container">
      <h2>Diesjährige Aktivitäten</h2>
      <table className="anbau-tabelle2">
        <thead>
          <tr>
            <th>Aktivität</th>
            <th>Fläche</th>
            <th>Datum</th>
          </tr>
        </thead>
        <tbody>
          {eintraege.map((eintrag, index) => (
            <tr key={index}>
              <td>{eintrag.aktivitaet}</td>
              <td>{eintrag.flaeche}</td>
              <td>{eintrag.datum}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
