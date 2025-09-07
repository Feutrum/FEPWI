import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Checkbox, FormControlLabel, Chip, Button, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { vehicleService } from '@/modules/fuhrpark/services/vehicleService';
import AddVehicleEquipmentForm from '../add-vehicle-utils/AddVehicleEquipmentForm';
import CloseIcon from '@mui/icons-material/Close';
import './VehicleOverviewTable.css';

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
    if (days < 30) return 'warning'; // weniger als 30 Tage
    return 'success'; // alles andere grün
}

export default function VehicleOverviewTable() {
    const [vehicles, setVehicles] = useState([]);
    const [onlyExpiring, setOnlyExpiring] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [formData, setFormData] = useState({
        ausstattung_id: '',
        name: '',
        typ: '',
        nutzungsbeschreibung: '',
        fahrzeug_id: ''
    });

    useEffect(() => {
    async function fetchVehicles() {
        const data = await vehicleService.getMockVehicles();
        setVehicles(data);
    }
    fetchVehicles();
}, []);

    const filtered = onlyExpiring ? vehicles.filter(v => daysUntil(v.TUEV) < 30) : vehicles;

    const handleOpenDialog = (vehicleId) => {
        setSelectedVehicleId(vehicleId);
        setFormData({
            ausstattung_id: '',
            name: '',
            typ: '',
            nutzungsbeschreibung: '',
            fahrzeug_id: vehicleId
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedVehicleId(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Hier kannst du die Logik zum Speichern der Ausstattung einfügen
        handleCloseDialog();
    };

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
                        <TableRow className="vehicle-table-row">
                            <TableCell>Name</TableCell>
                            <TableCell>Standort</TableCell>
                            <TableCell>Kategorie</TableCell>
                            <TableCell>Kennzeichen</TableCell>
                            <TableCell>Treibstoffart</TableCell>
                            <TableCell>Anschaffungsdatum</TableCell>
                            <TableCell>TÜV</TableCell>
                            <TableCell>Kilometerstand</TableCell>
                            <TableCell>Gemietet</TableCell>
                            <TableCell>Autonom</TableCell>
                            <TableCell>Fahrerlaubnis</TableCell>
                            <TableCell>Nutzungsbeschreibung</TableCell>
                            <TableCell>Austattung hinzufügen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((v, idx) => (
                            <TableRow key={v.id || idx} className="vehicle-table-row">
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
                                <TableCell>{v.kilometerstand}</TableCell>
                                <TableCell>{v.ist_gemietet ? 'Ja' : 'Nein'}</TableCell>
                                <TableCell>{v.ist_autonom ? 'Ja' : 'Nein'}</TableCell>
                                <TableCell>{v.erforderliche_fahrerlaubnis}</TableCell>
                                <TableCell>{v.nutzungsbeschreibung}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleOpenDialog(v.id)}>Austattung hinzufügen</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Ausstattung hinzufügen
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <AddVehicleEquipmentForm
                        formData={formData}
                        onChange={handleFormChange}
                        onSubmit={handleFormSubmit}
                    />
                    {/* Hidden input for fahrzeug_id */}
                    <input type="hidden" name="fahrzeug_id" value={formData.fahrzeug_id} />
                </DialogContent>
            </Dialog>
        </Box>
    );
}