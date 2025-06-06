/**
 * PERSONAL MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import TestPage from './pages/TestPage';

export const moduleConfig = {
    pages: [
        {
            name: 'Personal Übersicht',
            route: 'personal-uebersicht',
            component: 'TestPage',
            reactComponent: TestPage
        }
    ],
    defaultPage: 'TestPage'
};