/**
 * VEHICLE VALIDATION SCHEMAS
 *
 * Zod validation schemas for vehicle management operations
 * Includes schemas for vehicles, reservations, maintenance, and fuel tracking
 */

import { z } from 'zod'

// Vehicle schema
export const vehicleSchema = z.object({
  kennzeichen: z.string().min(1, 'Kennzeichen ist erforderlich').max(20, 'Kennzeichen zu lang'),
  marke: z.string().min(1, 'Marke ist erforderlich').max(50, 'Marke zu lang'),
  modell: z.string().min(1, 'Modell ist erforderlich').max(50, 'Modell zu lang'),
  baujahr: z.number().min(1950, 'Baujahr zu alt').max(new Date().getFullYear() + 1, 'Baujahr zu neu'),
  typ: z.enum(['car', 'truck', 'van', 'tractor', 'trailer']).default('car'),
  kraftstoffart: z.enum(['diesel', 'benzin', 'elektro', 'hybrid']).default('diesel'),
  verbrauch: z.number().min(0, 'Verbrauch muss positiv sein').max(50, 'Verbrauch zu hoch'),
  tankgroesse: z.number().min(10, 'Tankgröße zu klein').max(500, 'Tankgröße zu groß'),
  laufleistung: z.number().min(0, 'Laufleistung muss positiv sein'),
  tuev_ablauf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum'),
  versicherung_ablauf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum'),
  status: z.enum(['verfuegbar', 'reserviert', 'wartung', 'defekt']).default('verfuegbar'),
  standort: z.string().max(100, 'Standort zu lang').optional(),
  notizen: z.string().max(500, 'Notizen zu lang').optional()
})

// Vehicle reservation schema
export const reservationSchema = z.object({
  vehicle_id: z.number().min(1, 'Fahrzeug muss ausgewählt werden'),
  mitarbeiter_name: z.string().min(1, 'Mitarbeitername ist erforderlich').max(100, 'Name zu lang'),
  start_datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Startdatum'),
  start_zeit: z.string().regex(/^\d{2}:\d{2}$/, 'Ungültige Startzeit'),
  end_datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Enddatum'),
  end_zeit: z.string().regex(/^\d{2}:\d{2}$/, 'Ungültige Endzeit'),
  zweck: z.string().min(1, 'Zweck ist erforderlich').max(200, 'Zweck zu lang'),
  geplante_kilometer: z.number().min(0, 'Kilometer müssen positiv sein').optional(),
  status: z.enum(['aktiv', 'abgeschlossen', 'storniert']).default('aktiv'),
  notizen: z.string().max(500, 'Notizen zu lang').optional()
}).refine((data) => {
  const startDateTime = new Date(`${data.start_datum}T${data.start_zeit}`)
  const endDateTime = new Date(`${data.end_datum}T${data.end_zeit}`)
  return endDateTime > startDateTime
}, {
  message: 'Endzeitpunkt muss nach Startzeitpunkt liegen',
  path: ['end_datum']
})

// Maintenance record schema
export const maintenanceSchema = z.object({
  vehicle_id: z.number().min(1, 'Fahrzeug muss ausgewählt werden'),
  typ: z.enum(['wartung', 'reparatur', 'inspektion', 'tuev', 'reifenwechsel']),
  beschreibung: z.string().min(1, 'Beschreibung ist erforderlich').max(500, 'Beschreibung zu lang'),
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum'),
  kosten: z.number().min(0, 'Kosten müssen positiv sein'),
  werkstatt: z.string().max(100, 'Werkstattname zu lang').optional(),
  kilometerstand: z.number().min(0, 'Kilometerstand muss positiv sein').optional(),
  naechste_wartung_km: z.number().min(0, 'Kilometerstand muss positiv sein').optional(),
  naechste_wartung_datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum').optional(),
  status: z.enum(['geplant', 'in_arbeit', 'abgeschlossen']).default('geplant'),
  notizen: z.string().max(500, 'Notizen zu lang').optional()
})

// Fuel record schema
export const fuelSchema = z.object({
  vehicle_id: z.number().min(1, 'Fahrzeug muss ausgewählt werden'),
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum'),
  menge: z.number().min(0.1, 'Menge muss positiv sein').max(500, 'Menge zu groß'),
  preis_pro_liter: z.number().min(0.1, 'Preis muss positiv sein').max(5, 'Preis zu hoch'),
  gesamtkosten: z.number().min(0.1, 'Gesamtkosten müssen positiv sein'),
  kilometerstand: z.number().min(0, 'Kilometerstand muss positiv sein'),
  tankstelle: z.string().max(100, 'Tankstellenname zu lang').optional(),
  vollgetankt: z.boolean().default(true),
  notizen: z.string().max(200, 'Notizen zu lang').optional()
})

// Search and filter schemas
export const vehicleSearchSchema = z.object({
  search: z.string().max(100, 'Suchbegriff zu lang').optional(),
  status: z.enum(['alle', 'verfuegbar', 'reserviert', 'wartung', 'defekt']).default('alle'),
  typ: z.enum(['alle', 'car', 'truck', 'van', 'tractor', 'trailer']).default('alle'),
  kraftstoffart: z.enum(['alle', 'diesel', 'benzin', 'elektro', 'hybrid']).default('alle'),
  tuev_warnung: z.boolean().default(false),
  sortBy: z.enum(['kennzeichen', 'marke', 'modell', 'baujahr', 'laufleistung', 'tuev_ablauf']).default('kennzeichen'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

export const reservationSearchSchema = z.object({
  search: z.string().max(100, 'Suchbegriff zu lang').optional(),
  status: z.enum(['alle', 'aktiv', 'abgeschlossen', 'storniert']).default('alle'),
  vehicle_id: z.number().optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum').optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum').optional(),
  sortBy: z.enum(['start_datum', 'mitarbeiter_name', 'zweck']).default('start_datum'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})