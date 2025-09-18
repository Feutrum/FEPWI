
/**
 * FUHRPARK MODULE CONFIGURATION
 *
 * Streamlined configuration with consolidated vehicle overview page
 * All vehicle operations (add, edit, reserve, maintenance, fuel) are handled within the main overview
 */

// Import der konsolidierten Fahrzeugübersicht-Komponente
import VehicleOverview from './pages/VehicleOverviewModern.jsx';

export const moduleConfig = {
    pages: [
        {
            name: 'Fahrzeugübersicht',
            route: 'vehicle-overview',
            component: 'VehicleOverview',
            reactComponent: VehicleOverview
        }
    ],
    defaultPage: 'VehicleOverview'
};