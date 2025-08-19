/**
 * LAGERHALTUNG MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import LagerUebersicht from "./pages/LagerUebersicht.jsx";

export const moduleConfig = {
    pages: [
        {
            name: 'Lager Übersicht',
            route: 'lager-uebersicht',
            component: 'LagerUebersicht',
            reactComponent: LagerUebersicht
        }
    ],
    defaultPage: 'LagerUebersicht'
};