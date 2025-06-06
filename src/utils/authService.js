
/**
 * =================================================================
 * AUTHENTICATION SERVICE - BUSINESS LOGIC LAYER
 * =================================================================
 *
 * Dieser Service stellt die gesamte Geschäftslogik für die
 * Benutzerauthentifizierung bereit. Er fungiert als Middleware
 * zwischen der UI-Schicht (React Components) und der API-Schicht.
 *
 * HAUPTFUNKTIONALITÄTEN:
 * - Login/Logout Geschäftslogik
 * - Token-Management (localStorage)
 * - Session-Persistierung und -Validierung
 * - API-Integration für Authentifizierung
 * - Entwickler-Hilfsfunktionen
 * - Fehlerbehandlung und Datenvalidierung
 *
 * DESIGN PRINCIPLES:
 * - Separation of Concerns (Business Logic ↔ UI Logic)
 * - Single Responsibility Principle
 * - Service Layer Pattern
 * - Stateless Design (Session-State in localStorage)
 * - Promise-based Async Operations
 *
 * INTEGRATION:
 * - Backend: Strapi CMS Authentication API
 * - Frontend: AuthContext für State Management
 * - Storage: Browser localStorage für Session Persistence
 *
 * @author Studium Projekt
 * @version 1.0
 * =================================================================
 */

// ===== EXTERNAL DEPENDENCIES =====
// API Service: Kommunikation mit Backend (Strapi)
// Enthält HTTP Client Configuration und Base URL
import { api } from './api.js';

// =================================================================
// SERVICE OBJECT - Authentication Business Logic
// =================================================================

/**
 * AUTHENTICATION SERVICE OBJECT
 *
 * Objekt-basierte Service-Implementierung mit allen
 * authentifizierungsrelevanten Funktionen.
 *
 * PATTERN: Module Pattern
 * - Kapselt verwandte Funktionen in einem Namespace
 * - Vereinfacht Import/Export
 * - Stellt klare API-Oberfläche bereit
 */
export const authService = {

    // =================================================================
    // CORE AUTHENTICATION - Login Funktionalität
    // =================================================================

    /**
     * LOGIN FUNCTION - Zentrale Authentifizierungslogik
     *
     * Führt Benutzeranmeldung über Backend-API durch und
     * verwaltet lokale Session-Speicherung.
     *
     * @param {Object} credentials - Anmeldedaten
     * @param {string} credentials.email - Benutzer E-Mail Adresse
     * @param {string} credentials.password - Benutzer Passwort
     * @returns {Promise<Object>} Result Object mit success/error Status
     *
     * ABLAUF:
     * 1. API-Call an Strapi Authentication Endpoint
     * 2. Response-Validierung und JWT-Token Extraktion
     * 3. Lokale Speicherung von Token und Benutzerdaten
     * 4. Standardisierte Result-Objekt Rückgabe
     *
     * RETURN OBJECT STRUCTURE:
     * Success: { success: true, user: Object, token: string }
     * Error: { success: false, error: string }
     *
     * SICHERHEIT:
     * - Token wird sicher in localStorage gespeichert
     * - Passwort wird nie lokal gespeichert
     * - Sensitive Daten nur bei erfolgreichem Login
     */
    login: async (credentials) => {
        try {
            /**
             * API REQUEST - Strapi Authentication
             *
             * POST Request an Strapi Local Authentication Endpoint
             *
             * ENDPOINT: '/auth/local'
             * - Standard Strapi Authentication Route
             * - Verwendet Email/Passwort Credentials
             *
             * REQUEST BODY:
             * - identifier: Email (Strapi-spezifisches Feld)
             * - password: Klartext-Passwort (wird von Strapi gehasht)
             *
             * STRAPI RESPONSE:
             * - jwt: JSON Web Token für Authentication
             * - user: Benutzer-Objekt mit Profildaten
             */
            const response = await api.post('/auth/local', {
                identifier: credentials.email,  // Strapi verwendet 'identifier' statt 'email'
                password: credentials.password
            });

            /**
             * SUCCESS HANDLING - JWT Token Validation
             *
             * Prüft ob Strapi erfolgreich JWT Token zurückgegeben hat
             * response.jwt ist der Standard-Response von Strapi
             */
            if (response.jwt) {
                /**
                 * LOCAL STORAGE - Session Persistence
                 *
                 * Speichert Authentication-Daten lokal für Session-Persistierung
                 *
                 * STORED DATA:
                 * 1. auth_token: JWT Token für API-Autorisierung
                 * 2. user_data: Serialisierte Benutzerdaten (JSON)
                 *
                 * SECURITY NOTE:
                 * localStorage ist für Tokens akzeptabel da:
                 * - XSS-Schutz durch Content Security Policy
                 * - Token haben Ablaufzeit
                 * - Sensitive Daten sind minimal
                 */
                localStorage.setItem('auth_token', response.jwt);
                localStorage.setItem('user_data', JSON.stringify(response.user));

                /**
                 * SUCCESS RESPONSE
                 *
                 * Standardisiertes Response-Objekt für erfolgreichen Login
                 * - success: true für UI-Behandlung
                 * - user: Benutzer-Daten für Context State
                 * - token: JWT für weitere API-Calls (optional für UI)
                 */
                return {
                    success: true,
                    user: response.user,
                    token: response.jwt
                };
            }

            /**
             * FALLBACK ERROR
             *
             * Wenn API-Response keinen JWT enthält
             * Sollte normalerweise nicht auftreten bei korrekter Strapi-Config
             */
            return {
                success: false,
                error: 'Login fehlgeschlagen'
            };

        } catch (error) {
            /**
             * ERROR HANDLING
             *
             * Behandelt alle möglichen Fehlerquellen:
             * - Netzwerkfehler (keine Internetverbindung)
             * - API-Fehler (falsche Credentials, Server-Error)
             * - JSON-Parse Fehler
             * - localStorage Fehler
             *
             * error.message enthält die ursprüngliche Fehlermeldung
             * von der API oder dem HTTP-Client
             */
            return {
                success: false,
                error: error.message
            };
        }
    },

    // =================================================================
    // DEVELOPMENT FUNCTIONS - Testing und Development Support
    // =================================================================

    /**
     * DEVELOPMENT LOGIN FUNCTION
     *
     * Vereinfachte Login-Funktion für Entwicklung und Testing
     * Verwendet vordefinierte Entwickler-Credentials
     *
     * @returns {Promise<Object>} Result Object wie bei normalem Login
     *
     * ZWECK:
     * - Schnelles Testen ohne manuelle Eingabe
     * - Konsistente Entwicklungsumgebung
     * - Debugging und Feature-Testing
     *
     * CREDENTIALS:
     * - Email: 'dev@test.com'
     * - Password: 'development'
     *
     * IMPLEMENTATION:
     * Delegiert an standard login() Funktion für konsistentes Verhalten
     *
     * PRODUKTION:
     * Diese Funktion sollte in Production-Builds entfernt oder
     * durch Environment-Variablen deaktiviert werden
     */
    devLogin: async () => {
        // Delegation an Standard-Login mit vordefinierten Credentials
        return await authService.login({
            email: 'dev@test.com',
            password: 'development'
        });
    },

    // =================================================================
    // SESSION MANAGEMENT - Logout und Cleanup
    // =================================================================

    /**
     * LOGOUT FUNCTION - Session Termination
     *
     * Beendet die aktuelle Benutzersession und führt
     * lokales Cleanup durch.
     *
     * ABLAUF:
     * 1. Entfernung des JWT Tokens aus localStorage
     * 2. Entfernung der Benutzerdaten aus localStorage
     * 3. Console-Logging für Debugging
     *
     * DESIGN DECISION: Client-Side Only Logout
     * Strapi macht keine server-seitige Session-Verwaltung
     * JWT Tokens sind stateless - Server "vergisst" sie automatisch
     * bei Ablauf der Token-Lebenszeit
     *
     * SECURITY:
     * - Lokale Token-Entfernung verhindert weitere API-Zugriffe
     * - Token läuft server-seitig automatisch ab
     * - Keine sensitive Daten bleiben im Browser
     *
     * SEITENEFFEKTE:
     * - localStorage wird bereinigt
     * - Benutzer muss sich neu anmelden
     * - API-Calls ohne Token werden abgelehnt
     */
    logout: () => {
        /**
         * STORAGE CLEANUP
         *
         * Entfernt alle authentifizierungsrelevanten Daten
         * aus dem Browser-Storage
         *
         * REMOVED ITEMS:
         * - auth_token: JWT für API-Autorisierung
         * - user_data: Gespeicherte Benutzerdaten
         */
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        /**
         * LOGGING
         *
         * Console-Output für Entwickler-Feedback
         * Hilft bei Debugging und zeigt erfolgreichen Logout an
         */
        console.log('👋 Logout erfolgreich');
    },

    // =================================================================
    // SESSION VALIDATION - Current User und Token Handling
    // =================================================================

    /**
     * GET CURRENT USER FUNCTION - Session Restoration
     *
     * Prüft und lädt eine existierende Session aus localStorage
     * Wird beim App-Start verwendet für Session-Persistierung
     *
     * @returns {Object|null} Session-Objekt oder null bei ungültiger Session
     *
     * RETURN VALUE:
     * Success: { user: Object, token: string }
     * Failure: null
     *
     * ABLAUF:
     * 1. Laden der Session-Daten aus localStorage
     * 2. Validierung der Datenintegrität
     * 3. JSON-Parsing mit Error-Handling
     * 4. Return des Session-Objekts oder null
     *
     * ERROR HANDLING:
     * - JSON.parse Fehler (korrupte Daten)
     * - localStorage Zugriffsfehler
     * - Fehlende Keys im Storage
     * - Automatisches Cleanup bei Fehlern
     */
    getCurrentUser: () => {
        try {
            /**
             * STORAGE ACCESS
             *
             * Lädt gespeicherte Session-Daten aus localStorage
             *
             * ACCESSED KEYS:
             * - user_data: JSON-String der Benutzerdaten
             * - auth_token: JWT Token für API-Autorisierung
             */
            const userData = localStorage.getItem('user_data');
            const token = localStorage.getItem('auth_token');

            /**
             * DATA VALIDATION
             *
             * Prüft ob beide erforderlichen Datenpunkte vorhanden sind
             * Beide müssen existieren für gültige Session
             */
            if (userData && token) {
                /**
                 * SESSION OBJECT CONSTRUCTION
                 *
                 * Erstellt Session-Objekt mit deserialisierten Benutzerdaten
                 * JSON.parse() wandelt gespeicherten String zurück zu Object
                 *
                 * STRUCTURE:
                 * {
                 *   user: { email, id, role, permissions, ... },
                 *   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                 * }
                 */
                return {
                    user: JSON.parse(userData),  // Deserialisierung der Benutzerdaten
                    token                        // JWT Token as-is
                };
            }

            /**
             * NO SESSION FOUND
             *
             * Wenn userData oder token fehlen
             * Normale Situation bei erstem App-Besuch
             */
            return null;

        } catch (error) {
            /**
             * ERROR RECOVERY
             *
             * Bei jedem Fehler (meist JSON.parse) wird automatisch
             * ein Logout durchgeführt um inkonsistente Zustände zu vermeiden
             *
             * COMMON ERRORS:
             * - JSON.parse() Fehler bei korrupten user_data
             * - localStorage Zugriffsfehler
             * - SecurityError bei localStorage
             *
             * RECOVERY ACTION:
             * authService.logout() räumt localStorage auf
             */
            authService.logout(); // Cleanup bei Fehler
            return null;
        }
    },

    // =================================================================
    // TOKEN VALIDATION - Session Status Check
    // =================================================================

    /**
     * TOKEN VALIDATION FUNCTION - Simple Session Check
     *
     * Einfache Prüfung ob ein Authentication-Token vorhanden ist
     *
     * @returns {boolean} true wenn Token existiert, false wenn nicht
     *
     * ZWECK:
     * - Schnelle Session-Status Prüfung ohne Deserialisierung
     * - Guard Clauses in Components
     * - Conditional Rendering basierend auf Login-Status
     *
     * LIMITATION:
     * Diese Funktion prüft nur die EXISTENZ des Tokens,
     * nicht dessen GÜLTIGKEIT oder ABLAUFZEIT.
     *
     * ECHTE VALIDATION:
     * Vollständige Token-Validierung erfolgt bei jedem API-Call
     * durch das Backend (Strapi). Bei ungültigen Tokens
     * werden API-Requests mit 401 Unauthorized abgelehnt.
     *
     * DESIGN DECISION:
     * Vereinfachte Client-Side Prüfung für bessere UX
     * Server-Side ist die Single Source of Truth für Token-Gültigkeit
     */
    isTokenValid: () => {
        /**
         * TOKEN EXISTENCE CHECK
         *
         * localStorage.getItem() gibt null zurück wenn Key nicht existiert
         * !!token konvertiert zu Boolean:
         * - null -> false
         * - string -> true
         *
         * DOUBLE NEGATION (!!):
         * Erste Negation: null -> true, string -> false
         * Zweite Negation: true -> false, false -> true
         * Ergebnis: Truthiness als echter Boolean
         */
        const token = localStorage.getItem('auth_token');
        return !!token; // Vereinfacht - echte Validation macht Strapi
    }
};

/**
 * =================================================================
 * ZUSAMMENFASSUNG DER VERWENDETEN KONZEPTE:
 * =================================================================
 *
 * 1. SERVICE LAYER PATTERN:
 *    - Separation of Concerns: Business Logic ↔ UI Logic
 *    - Zentrale API für Authentication-Operationen
 *    - Stateless Design mit localStorage Persistence
 *
 * 2. ASYNC/AWAIT PROGRAMMING:
 *    - Promise-basierte API-Kommunikation
 *    - Fehlerbehandlung mit try/catch
 *    - Async Function Delegation
 *
 * 3. LOCAL STORAGE MANAGEMENT:
 *    - Session Persistence über Browser-Restarts
 *    - JSON Serialization/Deserialization
 *    - Error-tolerante Storage-Zugriffe
 *
 * 4. ERROR HANDLING STRATEGIES:
 *    - Graceful Degradation bei Storage-Fehlern
 *    - Automatisches Cleanup bei korrupten Daten
 *    - Standardisierte Error Response Objects
 *
 * 5. API INTEGRATION PATTERNS:
 *    - RESTful API Communication (POST /auth/local)
 *    - Strapi-spezifische Request/Response Handling
 *    - JWT Token Management
 *
 * 6. DEVELOPMENT SUPPORT:
 *    - Dev-Login Functions für Testing
 *    - Console Logging für Debugging
 *    - Simplified Token Validation
 *
 * 7. SECURITY CONSIDERATIONS:
 *    - JWT Token Storage in localStorage
 *    - No Password Persistence
 *    - Server-Side Token Validation
 *    - Automatic Session Cleanup
 *
 * 8. CODE ORGANIZATION:
 *    - Object-based Service Structure
 *    - Logical Function Grouping
 *    - Clear API Surface
 *    - Extensive Documentation
 *
 * 9. INTEGRATION ARCHITECTURE:
 *    - Clean separation from React Components
 *    - Context API compatible responses
 *    - Modular and testable design
 *    - Backend-agnostic authentication logic
 *
 * =================================================================
 *
 * ERWEITERTE KONZEPTE FÜR STUDIUM:
 * =================================================================
 *
 * 1. JWT (JSON WEB TOKENS):
 *    - Stateless Authentication Mechanism
 *    - Self-contained Authorization Information
 *    - Base64 Encoded Header.Payload.Signature
 *    - Server-Side Verification ohne Database-Lookup
 *
 * 2. LOCAL STORAGE vs COOKIES vs SESSION STORAGE:
 *    - localStorage: Persistent across browser sessions
 *    - sessionStorage: Only during browser session
 *    - Cookies: Automatic server transmission, HTTP-only option
 *    - Security trade-offs und Use Cases
 *
 * 3. AUTHENTICATION vs AUTHORIZATION:
 *    - Authentication: "Who are you?" (Login Process)
 *    - Authorization: "What can you do?" (Permissions)
 *    - Role-based Access Control (RBAC)
 *    - Token-based Permission Systems
 *
 * 4. CLIENT-SIDE SECURITY PATTERNS:
 *    - XSS (Cross-Site Scripting) Protection
 *    - CSRF (Cross-Site Request Forgery) Prevention
 *    - Content Security Policy (CSP)
 *    - Secure Token Storage Options
 *
 * 5. ERROR HANDLING BEST PRACTICES:
 *    - Graceful Degradation
 *    - User-Friendly Error Messages
 *    - Technical vs User-Facing Errors
 *    - Logging and Monitoring
 *
 * =================================================================
 */