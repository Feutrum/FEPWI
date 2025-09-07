
/**
 * FUHRPARK MODULE CONFIGURATION
 *
 * Definiert verfügbare Pages für die Sidebar-Navigation UND Component-Mapping
 */

// Import der tatsächlichen Komponenten
import TestPage from './pages/TestPage';
import AddVehicle from './pages/AddVehicle.jsx';
import AddVehicleEquipment from './pages/AddVehicleEquipment.jsx';


export const moduleConfig = {
    pages: [
        {
            name: 'Fuhrpark Übersicht',
            route: 'fuhrpark-uebersicht',
            component: 'TestPage',
            reactComponent: TestPage
        },
        {
            name: 'Fahrzeug hinzufügen',
            route: 'fahrzeug-hinzufuegen',
            component: 'AddVehicle',
            reactComponent: AddVehicle
        },
        {
            name: 'Ausstattung hinzufügen',
            route: 'ausstattung-hinzufuegen',
            component: 'AddVehicleEquipment',
            reactComponent: AddVehicleEquipment
        }
    ],
    defaultPage: 'TestPage'
};