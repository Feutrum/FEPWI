import { api } from '@/utils/api';

export const kopfzeile2Service = {
  getData: async () => {
    try {
      const data = await api.get('/farm/kopfzeile2');
      return data || {};
    } catch (error) {
      console.error('Fehler beim Laden der Kopfzeile2-Daten:', error);
      throw error;
    }
  }
};
