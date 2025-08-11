/**
 * PERSONAL MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import TestPage from './pages/MitarbeiterUebersicht.jsx';
import MitarbeiterUebersicht from "./pages/MitarbeiterUebersicht.jsx";

export const moduleConfig = {
    pages: [
        {
            name: 'Personal Übersicht',
            route: 'personal-uebersicht',
            component: 'MitarbeiterUebersicht',
            reactComponent: MitarbeiterUebersicht
        }
    ],
    defaultPage: 'MitarbeiterUebersicht'
};