/**
 * VEHICLE FORM MODAL
 *
 * Modal component for creating and editing vehicles
 * Supports add/edit modes with comprehensive vehicle data
 */

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Car, Fuel, Calendar, MapPin } from 'lucide-react'

// Validation schema
import { vehicleSchema } from '../schemas/vehicleValidation'

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

// Vehicle type options
const vehicleTypeOptions = [
  { value: 'car', label: 'PKW' },
  { value: 'truck', label: 'LKW' },
  { value: 'van', label: 'Transporter' },
  { value: 'tractor', label: 'Traktor' },
  { value: 'trailer', label: 'Anhänger' }
]

// Fuel type options
const fuelTypeOptions = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'benzin', label: 'Benzin' },
  { value: 'elektro', label: 'Elektro' },
  { value: 'hybrid', label: 'Hybrid' }
]

// Status options
const statusOptions = [
  { value: 'verfuegbar', label: 'Verfügbar' },
  { value: 'reserviert', label: 'Reserviert' },
  { value: 'wartung', label: 'Wartung' },
  { value: 'defekt', label: 'Defekt' }
]

export default function VehicleFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  loading = false
}) {
  const isEditing = !!initialData

  // Form setup with validation
  const form = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      kennzeichen: '',
      marke: '',
      modell: '',
      baujahr: new Date().getFullYear(),
      typ: 'car',
      kraftstoffart: 'diesel',
      verbrauch: 0,
      tankgroesse: 0,
      laufleistung: 0,
      tuev_ablauf: '',
      versicherung_ablauf: '',
      status: 'verfuegbar',
      standort: '',
      notizen: '',
      ...initialData
    }
  })

  // Handle form submission
  const handleSubmit = (data) => {
    onSubmit(data)
    if (!isEditing) {
      form.reset()
    }
  }

  // Handle modal close
  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {isEditing ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug anlegen'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Fahrzeugdaten. Änderungen werden sofort gespeichert.'
              : 'Füllen Sie alle erforderlichen Felder aus, um ein neues Fahrzeug anzulegen.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Car className="h-4 w-4" />
                Fahrzeugdaten
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="kennzeichen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kennzeichen *</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marke"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marke *</FormLabel>
                      <FormControl>
                        <Input placeholder="Volkswagen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modell *</FormLabel>
                      <FormControl>
                        <Input placeholder="Golf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="baujahr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baujahr *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2020"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="typ"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fahrzeugtyp *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Typ auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleTypeOptions.map((option) => (
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Fuel and Performance */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Kraftstoff & Leistung
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="kraftstoffart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kraftstoffart *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kraftstoff auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fuelTypeOptions.map((option) => (
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

                <FormField
                  control={form.control}
                  name="verbrauch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verbrauch (L/100km) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="7.5"
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
                  name="tankgroesse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tankgröße (Liter) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="laufleistung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laufleistung (km) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Aktuelle Kilometerleistung des Fahrzeugs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Legal and Administrative */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Termine & Dokumente
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tuev_ablauf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TÜV Ablauf *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="versicherung_ablauf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versicherung Ablauf *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location and Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Standort & Notizen
              </h3>

              <FormField
                control={form.control}
                name="standort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standort</FormLabel>
                    <FormControl>
                      <Input placeholder="Hauptstandort, Garage A" {...field} />
                    </FormControl>
                    <FormDescription>
                      Aktueller Standort oder Parkplatz des Fahrzeugs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notizen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notizen</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Zusätzliche Informationen zum Fahrzeug..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
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