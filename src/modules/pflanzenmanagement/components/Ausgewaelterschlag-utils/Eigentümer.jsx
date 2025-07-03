import React from 'react';
import './Eigentümer.css';

export default function Eigentümer() {
  return (
    <div className="eigentuemer-container">
      <h3>Eigentümer</h3>
      <ul className="eigentuemer-list">
        <li><strong>Name:</strong> -</li>
        <li><strong>Adresse:</strong> -</li>
        <li><strong>Pacht:</strong> -</li>
        <li><strong>Notiz:</strong> -</li>
      </ul>
    </div>
  );
}
