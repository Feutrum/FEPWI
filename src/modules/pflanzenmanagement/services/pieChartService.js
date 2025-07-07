import { api } from '@/utils/api';

export const pieChartService = {
  getAllPieData: async () => {
    try {
      const data = await api.get('/farm/piecharts');
      return data || [];
    } catch (error) {
      console.error('Fehler beim Laden der PieChart-Daten:', error);
      throw error;
    }
  }
};
