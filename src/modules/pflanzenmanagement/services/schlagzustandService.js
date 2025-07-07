import { api } from '@/utils/api';

export const schlagzustandService = {
  getStatus: async () => {
    try {
      const data = await api.get('/farm/schlagzustand');
      return data || {};
    } catch (error) {
      console.error('Fehler beim Abrufen des Schlagzustands:', error);
      throw error;
    }
  },
};
