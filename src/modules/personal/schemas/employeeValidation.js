/**
 * EMPLOYEE VALIDATION SCHEMAS
 *
 * Zod validation schemas for Personal module forms
 */

import { z } from 'zod'

// Base employee schema
export const employeeSchema = z.object({
  name: z.string()
    .min(1, 'Name ist erforderlich')
    .max(100, 'Name zu lang'),

  birthdate: z.string()
    .min(1, 'Geburtsdatum ist erforderlich')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 16 && age <= 100
    }, 'Alter muss zwischen 16 und 100 Jahren liegen'),

  address: z.string()
    .min(1, 'Adresse ist erforderlich')
    .max(200, 'Adresse zu lang'),

  entryDate: z.string()
    .min(1, 'Eintrittsdatum ist erforderlich')
    .refine((date) => {
      const entry = new Date(date)
      const today = new Date()
      return entry <= today
    }, 'Eintrittsdatum kann nicht in der Zukunft liegen'),

  salary: z.number()
    .min(0, 'Gehalt muss positiv sein')
    .max(200000, 'Gehalt unrealistisch hoch'),

  workTime: z.number()
    .min(1, 'Arbeitszeit muss mindestens 1 Stunde sein')
    .max(60, 'Arbeitszeit darf 60 Stunden pro Woche nicht überschreiten'),

  qualification: z.string()
    .min(1, 'Qualifikation ist erforderlich'),

  role: z.enum(['hr', 'manager', 'employee', 'admin'], {
    errorMap: () => ({ message: 'Ungültige Rolle ausgewählt' })
  }),

  email: z.string()
    .email('Ungültige E-Mail-Adresse')
    .optional(),

  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Ungültige Telefonnummer')
    .optional(),

  status: z.enum(['active', 'inactive', 'terminated']).default('active')
})

// Schema for employee creation (all fields required)
export const createEmployeeSchema = employeeSchema

// Schema for employee updates (partial updates allowed)
export const updateEmployeeSchema = employeeSchema.partial()

// Schema for time tracking
export const timeTrackingSchema = z.object({
  employeeId: z.number().min(1, 'Mitarbeiter-ID erforderlich'),
  date: z.string().min(1, 'Datum erforderlich'),
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültige Startzeit (HH:MM)'),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültige Endzeit (HH:MM)'),
  breakTime: z.number()
    .min(0, 'Pausenzeit kann nicht negativ sein')
    .max(480, 'Pausenzeit unrealistisch lang'),
  description: z.string().optional(),
  approved: z.boolean().default(false)
}).refine((data) => {
  const start = new Date(`2000-01-01T${data.startTime}`)
  const end = new Date(`2000-01-01T${data.endTime}`)
  return end > start
}, {
  message: 'Endzeit muss nach Startzeit liegen',
  path: ['endTime']
})

// Validation helper functions
export const validateEmployee = (data) => {
  return createEmployeeSchema.safeParse(data)
}

export const validateEmployeeUpdate = (data) => {
  return updateEmployeeSchema.safeParse(data)
}

export const validateTimeEntry = (data) => {
  return timeTrackingSchema.safeParse(data)
}