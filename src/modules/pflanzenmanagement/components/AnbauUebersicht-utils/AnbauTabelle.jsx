import React from 'react';
import './AnbauTabelle.css';

export default function AnbauTabelle() {
  const daten = [
    {
      jahr: 2025,
      kultur: 'Weizen',
      sorte: 'Brotweizen',
      gesaeht: '20 T',
      geerntet: '42,3 T',
    },
    {
      jahr: 2024,
      kultur: 'Mais',
      sorte: 'Silomais',
      gesaeht: '10 T',
      geerntet: '22T',
    },
    // Du kannst beliebig viele Datensätze hinzufügen
  ];

  return (
    <div className="anbau-tabelle-container">
      <h2>Anbau Übersicht</h2>
      <table className="anbau-tabelle">
        <thead>
          <tr>
            <th>Erntejahr</th>
            <th>Kultur</th>
            <th>Sorte</th>
            <th>Gesäht</th>
            <th>Geerntet</th>
          </tr>
        </thead>
        <tbody>
          {daten.map((eintrag, index) => (
            <tr key={index}>
              <td>{eintrag.jahr}</td>
              <td>{eintrag.kultur}</td>
              <td>{eintrag.sorte}</td>
              <td>{eintrag.gesaeht}</td>
              <td>{eintrag.geerntet}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
