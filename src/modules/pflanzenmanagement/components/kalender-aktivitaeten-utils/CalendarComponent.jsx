
import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Box, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/de';

// Deutsche Lokalisierung
dayjs.locale('de');

const CalendarComponent = ({ termine = [] }) => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [view, setView] = useState('month');

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);
        }
    };

    // Hier später: Termine für den ausgewählten Tag/Zeitraum filtern
    const getTermineForDate = (date) => {
        return termine.filter(termin =>
            dayjs(termin.datum).isSame(date, 'day')
        );
    };

    const renderCalendarViews = () => {
        switch (view) {
            case 'day':
                return (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            {selectedDate.format('dddd, DD. MMMM YYYY')}
                        </Typography>
                        <Paper sx={{ p: 2 }}>
                            {/* Hier später: Tagesansicht mit Terminen */}
                            <Typography>Termine für heute:</Typography>
                            {getTermineForDate(selectedDate).map(termin => (
                                <Typography key={termin.id} sx={{ mt: 1 }}>
                                    • {termin.titel} ({termin.zeit})
                                </Typography>
                            ))}
                        </Paper>
                    </Box>
                );

            case 'week':
                return (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Woche vom {selectedDate.startOf('week').format('DD.MM.')} - {selectedDate.endOf('week').format('DD.MM.YYYY')}
                        </Typography>
                        <Paper sx={{ p: 2 }}>
                            {/* Hier später: Wochenansicht */}
                            <Typography>Wochenansicht - Coming Soon</Typography>
                        </Paper>
                    </Box>
                );

            default: // month
                return (
                    <DateCalendar
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        sx={{
                            width: '100%',
                            maxWidth: 400,
                            // Styling für größeren Kalender
                            '& .MuiDayCalendar-header': {
                                justifyContent: 'space-around'
                            },
                            '& .MuiPickersDay-root': {
                                fontSize: '1rem',
                                width: 40,
                                height: 40
                            }
                        }}
                    />
                );
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
            <Box sx={{ width: '100%' }}>
                {/* View Toggle */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <ToggleButtonGroup
                        value={view}
                        exclusive
                        onChange={handleViewChange}
                        aria-label="Kalender Ansicht"
                    >
                        <ToggleButton value="day" aria-label="Tagesansicht">
                            Tag
                        </ToggleButton>
                        <ToggleButton value="week" aria-label="Wochenansicht">
                            Woche
                        </ToggleButton>
                        <ToggleButton value="month" aria-label="Monatsansicht">
                            Monat
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Kalender Content */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {renderCalendarViews()}
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default CalendarComponent;