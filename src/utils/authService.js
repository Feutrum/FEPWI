/**
 * Authentication Service
 * Verwaltet Login, Logout und Session-Handling für die Anwendung
 */

import { api } from './api.js';

export const authService = {

    /**
     * Meldet einen Benutzer mit Email und Passwort an
     * @param {Object} credentials - Login-Daten
     * @param {string} credentials.email - E-Mail-Adresse
     * @param {string} credentials.password - Passwort
     * @returns {Promise<Object>} Ergebnis mit success-Status, user und token
     */
    login: async (credentials) => {
        try {
            // API-Aufruf an Strapi Authentication Endpoint
            const response = await api.auth.login({
                identifier: credentials.email,
                password: credentials.password
            });

            if (response.jwt) {
                // Update token in API service
                api.auth.updateToken(response.jwt);

                // Speichere Benutzerdaten im localStorage (Token wird von BaseApiService verwaltet)
                localStorage.setItem('user_data', JSON.stringify(response.user));

                return {
                    success: true,
                    user: response.user,
                    token: response.jwt
                };
            }

            return {
                success: false,
                error: 'Login fehlgeschlagen'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Login mit vordefinierten Entwicklungs-Credentials
     * Falls API verfügbar ist, wird echte Authentifizierung versucht
     * @returns {Promise<Object>} Gleiche Struktur wie login()
     */
    devLogin: async () => {
        try {
            // Versuche zuerst echte API-Authentifizierung
            return await authService.login({
                email: 'dev@test.com',
                password: 'development'
            });
        } catch (error) {
            // Falls API nicht verfügbar, verwende Offline-Demo-Modus
            console.log('🔧 API not available, using offline demo mode');

            const demoUser = {
                id: 1,
                email: 'dev@test.com',
                username: 'dev',
                roles: ['farm-management', 'carpool', 'warehouse', 'hr', 'sales'],
                confirmed: true,
                blocked: false,
                provider: 'offline-demo'
            };

            const demoToken = 'offline-dev-token-' + Date.now();

            // Speichere Demo-Daten im localStorage
            localStorage.setItem('auth_token', demoToken);
            localStorage.setItem('user_data', JSON.stringify(demoUser));

            return {
                success: true,
                user: demoUser,
                token: demoToken
            };
        }
    },

    /**
     * Meldet den aktuellen Benutzer ab und löscht gespeicherte Daten
     */
    logout: () => {
        // Clear token in API service
        api.auth.updateToken(null);

        // Clear user data
        localStorage.removeItem('user_data');
        console.log('👋 Logout erfolgreich');
    },

    /**
     * Lädt die aktuelle Session aus dem localStorage
     * @returns {Object|null} Session-Objekt mit user und token oder null
     */
    getCurrentUser: () => {
        try {
            const userData = localStorage.getItem('user_data');
            const token = localStorage.getItem('auth_token');

            if (userData && token) {
                return {
                    user: JSON.parse(userData),
                    token
                };
            }

            return null;

        } catch (_error) {
            // Cleanup bei fehlerhaften Daten
            authService.logout();
            return null;
        }
    },

    /**
     * Prüft ob ein Token im localStorage vorhanden ist
     * @returns {boolean} true wenn Token existiert
     */
    isTokenValid: () => {
        const token = localStorage.getItem('auth_token');
        return !!token;
    },

    /**
     * Validiert das aktuelle Token beim Backend
     * @returns {Promise<Object>} Validation result mit user data
     */
    validateToken: async () => {
        try {
            const response = await api.auth.validateToken();
            return {
                success: true,
                user: response
            };
        } catch (error) {
            // Token ungültig - cleanup durchführen
            authService.logout();
            return {
                success: false,
                error: error.message
            };
        }
    }
};