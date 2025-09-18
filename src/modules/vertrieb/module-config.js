/**
 * VERTRIEB MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import Kundenverwaltung from './pages/Kundenverwaltung';
import Angebotserstellung from './pages/Angebotserstellung';
import Auftragsmanagement from './pages/Auftragsmanagement';
import TestPage from './pages/TestPage';

export const moduleConfig = {
    pages: [
        {
            name: 'Kundenverwaltung',
            route: 'kundenverwaltung',
            component: 'Kundenverwaltung',
            reactComponent: Kundenverwaltung
        },
        {
            name: 'Angebotserstellung',
            route: 'angebotserstellung',
            component: 'Angebotserstellung',
            reactComponent: Angebotserstellung
        },
        {
            name: 'Auftragsmanagement',
            route: 'auftragsmanagement',
            component: 'Auftragsmanagement',
            reactComponent: Auftragsmanagement
        },
        {
            name: 'Vertrieb Übersicht',
            route: 'vertrieb-uebersicht',
            component: 'TestPage',
            reactComponent: TestPage
        }
    ],
    defaultPage: 'Kundenverwaltung'
};