
/**
 * FUHRPARK MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import AddVehicle from './pages/AddVehicle.jsx';
import VehicleOverview from './pages/VehicleOverview.jsx';

export const moduleConfig = {
    pages: [
        {
            name: 'Fuhrpark Übersicht',
            route: 'fuhrpark-uebersicht',
            component: 'VehicleOverview',
            reactComponent: VehicleOverview
        },
        {
            name: 'Fahrzeug hinzufügen',
            route: 'fahrzeug-hinzufuegen',
            component: 'AddVehicle',
            reactComponent: AddVehicle
        }
    ],
    defaultPage: 'VehicleOverview'
};