/**
 * PFLANZENMANAGEMENT MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import KalenderAktivitaeten from './pages/KalenderAktivitaeten';
import SchlagUebersicht from './pages/SchlagUebersicht';
import Auswertungen from './pages/Auswertungen';

export const moduleConfig = {
    pages: [
        {
            name: 'Kalender & Aktivitäten',
            route: 'kalender-aktivitaeten',
            component: 'KalenderAktivitaeten',
            reactComponent: KalenderAktivitaeten
        },
        {
            name: 'Schlag-Übersicht',
            route: 'schlag-uebersicht',
            component: 'SchlagUebersicht',
            reactComponent: SchlagUebersicht
        },
        {
            name: 'Auswertungen',
            route: 'auswertungen',
            component: 'Auswertungen',
            reactComponent: Auswertungen
        }
    ],
    defaultPage: 'KalenderAktivitaeten'
};