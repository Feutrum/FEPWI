export const vehicleService = {
    addVehicle(vehicle) {
        const existing = JSON.parse(localStorage.getItem('mockVehicles')) || [];
        const updated = [...existing, { ...vehicle, id: Date.now() }];
        localStorage.setItem('mockVehicles', JSON.stringify(updated));
    },
    getVehicles() {
        return JSON.parse(localStorage.getItem('mockVehicles')) || [];
    }
};