import React, { useState, useEffect } from 'react';
import './SchlagÜbersicht.css';
import { schlagService } from '../../services/schlagService';

export default function SchlagÜbersicht() {
  const [schlaege, setSchlaege] = useState([]);
  const [selectedNr, setSelectedNr] = useState(null);
  const [sortBy, setSortBy] = useState('nr');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Beim Mount: Auswahl & Daten laden
  useEffect(() => {
    const stored = localStorage.getItem('selectedSchlagNr');
    if (stored) {
      setSelectedNr(Number(stored));
    }

    const fetchData = async () => {
      try {
        const data = await schlagService.getAll();
        setSchlaege(data);
      } catch (err) {
        console.error('Fehler beim Laden der Schläge:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auswahl speichern
  useEffect(() => {
    if (selectedNr !== null) {
      localStorage.setItem('selectedSchlagNr', selectedNr);
    }
  }, [selectedNr]);

  // Suche & Sortierung
  const sorted = [...schlaege]
    .filter((s) => {
      const term = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(term) ||
        s.adresse.toLowerCase().includes(term) ||
        s.groesse.toLowerCase().includes(term) ||
        s.bemerkung.toLowerCase().includes(term) ||
        s.nr.toString().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.nr - b.nr;
    });

  // Lade-/Fehleranzeige
  if (loading) return <div>Lade Schläge...</div>;
  if (error) return <div style={{ color: 'red' }}>Fehler: {error.message}</div>;
  if (!sorted.length) return <div>Keine Schläge gefunden.</div>;

  return (
    <div className="schlag-container">
      <div className="top-bar">
        <h2>Schlag Übersicht</h2>
        <input
          type="text"
          placeholder="Suche..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-controls">
        <label>Sortieren nach: </label>
        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
          <option value="nr">Nr (1–100)</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      <div className="schlag-liste">
        {sorted.map((schlag) => (
          <div
            key={schlag.nr}
            className={`schlag-card ${selectedNr === schlag.nr ? 'active' : ''}`}
            onClick={() => {
              setSelectedNr(schlag.nr);
              localStorage.setItem('selectedSchlag', JSON.stringify(schlag));
            }}
          >
            <h3>{schlag.name} (Nr. {schlag.nr})</h3>
            <p><strong>Adresse:</strong> {schlag.adresse}</p>
            <p><strong>Größe:</strong> {schlag.groesse}</p>
            <p><strong>Aktuell:</strong> {schlag.bemerkung}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

