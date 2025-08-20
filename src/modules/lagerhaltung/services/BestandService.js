import { api } from '@/utils/api';

export const bestandService = {
    getAll: async () => {
        const response = await api.get('/bestands?populate=artikel,lagerort');
        return response.data || [];
    },
    getById: async (id) => {
        const response = await api.get(`/bestands/${id}?populate=artikel,lagerort`);
        return response.data;
    },
    create: async (bestand) => {
        const response = await api.post('/bestands', {
            data: {
                artikel: bestand.artikel,
                lagerort: bestand.lagerort,
                menge: bestand.menge
            }
        });
        return response.data;
    },
    update: async (id, bestand) => {
        const response = await api.put(`/bestands/${id}`, {
            data: {
                artikel: bestand.artikel,
                lagerort: bestand.lagerort,
                menge: bestand.menge
            }
        });
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/bestands/${id}`);
        return response.data;
    }
};
