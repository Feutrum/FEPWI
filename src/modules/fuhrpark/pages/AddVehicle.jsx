import React, { useState } from 'react';
import AddVehicleForm from '../components/add-vehicle-utils/AddVehicleForm.jsx';
import { vehicleService } from '../services/vehicleService.js';

export default function AddVehicle() {
    const [formData, setFormData] = useState({
        name: '',
        standort: '',
        kategorie: '',
        anschaffungsdatum: '',
        TUEV: '',
        kilometerstand: '',
        kennzeichen: '',
        status: '',
        treibstoff_art: '',
        erforderliche_fahrerlaubnis: '',
        nutzungsbeschreibung: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        vehicleService.addVehicle(formData);
        alert('Fahrzeug (mock) hinzugefügt!');
        setFormData({
            name: '',
            standort: '',
            kategorie: '',
            anschaffungsdatum: '',
            TUEV: '',
            kilometerstand: '',
            kennzeichen: '',
            status: '',
            treibstoff_art: '',
            erforderliche_fahrerlaubnis: '',
            nutzungsbeschreibung: ''
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Fahrzeug hinzufügen</h1>
            <AddVehicleForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        </div>
    );
}