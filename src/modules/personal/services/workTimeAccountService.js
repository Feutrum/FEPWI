import { api } from '@/utils/api';

export const workTimeAccountService = {
    getAll: async () => {
        try {
            const response = await api.get('/worktimeaccount');
            return response.data || [];
        } catch (error) {
            console.error('Fehler beim Laden des Arbeitszeitkontos:', error);
            throw error;
        }
    }
};