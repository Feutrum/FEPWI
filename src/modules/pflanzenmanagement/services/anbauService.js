import { api } from '@/utils/api';

export const anbauService = {
  getAnbauDaten: async () => {
    try {
      const data = await api.get('/farm/anbauDaten');
      return data || [];
    } catch (error) {
      console.error('Fehler beim Laden der Anbaudaten:', error);
      return [];
    }
  }
};
