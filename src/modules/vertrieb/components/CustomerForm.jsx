/**
 * CUSTOMER FORM COMPONENT
 *
 * Reusable form component for creating and editing customers
 * Implements customer data model with validation
 *
 * Data Model (from frontend-implementation-guide.md):
 * - kid: unique_id
 * - name: string
 * - telefon: string
 * - plz: string
 * - ort: string
 * - strasse: string
 * - hausnummer: string
 * - iban: string
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Shadcn UI Components
import { Button } from '../../../components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { Separator } from '../../../components/ui/separator'
import { Card, CardContent } from '../../../components/ui/card'

// =================================================================
// FORM VALIDATION SCHEMA
// =================================================================

const customerSchema = z.object({
  name: z.string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),

  telefon: z.string()
    .optional()
    .refine((val) => !val || /^[\d\s\-+()]+$/.test(val), {
      message: 'Ungültiges Telefonnummer-Format'
    }),

  strasse: z.string()
    .optional(),

  hausnummer: z.string()
    .optional(),

  plz: z.string()
    .optional()
    .refine((val) => !val || /^\d{5}$/.test(val), {
      message: 'PLZ muss 5 Ziffern haben'
    }),

  ort: z.string()
    .optional(),

  iban: z.string()
    .optional()
    .refine((val) => !val || /^[A-Z]{2}\d{20}$/.test(val.replace(/\s/g, '')), {
      message: 'Ungültiges IBAN-Format (z.B. DE89370400440532013000)'
    })
})

// =================================================================
// COMPONENT
// =================================================================

export default function CustomerForm({ customer, onSubmit, onCancel }) {
  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      telefon: '',
      strasse: '',
      hausnummer: '',
      plz: '',
      ort: '',
      iban: ''
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Populate form with customer data when editing
   */
  useEffect(() => {
    if (customer) {
      const attrs = customer.attributes || customer

      form.reset({
        name: attrs.name || '',
        telefon: attrs.telefon || '',
        strasse: attrs.strasse || '',
        hausnummer: attrs.hausnummer || '',
        plz: attrs.plz || '',
        ort: attrs.ort || '',
        iban: attrs.iban || ''
      })
    }
  }, [customer, form])

  // =================================================================
  // FORM HANDLERS
  // =================================================================

  /**
   * Handle form submission
   */
  const handleSubmit = (data) => {
    // Clean IBAN (remove spaces)
    if (data.iban) {
      data.iban = data.iban.replace(/\s/g, '')
    }

    // Remove empty fields
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== '')
    )

    onSubmit(cleanedData)
  }

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    form.reset()
    onCancel()
  }

  /**
   * Format IBAN display with spaces
   */
  const formatIBAN = (value) => {
    if (!value) return value
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Grunddaten</h3>
                <p className="text-sm text-muted-foreground">
                  Grundlegende Kundeninformationen
                </p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name / Firmenname *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Max Mustermann oder Mustermann GmbH"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefonnummer</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+49 123 456789"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optionale Telefonnummer für Rückfragen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Adresse</h3>
                <p className="text-sm text-muted-foreground">
                  Lieferadresse und Kontaktdaten
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="strasse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Straße</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Musterstraße"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="hausnummer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hausnummer</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123a"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="plz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PLZ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345"
                          maxLength={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="ort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ort</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Musterstadt"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Zahlungsinformationen</h3>
                <p className="text-sm text-muted-foreground">
                  Optionale Bankverbindung für Lastschriftverfahren
                </p>
              </div>

              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DE89 3704 0044 0532 0130 00"
                        value={formatIBAN(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Internationale Bankkontonummer für Zahlungen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Abbrechen
          </Button>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? 'Speichern...'
              : customer
                ? 'Änderungen speichern'
                : 'Kunde erstellen'
            }
          </Button>
        </div>
      </form>
    </Form>
  )
}