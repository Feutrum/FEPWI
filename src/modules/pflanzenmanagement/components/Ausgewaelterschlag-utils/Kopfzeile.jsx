import React, { useEffect, useState } from 'react';
import './Kopfzeile.css';

export default function Kopfzeile() {
  const [selectedSchlag, setSelectedSchlag] = useState(null);

  useEffect(() => {
    const nr = localStorage.getItem('selectedSchlagNr');
    if (nr) {
      // Beispielhafte Schlagdaten, die du aus deiner Übersicht verwendest
      const alleSchlaege = [
        { nr: 1, name: 'Acker Nord', adresse: 'Hauptstraße 12', groesse: '3.5 ha', bemerkung: 'Mais', naechsteAktivitaet: 'Düngung' },
        { nr: 2, name: 'Wiese Süd', adresse: 'Feldweg 5', groesse: '2.0 ha', bemerkung: 'Weizen', naechsteAktivitaet: 'Pflügen' },
        { nr: 3, name: 'Hang Ost', adresse: 'Bergstraße 9', groesse: '4.2 ha', bemerkung: 'Roggen', naechsteAktivitaet: 'Ernte' },
        { nr: 4, name: 'Tal West', adresse: 'Talweg 3', groesse: '1.8 ha', bemerkung: 'Kartoffeln', naechsteAktivitaet: 'Säen' },
      ];
      const gefunden = alleSchlaege.find(s => s.nr === Number(nr));
      setSelectedSchlag(gefunden || null);
    }
  }, []);

  if (!selectedSchlag) {
    return <div className="kopfzeile-container">Kein Schlag ausgewählt</div>;
  }

  return (
    <div className="kopfzeile-container">
      <h2>{selectedSchlag.name} (Nr. {selectedSchlag.nr})</h2>
      <div className="kopfzeile-einzeiler">
        <div><strong>Größe:</strong> {selectedSchlag.groesse}</div>
        <div><strong>Adresse:</strong> {selectedSchlag.adresse}</div>
        <div><strong>Aktueller Anbau:</strong> {selectedSchlag.bemerkung}</div>
        <div><strong>Nächste Aktivität:</strong> {selectedSchlag.naechsteAktivitaet || 'Unbekannt'}</div>
      </div>
    </div>
  );
}

