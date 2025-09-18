/**
 * LAGERHALTUNG MODULE CONFIGURATION
 *
 * Streamlined configuration with consolidated overview pages
 * All CRUD operations are handled within the main overview pages
 */

// Import der konsolidierten Übersichts-Komponenten
import LagerUebersicht from "./pages/LagerUebersichtModern.jsx";
import ArtikelUebersicht from "./pages/ArtikelUebersichtModern.jsx";
import BestandUebersicht from "./pages/BestandUebersichtModern.jsx";
import BuchungsJournal from "./pages/BuchungsJournal.jsx";
import Warnungen from "./pages/Warnungen.jsx";

export const moduleConfig = {
    pages: [
        {
            name: "Lager Übersicht",
            route: "lager-uebersicht",
            component: "LagerUebersicht",
            reactComponent: LagerUebersicht
        },
        {
            name: "Artikel Übersicht",
            route: "artikel-uebersicht",
            component: "ArtikelUebersicht",
            reactComponent: ArtikelUebersicht
        },
        {
            name: "Bestand Übersicht",
            route: "bestand-uebersicht",
            component: "BestandUebersicht",
            reactComponent: BestandUebersicht
        },
        {
            name: "Buchungsjournal",
            route: "buchungs-journal",
            component: "BuchungsJournal",
            reactComponent: BuchungsJournal
        },
        {
            name: "Warnungen",
            route: "warnungen",
            component: "Warnungen",
            reactComponent: Warnungen
        }
    ],

    defaultPage: "LagerUebersicht"
};
