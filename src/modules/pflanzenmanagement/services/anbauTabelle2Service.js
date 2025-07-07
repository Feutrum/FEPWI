import { api } from '@/utils/api';

export const anbauTabelle2Service = {
  getData: async () => {
    try {
      const data = await api.get('/farm/anbautabelle2');
      return data || [];
    } catch (error) {
      console.error('Fehler beim Laden der AnbauTabelle2-Daten:', error);
      throw error;
    }
  }
};
