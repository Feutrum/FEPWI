import React from 'react';
import './InputBox.css';

export default function InputBox() {
  return (
    <div className="input-box">
      {[
        'Erntejahr',
        'Schläge',
        'ha',
        'Maschinen',
        'Lager',
        'Arbeiter',
      ].map((label) => (
        <div key={label} className="input-group">
          <label>{label}</label>
          <input type="text" />
        </div>
      ))}
    </div>
  );
}

/*Wird aktuell nicht benutzt*/