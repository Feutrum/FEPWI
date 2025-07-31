import React from 'react';
import { TextField, Button, Box, MenuItem } from '@mui/material';
import { vehicleService } from '@/modules/fuhrpark/services/vehicleService';

export default function AddVehicleForm({ formData, onChange, onSubmit }) {
    const kategorien = ['PKW', 'LKW', 'Transporter', 'Anhänger'];
    const kraftstoffe = ['Benzin', 'Diesel', 'Elektro', 'Hybrid'];
    const fahrerlaubnisse = ['B', 'C', 'CE', 'T'];

    return (
        <Box component="form" onSubmit={onSubmit} sx={{ p: 2 }}>
            <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="Name" name="name" value={formData.name} onChange={onChange} fullWidth required />
                <TextField label="Standort" name="standort" value={formData.standort} onChange={onChange} fullWidth required />
                <TextField
                    label="Kategorie"
                    name="kategorie"
                    value={formData.kategorie}
                    onChange={onChange}
                    select
                    fullWidth
                    required
                >
                    {kategorien.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Anschaffungsdatum"
                    name="anschaffungsdatum"
                    type="date"
                    value={formData.anschaffungsdatum}
                    onChange={onChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="TÜV gültig bis"
                    name="TUEV"
                    type="date"
                    value={formData.TUEV}
                    onChange={onChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Kilometerstand"
                    name="kilometerstand"
                    type="number"
                    value={formData.kilometerstand}
                    onChange={onChange}
                    fullWidth
                    required
                />
                <TextField
                    label="Kennzeichen"
                    name="kennzeichen"
                    value={formData.kennzeichen}
                    onChange={onChange}
                    fullWidth
                    required
                />
                <TextField
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={onChange}
                    fullWidth
                    required
                />
                <TextField
                    label="Treibstoffart"
                    name="treibstoff_art"
                    value={formData.treibstoff_art}
                    onChange={onChange}
                    select
                    fullWidth
                    required
                >
                    {kraftstoffe.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Erforderliche Fahrerlaubnis"
                    name="erforderliche_fahrerlaubnis"
                    value={formData.erforderliche_fahrerlaubnis}
                    onChange={onChange}
                    select
                    fullWidth
                    required
                >
                    {fahrerlaubnisse.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Nutzungsbeschreibung"
                    name="nutzungsbeschreibung"
                    value={formData.nutzungsbeschreibung}
                    onChange={onChange}
                    multiline
                    rows={3}
                    fullWidth
                    required
                />
                <Button type="submit" variant="contained">Fahrzeug hinzufügen</Button>
                <details style={{ marginTop: '2rem' }}>
                    <summary>Debug Info</summary>
                    <pre>{JSON.stringify(vehicleService.getVehicles(), null, 2)}</pre>
                </details>
            </Box>
        </Box>
    );
}