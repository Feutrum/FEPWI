/**
 * LAGERHALTUNG MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import LagerUebersicht from "./pages/LagerUebersicht.jsx";
import ArtikelBearbeiten from "./pages/ArtikelBearbeiten.jsx";
import BestandBearbeiten from "./pages/BestandBearbeiten.jsx";

export const moduleConfig = {
    pages: [
        {
            name: 'Lager Übersicht',
            route: 'lager-uebersicht',
            component: 'LagerUebersicht',
            reactComponent: LagerUebersicht
        },
        {
            name: 'Artikel Bearbeiten',
            route: 'artikel-bearbeiten/:id',
            component: 'ArtikelBearbeiten',
            reactComponent: ArtikelBearbeiten
        },
        {
            name: 'Bestand bearbeiten',
            route: 'bestand-bearbeiten/:id?',  // :id optional → neu anlegen oder bearbeiten
            component: 'BestandBearbeiten',
            reactComponent: BestandBearbeiten
        }
    ],

    defaultPage: 'LagerUebersicht'
};