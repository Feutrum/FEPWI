import React, { useState, useEffect } from 'react';
import YearSelector from '../components/auswertung-utils/YearSelector.jsx';
import Kopfzeile2 from '../components/auswertung-utils/Kopfzeile2.jsx';
import PieCharts from '../components/auswertung-utils/PieCharts.jsx';
import { kopfzeile2Service } from '../services/kopfzeile2Service';

const Auswertung = () => {
  const [anbauDaten, setAnbauDaten] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await kopfzeile2Service.getData();
        console.log('Kopfzeile2-Daten geladen:', data);
        setAnbauDaten(data);
      } catch (err) {
        setError(err);
        console.error('Fehler beim Laden der Kopfzeile2-Daten:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Lade Daten...</div>;
  if (error) return <div style={{ color: 'red' }}>Fehler: {error.message}</div>;
  if (!anbauDaten) return <div>Keine Daten gefunden.</div>;

  return (
    <div className="auswertung-wrapper">
      <h1>Auswertung der Erntejahre</h1>
      <YearSelector />

      <div className="kopfzeile-wrapper">
        <Kopfzeile2 data={anbauDaten} />
      </div>

      <div className="piecharts-wrapper">
        <PieCharts />
      </div>
    </div>
  );
};

export default Auswertung;
