import React, { useState, useEffect } from 'react';
import './SchlagÜbersicht.css';

const schlaege = [
  { nr: 1, name: 'Acker Nord', adresse: 'Hauptstraße 12', groesse: '3.5 ha', bemerkung: 'Mais' },
  { nr: 2, name: 'Wiese Süd', adresse: 'Feldweg 5', groesse: '2.0 ha', bemerkung: 'Weizen' },
  { nr: 3, name: 'Hang Ost', adresse: 'Bergstraße 9', groesse: '4.2 ha', bemerkung: 'Roggen' },
  { nr: 4, name: 'Tal West', adresse: 'Talweg 3', groesse: '1.8 ha', bemerkung: 'Kartoffeln' },
];

export default function SchlagÜbersicht() {
  const [selectedNr, setSelectedNr] = useState(null);
  const [sortBy, setSortBy] = useState('nr');
  const [searchTerm, setSearchTerm] = useState('');

  // Beim Laden: gespeicherte Auswahl aus localStorage übernehmen
  useEffect(() => {
    const stored = localStorage.getItem('selectedSchlagNr');
    if (stored) {
      setSelectedNr(Number(stored));
    }
  }, []);

  // Wenn sich selectedNr ändert, speichern wir es
  useEffect(() => {
    if (selectedNr !== null) {
      localStorage.setItem('selectedSchlagNr', selectedNr);
    }
  }, [selectedNr]);

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
