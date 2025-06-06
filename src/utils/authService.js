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
            const response = await api.post('/auth/local', {
                identifier: credentials.email,
                password: credentials.password
            });

            if (response.jwt) {
                // Speichere Token und Benutzerdaten im localStorage
                localStorage.setItem('auth_token', response.jwt);
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
     * @returns {Promise<Object>} Gleiche Struktur wie login()
     */
    devLogin: async () => {
        return await authService.login({
            email: 'dev@test.com',
            password: 'development'
        });
    },

    /**
     * Meldet den aktuellen Benutzer ab und löscht gespeicherte Daten
     */
    logout: () => {
        localStorage.removeItem('auth_token');
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

        } catch (error) {
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
    }
};