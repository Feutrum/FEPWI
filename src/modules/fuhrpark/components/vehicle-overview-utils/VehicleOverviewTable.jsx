import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Checkbox, FormControlLabel, Chip } from '@mui/material';
import { vehicleService } from '@/modules/fuhrpark/services/vehicleService';

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const today = new Date();
    const date = new Date(dateStr);
    return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
}

function tuevColor(tuev) {
    const days = daysUntil(tuev);
    if (days === null) return 'default';
    if (days < 0) return 'error'; // abgelaufen
    if (days < 30) return 'error'; // weniger als 30 Tage
    return 'success'; // alles andere grün
}

function statusColor(status) {
    if (status === 'bereit') return 'success';
    if (status === 'in Wartung') return 'warning';
    return 'default';
}

export default function VehicleOverviewTable() {
    const [vehicles, setVehicles] = useState([]);
    const [onlyExpiring, setOnlyExpiring] = useState(false);

    useEffect(() => {
        setVehicles(vehicleService.getVehicles());
    }, []);

    const filtered = onlyExpiring ? vehicles.filter(v => daysUntil(v.TUEV) < 30) : vehicles;

    return (
        <Box>
            <Typography variant='h4' gutterBottom>Fahrzeugübersicht</Typography>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={onlyExpiring}
                        onChange={e => setOnlyExpiring(e.target.checked)}
                    />
                }
                label="Nur Fahrzeuge mit TÜV < 30 Tage anzeigen"
            />
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Standort</TableCell>
                            <TableCell>Kategorie</TableCell>
                            <TableCell>Kennzeichen</TableCell>
                            <TableCell>Treibstoffart</TableCell>
                            <TableCell>Anschaffungsdatum</TableCell>
                            <TableCell>TÜV</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Kilometerstand</TableCell>
                            <TableCell>Gemietet</TableCell>
                            <TableCell>Autonom</TableCell>
                            <TableCell>Fahrerlaubnis</TableCell>
                            <TableCell>Nutzungsbeschreibung</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((v, idx) => (
                            <TableRow key={v.id || idx}>
                                <TableCell>{v.name}</TableCell>
                                <TableCell>{v.standort}</TableCell>
                                <TableCell>{v.kategorie}</TableCell>
                                <TableCell>{v.kennzeichen}</TableCell>
                                <TableCell>{v.treibstoff_art}</TableCell>
                                <TableCell>{v.anschaffungsdatum}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={v.TUEV}
                                        color={tuevColor(v.TUEV)} 
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={v.status}
                                        color={statusColor(v.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{v.kilometerstand}</TableCell>
                                <TableCell>{v.ist_gemietet ? 'Ja' : 'Nein'}</TableCell>
                                <TableCell>{v.ist_autonom ? 'Ja' : 'Nein'}</TableCell>
                                <TableCell>{v.erforderliche_fahrerlaubnis}</TableCell>
                                <TableCell>{v.nutzungsbeschreibung}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}