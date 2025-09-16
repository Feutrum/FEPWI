import { api } from '@/utils/api';

export const lagerService = {
    async getAll() {
        try {
            const res = await api.get('/storage');
            const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
            // Strapi → flach mappen
            return raw.map((x) => {
                const a = x?.attributes ?? x;
                return {
                    id: x?.id ?? a?.id,
                    lagername: a?.lagername ?? '',
                    standort: a?.standort ?? '',
                    beschreibung: a?.beschreibung ?? ''
                };
            });
        } catch (err) {
            console.error('Fehler beim Laden der Lagerorte:', err);
            throw err;
        }
    },

    async getById(id) {
        try {
            const res = await api.get(`/storage/${id}`);
            const x = res.data?.data ?? res.data ?? null;
            if (!x) return null;
            const a = x?.attributes ?? x;
            return {
                id: x?.id ?? a?.id,
                lagername: a?.lagername ?? '',
                standort: a?.standort ?? '',
                beschreibung: a?.beschreibung ?? ''
            };
        } catch (err) {
            console.error('Fehler beim Laden des Lagerorts:', err);
            throw err;
        }
    },

    async create(lagerort) {
        try {
            const res = await api.post('/storage', lagerort);
            return res.data?.data ?? res.data;
        } catch (err) {
            console.error('Fehler beim Anlegen des Lagerorts:', err);
            throw err;
        }
    },
    async update(id, lagerort) {
        try {
            const res = await api.put(`/storage/${id}`, { data: lagerort });
            return res.data?.data ?? res.data;
        } catch {
            throw new Error("update() nicht implementiert");
        }
    },
    async delete(id) {
        // wenn echte API -> delete-Call
        try {
            await api.delete(`/storage/${id}`);
        } catch {
            // Mockmodus
            throw new Error("delete() nicht implementiert");
        }
    }
};


