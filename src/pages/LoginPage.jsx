
/**
 * LoginPage Component
 * Anmeldeseite mit Standard-Login und Demo-Buttons für Entwicklung
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Container,
    Alert,
    Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Auth und Navigation
    const { login, devLoginAdmin, devLoginLimited, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Automatische Weiterleitung nach erfolgreichem Login
    useEffect(() => {
        if (isAuthenticated) {
            console.log('Login erfolgreich - Redirect zu Dashboard');
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    /**
     * Verarbeitet Standard-Login-Formular
     * @param {Event} e - Form Submit Event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);

        if (!result.success) {
            setError(result.error);
        }
    };

    /**
     * Demo-Login mit Admin-Rechten (alle Menüs sichtbar)
     */
    const handleAdminLogin = () => {
        console.log('Admin Login - Alle Menüs sichtbar');
        devLoginAdmin();
    };

    /**
     * Demo-Login mit eingeschränkten Rechten (nur Lager & Vertrieb)
     */
    const handleLimitedLogin = () => {
        console.log('Limited Login - Nur Lager & Vertrieb sichtbar');
        devLoginLimited();
    };

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                margin: 0,
                padding: 0
            }}
        >
            <Box sx={{ width: '100%', maxWidth: '500px', px: 2 }}>
                <Paper sx={{ p: 4, width: '100%', mx: 'auto' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        ERP System Login
                    </Typography>

                    {/* Demo Login Bereich - nur für Entwicklung */}
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Demo Logins
                        </Typography>

                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleAdminLogin}
                            fullWidth
                            sx={{ mb: 1 }}
                        >
                            Full View Developer Login
                        </Button>
                        <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                            Alle 5 Menüpunkte sichtbar (Admin-Rechte)
                        </Typography>

                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleLimitedLogin}
                            fullWidth
                            sx={{ mb: 1 }}
                        >
                            Limited Role Test Login
                        </Button>
                        <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                            Nur "Lager" und "Vertrieb" sichtbar
                        </Typography>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="caption" color="text.secondary">
                            Offline-fähig für Demo-Zwecke
                        </Typography>
                    </Box>

                    {/* Standard Login Formular */}
                    <Box component="form" onSubmit={handleSubmit}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                Email
                            </Typography>
                            <TextField
                                fullWidth
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ihre.email@beispiel.com"
                                variant="outlined"
                                required
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                Passwort
                            </Typography>
                            <TextField
                                fullWidth
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ihr Passwort"
                                variant="outlined"
                                required
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 1, mb: 2 }}
                        >
                            Anmelden
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}