import React from 'react';
import './SchlagzustandForm.css';

export default function SchlagzustandForm() {
  return (
    <div className="schlagzustand-form">
      <h3>Aktueller Schlagzustand</h3>
      <div className="form-group">
        <label>Status</label>
        <input type="text" placeholder="z. B. Boden feucht, gut vorbereitet" />
      </div>
    </div>
  );
}
