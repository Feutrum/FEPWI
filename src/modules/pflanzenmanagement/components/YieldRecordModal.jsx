/**
 * YIELD RECORD MODAL
 *
 * Modern yield recording form with Shadcn components
 * Uses React Hook Form + Zod validation for robust form handling
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2, TrendingUp, Scale, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

// Validation schema
import { yieldRecordSchema } from '../schemas/plantManagementValidation'

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
import { Calendar } from '../../../components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover'
import { toast } from 'sonner'
import { cn } from '../../../lib/utils'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// COMPONENT
// =================================================================

export default function YieldRecordModal({
  open,
  onOpenChange,
  yieldRecord = null,
  fields = [],
  crops = [],
  onSuccess
}) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!yieldRecord

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(yieldRecordSchema),
    defaultValues: {
      fieldId: 0,
      cropId: 0,
      harvestDate: '',
      quantity: 0,
      unit: 'kg',
      quality: 'good',
      moistureContent: 0,
      notes: '',
      pricePerUnit: 0,
      laborHours: 0,
      machineHours: 0,
      storageLocation: ''
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load yield record data when editing
   */
  useEffect(() => {
    if (yieldRecord && open) {
      form.reset({
        fieldId: yieldRecord.attributes.field?.data?.id || 0,
        cropId: yieldRecord.attributes.crop?.data?.id || 0,
        harvestDate: yieldRecord.attributes.harvestDate || '',
        quantity: yieldRecord.attributes.quantity || 0,
        unit: yieldRecord.attributes.unit || 'kg',
        quality: yieldRecord.attributes.quality || 'good',
        moistureContent: yieldRecord.attributes.moistureContent || 0,
        notes: yieldRecord.attributes.notes || '',
        pricePerUnit: yieldRecord.attributes.pricePerUnit || 0,
        laborHours: yieldRecord.attributes.laborHours || 0,
        machineHours: yieldRecord.attributes.machineHours || 0,
        storageLocation: yieldRecord.attributes.storageLocation || ''
      })
    } else if (!yieldRecord && open) {
      form.reset({
        fieldId: 0,
        cropId: 0,
        harvestDate: '',
        quantity: 0,
        unit: 'kg',
        quality: 'good',
        moistureContent: 0,
        notes: '',
        pricePerUnit: 0,
        laborHours: 0,
        machineHours: 0,
        storageLocation: ''
      })
    }
  }, [yieldRecord, open, form])

  // =================================================================
  // FORM HANDLERS
  // =================================================================

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      setLoading(true)

      if (isEditing) {
        await api.plantManagement.updateYieldRecord(yieldRecord.id, data)
        toast.success('Ertragsdaten erfolgreich aktualisiert')
      } else {
        await api.plantManagement.createYieldRecord(data)
        toast.success('Ertragsdaten erfolgreich erfasst')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving yield record:', error)
      toast.error(isEditing ? 'Fehler beim Aktualisieren der Ertragsdaten' : 'Fehler beim Erfassen der Ertragsdaten')
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
   * Units for yield measurement
   */
  const units = [
    { value: 'kg', label: 'Kilogramm' },
    { value: 't', label: 'Tonnen' },
    { value: 'g', label: 'Gramm' },
    { value: 'pieces', label: 'Stück' },
    { value: 'liters', label: 'Liter' }
  ]

  /**
   * Quality grades
   */
  const qualityGrades = [
    { value: 'excellent', label: 'Ausgezeichnet' },
    { value: 'good', label: 'Gut' },
    { value: 'average', label: 'Durchschnittlich' },
    { value: 'poor', label: 'Schlecht' },
    { value: 'damaged', label: 'Beschädigt' }
  ]

  // =================================================================
  // CALCULATIONS
  // =================================================================

  const quantity = form.watch('quantity')
  const pricePerUnit = form.watch('pricePerUnit')
  const totalValue = quantity * pricePerUnit

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {isEditing ? 'Ertragsdaten bearbeiten' : 'Neue Ertragsdaten erfassen'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Ertragsdaten. Änderungen werden sofort gespeichert.'
              : 'Erfassen Sie die Ernteergebnisse mit allen relevanten Details.'}
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
                  name="fieldId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feld *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Feld auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fields.map((field) => (
                            <SelectItem key={field.id} value={field.id.toString()}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {field.attributes.name} (Nr. {field.attributes.nr})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cropId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pflanze *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pflanze auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {crops.map((crop) => (
                            <SelectItem key={crop.id} value={crop.id.toString()}>
                              {crop.attributes.name}
                              {crop.attributes.variety && ` (${crop.attributes.variety})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="harvestDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Erntedatum *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP", { locale: de })
                            ) : (
                              <span>Datum auswählen</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Yield Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Ertragsdaten
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menge *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Einheit *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Einheit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualität</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Qualität" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {qualityGrades.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="moistureContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feuchtigkeitsgehalt (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Feuchtigkeitsgehalt in Prozent
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="storageLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lagerort</FormLabel>
                      <FormControl>
                        <Input placeholder="Lagerhalle, Silo, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Wo wird die Ernte gelagert?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Economic Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Wirtschaftsdaten</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pricePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preis pro Einheit (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Verkaufspreis oder Marktwert
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="laborHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arbeitsstunden</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Aufwand für die Ernte
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="machineHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maschinenstunden</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maschineneinsatz für die Ernte
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Total Value Display */}
              {quantity > 0 && pricePerUnit > 0 && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gesamtwert:</span>
                    <span className="text-lg font-semibold">
                      {totalValue.toLocaleString('de-DE', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Zusätzliche Informationen</h3>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bemerkungen</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Besondere Beobachtungen, Probleme, Qualitätsmerkmale..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Dokumentation besonderer Umstände oder Qualitätsmerkmale
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
                {isEditing ? 'Aktualisieren' : 'Erfassen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}