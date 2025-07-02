import React from 'react';
import './BodenQualitaet.css';

export default function BodenQualitaet() {
  return (
    <div className="bodenqualitaet-container">
      <h2>Bodenqualität</h2>
      <ul className="bodenqualitaet-liste">
        <li><strong>Stickstoff:</strong> –</li>
        <li><strong>Phosphor:</strong> –</li>
        <li><strong>Kalium:</strong> –</li>
        <li><strong>pH-Wert:</strong> –</li>
        <li><strong>Magnesium:</strong> –</li>
        <li><strong>Schwefel:</strong> –</li>
        <li><strong>Humusgehalt:</strong> –</li>
        <li><strong>Organische Substanz:</strong> –</li>
        <li><strong>Sonstiges:</strong> –</li>
      </ul>
    </div>
  );
}
