/**
 * PERSONAL MODULE CONFIGURATION
 *
 * Streamlined configuration with consolidated overview pages
 * All employee CRUD operations are handled within the main overview pages
 */

// Import der konsolidierten Übersichts-Komponenten
import MitarbeiterUebersicht from './pages/MitarbeiterUebersicht.jsx';
import ArbeitszeitKonto from './pages/ArbeitszeitKonto.jsx';
import MitarbeiterKalender from './pages/MitarbeiterKalender.jsx';

export const moduleConfig = {
  pages: [
    {
      name: 'Personal Übersicht',
      route: 'personal-uebersicht',
      component: 'MitarbeiterUebersicht',
      reactComponent: MitarbeiterUebersicht,
    },
    {
      name: 'Arbeitszeitkonto',
      route: 'personal-arbeitszeitkonto',
      component: 'ArbeitszeitKonto',
      reactComponent: ArbeitszeitKonto,
    },
    {
      name: 'Kalender',
      route: 'kalender-aenderung',
      component: 'MitarbeiterKalender',
      reactComponent: MitarbeiterKalender,
    },
  ],

  defaultPage: 'MitarbeiterUebersicht',
};
