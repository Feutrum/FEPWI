import React, { useEffect, useState } from 'react';
import './Schlagzustand.css';
import { schlagzustandService } from '../../services/schlagzustandService';

export default function Schlagzustand() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Daten vom Service abrufen
        const result = await schlagzustandService.getStatus();
        setStatus(result.status);
      } catch (err) {
        console.error('Fehler beim Laden des Schlagzustands:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) return <div>Lade Schlagzustand...</div>;
  if (error) return <div style={{ color: 'red' }}>Fehler: {error.message}</div>;
  if (!status) return <div>Kein Zustand verfügbar.</div>;

  // Darstellung des aktuellen Schlagzustands
  return (
    <div className="schlagzustand-container">
      <h2>Aktueller Schlagzustand</h2>
      <div className="schlagzustand-feld">
        <strong>Status:</strong> {status}
      </div>
    </div>
  );
}
