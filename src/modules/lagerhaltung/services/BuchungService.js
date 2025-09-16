// src/modules/lagerhaltung/services/buchungService.js
import { api } from "@/utils/api";

const toTime = (d) => {
    if (!d) return NaN;
    const t = new Date(d).getTime();
    return Number.isNaN(t) ? NaN : t;
};

// Clientseitige Filter + Sortierung (neueste zuerst)
function filterAndSort(rows, { articleId, lagerortId, from, to } = {}) {
    const f = rows.filter((b) => {
        const byArt   = !articleId || String(b.artikelId)  === String(articleId);
        const byLager = !lagerortId || String(b.lagerortId) === String(lagerortId);

        let byDate = true;
        const ts = toTime(b.datum);
        if (from && !Number.isNaN(ts)) byDate = byDate && ts >= toTime(from);
        if (to   && !Number.isNaN(ts)) byDate = byDate && ts <= toTime(to);

        return byArt && byLager && byDate;
    });

    f.sort((a, b) => (toTime(b.datum) || 0) - (toTime(a.datum) || 0));
    return f;
}

export const buchungService = {
    // Holt ALLE Buchungen aus /buchungen (buchungen.json) und flacht Strapi-Struktur
    async getAll() {
        const res  = await api.get("/buchungen");               // keine Query-Strings im Mockmodus
        const rows = res?.data?.data ?? res?.data ?? [];

        return rows.map((x) => {
            const a       = x?.attributes ?? x ?? {};
            const artData = a?.artikel?.data ?? a?.artikel ?? null;
            const lagData = a?.lagerort?.data ?? a?.lagerort ?? null;
            const artAttr = artData?.attributes ?? artData ?? {};
            const lagAttr = lagData?.attributes ?? lagData ?? {};

            return {
                id:         x?.id ?? a?.id ?? null,
                typ:        a?.typ ?? a?.type ?? "",
                datum:      a?.datum ?? a?.date ?? "",
                menge:      Number(a?.menge ?? a?.quantity ?? 0) || 0,
                einheit:    a?.einheit ?? a?.unit ?? artAttr?.einheit ?? "",
                kommentar:  a?.kommentar ?? a?.comment ?? "",

                artikelId:   artData?.id ?? null,
                artikelname: artAttr?.artikelname ?? artAttr?.name ?? "",
                lagerortId:  lagData?.id ?? null,
                lagername:   lagAttr?.lagername ?? lagAttr?.name ?? ""
            };
        });
    },

    // Liste mit clientseitigen Filtern (Artikel, Lagerort, Datum)
    async list(filters = {}) {
        const all = await this.getAll();
        return filterAndSort(all, filters);
    },

    // CSV-Export clientseitig (aus aktuell gefilterten Daten)
    async exportCsv(filters = {}) {
        const rows = await this.list(filters);
        const headers = [
            "Datum",
            "Typ",
            "Artikel",
            "Lagerort",
            "Menge",
            "Einheit",
            "Kommentar"
        ];

        const escapeCsv = (v) => {
            const s = String(v ?? "");
            return s.includes(";") || s.includes('"') || s.includes("\n")
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        };

        const lines = [
            headers,
            ...rows.map((b) => [
                b.datum,
                b.typ,
                b.artikelname,
                b.lagername,
                b.menge,
                b.einheit,
                b.kommentar
            ])
        ].map((arr) => arr.map(escapeCsv).join(";")).join("\n");

        // mit BOM für Excel-DE
        return new Blob(["\uFEFF" + lines], { type: "text/csv;charset=utf-8;" });
    },

    // Mockmodus: Schreib-Operationen deaktivieren (kein Persistieren möglich)
    async createOutgoing() { throw new Error("Warenausgang ist im Mockmodus nicht verfügbar."); },
    async create()         { throw new Error("Buchungs-Create ist im Mockmodus nicht verfügbar."); },
    async update()         { throw new Error("Buchungs-Update ist im Mockmodus nicht verfügbar."); },
    async delete()         { throw new Error("Buchungs-Delete ist im Mockmodus nicht verfügbar."); }
};
