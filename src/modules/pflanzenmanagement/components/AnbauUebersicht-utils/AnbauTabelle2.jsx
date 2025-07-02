import React from 'react';
import './AnbauTabelle2.css';

export default function AnbauTabelle2() {
  return (
    <div className="anbau-tabelle2-container">
      <h2>Diesjährige Aktivitäten</h2>
      <table className="anbau-tabelle2">
        <thead>
          <tr>
            <th>Aktivität</th>
            <th>Fläche</th>
            <th>Datum</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Düngen</td>
            <td>12 ha</td>
            <td>01.03.2025</td>
          </tr>
          <tr>
            <td>Bewässern</td>
            <td>8 ha</td>
            <td>15.03.2025</td>
          </tr>
          <tr>
            <td>Pflügen</td>
            <td>10 ha</td>
            <td>22.03.2025</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
