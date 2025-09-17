import React from 'react';
import { TextField, Button, Box } from '@mui/material';

export default function AddVehicleEquipmentForm({ formData, onChange, onSubmit }) {
    return (
        <Box component="form" onSubmit={onSubmit} sx={{ p: 2 }}>
            <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="Ausstattung ID" name="ausstattung_id" value={formData.ausstattung_id} onChange={onChange} fullWidth required />
                <TextField label="Name" name="name" value={formData.name} onChange={onChange} fullWidth required />
                <TextField label="Typ" name="typ" value={formData.typ} onChange={onChange} fullWidth required />
                <TextField label="Nutzungsbeschreibung" name="nutzungsbeschreibung" value={formData.nutzungsbeschreibung} onChange={onChange} fullWidth multiline rows={3} required />
                <Button type="submit" variant="contained">Ausstattung hinzufügen</Button>
            </Box>
        </Box>
    );
}