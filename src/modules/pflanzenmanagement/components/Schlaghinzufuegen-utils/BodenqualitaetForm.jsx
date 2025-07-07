import React from 'react';
import './BodenqualitaetForm.css';

export default function BodenqualitaetForm() {
  return (
    <div className="bodenqualitaet-form">
      <h3>Bodenqualität</h3>
      <div className="form-group">
        <label>Stickstoff</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>Phosphor</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>Kalium</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>pH-Wert</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>Magnesium</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>Schwefel</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>Humusgehalt</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>Organische Substanz</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>Sonstiges</label>
        <input type="text" />
      </div>
    </div>
  );
}
