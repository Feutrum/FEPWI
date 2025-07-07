import { api } from '@/utils/api';

export const eigentuemerService = {
  getEigentuemer: async () => {
    try {
      const data = await api.get('/farm/eigentuemer');
      return data || {};
    } catch (error) {
      console.error('Fehler beim Abrufen der Eigentümerdaten:', error);
      throw error;
    }
  },
};
