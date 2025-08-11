import { api } from '@/utils/api';

export const mitarbeiterService = {
    getAll: async () => {
        try {
            const response = await api.get('/employees');
            return response.data || [];
        } catch (error) {
            console.error('Fehler beim Laden der Mitarbeiter:', error);
            throw error;
        }
    }
};