export const bodenService = {
  getQualitaet: async () => {
    const res = await fetch('/src/data/mock-module-dummys/pflanzenmanagement/AusgewaelterSchlag/bodenQualitaet.json');
    if (!res.ok) {
      throw new Error('Bodenqualität konnte nicht geladen werden');
    }
    return res.json();
  },
};
