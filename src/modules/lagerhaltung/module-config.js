/**
 * LAGERHALTUNG MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import LagerUebersicht from "./pages/LagerUebersicht.jsx";
import LagerortDetails from "./pages/LagerortDetails.jsx";
import LagerAnlegen from "./pages/LagerAnlegen.jsx";
import LagerBearbeiten from "./pages/LagerBearbeiten.jsx";
import ArtikelUebersicht from "./pages/ArtikelUebersicht.jsx";
import ArtikelAnlegen from "./pages/ArtikelAnlegen.jsx";
import ArtikelBearbeiten from "./pages/ArtikelBearbeiten.jsx";
import BestandUebersicht from "./pages/BestandUebersicht.jsx";
import BuchungAusgang from "./pages/BuchungAusgang.jsx";
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
            name: "Lager Details",
            route: "lager-details",
            component: "LagerortDetails",
            reactComponent: LagerortDetails
        },
        {
            name: "Lager anlegen",
            route: "lager-anlegen",
            component: "LagerAnlegen",
            reactComponent: LagerAnlegen
        },
        {
            name: "Lager bearbeiten",
            route: "lager-bearbeiten/:id",
            component: "LagerBearbeiten",
            reactComponent: LagerBearbeiten
        },
        {
            name: "Artikel Übersicht",
            route: "artikel-uebersicht",
            component: "ArtikelUebersicht",
            reactComponent: ArtikelUebersicht
        },
        {
            name: "Artikel anlegen",
            route: "artikel-anlegen/new",
            component: "ArtikelAnlegen",
            reactComponent: ArtikelAnlegen
        },
        {
            name: "Artikel bearbeiten",
            route: "artikel-bearbeiten",
            component: "ArtikelBearbeiten",
            reactComponent: ArtikelBearbeiten
        },
        {   name: "Bestand Übersicht",
            route: "bestand-uebersicht",
            component: "BestandUebersicht",
            reactComponent: BestandUebersicht
        },
        {
            name: "Warenausgang",
            route: "warenausgang",
            component: "BuchungAusgang",
            reactComponent: BuchungAusgang
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
