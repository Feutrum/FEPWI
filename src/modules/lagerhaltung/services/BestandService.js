import { api } from '@/utils/api';

export const bestandService = {
    // Holt ALLE Bestände direkt aus /bestands (bestands.json)
    async getAll() {
        const res = await api.get('/bestands'); // keine Query-Strings!
        const rows = res?.data?.data ?? res?.data ?? [];

        // Strapi-Shape → flache UI-Zeilen
        return rows.map((x) => {
            const a       = x?.attributes ?? x ?? {};
            const artData = a?.artikel?.data ?? a?.artikel ?? null;
            const lagData = a?.lagerort?.data ?? a?.lagerort ?? null;
            const artAttr = artData?.attributes ?? artData ?? {};
            const lagAttr = lagData?.attributes ?? lagData ?? {};

            return {
                id: x?.id ?? a?.id ?? null,

                artikelId:  artData?.id ?? a?.artikelId ?? null,
                lagerortId: lagData?.id ?? a?.lagerortId ?? null,

                artikelname: artAttr?.artikelname ?? '',
                einheit:     artAttr?.einheit ?? '',
                lagername:   lagAttr?.lagername ?? '',

                menge: Number(a?.menge ?? 0) || 0
            };
        });
    },

    // getById ohne /bestands/:id-Endpoint: per getAll() und lokal filtern
    async getById(id) {
        const all = await this.getAll();
        return all.find(r => String(r.id) === String(id)) ?? null;
    },

    // Mock-Setup: optional no-op für Schreiboperationen (verhindert Fehler im FE)
    async create() { throw new Error('Bestand-Create im Mockmodus nicht verfügbar'); },
    async update() { throw new Error('Bestand-Update im Mockmodus nicht verfügbar'); },
    async delete() { throw new Error('Bestand-Delete im Mockmodus nicht verfügbar'); }
};
