/**
 * INVENTORY VALIDATION SCHEMAS
 *
 * Zod validation schemas for inventory management forms
 * Provides comprehensive validation for warehouse operations
 */

import { z } from 'zod'

// =================================================================
// WAREHOUSE/STORAGE LOCATION SCHEMAS
// =================================================================

/**
 * Storage location validation schema
 */
export const storageLocationSchema = z.object({
  lagername: z.string()
    .min(1, 'Lagername ist erforderlich')
    .max(100, 'Lagername zu lang'),
  standort: z.string()
    .min(1, 'Standort ist erforderlich')
    .max(200, 'Standort zu lang'),
  beschreibung: z.string()
    .max(500, 'Beschreibung zu lang')
    .optional()
})

// =================================================================
// ARTICLE/ITEM SCHEMAS
// =================================================================

/**
 * Article validation schema
 */
export const articleSchema = z.object({
  artikelname: z.string()
    .min(1, 'Artikelname ist erforderlich')
    .max(150, 'Artikelname zu lang'),
  kategorie: z.string()
    .min(1, 'Kategorie ist erforderlich')
    .max(100, 'Kategorie zu lang'),
  einheit: z.string()
    .min(1, 'Einheit ist erforderlich')
    .max(20, 'Einheit zu lang'),
  mindestbestand: z.number()
    .min(0, 'Mindestbestand muss positiv sein')
    .default(0),
  preis: z.number()
    .min(0, 'Preis muss positiv sein')
    .optional(),
  lieferant: z.string()
    .max(100, 'Lieferant zu lang')
    .optional(),
  beschreibung: z.string()
    .max(500, 'Beschreibung zu lang')
    .optional(),
  artikelnummer: z.string()
    .max(50, 'Artikelnummer zu lang')
    .optional(),
  barcode: z.string()
    .max(50, 'Barcode zu lang')
    .optional()
})

// =================================================================
// STOCK/INVENTORY SCHEMAS
// =================================================================

/**
 * Stock entry validation schema
 */
export const stockSchema = z.object({
  artikelId: z.number()
    .min(1, 'Artikel muss ausgewählt werden'),
  lagerortId: z.number()
    .min(1, 'Lagerort muss ausgewählt werden'),
  menge: z.number()
    .min(0, 'Menge muss positiv sein'),
  mindestbestand: z.number()
    .min(0, 'Mindestbestand muss positiv sein')
    .optional(),
  reserviert: z.number()
    .min(0, 'Reservierte Menge muss positiv sein')
    .default(0),
  verfügbar: z.number()
    .min(0, 'Verfügbare Menge muss positiv sein')
    .optional()
})

// =================================================================
// BOOKING/TRANSACTION SCHEMAS
// =================================================================

/**
 * Booking entry validation schema
 */
export const bookingSchema = z.object({
  artikelId: z.number()
    .min(1, 'Artikel muss ausgewählt werden'),
  lagerortId: z.number()
    .min(1, 'Lagerort muss ausgewählt werden'),
  menge: z.number()
    .min(0.01, 'Menge muss größer als 0 sein'),
  buchungstyp: z.enum(['eingang', 'ausgang', 'umbuchung', 'korrektur'], {
    errorMap: () => ({ message: 'Ungültiger Buchungstyp' })
  }),
  grund: z.string()
    .min(1, 'Grund ist erforderlich')
    .max(200, 'Grund zu lang'),
  referenz: z.string()
    .max(100, 'Referenz zu lang')
    .optional(),
  kosten: z.number()
    .min(0, 'Kosten müssen positiv sein')
    .optional(),
  zielLagerortId: z.number()
    .min(1, 'Ziel-Lagerort muss bei Umbuchung ausgewählt werden')
    .optional(),
  bemerkung: z.string()
    .max(500, 'Bemerkung zu lang')
    .optional()
}).refine((data) => {
  // Bei Umbuchung muss Ziel-Lagerort angegeben werden
  if (data.buchungstyp === 'umbuchung' && !data.zielLagerortId) {
    return false
  }
  return true
}, {
  message: 'Bei Umbuchung muss ein Ziel-Lagerort angegeben werden',
  path: ['zielLagerortId']
})

// =================================================================
// SEARCH AND FILTER SCHEMAS
// =================================================================

/**
 * Inventory search options schema
 */
export const inventorySearchSchema = z.object({
  search: z.string().optional(),
  kategorie: z.string().optional(),
  lagerort: z.string().optional(),
  status: z.enum(['all', 'low_stock', 'out_of_stock', 'available']).default('all'),
  sortBy: z.enum(['name', 'quantity', 'category', 'location']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25)
})

// =================================================================
// REPORTING SCHEMAS
// =================================================================

/**
 * Inventory report filters schema
 */
export const reportFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  lagerortIds: z.array(z.number()).optional(),
  artikelIds: z.array(z.number()).optional(),
  buchungstypen: z.array(z.enum(['eingang', 'ausgang', 'umbuchung', 'korrektur'])).optional(),
  format: z.enum(['csv', 'excel', 'pdf']).default('csv')
})

// =================================================================
// EXPORT HELPERS
// =================================================================

/**
 * Validate storage location data
 */
export const validateStorageLocation = (data) => {
  return storageLocationSchema.parse(data)
}

/**
 * Validate article data
 */
export const validateArticle = (data) => {
  return articleSchema.parse(data)
}

/**
 * Validate stock data
 */
export const validateStock = (data) => {
  return stockSchema.parse(data)
}

/**
 * Validate booking data
 */
export const validateBooking = (data) => {
  return bookingSchema.parse(data)
}

/**
 * Validate search options
 */
export const validateSearchOptions = (data) => {
  return inventorySearchSchema.parse(data)
}

/**
 * Validate report filters
 */
export const validateReportFilters = (data) => {
  return reportFiltersSchema.parse(data)
}