import React from 'react';
import Kopfzeile from '../components/Ausgewaelterschlag-utils/Kopfzeile';
import BodenQualitaet from '../components/Ausgewaelterschlag-utils/BodenQualitaet';
import Schlagzustand from '../components/Ausgewaelterschlag-utils/Schlagzustand';
import Eigentümer from '../components/Ausgewaelterschlag-utils/Eigentümer';

export default function AusgewählterSchlag() {
  return (
    <div style={{ padding: '20px' }}>
      <Kopfzeile />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          flexWrap: 'nowrap',
        }}
      >
        <BodenQualitaet />

        
        <div
          style={{
            display: 'flex',
            flexDirection: 'column', 
            gap: '20px',
            flex: 1,
          }}
        >
          <Schlagzustand />
          <Eigentümer />
        </div>
      </div>
    </div>
  );
}

