import { api } from '@/utils/api';

export const lagerService = {
    getAll: async () => {
        try {
            // Holt alle Lagerorte inkl. der Artikel und deren Bestände
            const response = await api.get('/lagerorte?populate=artikel.bestand');
            return response.data || [];
        } catch (error) {
            console.error('Fehler beim Laden der Lagerorte:', error);
            throw error;
        }
    }
};