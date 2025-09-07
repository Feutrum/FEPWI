import React, { useState } from 'react';
import AddVehicleEquipmentForm from '../components/add-vehicle-utils/AddVehicleEquipmentForm.jsx';

export default function AddVehicleEquipment() {
    const [formData, setFormData] = useState({
        ausstattung_id: '',
        name: '',
        typ: '',
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
        console.log("Ausstattung hinzugefügt:", formData);
        alert('Ausstattung (mock) hinzugefügt!');
        setFormData({ ausstattung_id: '', name: '', typ: '', nutzungsbeschreibung: '' });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Ausstattung hinzufügen</h1>
            <AddVehicleEquipmentForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        </div>
    );
}