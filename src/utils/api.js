/**
 * API Client Service
 * Zentrale HTTP-Kommunikationsschicht mit Mock-System für Entwicklung
 */

const API_BASE_URL = 'http://localhost:1337/api';

/**
 * Lädt Mock-User-Daten aus JSON-Dateien
 * @param {string} identifier - E-Mail für User-Lookup
 * @returns {Promise<Object>} Mock JWT Response mit User-Daten
 */
const loadMockUser = async (identifier) => {
  try {
    const userFileMap = {
      'admin@test.com': () => import('../data/mock-users/admin.json'),
      'worker@test.com': () => import('../data/mock-users/worker.json'),
    };

    const userLoader = userFileMap[identifier];
    if (userLoader) {
      const userData = await userLoader();
      const response = userData.default;
      response.jwt = response.jwt + Date.now();
      return response;
    }

    // Fallback für unbekannte User
    return {
      jwt: 'mock-jwt-token-dev-' + Date.now(),
      user: {
        id: 99,
        username: 'developer',
        email: 'dev@test.com',
        confirmed: true,
        blocked: false,
        roles: ['carpool', 'warehouse', 'hr', 'sales', 'farm-management'],
      },
    };
  } catch (error) {
    console.error('Fehler beim Laden der Mock-User-Daten:', error);
    return {
      jwt: 'mock-jwt-token-fallback-' + Date.now(),
      user: {
        id: 1,
        username: 'fallback',
        email: 'fallback@test.com',
        confirmed: true,
        blocked: false,
        roles: ['farm-management'],
      },
    };
  }
};

/**
 * Lädt Mock-Daten für verschiedene Module aus JSON-Dateien
 * @param {string} endpoint - API Endpoint für Daten-Lookup
 * @returns {Promise<Object>} Mock Module Response
 */
const loadMockModuleData = async (endpoint) => {
  try {
    const mockDataMap = {
      // ========================================
      // BESTEHENDE MOCK-MODULE
      // ========================================

      '/farm/fields': () =>
        import('../data/mock-module-dummys/pflanzenmanagement/fields.json'),
      '/farm/piecharts': () =>
        import(
          '../data/mock-module-dummys/pflanzenmanagement/Auswertungen/piecharts.json'
        ),
      '/farm/kopfzeile2': () =>
        import(
          '../data/mock-module-dummys/pflanzenmanagement/Auswertungen/kopfzeile2.json'
        ),
      '/farm/years': () =>
        import(
          '../data/mock-module-dummys/pflanzenmanagement/Auswertungen/years.json'
        ),
      '/farm/anbauDaten': () =>
        import(
          '../data/mock-module-dummys/pflanzenmanagement/AnbauUebersicht/anbauDaten.json'
        ),
      '/farm/anbautabelle2': () =>
        import(
          '../data/mock-module-dummys/pflanzenmanagement/AnbauUebersicht/anbauTabelle2.json'
        ),
      '/farm/schlaege': () =>
        import(
          '../data/mock-module-dummys/pflanzenmanagement/SchlagUebersicht/schlaege.json'
        ),
      '/farm/bodenqualitaet': () =>
        import(
          '../data/mock-module-dummys/pflanzenmanagement/AusgewaelterSchlag/bodenQualitaet.json'
        ),
      '/farm/eigentuemer': () =>
        import(
          '../data/mock-module-dummys/pflanzenmanagement/AusgewaelterSchlag/eigentuemer.json'
        ),
      '/farm/schlagzustand': () =>
        import(
          '../data/mock-module-dummys/pflanzenmanagement/AusgewaelterSchlag/schlagzustand.json'
        ),
      '/workers': () =>
        import('../data/mock-module-dummys/personal/workers.json'),
      '/storage': () =>
        import('../data/mock-module-dummys/lagerhaltung/storage.json'),
      '/bestands': () =>
        import('../data/mock-module-dummys/lagerhaltung/bestands.json'),
      '/artikels': () =>
        import('../data/mock-module-dummys/lagerhaltung/artikels.json'),
      '/buchungen': () =>
        import('../data/mock-module-dummys/lagerhaltung/buchungen.json'),
    };

    const dataLoader = mockDataMap[endpoint];
    if (dataLoader) {
      const moduleData = await dataLoader();
      return moduleData.default;
    }

    return {
      data: [],
      message: `Mock-Daten für ${endpoint} nicht gefunden`,
      endpoint: endpoint,
    };
  } catch (error) {
    console.error('Fehler beim Laden der Mock-Modul-Daten:', error);
    return {
      data: [],
      error: 'Mock-Daten konnten nicht geladen werden',
      endpoint: endpoint,
    };
  }
};

/**
 * Mock-Responses für verschiedene Endpoints
 */
const mockResponses = {
  '/auth/local': async (credentials) => {
    const { identifier } = credentials;
    return await loadMockUser(identifier);
  },
};

export const api = {
  /**
   * Zentrale Request-Methode für alle HTTP-Calls
   * @param {string} method - HTTP-Methode (GET, POST, PUT, DELETE)
   * @param {string} endpoint - API-Endpoint
   * @param {Object|null} data - Request-Body-Daten
   * @returns {Promise<Object>} API Response
   */
  request: async (method, endpoint, data = null) => {
    console.log(`🌐 API ${method} ${endpoint}:`, data);

    const headers = {
      'Content-Type': 'application/json',
    };

    // JWT-Token für authentifizierte Requests hinzufügen
    if (endpoint !== '/auth/local') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      // Netzwerk-Latenz simulieren
      await delay(500);

      // Mock-Authentication für Login-Requests
      if (method === 'POST' && endpoint === '/auth/local') {
        return await mockResponses['/auth/local'](data);
      }

      // Token-Validierung für geschützte Endpoints
      if (headers.Authorization) {
        const token = headers.Authorization.replace('Bearer ', '');
        if (!token.startsWith('mock-jwt-token')) {
          throw new ApiError(401, 'Invalid token');
        }
      }

      // Mock-Daten für GET-Requests
      if (method === 'GET') {
        return await loadMockModuleData(endpoint);
      }

      // Standard Mock-Response für andere Requests
      return {
        success: true,
        data: 'Mock response',
        method: method,
        endpoint: endpoint,
      };
    } catch (error) {
      // Session-abgelaufen Behandlung
      if (error.status === 401) {
        console.log('🚨 Session ungültig - Auto-Logout');
        this.handleSessionExpired();
      }
      throw error;
    }
  },

  /**
   * Behandelt abgelaufene Sessions und führt Cleanup durch
   */
  handleSessionExpired: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.dispatchEvent(new CustomEvent('session-expired'));
  },

  /**
   * GET-Request
   * @param {string} endpoint - API-Endpoint
   * @returns {Promise<Object>} API Response
   */
  get: (endpoint) => api.request('GET', endpoint),

  /**
   * POST-Request mit Daten
   * @param {string} endpoint - API-Endpoint
   * @param {Object} data - Request-Body
   * @returns {Promise<Object>} API Response
   */
  post: (endpoint, data) => api.request('POST', endpoint, data),

  /**
   * PUT-Request für Updates
   * @param {string} endpoint - API-Endpoint
   * @param {Object} data - Update-Daten
   * @returns {Promise<Object>} API Response
   */
  put: (endpoint, data) => api.request('PUT', endpoint, data),

  /**
   * DELETE-Request
   * @param {string} endpoint - API-Endpoint
   * @returns {Promise<Object>} API Response
   */
  delete: (endpoint) => api.request('DELETE', endpoint),
};

/**
 * Promise-basierte Delay-Funktion
 * @param {number} ms - Millisekunden für Verzögerung
 * @returns {Promise<void>} Promise die nach ms Millisekunden resolved
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Custom Error-Klasse für API-spezifische Fehler
 */
class ApiError extends Error {
  /**
   * @param {number} status - HTTP Status Code
   * @param {string} message - Fehlermeldung
   */
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
