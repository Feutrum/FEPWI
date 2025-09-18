/**
 * PFLANZENMANAGEMENT MODULE CONFIGURATION
 *
 * Modern configuration using Shadcn components
 * Consolidated overview pages with integrated CRUD operations
 */

// Import modern components
import KalenderAktivitaetenModern from './pages/KalenderAktivitaetenModern';
import SchlagUebersichtModern from './pages/SchlagUebersichtModern';
import Auswertungen from './pages/Auswertungen';

export const moduleConfig = {
    pages: [
        {
            name: 'Feld Übersicht',
            route: 'feld-uebersicht',
            component: 'SchlagUebersichtModern',
            reactComponent: SchlagUebersichtModern
        },
        {
            name: 'Kalender & Aktivitäten',
            route: 'kalender-aktivitaeten',
            component: 'KalenderAktivitaetenModern',
            reactComponent: KalenderAktivitaetenModern
        },
        {
            name: 'Auswertungen',
            route: 'auswertungen',
            component: 'Auswertungen',
            reactComponent: Auswertungen
        }
    ],
    defaultPage: 'SchlagUebersichtModern'
};