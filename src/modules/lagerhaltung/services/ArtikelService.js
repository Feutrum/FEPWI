import { api } from '@/utils/api';

export const artikelService = {
    getAll: async () => {
        try {
            const response = await api.get('/articles');
            return response.data || [];
        } catch (error) {
            console.error('Fehler beim Laden der Artikel:', error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/articles/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Fehler beim Laden des Artikels ${id}:`, error);
            throw error;
        }
    },

    create: async (artikel) => {
        try {
            const response = await api.post('/articles', artikel);
            return response.data;
        } catch (error) {
            console.error('Fehler beim Erstellen des Artikels:', error);
            throw error;
        }
    },

    update: async (id, artikel) => {
        try {
            const response = await api.put(`/articles/${id}`, artikel);
            return response.data;
        } catch (error) {
            console.error(`Fehler beim Aktualisieren des Artikels ${id}:`, error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            await api.delete(`/articles/${id}`);
        } catch (error) {
            console.error(`Fehler beim Löschen des Artikels ${id}:`, error);
            throw error;
        }
    }
};
