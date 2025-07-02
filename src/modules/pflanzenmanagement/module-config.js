/**
 * PFLANZENMANAGEMENT MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import KalenderAktivitaeten from './pages/KalenderAktivitaeten';
import SchlagUebersicht from './pages/SchlagUebersicht';
import Auswertungen from './pages/Auswertungen';
import AnbauUebersicht from './pages/AnbauUebersicht';
import Ausgewaelterschlag from './pages/Ausgewaelterschlag';

export const moduleConfig = {
    pages: [
        {
            name: 'Schlag Übersicht',
            route: 'Schlag uebersicht',
            component: 'SchlagUebersicht',
            reactComponent: SchlagUebersicht
        },
        {
            name: 'Ausgewählter Schlag',
            route: 'Ausgewaelter schlag',
            component: 'Ausgewaelterschlag',
            reactComponent: Ausgewaelterschlag
        },
        {
            name: 'Anbau Übersicht',
            route: 'anbau-übersicht',
            component: 'AnbauUebersicht',
            reactComponent: AnbauUebersicht
        },
        {
            name: 'Kalender & Aktivitäten',
            route: 'kalender-aktivitaeten',
            component: 'KalenderAktivitaeten',
            reactComponent: KalenderAktivitaeten
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