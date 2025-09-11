import { api } from '@/utils/api';

export const mitarbeiterService = {
    getAll: async () => {
        try {
            const response = await api.get('/workers');
            return response.data || [];
        } catch (error) {
            console.error('Fehler beim Laden der Mitarbeiter:', error);
            throw error;
        }
    },
    create: async (mitarbeiter) => {
        try {
            const response = await api.post('/workers', mitarbeiter);
            return response.data;
        } catch (error) {
            console.error('Fehler beim Anlegen des Mitarbeiters:', error);
            throw error;
        }
    }
};