
/**
 * =================================================================
 * LOGIN PAGE KOMPONENTE - ERP SYSTEM
 * =================================================================
 *
 * Diese Komponente stellt die Anmeldeseite für das ERP-System dar.
 * Sie kombiniert sowohl normale Benutzerauthentifizierung als auch
 * Entwickler-Demo-Funktionen für Testzwecke.
 *
 * FUNKTIONALITÄTEN:
 * - Standard Email/Passwort Login
 * - Demo-Login Buttons für verschiedene Benutzerrollen
 * - Automatische Weiterleitung nach erfolgreichem Login
 * - Fehlerbehandlung und Benutzer-Feedback
 * - Responsive Design mit Material-UI
 *
 * ARCHITEKTUR-PATTERN:
 * - React Functional Component mit Hooks
 * - Context API für Authentifizierung (AuthContext)
 * - React Router für Navigation
 * - Material-UI für konsistentes Design
 *
 * @author Studium Projekt
 * @version 1.0
 * =================================================================
 */

// ===== REACT IMPORTS =====
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ===== MATERIAL-UI IMPORTS =====
// Box: Flexbox Container für Layout
// Paper: Material Design Card mit Schatten
// TextField: Eingabefelder mit Material Design
// Button: Interaktive Schaltflächen
// Typography: Textkomponenten mit verschiedenen Varianten
// Container: Responsive Container für Content-Begrenzung
// Alert: Feedback-Komponente für Fehlermeldungen
// Divider: Visuelle Trennung zwischen Bereichen
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

// ===== CUSTOM HOOKS =====
// AuthContext stellt Authentifizierungsfunktionen bereit
import { useAuth } from '../contexts/AuthContext';

/**
 * =================================================================
 * HAUPT-KOMPONENTE: LoginPage
 * =================================================================
 *
 * Diese funktionale Komponente verwaltet den gesamten Login-Prozess
 * und stellt sowohl normale als auch Demo-Login-Optionen bereit.
 */
export default function LoginPage() {

    // =================================================================
    // STATE MANAGEMENT - React Hooks für lokalen Zustand
    // =================================================================

    /**
     * EMAIL STATE
     * Verwaltet die Eingabe des Benutzers für die E-Mail-Adresse
     * useState Hook initialisiert mit leerem String
     */
    const [email, setEmail] = useState('');

    /**
     * PASSWORD STATE
     * Verwaltet die Eingabe des Benutzers für das Passwort
     * Wird als controlled component verwendet
     */
    const [password, setPassword] = useState('');

    /**
     * ERROR STATE
     * Speichert Fehlermeldungen für Anzeige an den Benutzer
     * Wird bei Login-Fehlern gesetzt und in Alert-Komponente angezeigt
     */
    const [error, setError] = useState('');

    // =================================================================
    // EXTERNAL HOOKS - Externe Funktionalitäten
    // =================================================================

    /**
     * AUTHENTICATION CONTEXT
     * Destructuring der benötigten Funktionen aus AuthContext:
     * - login: Standard-Login mit Email/Passwort
     * - devLoginAdmin: Demo-Login mit Admin-Rechten (alle Menüs)
     * - devLoginLimited: Demo-Login mit begrenzten Rechten
     * - isAuthenticated: Boolean-Status der Authentifizierung
     */
    const { login, devLoginAdmin, devLoginLimited, isAuthenticated } = useAuth();

    /**
     * REACT ROUTER NAVIGATION
     * useNavigate Hook für programmatische Navigation
     * Ermöglicht Weiterleitung nach erfolgreichem Login
     */
    const navigate = useNavigate();

    // =================================================================
    // SIDE EFFECTS - useEffect Hooks
    // =================================================================

    /**
     * AUTOMATISCHE WEITERLEITUNG NACH LOGIN
     *
     * Dieser useEffect Hook überwacht den isAuthenticated Status
     * und leitet automatisch zum Dashboard weiter, wenn Login erfolgreich.
     *
     * DEPENDENCY ARRAY: [isAuthenticated, navigate]
     * - Wird ausgeführt bei Änderung des Authentication-Status
     * - navigate wird als Dependency aufgeführt (React Best Practice)
     *
     * REPLACE: true verhindert, dass Login-Page im Browser-Verlauf bleibt
     */
    useEffect(() => {
        if (isAuthenticated) {
            console.log('🚀 Login erfolgreich - Redirect zu Dashboard');
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // =================================================================
    // EVENT HANDLERS - Funktionen für Benutzerinteraktionen
    // =================================================================

    /**
     * STANDARD LOGIN HANDLER
     *
     * Verarbeitet das Absenden des Login-Formulars
     *
     * @param {Event} e - Form Submit Event
     *
     * ABLAUF:
     * 1. preventDefault() verhindert Standard-Formular-Verhalten
     * 2. Aufruf der login-Funktion aus AuthContext
     * 3. Fehlerbehandlung: Bei Misserfolg wird Error-State gesetzt
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Verhindert Seiten-Reload bei Form Submit

        // Asynchroner Login-Aufruf mit Email und Passwort
        const result = await login(email, password);

        // Fehlerbehandlung: Wenn Login fehlschlägt
        if (!result.success) {
            setError(result.error); // Fehlermeldung für UI setzen
        }
        // Bei Erfolg wird automatisch durch useEffect weitergeleitet
    };

    /**
     * DEMO ADMIN LOGIN HANDLER
     *
     * Ermöglicht schnelles Testen mit vollen Admin-Rechten
     * Alle 5 Hauptmenüpunkte werden sichtbar
     *
     * ENTWICKLUNGSZWECK: Wird in Produktion entfernt
     */
    const handleAdminLogin = () => {
        console.log('🔑 Admin Login - Alle Menüs sichtbar');
        devLoginAdmin(); // Ruft Demo-Login aus AuthContext auf
    };

    /**
     * DEMO LIMITED LOGIN HANDLER
     *
     * Ermöglicht Testen mit eingeschränkten Benutzerrechten
     * Nur "Lager" und "Vertrieb" Menüpunkte sichtbar
     *
     * ZWECK: Testen der rollenbasierten Menü-Anzeige
     */
    const handleLimitedLogin = () => {
        console.log('🔒 Limited Login - Nur Lager & Vertrieb sichtbar');
        devLoginLimited(); // Ruft Demo-Login mit begrenzten Rechten auf
    };

    // =================================================================
    // RENDER - JSX Return
    // =================================================================

    return (
        /**
         * VOLLBILD CONTAINER
         *
         * Hauptcontainer der Login-Seite mit Vollbild-Abmessungen
         *
         * CSS PROPERTIES (sx Prop):
         * - width: '100vw' = 100% der Viewport-Breite
         * - height: '100vh' = 100% der Viewport-Höhe
         * - display: 'flex' = Flexbox Layout
         * - alignItems: 'center' = Vertikale Zentrierung
         * - justifyContent: 'center' = Horizontale Zentrierung
         * - backgroundColor: Subtiler grauer Hintergrund
         * - margin/padding: 0 = Entfernt Standard-Browser-Abstände
         */
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
            {/**
             * RESPONSIVE CONTENT CONTAINER
             *
             * Innerer Container für responsive Gestaltung
             * - width: '100%' = Nutzt verfügbaren Platz
             * - maxWidth: '500px' = Begrenzt maximale Breite
             * - px: 2 = Padding horizontal für mobile Geräte
             */}
            <Box sx={{ width: '100%', maxWidth: '500px', px: 2 }}>

                {/**
                 * MATERIAL DESIGN CARD
                 *
                 * Paper-Komponente erstellt Material Design Card mit Schatten
                 * - p: 4 = Padding 32px (4 * 8px MUI Spacing)
                 * - width: '100%' = Nutzt verfügbare Container-Breite
                 * - mx: 'auto' = Automatische horizontale Zentrierung
                 */}
                <Paper sx={{ p: 4, width: '100%', mx: 'auto' }}>

                    {/**
                     * HAUPT-ÜBERSCHRIFT
                     *
                     * Typography mit h4 Variant für große, prominente Überschrift
                     * - align="center" = Zentrierte Textausrichtung
                     * - gutterBottom = Automatischer Abstand nach unten
                     */}
                    <Typography variant="h4" align="center" gutterBottom>
                        ERP System Login
                    </Typography>

                    {/* =================================================================
                        ENTWICKLUNGS-BEREICH: DEMO LOGIN BUTTONS
                        ================================================================= */}

                    {/**
                     * DEMO LOGIN SEKTION
                     *
                     * Dieser Bereich enthält Buttons für schnelles Demo-Login
                     * WICHTIG: Nur für Entwicklung - wird in Produktion entfernt
                     */}
                    <Box sx={{ mb: 3, textAlign: 'center' }}>

                        {/* Demo-Sektion Überschrift */}
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            🧪 Demo Logins
                        </Typography>

                        {/**
                         * ADMIN DEMO LOGIN BUTTON
                         *
                         * Button für sofortigen Login mit Admin-Rechten
                         * - variant="contained" = Gefüllter Button-Stil
                         * - color="success" = Grüne Farbe (MUI Theme)
                         * - fullWidth = Nutzt komplette verfügbare Breite
                         * - onClick Handler ruft handleAdminLogin auf
                         */}
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleAdminLogin}
                            fullWidth
                            sx={{ mb: 1 }}
                        >
                            👑 Full View Developer Login
                        </Button>

                        {/* Erklärungstext für Admin-Login */}
                        <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                            Alle 5 Menüpunkte sichtbar (Admin-Rechte)
                        </Typography>

                        {/**
                         * LIMITED DEMO LOGIN BUTTON
                         *
                         * Button für Login mit eingeschränkten Rechten
                         * - color="warning" = Orange/Gelbe Warnung-Farbe
                         * - Testet rollenbasierte Menü-Beschränkungen
                         */}
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleLimitedLogin}
                            fullWidth
                            sx={{ mb: 1 }}
                        >
                            🔒 Limited Role Test Login
                        </Button>

                        {/* Erklärungstext für Limited-Login */}
                        <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                            Nur "Lager" und "Vertrieb" sichtbar
                        </Typography>

                        {/* Visuelle Trennung zwischen Demo und echtem Login */}
                        <Divider sx={{ my: 2 }} />

                        {/* Hinweis dass Demo-Bereich temporär ist */}
                        <Typography variant="caption" color="text.secondary">
                            Für Entwicklung - wird später entfernt
                        </Typography>
                    </Box>

                    {/* =================================================================
                        NORMALER LOGIN FORM
                        ================================================================= */}

                    {/**
                     * LOGIN FORMULAR
                     *
                     * HTML Form mit React onSubmit Handler
                     * - component="form" = Semantisch korrektes Form-Element
                     * - onSubmit={handleSubmit} = Event Handler für Form-Absendung
                     */}
                    <Box component="form" onSubmit={handleSubmit}>

                        {/**
                         * FEHLER-ANZEIGE
                         *
                         * Conditional Rendering: Alert wird nur angezeigt wenn error State gesetzt
                         * - severity="error" = Rote Fehler-Darstellung
                         * - sx={{ mb: 2 }} = Margin-bottom für Abstand
                         */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/**
                         * EMAIL EINGABEFELD
                         *
                         * Controlled Component Pattern:
                         * - value={email} = State als Single Source of Truth
                         * - onChange aktualisiert State bei jeder Eingabe
                         */}
                        <Box sx={{ mb: 2 }}>
                            {/* Label über dem Eingabefeld */}
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                Email
                            </Typography>

                            {/**
                             * EMAIL TEXTFIELD
                             *
                             * Material-UI TextField Komponente
                             * - fullWidth = Nutzt komplette Container-Breite
                             * - type="email" = HTML5 Email-Validierung
                             * - value/onChange = Controlled Component Pattern
                             * - placeholder = Hilfstext für Benutzer
                             * - variant="outlined" = Umrandeter Stil
                             * - required = HTML5 Pflichtfeld-Validierung
                             */}
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

                        {/**
                         * PASSWORT EINGABEFELD
                         *
                         * Analog zum Email-Feld, aber mit password type
                         * - type="password" = Maskiert Eingabe mit Punkten
                         * - Gleiche Controlled Component Struktur
                         */}
                        <Box sx={{ mb: 3 }}>
                            {/* Label über dem Passwort-Feld */}
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                Passwort
                            </Typography>

                            {/**
                             * PASSWORT TEXTFIELD
                             *
                             * Identische Konfiguration wie Email-Feld
                             * aber mit password type für Sicherheit
                             */}
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

                        {/**
                         * SUBMIT BUTTON
                         *
                         * Primärer Action-Button für Login
                         * - type="submit" = Löst Form onSubmit Event aus
                         * - fullWidth = Nutzt komplette verfügbare Breite
                         * - variant="contained" = Hervorgehobener Button-Stil
                         * - sx Styling für Abstände
                         */}
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

/**
 * =================================================================
 * ZUSAMMENFASSUNG DER VERWENDETEN KONZEPTE:
 * =================================================================
 *
 * 1. REACT HOOKS:
 *    - useState für lokalen Zustand
 *    - useEffect für Side Effects
 *    - Custom Hook (useAuth) für geteilte Logik
 *
 * 2. MATERIAL-UI DESIGN SYSTEM:
 *    - Konsistente Komponenten (Box, Paper, TextField, etc.)
 *    - Theme-basierte Farben und Spacing
 *    - Responsive Design mit sx Prop
 *
 * 3. CONTROLLED COMPONENTS:
 *    - React State als Single Source of Truth
 *    - onChange Handler für State Updates
 *    - Formular-Validierung
 *
 * 4. EVENT HANDLING:
 *    - Form onSubmit mit preventDefault
 *    - Button onClick Handler
 *    - Asynchrone API Calls
 *
 * 5. CONDITIONAL RENDERING:
 *    - Error Alert nur bei Fehlern
 *    - Automatische Weiterleitung bei Erfolg
 *
 * 6. RESPONSIVE DESIGN:
 *    - Flexbox für Zentrierung
 *    - Viewport-basierte Dimensionen
 *    - Mobile-friendly Spacing
 *
 *
 * =================================================================
 */