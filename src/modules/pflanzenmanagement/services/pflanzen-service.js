/**
 * FIELD SERVICE - Business Logic für Feld-Management
 *
 * Service-Layer zwischen Components und API
 * Abstrahiert API-Calls und Business Logic
 */

import { api } from '@/utils/api';

export const fieldService = {
    /**
     * Lädt alle Felder aus der API
     * @returns {Promise<Array>} Array von Feld-Objekten
     */
    getAllFields: async () => {
        try {
            const response = await api.get('/farm/fields');
            return response.data || [];
        } catch (error) {
            console.error('Fehler beim Laden der Felder:', error);
            throw error;
        }
    },

    /**
     * Lädt es Feld
     * @param {number} fieldId - ID des Feldes
     * @returns {Promise<Object>} Feld-Objekt
     */
    getFieldById: async (fieldId) => {
        try {
            const response = await api.get(`/farm/fields/${fieldId}`);
            return response.data;
        } catch (error) {
            console.error(`Fehler beim Laden von Feld ${fieldId}:`, error);
            throw error;
        }
    }
};