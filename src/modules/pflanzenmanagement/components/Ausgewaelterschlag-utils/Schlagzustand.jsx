import React from 'react';
import './Schlagzustand.css';

export default function Schlagzustand() {
  return (
    <div className="schlagzustand-container">
      <h2>Aktueller Schlagzustand</h2>
      <div className="schlagzustand-feld">
        <strong>Status:</strong> –
      </div>
    </div>
  );
}
