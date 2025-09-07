import { api } from '@/utils/api';

export const vehicleService = {
    addVehicle(vehicle) {
        const existing = JSON.parse(localStorage.getItem('mockVehicles')) || [];
        const updated = [...existing, { ...vehicle, id: Date.now() }];
        localStorage.setItem('mockVehicles', JSON.stringify(updated));
    },
    getVehicles() {
        return JSON.parse(localStorage.getItem('mockVehicles')) || [];
    },
    // Service-Layer für Mock-Daten aus JSON
    getMockVehicles: async () => {
        try {
            const response = await api.get('/fuhrpark/vehicles');
            return response.data || [];
        } catch (error) {
            console.error('Fehler:', error);
            throw error;
        }
    }
};