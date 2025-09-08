/**
 * PERSONAL MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import TestPage from './pages/MitarbeiterUebersicht.jsx';
import MitarbeiterUebersicht from "./pages/MitarbeiterUebersicht.jsx";
import MitarbeiterAendern from "./pages/MitarbeiterAendern.jsx";
import MitarbeiterKalender from "./pages/MitarbeiterKalender.jsx";

export const moduleConfig = {
    pages: [
        {
            name: 'Personal Übersicht',
            route: 'personal-uebersicht',
            component: 'MitarbeiterUebersicht',
            reactComponent: MitarbeiterUebersicht         
        },
        {
            name: 'Personal Änderung',
            route: 'personal-aenderung',
            component: 'MitarbeiterAendern',
            reactComponent: MitarbeiterAendern         
        },
        {
            name: 'Kalender',
            route: 'kalender-aenderung',
            component: 'MitarbeiterKalender',
            reactComponent: MitarbeiterKalender         
        }
    ],

    defaultPage: 'MitarbeiterUebersicht'
};