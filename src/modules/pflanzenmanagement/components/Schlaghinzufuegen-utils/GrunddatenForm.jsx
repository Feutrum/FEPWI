import React, { useState } from 'react';
import './grunddatenform.css'; // Falls du schon eine zentrale Form-Styles-Datei nutzt

export default function GrunddatenForm() {
  const [nr, setNr] = useState('');
  const [name, setName] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ha, setHa] = useState('');
  const [aktuell, setAktuell] = useState('');

  return (
    <div className="form-section">
      <h3>Grunddaten</h3>

      <div className="form-field">
        <label>Schlagnummer</label>
        <input type="text" value={nr} onChange={(e) => setNr(e.target.value)} />
      </div>

      <div className="form-field">
        <label>Schlagname</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="form-field">
        <label>Adresse</label>
        <input type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
      </div>

      <div className="form-field">
        <label>Größe in ha</label>
        <input type="text" value={ha} onChange={(e) => setHa(e.target.value)} />
      </div>

      <div className="form-field">
        <label>Aktuell</label>
        <input type="text" value={aktuell} onChange={(e) => setAktuell(e.target.value)} />
      </div>
    </div>
  );
}

