/**
 * =================================================================
 * API CLIENT SERVICE - HTTP KOMMUNIKATIONS-LAYER
 * =================================================================
 *
 * Dieser Service stellt eine zentrale API-Kommunikationsschicht
 * für die gesamte Anwendung bereit. Er abstrahiert HTTP-Requests
 * und bietet einheitliche Interfaces für Backend-Kommunikation.
 *
 * HAUPTFUNKTIONALITÄTEN:
 * - HTTP Client mit standardisierten Request/Response Handling
 * - Automatische JWT Token-Injection für authentifizierte Requests
 * - Session-Expired Handling und automatische Cleanup
 * - Development Mock-System für Backend-unabhängige Entwicklung
 * - Einheitliche Error-Behandlung mit Custom Error Types
 * - Request/Response Logging für Debugging
 *
 * DESIGN PATTERNS:
 * - Facade Pattern: Vereinfachte API für HTTP-Kommunikation
 * - Strategy Pattern: Mock vs Real API Implementation
 * - Observer Pattern: Session-Expired Event Broadcasting
 * - Factory Pattern: Standardisierte Request Creation
 *
 * ENTWICKLUNGSSTRATEGIE:
 * - Mock-First Development: Entwicklung ohne Backend-Abhängigkeit
 * - Progressive Enhancement: Einfacher Wechsel zu echtem Backend
 * - Role-Based Testing: Verschiedene User-Rollen simulierbar
 *
 * @author Studium Projekt
 * @version 1.0
 * =================================================================
 */

// =================================================================
// CONFIGURATION - API Base Configuration
// =================================================================

/**
 * API BASE URL CONFIGURATION
 *
 * Zentrale Konfiguration der Backend-URL
 *
 * CURRENT: Development Mock Setup
 * PRODUCTION: Wird durch echte Strapi-URL ersetzt
 *
 * STRAPI STANDARD:
 * - Development: http://localhost:1337/api
 * - Production: https://your-strapi-domain.com/api
 *
 * ENVIRONMENT VARIABLES:
 * In echten Projekten über .env Files konfiguriert:
 * REACT_APP_API_URL=http://localhost:1337/api
 */
const API_BASE_URL = 'http://localhost:1337/api'; // Später echte Strapi URL

// =================================================================
// MOCK DATA SYSTEM - Development Backend Simulation
// =================================================================

/**
 * MOCK RESPONSES CONFIGURATION
 *
 * Simuliert Backend-Responses für entwicklung ohne echtes Backend
 * Ermöglicht vollständige Frontend-Entwicklung und Testing
 *
 * STRUCTURE:
 * - Key: API Endpoint (z.B. '/auth/local')
 * - Value: Function die Mock-Response generiert
 *
 * VORTEILE:
 * - Backend-unabhängige Entwicklung
 * - Schnelle Iteration und Testing
 * - Verschiedene User-Rollen testbar
 * - Konsistente Response-Struktur
 *
 * MOCK-TO-REAL MIGRATION:
 * Diese Mock-Responses werden später durch echte API-Calls ersetzt
 */
const mockResponses = {
    /**
     * AUTHENTICATION MOCK ENDPOINT
     *
     * Simuliert Strapi '/auth/local' Endpoint
     * Unterstützt verschiedene User-Rollen für umfassendes Testing
     *
     * @param {Object} credentials - Login-Daten
     * @param {string} credentials.identifier - Email (Strapi-Standard)
     * @param {string} credentials.password - Passwort
     * @returns {Object} Mock JWT Response
     *
     * SUPPORTED TEST USERS:
     * 1. admin@test.com - Vollzugriff (alle 5 Module)
     * 2. worker@test.com - Eingeschränkt (nur Lager + Vertrieb)
     * 3. dev@test.com - Legacy-Support (Vollzugriff)
     */
    '/auth/local': (credentials) => {
        const { identifier } = credentials;

        /**
         * ADMIN USER MOCK - Vollzugriff Simulation
         *
         * Simuliert Administrator mit allen Systemberechtigungen
         *
         * ROLES ARRAY:
         * - carpool: Fahrgemeinschafts-Verwaltung
         * - warehouse: Lager-Management
         * - hr: Human Resources / Personalwesen
         * - sales: Vertrieb und Verkauf
         * - farm-management: Landwirtschafts-Management
         *
         * JWT TOKEN:
         * Mock-Token mit Timestamp für Eindeutigkeit
         * Format: 'mock-jwt-token-admin-{timestamp}'
         */
        if (identifier === 'admin@test.com') {
            return {
                jwt: 'mock-jwt-token-admin-' + Date.now(),
                user: {
                    id: 1,
                    username: 'admin',
                    email: 'admin@test.com',
                    confirmed: true,           // Strapi Email-Bestätigung
                    blocked: false,            // Strapi User-Blocking Status
                    roles: ['carpool', 'warehouse', 'hr', 'sales', 'farm-management']
                }
            };
        }

        /**
         * LIMITED USER MOCK - Eingeschränkte Rechte
         *
         * Simuliert Worker mit begrenzten Systemberechtigungen
         * Nur Zugriff auf Lager (warehouse) und Vertrieb (sales)
         *
         * TESTING PURPOSE:
         * Verifiziert dass rollenbasierte Zugriffskontrolle funktioniert
         * UI sollte nur entsprechende Menüpunkte anzeigen
         */
        if (identifier === 'worker@test.com') {
            return {
                jwt: 'mock-jwt-token-worker-' + Date.now(),
                user: {
                    id: 2,
                    username: 'worker',
                    email: 'worker@test.com',
                    confirmed: true,
                    blocked: false,
                    roles: ['warehouse', 'sales']  // Nur 2 von 5 Modulen
                }
            };
        }

        /**
         * FALLBACK / LEGACY USER MOCK
         *
         * Backwards-Kompatibilität für bestehenden Entwicklungscode
         * Behandelt alle anderen Login-Versuche als Developer-Account
         *
         * DESIGN DECISION:
         * Graceful Fallback verhindert Entwicklungsunterbrechungen
         * bei unerwarteten Email-Adressen
         */
        return {
            jwt: 'mock-jwt-token-' + Date.now(),
            user: {
                id: 1,
                username: 'developer',
                email: 'dev@test.com',
                confirmed: true,
                blocked: false,
                roles: ['carpool', 'warehouse', 'hr', 'sales', 'farm-management']
            }
        };
    }
};

// =================================================================
// API CLIENT OBJECT - Main HTTP Communication Interface
// =================================================================

/**
 * API CLIENT SERVICE OBJECT
 *
 * Zentrale API-Kommunikationsschicht mit einheitlichen Methoden
 * für alle HTTP-Operationen der Anwendung
 *
 * DESIGN PRINCIPLES:
 * - Consistent Interface: Alle HTTP-Methoden durch gleiche API
 * - Automatic Authentication: JWT-Token automatisch injiziert
 * - Error Handling: Zentrale Fehlerbehandlung für alle Requests
 * - Development Support: Mock-System für Backend-unabhängige Entwicklung
 */
export const api = {

    // =================================================================
    // CORE REQUEST METHOD - Universal HTTP Request Handler
    // =================================================================

    /**
     * UNIVERSAL REQUEST METHOD
     *
     * Zentrale Methode für alle HTTP-Requests mit einheitlicher
     * Authentifizierung, Fehlerbehandlung und Mock-Support
     *
     * @param {string} method - HTTP Method (GET, POST, PUT, DELETE)
     * @param {string} endpoint - API Endpoint (z.B. '/auth/local')
     * @param {Object|null} data - Request Body Data (für POST/PUT)
     * @returns {Promise<Object>} API Response Object
     *
     * FEATURES:
     * - Automatische JWT-Token Injection
     * - Session-Expired Detection und Handling
     * - Development Mock-System
     * - Request/Response Logging
     * - Einheitliche Error-Behandlung
     *
     * ABLAUF:
     * 1. Request-Logging für Debugging
     * 2. HTTP Headers-Konfiguration
     * 3. JWT-Token Injection (außer für Login)
     * 4. Mock-Response oder echter API-Call
     * 5. Error-Handling und Session-Validation
     */
    request: async (method, endpoint, data = null) => {
        /**
         * REQUEST LOGGING
         *
         * Console-Output für Entwickler-Debugging
         * Zeigt HTTP-Method, Endpoint und Request-Data
         *
         * FORMAT: "🌐 API {METHOD} {ENDPOINT}: {DATA}"
         * Emoji macht Logs leichter erkennbar in Console
         */
        console.log(`🌐 API ${method} ${endpoint}:`, data);

        /**
         * HTTP HEADERS CONFIGURATION
         *
         * Standard-Headers für alle API-Requests
         *
         * Content-Type: application/json
         * - Informiert Server über JSON-Request-Body
         * - Standard für moderne REST APIs
         * - Strapi erwartet JSON-Format
         */
        const headers = {
            'Content-Type': 'application/json'
        };

        /**
         * AUTOMATIC JWT AUTHENTICATION
         *
         * Automatische Injection von JWT-Token für authentifizierte Requests
         *
         * LOGIC:
         * - Login-Requests benötigen KEINE Authentifizierung
         * - Alle anderen Endpoints erhalten automatisch JWT-Token
         *
         * AUTHORIZATION HEADER:
         * Format: "Bearer {jwt-token}"
         * Standard für JWT-basierte APIs
         */
        if (endpoint !== '/auth/local') {
            const token = localStorage.getItem('auth_token');
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        try {
            /**
             * DEVELOPMENT DELAY SIMULATION
             *
             * Simuliert Netzwerk-Latenz für realistische Entwicklung
             * 500ms Delay entspricht typischer API-Response-Zeit
             *
             * ZWECK:
             * - Testen von Loading-States
             * - Realistische User-Experience Simulation
             * - Race-Condition Detection
             */
            await delay(500);

            /**
             * MOCK AUTHENTICATION HANDLING
             *
             * Spezielle Behandlung für Login-Requests
             * Verwendet Mock-Response statt echten API-Call
             *
             * CONDITION: POST-Request an '/auth/local'
             * ACTION: Delegiert an mockResponses['/auth/local']
             */
            if (method === 'POST' && endpoint === '/auth/local') {
                return mockResponses['/auth/local'](data);
            }

            /**
             * TOKEN VALIDATION FOR PROTECTED ENDPOINTS
             *
             * Validiert JWT-Token für alle authentifizierten Requests
             *
             * VALIDATION LOGIC:
             * 1. Prüft ob Authorization Header vorhanden
             * 2. Extrahiert Token aus "Bearer {token}" Format
             * 3. Validiert Token-Format (Mock: beginnt mit 'mock-jwt-token')
             * 4. Wirft 401 Error bei ungültigen Tokens
             *
             * MOCK LIMITATION:
             * Echte JWT-Validation würde Signature und Expiry prüfen
             * Mock prüft nur Token-Präfix für Entwicklungszwecke
             */
            if (headers.Authorization) {
                const token = headers.Authorization.replace('Bearer ', '');
                if (!token.startsWith('mock-jwt-token')) {
                    throw new ApiError(401, 'Invalid token');
                }
            }

            /**
             * FALLBACK MOCK RESPONSE
             *
             * Standard-Response für alle anderen Endpoints
             * Simuliert erfolgreiche API-Calls ohne spezifische Logik
             *
             * RETURN: Generic Success Response
             * In echter Implementation: fetch() oder axios() Call
             */
            return { success: true, data: 'Mock response' };

        } catch (error) {
            /**
             * SESSION-EXPIRED ERROR HANDLING
             *
             * Spezielle Behandlung für 401 Unauthorized Errors
             * Deutet auf abgelaufene oder ungültige JWT-Tokens hin
             *
             * ACTIONS:
             * 1. Console-Logging für Debugging
             * 2. Automatisches Session-Cleanup
             * 3. Error Re-throw für Component-Handling
             */
            if (error.status === 401) {
                console.log('🚨 Session ungültig - Auto-Logout');
                this.handleSessionExpired();
            }
            throw error; // Re-throw für Component Error-Handling
        }
    },

    // =================================================================
    // SESSION MANAGEMENT - Session Expiry Handling
    // =================================================================

    /**
     * SESSION EXPIRED HANDLER
     *
     * Behandelt abgelaufene Sessions und führt automatisches Cleanup durch
     *
     * ACTIONS:
     * 1. localStorage Cleanup (Token + User Data)
     * 2. Custom Event Broadcasting für UI-Updates
     *
     * EVENT BROADCASTING:
     * Sendet 'session-expired' Event an window-Object
     * AuthContext lauscht auf dieses Event und aktualisiert UI-State
     *
     * DESIGN PATTERN: Observer Pattern
     * - Lose Kopplung zwischen API-Layer und UI-Layer
     * - Event-basierte Kommunikation
     * - Zentrale Session-Handling Logic
     *
     * CUSTOM EVENT:
     * window.dispatchEvent(new CustomEvent('session-expired'))
     * - Standard Web API für Component-übergreifende Events
     * - Keine direkte Abhängigkeit zu React-Komponenten
     * - Testbar und mockbar
     */
    handleSessionExpired: () => {
        /**
         * STORAGE CLEANUP
         *
         * Entfernt alle Session-relevanten Daten aus localStorage
         * Identisch mit authService.logout() Implementierung
         */
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        /**
         * UI NOTIFICATION VIA CUSTOM EVENT
         *
         * Benachrichtigt UI-Components über Session-Ablauf
         * AuthContext EventListener reagiert auf dieses Event
         */
        window.dispatchEvent(new CustomEvent('session-expired'));
    },

    // =================================================================
    // HTTP METHOD SHORTCUTS - Convenience Methods
    // =================================================================

    /**
     * HTTP GET METHOD
     *
     * Convenience-Method für GET-Requests
     *
     * @param {string} endpoint - API Endpoint
     * @returns {Promise<Object>} API Response
     *
     * USAGE: api.get('/users/me')
     * DELEGIERT AN: api.request('GET', endpoint)
     */
    get: (endpoint) => api.request('GET', endpoint),

    /**
     * HTTP POST METHOD
     *
     * Convenience-Method für POST-Requests mit Request Body
     *
     * @param {string} endpoint - API Endpoint
     * @param {Object} data - Request Body Data
     * @returns {Promise<Object>} API Response
     *
     * USAGE: api.post('/auth/local', { email, password })
     * DELEGIERT AN: api.request('POST', endpoint, data)
     */
    post: (endpoint, data) => api.request('POST', endpoint, data),

    /**
     * HTTP PUT METHOD
     *
     * Convenience-Method für PUT-Requests (Updates)
     *
     * @param {string} endpoint - API Endpoint
     * @param {Object} data - Update Data
     * @returns {Promise<Object>} API Response
     *
     * USAGE: api.put('/users/me', { name: 'New Name' })
     * DELEGIERT AN: api.request('PUT', endpoint, data)
     */
    put: (endpoint, data) => api.request('PUT', endpoint, data),

    /**
     * HTTP DELETE METHOD
     *
     * Convenience-Method für DELETE-Requests
     *
     * @param {string} endpoint - API Endpoint
     * @returns {Promise<Object>} API Response
     *
     * USAGE: api.delete('/users/123')
     * DELEGIERT AN: api.request('DELETE', endpoint)
     */
    delete: (endpoint) => api.request('DELETE', endpoint)
};

// =================================================================
// UTILITY FUNCTIONS - Helper Functions
// =================================================================

/**
 * DELAY UTILITY FUNCTION
 *
 * Promise-basierte Delay-Funktion für asynchrone Verzögerungen
 *
 * @param {number} ms - Millisekunden für Verzögerung
 * @returns {Promise<void>} Promise die nach ms Millisekunden resolved
 *
 * USAGE: await delay(1000); // 1 Sekunde warten
 *
 * ZWECK:
 * - Simulation von Netzwerk-Latenz in Development
 * - Testing von Loading-States
 * - Rate-Limiting Simulation
 * - Debouncing und Throttling
 *
 * IMPLEMENTATION:
 * setTimeout() wrapped in Promise für async/await Compatibility
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// =================================================================
// CUSTOM ERROR CLASSES - Structured Error Handling
// =================================================================

/**
 * API ERROR CLASS - Custom Error Type für API-spezifische Fehler
 *
 * Erweitert standard JavaScript Error-Klasse um HTTP-spezifische
 * Informationen wie Status-Codes und strukturierte Error-Handling
 *
 * @extends Error
 *
 * PROPERTIES:
 * - message: Fehlermeldung (von Error-Klasse geerbt)
 * - status: HTTP Status Code (z.B. 401, 404, 500)
 * - name: Error Type Name für Debugging
 *
 * USAGE:
 * throw new ApiError(401, 'Unauthorized access');
 *
 * VORTEILE:
 * - Strukturierte Error-Informationen
 * - HTTP-Status-Code für spezifische Error-Handling
 * - instanceof checks für Error-Type Detection
 * - Stack-Trace preservation
 *
 * ERROR HANDLING PATTERN:
 * ```javascript
 * try {
 *   await api.get('/protected');
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 401) {
 *     // Handle unauthorized access
 *   }
 * }
 * ```
 */
class ApiError extends Error {
    /**
     * CONSTRUCTOR - ApiError Instanz-Erstellung
     *
     * @param {number} status - HTTP Status Code
     * @param {string} message - Fehlermeldung
     *
     * INITIALIZATION:
     * 1. super(message) - Ruft Error-Konstruktor auf
     * 2. this.status - Setzt HTTP Status Code
     * 3. this.name - Setzt Error-Type Name für Debugging
     */
    constructor(status, message) {
        super(message);        // Error-Klasse Initialisierung
        this.status = status;  // HTTP Status Code (401, 404, 500, etc.)
        this.name = 'ApiError'; // Error-Type Identifikation
    }
}

/**
 * =================================================================
 * ZUSAMMENFASSUNG DER VERWENDETEN KONZEPTE:
 * =================================================================
 *
 * 1. HTTP CLIENT ARCHITECTURE:
 *    - Zentrale API-Kommunikationsschicht
 *    - Einheitliche Request/Response Handling
 *    - Automatic Authentication mit JWT
 *    - RESTful API Integration
 *
 * 2. MOCK-DRIVEN DEVELOPMENT:
 *    - Backend-unabhängige Frontend-Entwicklung
 *    - Realistische Response-Simulation
 *    - Multiple User-Role Testing
 *    - Progressive Enhancement zu echtem Backend
 *
 * 3. ERROR HANDLING PATTERNS:
 *    - Custom Error Classes für strukturierte Fehler
 *    - HTTP Status Code basierte Behandlung
 *    - Session-Expired Auto-Recovery
 *    - Graceful Error Propagation
 *
 * 4. AUTHENTICATION INTEGRATION:
 *    - JWT Bearer Token automatische Injection
 *    - localStorage-basierte Token Persistence
 *    - Session-Validation und Auto-Logout
 *    - Secure Header Management
 *
 * 5. EVENT-DRIVEN ARCHITECTURE:
 *    - Custom Events für Component Communication
 *    - Observer Pattern für Session Management
 *    - Lose Kopplung zwischen Layern
 *    - Testbare Event-basierte Logic
 *
 * 6. DEVELOPMENT TOOLS:
 *    - Request/Response Logging
 *    - Network Latency Simulation
 *    - Multiple Environment Support
 *    - Debugging-freundliche Console-Outputs
 *
 * 7. PROMISE-BASED ASYNC PATTERNS:
 *    - async/await für moderne Async-Handling
 *    - Promise-basierte Delay-Functions
 *    - Error Propagation durch Promise Chain
 *    - Clean Async/Sync Code Separation
 *
 * 8. OBJECT-ORIENTED DESIGN:
 *    - Service Object Pattern
 *    - Method Delegation und Composition
 *    - Inheritance mit Custom Error Classes
 *    - Encapsulation von HTTP Logic
 *
 * =================================================================
 */