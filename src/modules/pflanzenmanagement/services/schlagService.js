import { api } from '@/utils/api';

export const schlagService = {
  getAll: async () => {
    try {
      const data = await api.get('/farm/schlaege');
      return data || [];
    } catch (err) {
      console.error('Fehler beim Laden der Schläge:', err);
      throw err;
    }
  }
};
