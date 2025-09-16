// src/modules/lagerhaltung/services/artikelService.js
import { api } from '@/utils/api';

const norm = (s) =>
    String(s ?? '')
        .toLowerCase()
        .replace('ü', 'ue')
        .replace('ö', 'oe')
        .replace('ä', 'ae')
        .replace('ß', 'ss')
        .trim();

function clientFilterAndSort(rows, { category, state, q } = {}) {
    const nCategory = category ? String(category) : '';
    const nState    = state ? norm(state) : '';
    const nQ        = q ? norm(q) : '';

    const filtered = rows.filter((r) => {
        const byCat = !nCategory || r.kategorie === nCategory;
        const bySt  = !nState || norm(r.zustand) === nState;
        const byQf  = !nQ || norm(r.artikelname).includes(nQ);
        return byCat && bySt && byQf;
    });

    // Sortierung  : artikelname asc
    filtered.sort((a, b) => (a.artikelname || '').localeCompare(b.artikelname || ''));
    return filtered;
}

export const artikelService = {
    // Holt ALLE Artikel aus /artikels (artikels.json) und flacht das Strapi-Format auf einfache Objekte ab
    async getAll() {
        const res  = await api.get('/artikels'); // keine Query-Strings im Mockmodus
        const rows = res?.data?.data ?? res?.data ?? [];

        return rows.map((x) => {
            const a = x?.attributes ?? x ?? {};
            return {
                id:              x?.id ?? a?.id ?? null,
                artikelname:     a?.artikelname ?? '',
                einheit:         a?.einheit ?? '',
                kategorie:       a?.kategorie ?? '',
                zustand:         a?.zustand ?? '',          // 'fest' | 'fluessig' | 'gas'
                beschreibung:    a?.beschreibung ?? '',
                mindestbestand:  Number(a?.mindestbestand ?? 0) || 0,
                active:          a?.active ?? true
            };
        });
    },

    //list(filters) –  clientseitige Filterung auf Basis von getAll()
    async list(filters = {}) {
        const all = await this.getAll();
        return clientFilterAndSort(all, filters);
    },

    // Ein einzelner Artikel (ohne separaten /artikels/:id-Mock): lokal aus getAll() ermitteln
    async getById(id) {
        const all = await this.getAll();
        return all.find((a) => String(a.id) === String(id)) ?? null;
    },

    // Schreib-Operationen im Mockmodus deaktivieren (optional)
    async create() { throw new Error('Artikel-Create ist im Mockmodus nicht verfügbar.'); },
    async update() { throw new Error('Artikel-Update ist im Mockmodus nicht verfügbar.'); },
    async delete() { throw new Error('Artikel-Delete ist im Mockmodus nicht verfügbar.'); }
};
