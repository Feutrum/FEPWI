/**
 * LAGERHALTUNG MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import TestPage from './pages/TestPage';

export const moduleConfig = {
    pages: [
        {
            name: 'Lager Übersicht',
            route: 'lager-uebersicht',
            component: 'TestPage',
            reactComponent: TestPage
        }
    ],
    defaultPage: 'TestPage'
};