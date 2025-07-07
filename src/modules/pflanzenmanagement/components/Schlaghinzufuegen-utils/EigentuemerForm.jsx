import React from 'react';
import './EigentuemerForm.css';

export default function EigentuemerForm() {
  return (
    <div className="eigentuemer-form">
      <h3>Eigentümer</h3>
      <div className="form-group">
        <label>Name</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>Adresse</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>Pacht</label>
        <input type="text" />
      </div>
      <div className="form-group">
        <label>Notiz</label>
        <input type="text" />
      </div>
    </div>
  );
}
