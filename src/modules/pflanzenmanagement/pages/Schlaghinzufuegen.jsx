import React from 'react';
import GrunddatenForm from '../components/Schlaghinzufuegen-utils/GrunddatenForm';
import BodenqualitaetForm from '../components/Schlaghinzufuegen-utils/BodenqualitaetForm';
import EigentuemerForm from '../components/Schlaghinzufuegen-utils/EigentuemerForm';
import SchlagzustandForm from '../components/Schlaghinzufuegen-utils/SchlagzustandForm';

export default function Schlaghinzufuegen() {
  const containerStyle = {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 1rem',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  };

  const rowStyle = {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2rem',
  };

  const columnStyle = {
    flex: 1,
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    boxSizing: 'border-box',
  };

  const fullWidthStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    boxSizing: 'border-box',
  };

  const buttonStyle = {
    backgroundColor: '#0088FE',
    color: 'white',
    padding: '0.75rem 2rem',
    fontSize: '1.1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>Schlag hinzufügen</h2>
        <button
          style={buttonStyle}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#005bb5')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0088FE')}
        >
          Speichern
        </button>
      </div>

      <div style={rowStyle}>
        <div style={columnStyle}>
          <GrunddatenForm />
        </div>
        <div style={columnStyle}>
          <BodenqualitaetForm />
        </div>
        <div style={columnStyle}>
          <EigentuemerForm />
        </div>
      </div>

      <div style={fullWidthStyle}>
        <SchlagzustandForm />
      </div>
    </div>
  );
}
