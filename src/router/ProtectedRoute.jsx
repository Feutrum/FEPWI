
/**
 * =================================================================
 * PROTECTED ROUTE COMPONENT - ZUGRIFFSKONTROLLE FÜR SEITEN
 * =================================================================
 *
 * Diese Komponente implementiert Zugriffskontrolle für geschützte
 * Bereiche der Anwendung. Sie prüft die Authentifizierung von
 * Benutzern bevor der Zugang zu bestimmten Seiten gewährt wird.
 *
 * ZWECK:
 * Automatische Prüfung ob ein Benutzer berechtigt ist, eine
 * bestimmte Seite aufzurufen. Nicht-authentifizierte Benutzer
 * werden zur Login-Seite weitergeleitet.
 *
 * FUNKTIONSWEISE:
 * - Überprüft den aktuellen Authentifizierungsstatus
 * - Zeigt während der Prüfung eine Ladeanimation
 * - Leitet nicht-authentifizierte Benutzer zum Login weiter
 * - Erlaubt authentifizierten Benutzern den Zugang zur Seite
 *
 * VERWENDUNG:
 * Wird als Wrapper um Komponenten verwendet, die Authentifizierung
 * erfordern (Dashboard, Benutzerprofil, Admin-Bereiche).
 *
 * @version 1.0
 * =================================================================
 */

// ===== REACT ROUTER IMPORTS =====
import { Navigate } from 'react-router-dom';

// ===== AUTHENTICATION CONTEXT =====
import { useAuth } from '../contexts/AuthContext';

// ===== UI COMPONENTS =====
import { Box, CircularProgress } from '@mui/material';

// =================================================================
// PROTECTED ROUTE COMPONENT
// =================================================================

/**
 * PROTECTED ROUTE WRAPPER COMPONENT
 *
 * Wrapper-Komponente die andere Komponenten mit Authentifizierung
 * schützt. Implementiert drei verschiedene Zustände basierend
 * auf dem aktuellen Authentifizierungsstatus.
 *
 * @param {Object} props - Component Properties
 * @param {ReactNode} props.children - Zu schützende Komponente
 * @returns {ReactElement} Loading, Redirect oder geschützte Komponente
 */
export default function ProtectedRoute({ children }) {

    /**
     * AUTHENTICATION STATUS ABRUFEN
     *
     * Extrahiert den aktuellen Authentifizierungsstatus und
     * Loading-State aus dem AuthContext.
     */
    const { isAuthenticated, isLoading } = useAuth();

    // =================================================================
    // LOADING STATE - Authentifizierungs-Prüfung läuft
    // =================================================================

    /**
     * LOADING STATE HANDLING
     *
     * Während der App-Initialisierung wird geprüft ob eine gültige
     * Session im Browser gespeichert ist. Bis diese Prüfung
     * abgeschlossen ist, wird eine Ladeanimation angezeigt.
     *
     * ZWECK:
     * - Verhindert kurzes Aufblitzen von "Nicht eingeloggt"-Zustand
     * - Bietet visuelles Feedback während der Session-Prüfung
     * - Verbessert die Benutzererfahrung beim App-Start
     */
    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    // =================================================================
    // NOT AUTHENTICATED - Weiterleitung zum Login
    // =================================================================

    /**
     * UNAUTHORIZED ACCESS HANDLING
     *
     * Wenn die Authentifizierungs-Prüfung abgeschlossen ist und
     * kein gültiger Login-Status vorliegt, wird der Benutzer
     * automatisch zur Login-Seite weitergeleitet.
     *
     * NAVIGATION:
     * - Navigate-Komponente führt programmatische Weiterleitung durch
     * - replace={true} ersetzt den aktuellen Browser-History-Eintrag
     * - Verhindert Navigation zurück zur geschützten Seite über Browser-Zurück
     */
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // =================================================================
    // AUTHENTICATED - Zugang gewährt
    // =================================================================

    /**
     * AUTHORIZED ACCESS
     *
     * Wenn der Benutzer erfolgreich authentifiziert ist, wird die
     * ursprünglich angeforderte Komponente gerendert. Die ProtectedRoute
     * wirkt transparent und gibt die children-Komponente unverändert weiter.
     *
     * CHILDREN PATTERN:
     * - children enthält die zu schützende Komponente
     * - Wird bei erfolgreicher Authentifizierung durchgereicht
     * - ProtectedRoute ist nach erfolgreicher Prüfung "unsichtbar"
     */
    return children;
}

/**
 * =================================================================
 * VERWENDUNGSBEISPIELE:
 * =================================================================
 *
 * GRUNDLEGENDE VERWENDUNG:
 * ```jsx
 * <Route 
 *   path="/dashboard" 
 *   element={
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   } 
 * />
 * ```
 *
 * MEHRERE GESCHÜTZTE ROUTEN:
 * ```jsx
 * <Routes>
 *   <Route path="/login" element={<LoginPage />} />
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   } />
 *   <Route path="/profile" element={
 *     <ProtectedRoute><ProfilePage /></ProtectedRoute>
 *   } />
 * </Routes>
 * ```
 *
 * =================================================================
 */

/**
 * =================================================================
 * KONZEPTE UND PATTERNS:
 * =================================================================
 *
 * 1. HIGHER-ORDER COMPONENT PATTERN:
 *    - Wrapper-Komponente die andere Komponenten erweitert
 *    - Trennung von Authentifizierungs-Logik und Seiten-Logik
 *    - Wiederverwendbare Sicherheitsschicht
 *
 * 2. CONDITIONAL RENDERING:
 *    - Verschiedene UI basierend auf Authentifizierungsstatus
 *    - Loading-, Error- und Success-States
 *    - Dynamische Benutzeroberfläche
 *
 * 3. REACT ROUTER INTEGRATION:
 *    - Programmatische Navigation mit Navigate-Komponente
 *    - Integration in deklaratives Routing-System
 *    - Browser-History Management
 *
 * 4. CONTEXT API INTEGRATION:
 *    - Zugriff auf globalen Authentifizierungsstatus
 *    - Reaktive Updates bei Änderung des Login-Status
 *    - Entkopplung von Authentifizierungs-Provider
 *
 * =================================================================
 */