
/**
 * =================================================================
 * AUTHENTICATION CONTEXT - GLOBALE AUTHENTIFIZIERUNG
 * =================================================================
 *
 * Dieser Context stellt die zentrale Authentifizierungslogik für
 * die gesamte Anwendung bereit. Er implementiert das Context API
 * Pattern von React für globales State Management.
 *
 * HAUPTFUNKTIONALITÄTEN:
 * - Benutzerauthentifizierung (Login/Logout)
 * - Session-Management (localStorage persistence)
 * - Globaler Authentication State
 * - Demo-Login Funktionen für Entwicklung
 * - Automatische Session-Prüfung beim App-Start
 * - Event-basierte Session-Expired Behandlung
 *
 * DESIGN PATTERNS:
 * - Context API für globales State Management
 * - Provider Pattern für Dependency Injection
 * - Custom Hook Pattern für gekapselte Logik
 * - Observer Pattern für Session Events
 *
 * @author Studium Projekt
 * @version 1.0
 * =================================================================
 */

// ===== REACT CORE IMPORTS =====
import {
    createContext,    // Erstellt React Context für globalen State
    useContext,       // Hook zum Konsumieren von Context
    useState,         // Hook für lokalen Component State
    useEffect         // Hook für Side Effects und Lifecycle
} from 'react';

// ===== SERVICE LAYER IMPORTS =====
// authService: Geschäftslogik für Authentifizierung
// Trennung von UI-Logic und Business-Logic
import { authService } from '../utils/authService.js';

// =================================================================
// CONTEXT CREATION - Globaler Authentication Context
// =================================================================

/**
 * AUTHENTICATION CONTEXT
 *
 * Erstellt einen React Context für die Authentifizierung.
 * Dieser Context wird von allen Komponenten der App konsumiert,
 * die Zugriff auf den Authentication State benötigen.
 *
 * DEFAULT VALUE: undefined
 * - Ermöglicht Error-Handling wenn Context außerhalb Provider verwendet wird
 */
const AuthContext = createContext();

// =================================================================
// PROVIDER COMPONENT - Context Provider Implementation
// =================================================================

/**
 * AUTHENTICATION PROVIDER COMPONENT
 *
 * Diese Komponente wraps die gesamte App und stellt den
 * Authentication State und die zugehörigen Funktionen bereit.
 *
 * @param {Object} props - Component Props
 * @param {ReactNode} props.children - Child Components die Zugriff auf Context benötigen
 *
 * PROVIDER PATTERN:
 * - Kapselt komplexe State-Logik
 * - Stellt einheitliche API für alle Consumer bereit
 * - Ermöglicht globales State Management ohne Prop Drilling
 */
export function AuthProvider({ children }) {

    // =================================================================
    // STATE MANAGEMENT - Zentraler Authentication State
    // =================================================================

    /**
     * AUTHENTICATION STATUS
     *
     * Boolean State der angibt ob Benutzer authentifiziert ist
     * - true: Benutzer ist eingeloggt
     * - false: Benutzer ist nicht eingeloggt
     *
     * INITIAL VALUE: false (sicherheitshalber nicht authentifiziert)
     */
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    /**
     * USER OBJECT STATE
     *
     * Speichert die Daten des aktuell eingeloggten Benutzers
     * - null: Kein Benutzer eingeloggt
     * - Object: Benutzerdaten (email, role, permissions, etc.)
     *
     * STRUCTURE: { email, role, permissions, ... }
     */
    const [user, setUser] = useState(null);

    /**
     * LOADING STATE
     *
     * Indikator für laufende Authentifizierungsprozesse
     * - true: Session-Check läuft (z.B. beim App-Start)
     * - false: Authentication State ist final bestimmt
     *
     * ZWECK: Verhindert flackern während initialer Session-Prüfung
     */
    const [isLoading, setIsLoading] = useState(true);

    // =================================================================
    // INITIALIZATION EFFECT - App-Start Session Check
    // =================================================================

    /**
     * COMPONENT INITIALIZATION EFFECT
     *
     * Wird einmalig beim Mount der AuthProvider Komponente ausgeführt
     *
     * FUNKTIONEN:
     * 1. Prüft ob existierende Session in localStorage vorhanden
     * 2. Registriert Event Listener für Session-Expired Events
     * 3. Setup von Cleanup-Funktionen
     *
     * DEPENDENCY ARRAY: [] = Wird nur einmal beim Mount ausgeführt
     */
    useEffect(() => {
        // Sofortige Session-Prüfung beim App-Start
        checkLocalSession();

        /**
         * SESSION-EXPIRED EVENT LISTENER
         *
         * Globaler Event Listener für Session-Ablauf
         * Wird von authService getriggert wenn Token abläuft
         *
         * CUSTOM EVENT: 'session-expired'
         * - Ermöglicht lose Kopplung zwischen Service und UI
         * - Zentrale Behandlung von Session-Ablauf
         */
        const handleSessionExpired = () => {
            console.log('🚨 Session expired - zurück zum Login');

            // Authentication State zurücksetzen
            setIsAuthenticated(false);
            setUser(null);

            // Hinweis: Navigation wird durch ProtectedRoute Component gehandhabt
        };

        // Event Listener registrieren
        window.addEventListener('session-expired', handleSessionExpired);

        /**
         * CLEANUP FUNCTION
         *
         * Wird ausgeführt wenn AuthProvider Component unmounted wird
         * Entfernt Event Listeners um Memory Leaks zu verhindern
         *
         * BEST PRACTICE: Immer Event Listeners in useEffect cleanup entfernen
         */
        return () => {
            window.removeEventListener('session-expired', handleSessionExpired);
        };
    }, []); // Leeres Dependency Array = nur beim Mount/Unmount

    // =================================================================
    // SESSION MANAGEMENT FUNCTIONS
    // =================================================================

    /**
     * LOCAL SESSION CHECK FUNCTION
     *
     * Prüft ob eine gültige Session in localStorage gespeichert ist
     * Wird beim App-Start und nach Login aufgerufen
     *
     * ABLAUF:
     * 1. authService.getCurrentUser() prüft localStorage
     * 2. Bei gültiger Session: State entsprechend setzen
     * 3. Bei ungültiger Session: State auf default belassen
     * 4. Loading State auf false setzen (Check abgeschlossen)
     *
     * SEITENEFFEKTE:
     * - Setzt isAuthenticated State
     * - Setzt user State
     * - Setzt isLoading State
     * - Console-Ausgaben für Debugging
     */
    const checkLocalSession = () => {
        console.log('🔍 Prüfe lokale Session...');

        // Service-Layer: Prüfung der gespeicherten Session
        const localAuth = authService.getCurrentUser();

        if (localAuth) {
            // Gültige Session gefunden
            setIsAuthenticated(true);
            setUser(localAuth.user);
            console.log('✅ Lokale Session gefunden:', localAuth.user.email);
        } else {
            // Keine oder ungültige Session
            console.log('❌ Keine lokale Session');
            // State bleibt auf default values (false, null)
        }

        // Session-Check abgeschlossen
        setIsLoading(false);
    };

    // =================================================================
    // AUTHENTICATION FUNCTIONS - Login/Logout Logic
    // =================================================================

    /**
     * STANDARD LOGIN FUNCTION
     *
     * Führt Benutzerauthentifizierung mit Email und Passwort durch
     *
     * @param {string} email - Benutzer E-Mail Adresse
     * @param {string} password - Benutzer Passwort
     * @returns {Promise<Object>} Result Object mit success/error
     *
     * ABLAUF:
     * 1. Delegation an authService für eigentliche Authentifizierung
     * 2. Bei Erfolg: Authentication State entsprechend setzen
     * 3. Return des Result Objects für UI-Feedback
     *
     * ASYNC/AWAIT: Asynchrone Behandlung für API-Calls
     */
    const login = async (email, password) => {
        // Service-Layer: Authentifizierung durchführen
        const result = await authService.login({ email, password });

        // Bei erfolgreichem Login: Context State aktualisieren
        if (result.success) {
            setIsAuthenticated(true);
            setUser(result.user);

            // Hinweis: Session wird vom authService in localStorage gespeichert
        }

        // Result für UI-Komponente zurückgeben
        return result;
    };

    // =================================================================
    // DEVELOPMENT FUNCTIONS - Demo Login für Testing
    // =================================================================

    /**
     * ADMIN DEMO LOGIN FUNCTION
     *
     * Entwickler-Funktion für schnelles Login mit Admin-Rechten
     *
     * ZWECK:
     * - Schnelles Testen ohne manuelle Eingabe
     * - Alle Menüpunkte und Funktionen verfügbar
     * - Simulation von Vollzugriff-Benutzer
     *
     * CREDENTIALS:
     * - Email: 'admin@test.com' (vordefinierte Admin-Credentials)
     * - Password: 'development' (Development-Passwort)
     *
     * WICHTIG: Wird in Produktion entfernt oder deaktiviert
     */
    const devLoginAdmin = async () => {
        // Vordefinierte Admin-Credentials für Development
        const result = await authService.login({
            email: 'admin@test.com',
            password: 'development'
        });

        // Gleiche State-Behandlung wie bei normalem Login
        if (result.success) {
            setIsAuthenticated(true);
            setUser(result.user);
        }

        return result;
    };

    /**
     * LIMITED DEMO LOGIN FUNCTION
     *
     * Entwickler-Funktion für Login mit eingeschränkten Rechten
     *
     * ZWECK:
     * - Testen der rollenbasierten Zugriffskontrolle
     * - Nur bestimmte Menüpunkte sichtbar (warehouse & sales)
     * - Simulation von eingeschränktem Benutzer
     *
     * CREDENTIALS:
     * - Email: 'worker@test.com' (Worker-Role Credentials)
     * - Password: 'development' (Development-Passwort)
     *
     * TESTING: Verifiziert dass Menü-Beschränkungen funktionieren
     */
    const devLoginLimited = async () => {
        // Vordefinierte Worker-Credentials für Development
        const result = await authService.login({
            email: 'worker@test.com',
            password: 'development'
        });

        // State-Update bei erfolgreichem Login
        if (result.success) {
            setIsAuthenticated(true);
            setUser(result.user);
        }

        return result;
    };

    /**
     * LEGACY DEV LOGIN FUNCTION
     *
     * Backwards-Kompatibilität für existierenden Code
     * Delegiert an devLoginAdmin für konsistentes Verhalten
     *
     * ZWECK: Vermeidet Breaking Changes in bestehenden Komponenten
     * STATUS: Deprecated - sollte durch devLoginAdmin ersetzt werden
     */
    const devLogin = async () => {
        return await devLoginAdmin();
    };

    // =================================================================
    // LOGOUT FUNCTION - Session Termination
    // =================================================================

    /**
     * LOGOUT FUNCTION
     *
     * Beendet die aktuelle Benutzersession und räumt auf
     *
     * ABLAUF:
     * 1. authService.logout() entfernt localStorage Daten
     * 2. Context State wird zurückgesetzt
     * 3. UI wird automatisch durch Context Consumer aktualisiert
     *
     * SEITENEFFEKTE:
     * - Entfernt Token aus localStorage
     * - Setzt isAuthenticated auf false
     * - Setzt user auf null
     * - Triggert Re-Render aller Context Consumer
     */
    const logout = () => {
        // Service-Layer: Session-Daten entfernen
        authService.logout();

        // Context State zurücksetzen
        setIsAuthenticated(false);
        setUser(null);

        // Hinweis: Navigation wird durch useEffect in LoginPage gehandhabt
    };

    // =================================================================
    // CONTEXT PROVIDER RENDER
    // =================================================================

    /**
     * CONTEXT PROVIDER JSX
     *
     * Stellt den AuthContext.Provider bereit der alle Funktionen
     * und State-Werte an Consumer-Komponenten weitergibt
     *
     * VALUE OBJECT:
     * - isAuthenticated: Boolean Authentication Status
     * - user: Current User Object oder null
     * - login: Standard Login Function
     * - logout: Session Termination Function
     * - devLogin: Legacy Development Login
     * - devLoginAdmin: Admin Development Login
     * - devLoginLimited: Limited Development Login
     * - isLoading: Loading State für App Initialization
     *
     * CHILDREN: Alle Child-Komponenten die Zugriff auf Context benötigen
     */
    return (
        <AuthContext.Provider value={{
            // Authentication State
            isAuthenticated,
            user,
            isLoading,

            // Core Authentication Functions
            login,
            logout,

            // Development Functions
            devLogin,
            devLoginAdmin,
            devLoginLimited
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// =================================================================
// CUSTOM HOOK - Vereinfachter Context Zugriff
// =================================================================

/**
 * USE AUTH CUSTOM HOOK
 *
 * Custom Hook der den Zugriff auf AuthContext vereinfacht
 * und Error-Handling für falsche Verwendung bereitstellt
 *
 * @returns {Object} AuthContext Value Object
 * @throws {Error} Wenn Hook außerhalb AuthProvider verwendet wird
 *
 * VORTEILE:
 * - Vereinfachter Import: nur useAuth statt useContext + AuthContext
 * - Eingebaute Error-Behandlung
 * - Bessere Developer Experience
 * - Type Safety (bei TypeScript)
 *
 * VERWENDUNG:
 * ```javascript
 * import { useAuth } from './AuthContext';
 *
 * function MyComponent() {
 *   const { isAuthenticated, login, logout } = useAuth();
 *   // ...
 * }
 * ```
 *
 * ERROR HANDLING:
 * Wirft aussagekräftigen Fehler wenn Hook außerhalb Provider verwendet wird
 * Verhindert undefined-Zugriffe und schwer debugbare Fehler
 */
export const useAuth = () => {
    // Context-Wert aus AuthContext extrahieren
    const context = useContext(AuthContext);

    /**
     * CONTEXT VALIDATION
     *
     * Prüft ob Hook innerhalb eines AuthProvider verwendet wird
     * context ist undefined wenn Provider fehlt
     *
     * FEHLERBEHANDLUNG:
     * - Wirft aussagekräftige Fehlermeldung
     * - Hilft Entwicklern bei korrekter Setup-Identifikation
     * - Verhindert Runtime-Fehler durch undefined-Zugriffe
     */
    if (!context) {
        throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
    }

    // Gültigen Context zurückgeben
    return context;
};

/**
 * =================================================================
 * ZUSAMMENFASSUNG DER VERWENDETEN KONZEPTE:
 * =================================================================
 *
 * 1. REACT CONTEXT API:
 *    - createContext() für globalen State
 *    - Provider Pattern für State-Bereitstellung
 *    - useContext() für State-Konsumierung
 *
 * 2. CUSTOM HOOKS:
 *    - useAuth() als vereinfachte Context-API
 *    - Error Handling bei falscher Verwendung
 *    - Bessere Developer Experience
 *
 * 3. STATE MANAGEMENT:
 *    - useState für lokalen Component State
 *    - Globaler State für App-weite Authentifizierung
 *    - Loading States für bessere UX
 *
 * 4. SIDE EFFECTS:
 *    - useEffect für Component Lifecycle
 *    - Event Listeners für Session Management
 *    - Cleanup Functions für Memory Leaks Prevention
 *
 * 5. SEPARATION OF CONCERNS:
 *    - AuthContext: UI State Management
 *    - authService: Business Logic
 *    - Klare Trennung von Verantwortlichkeiten
 *
 * 6. DEVELOPMENT TOOLS:
 *    - Demo-Login Functions für Testing
 *    - Console-Logging für Debugging
 *    - Development vs Production Considerations
 *
 * 7. ERROR HANDLING:
 *    - Custom Hook Validation
 *    - Graceful Session Expiry Handling
 *    - Aussagekräftige Fehlermeldungen
 *
 * 8. PERFORMANCE:
 *    - Event Listener Cleanup
 *    - Conditional State Updates
 *    - Loading States für UX
 *
 * 9. SECURITY PATTERNS:
 *    - Session Token Management
 *    - Automatic Session Expiry
 *    - Secure State Reset on Logout
 *
 * =================================================================
 */