/**
 * FIELD FORM MODAL
 *
 * Modern field creation/editing form with Shadcn components
 * Uses React Hook Form + Zod validation for robust form handling
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MapPin, Ruler, FileText } from 'lucide-react'

// Validation schema
import { fieldSchema } from '../schemas/plantManagementValidation'

// Shadcn UI Components
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
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
import { Textarea } from '../../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// COMPONENT
// =================================================================

export default function FieldFormModal({
  open,
  onOpenChange,
  field = null,
  onSuccess
}) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!field

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: '',
      nr: 1,
      adresse: '',
      groesse: '',
      bemerkung: '',
      coordinates: {
        latitude: '',
        longitude: ''
      },
      status: 'active'
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load field data when editing
   */
  useEffect(() => {
    if (field && open) {
      form.reset({
        name: field.attributes.name || '',
        nr: field.attributes.nr || 1,
        adresse: field.attributes.adresse || '',
        groesse: field.attributes.groesse || '',
        bemerkung: field.attributes.bemerkung || '',
        coordinates: {
          latitude: field.attributes.coordinates?.latitude || '',
          longitude: field.attributes.coordinates?.longitude || ''
        },
        status: field.attributes.status || 'active'
      })
    } else if (!field && open) {
      form.reset({
        name: '',
        nr: 1,
        adresse: '',
        groesse: '',
        bemerkung: '',
        coordinates: {
          latitude: '',
          longitude: ''
        },
        status: 'active'
      })
    }
  }, [field, open, form])

  // =================================================================
  // FORM HANDLERS
  // =================================================================

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      setLoading(true)

      // Clean up coordinates if empty
      const cleanedData = {
        ...data,
        coordinates: data.coordinates.latitude && data.coordinates.longitude
          ? {
              latitude: parseFloat(data.coordinates.latitude),
              longitude: parseFloat(data.coordinates.longitude)
            }
          : null
      }

      if (isEditing) {
        await api.plantManagement.updateField(field.id, cleanedData)
        toast.success('Feld erfolgreich aktualisiert')
      } else {
        await api.plantManagement.createField(cleanedData)
        toast.success('Feld erfolgreich erstellt')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving field:', error)
      toast.error(isEditing ? 'Fehler beim Aktualisieren des Feldes' : 'Fehler beim Erstellen des Feldes')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================

  /**
   * Status options
   */
  const statusOptions = [
    { value: 'active', label: 'Aktiv' },
    { value: 'inactive', label: 'Inaktiv' },
    { value: 'fallow', label: 'Brache' }
  ]

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isEditing ? 'Feld bearbeiten' : 'Neues Feld anlegen'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Felddaten. Änderungen werden sofort gespeichert.'
              : 'Füllen Sie alle erforderlichen Felder aus, um ein neues Feld anzulegen.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Grunddaten</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feldnummer *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        Eindeutige Feldnummer (1-9999)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feldname *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Westfeld, Obstgarten" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="adresse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse/Lage *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Genaue Beschreibung der Lage oder Adresse des Feldes"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="groesse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Größe *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Ruler className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="z.B. 2,5 ha, 25000 m²"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Größe mit Einheit (ha, m², etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Status auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Coordinates (Optional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">GPS-Koordinaten (Optional)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="coordinates.latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breitengrad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="z.B. 52.520008"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Geografische Breite (-90 bis 90)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coordinates.longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Längengrad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="z.B. 13.404954"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Geografische Länge (-180 bis 180)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Zusätzliche Informationen</h3>

              <FormField
                control={form.control}
                name="bemerkung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bemerkung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Weitere wichtige Informationen zum Feld, aktuelle Nutzung, Besonderheiten..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Beschreibung der aktuellen Nutzung oder besondere Eigenschaften
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Aktualisieren' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}