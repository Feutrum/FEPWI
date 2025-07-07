import { api } from '@/utils/api';

export const yearSelectorService = {
  getYears: async () => {
    try {
      const data = await api.get('/farm/years');
      return data || [];
    } catch (error) {
      console.error('Fehler beim Laden der Jahreszahlen:', error);
      return [];
    }
  }
};
