import React from 'react';
import './Kopfzeile2.css';

export default function Kopfzeile2({ data }) {
  return (
    <div className="kopfzeile2-wrapper">
      <div className="kopfzeile2-container">
        <h2>Anbauübersicht</h2>
        <div className="kopfzeile2-einzeiler">
          <div><strong>Erntejahr:</strong> {data.erntejahr || '2025'}</div>
          <div><strong>Schläge:</strong> {data.schlaege || '30'}</div>
          <div><strong>ha:</strong> {data.ha || '80'}</div>
          <div><strong>Maschinen:</strong> {data.maschinen || '20'}</div>
          <div><strong>Lager:</strong> {data.lager || '7'}</div>
          <div><strong>Arbeiter:</strong> {data.arbeiter || '5'}</div>
        </div>
      </div>
    </div>
  );
}
