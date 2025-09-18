/**
 * PLANT MANAGEMENT VALIDATION SCHEMAS
 *
 * Zod validation schemas for agricultural plant management forms
 * Provides comprehensive validation for field management and crop operations
 */

import { z } from 'zod'

// =================================================================
// FIELD/PLOT (SCHLAG) SCHEMAS
// =================================================================

/**
 * Field/Plot basic information validation schema
 */
export const fieldSchema = z.object({
  name: z.string()
    .min(1, 'Feldname ist erforderlich')
    .max(100, 'Feldname zu lang'),
  nr: z.number()
    .min(1, 'Feldnummer muss positiv sein')
    .max(9999, 'Feldnummer zu hoch'),
  adresse: z.string()
    .min(1, 'Adresse ist erforderlich')
    .max(200, 'Adresse zu lang'),
  groesse: z.string()
    .min(1, 'Größenangabe ist erforderlich')
    .max(50, 'Größenangabe zu lang'),
  bemerkung: z.string()
    .max(500, 'Bemerkung zu lang')
    .optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
  }).optional(),
  status: z.enum(['active', 'inactive', 'fallow']).default('active')
})

/**
 * Soil quality validation schema
 */
export const soilQualitySchema = z.object({
  fieldId: z.number().min(1, 'Feld muss ausgewählt werden'),
  pH: z.number()
    .min(0, 'pH-Wert muss positiv sein')
    .max(14, 'pH-Wert zu hoch')
    .optional(),
  organicMatter: z.number()
    .min(0, 'Organische Substanz muss positiv sein')
    .max(100, 'Organische Substanz zu hoch')
    .optional(),
  nitrogen: z.number()
    .min(0, 'Stickstoffgehalt muss positiv sein')
    .optional(),
  phosphorus: z.number()
    .min(0, 'Phosphorgehalt muss positiv sein')
    .optional(),
  potassium: z.number()
    .min(0, 'Kaliumgehalt muss positiv sein')
    .optional(),
  soilType: z.enum(['sand', 'clay', 'loam', 'silt', 'peat', 'chalk']).optional(),
  drainage: z.enum(['poor', 'moderate', 'good', 'excellent']).optional(),
  testDate: z.string().optional(),
  notes: z.string().max(500, 'Notizen zu lang').optional()
})

/**
 * Field owner information validation schema
 */
export const fieldOwnerSchema = z.object({
  fieldId: z.number().min(1, 'Feld muss ausgewählt werden'),
  ownerName: z.string()
    .min(1, 'Eigentümername ist erforderlich')
    .max(100, 'Eigentümername zu lang'),
  ownerAddress: z.string()
    .min(1, 'Eigentümeradresse ist erforderlich')
    .max(200, 'Eigentümeradresse zu lang'),
  contactPerson: z.string()
    .max(100, 'Kontaktperson zu lang')
    .optional(),
  phone: z.string()
    .max(20, 'Telefonnummer zu lang')
    .optional(),
  email: z.string()
    .email('Ungültige E-Mail-Adresse')
    .optional(),
  contractType: z.enum(['owned', 'leased', 'rented', 'partnership']).default('owned'),
  contractStart: z.string().optional(),
  contractEnd: z.string().optional(),
  rentPrice: z.number().min(0, 'Pachtpreis muss positiv sein').optional()
})

// =================================================================
// CROP CULTIVATION SCHEMAS
// =================================================================

/**
 * Crop/Plant validation schema
 */
export const cropSchema = z.object({
  name: z.string()
    .min(1, 'Pflanzenname ist erforderlich')
    .max(100, 'Pflanzenname zu lang'),
  scientificName: z.string()
    .max(150, 'Wissenschaftlicher Name zu lang')
    .optional(),
  category: z.enum([
    'getreide', 'gemüse', 'obst', 'hülsenfrüchte',
    'ölsaaten', 'futterpflanzen', 'zwischenfrüchte', 'sonstige'
  ]),
  variety: z.string()
    .max(100, 'Sorte zu lang')
    .optional(),
  seedingRate: z.number()
    .min(0, 'Aussaatmenge muss positiv sein')
    .optional(),
  seedingUnit: z.enum(['kg/ha', 'g/m²', 'seeds/m²', 'plants/m²']).optional(),
  growthDuration: z.number()
    .min(1, 'Wachstumsdauer muss mindestens 1 Tag sein')
    .max(365, 'Wachstumsdauer zu lang')
    .optional(),
  harvestWindow: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  requirements: z.object({
    minTemperature: z.number().optional(),
    maxTemperature: z.number().optional(),
    waterRequirement: z.enum(['low', 'medium', 'high']).optional(),
    sunRequirement: z.enum(['shade', 'partial', 'full']).optional()
  }).optional()
})

/**
 * Cultivation planning validation schema
 */
export const cultivationPlanSchema = z.object({
  fieldId: z.number().min(1, 'Feld muss ausgewählt werden'),
  cropId: z.number().min(1, 'Pflanze muss ausgewählt werden'),
  season: z.number()
    .min(new Date().getFullYear() - 5, 'Jahr zu weit in der Vergangenheit')
    .max(new Date().getFullYear() + 10, 'Jahr zu weit in der Zukunft'),
  plannedSowingDate: z.string()
    .min(1, 'Aussaattermin ist erforderlich'),
  plannedHarvestDate: z.string()
    .min(1, 'Erntetermin ist erforderlich'),
  plannedArea: z.number()
    .min(0.01, 'Geplante Fläche muss größer als 0 sein'),
  expectedYield: z.number()
    .min(0, 'Erwarteter Ertrag muss positiv sein')
    .optional(),
  yieldUnit: z.enum(['t/ha', 'kg/ha', 'dt/ha', 'Stück/ha']).optional(),
  notes: z.string().max(500, 'Notizen zu lang').optional(),
  status: z.enum(['planned', 'sown', 'growing', 'harvested', 'cancelled']).default('planned')
}).refine((data) => {
  const sowingDate = new Date(data.plannedSowingDate)
  const harvestDate = new Date(data.plannedHarvestDate)
  return harvestDate > sowingDate
}, {
  message: 'Erntetermin muss nach Aussaattermin liegen',
  path: ['plannedHarvestDate']
})

// =================================================================
// FIELD ACTIVITIES SCHEMAS
// =================================================================

/**
 * Field activity validation schema
 */
export const fieldActivitySchema = z.object({
  fieldId: z.number().min(1, 'Feld muss ausgewählt werden'),
  activityType: z.enum([
    'sowing', 'planting', 'fertilizing', 'watering', 'weeding',
    'pest_control', 'harvesting', 'tilling', 'mulching', 'pruning',
    'soil_testing', 'maintenance', 'other'
  ]),
  activityDate: z.string().min(1, 'Aktivitätsdatum ist erforderlich'),
  duration: z.number()
    .min(0.1, 'Dauer muss mindestens 0.1 Stunden sein')
    .max(24, 'Dauer zu lang')
    .optional(),
  description: z.string()
    .min(1, 'Beschreibung ist erforderlich')
    .max(500, 'Beschreibung zu lang'),
  materials: z.array(z.object({
    name: z.string().min(1, 'Materialname erforderlich'),
    quantity: z.number().min(0, 'Menge muss positiv sein'),
    unit: z.string().min(1, 'Einheit erforderlich'),
    cost: z.number().min(0, 'Kosten müssen positiv sein').optional()
  })).optional(),
  laborHours: z.number().min(0, 'Arbeitsstunden müssen positiv sein').optional(),
  machineHours: z.number().min(0, 'Maschinenstunden müssen positiv sein').optional(),
  weather: z.object({
    temperature: z.number().optional(),
    humidity: z.number().min(0).max(100).optional(),
    windSpeed: z.number().min(0).optional(),
    precipitation: z.number().min(0).optional(),
    conditions: z.enum(['sunny', 'cloudy', 'rainy', 'stormy', 'foggy']).optional()
  }).optional(),
  results: z.string().max(500, 'Ergebnisse zu lang').optional(),
  nextActivity: z.string().max(200, 'Nächste Aktivität zu lang').optional(),
  completed: z.boolean().default(false)
})

// =================================================================
// REPORTING SCHEMAS
// =================================================================

/**
 * Yield record validation schema
 */
export const yieldRecordSchema = z.object({
  fieldId: z.number().min(1, 'Feld muss ausgewählt werden'),
  cropId: z.number().min(1, 'Pflanze muss ausgewählt werden'),
  harvestDate: z.string().min(1, 'Erntedatum ist erforderlich'),
  area: z.number().min(0.01, 'Fläche muss größer als 0 sein'),
  totalYield: z.number().min(0, 'Gesamtertrag muss positiv sein'),
  yieldPerArea: z.number().min(0, 'Ertrag pro Fläche muss positiv sein'),
  quality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  moistureContent: z.number().min(0).max(100).optional(),
  storageLocation: z.string().max(100, 'Lagerort zu lang').optional(),
  marketPrice: z.number().min(0, 'Marktpreis muss positiv sein').optional(),
  totalRevenue: z.number().min(0, 'Gesamterlös muss positiv sein').optional(),
  notes: z.string().max(500, 'Notizen zu lang').optional()
})

/**
 * Season report filters validation schema
 */
export const seasonReportSchema = z.object({
  year: z.number()
    .min(2000, 'Jahr zu weit in der Vergangenheit')
    .max(new Date().getFullYear() + 1, 'Jahr zu weit in der Zukunft'),
  fieldIds: z.array(z.number()).optional(),
  cropIds: z.array(z.number()).optional(),
  activityTypes: z.array(z.string()).optional(),
  includeFinancials: z.boolean().default(false),
  format: z.enum(['summary', 'detailed', 'export']).default('summary')
})

// =================================================================
// SEARCH AND FILTER SCHEMAS
// =================================================================

/**
 * Plant management search options schema
 */
export const plantSearchSchema = z.object({
  search: z.string().optional(),
  fieldId: z.number().optional(),
  cropCategory: z.string().optional(),
  activityType: z.string().optional(),
  season: z.number().optional(),
  status: z.enum(['all', 'active', 'planned', 'completed']).default('all'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['date', 'field', 'crop', 'activity']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25)
})

// =================================================================
// EXPORT HELPERS
// =================================================================

/**
 * Validate field data
 */
export const validateField = (data) => {
  return fieldSchema.parse(data)
}

/**
 * Validate crop data
 */
export const validateCrop = (data) => {
  return cropSchema.parse(data)
}

/**
 * Validate cultivation plan
 */
export const validateCultivationPlan = (data) => {
  return cultivationPlanSchema.parse(data)
}

/**
 * Validate field activity
 */
export const validateFieldActivity = (data) => {
  return fieldActivitySchema.parse(data)
}

/**
 * Validate yield record
 */
export const validateYieldRecord = (data) => {
  return yieldRecordSchema.parse(data)
}

/**
 * Validate soil quality data
 */
export const validateSoilQuality = (data) => {
  return soilQualitySchema.parse(data)
}

/**
 * Validate field owner data
 */
export const validateFieldOwner = (data) => {
  return fieldOwnerSchema.parse(data)
}

/**
 * Validate search options
 */
export const validatePlantSearch = (data) => {
  return plantSearchSchema.parse(data)
}

/**
 * Validate season report filters
 */
export const validateSeasonReport = (data) => {
  return seasonReportSchema.parse(data)
}