/**
 * RESERVATION FORM MODAL
 *
 * Modal component for creating and editing vehicle reservations
 * Supports availability checking and conflict prevention
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Calendar, Clock, User, MapPin } from 'lucide-react'

// Validation schema
import { reservationSchema } from '../schemas/vehicleValidation'

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
import { Alert, AlertDescription } from '../../../components/ui/alert'

// Status options
const statusOptions = [
  { value: 'aktiv', label: 'Aktiv' },
  { value: 'abgeschlossen', label: 'Abgeschlossen' },
  { value: 'storniert', label: 'Storniert' }
]

export default function ReservationFormModal({
  open,
  onClose,
  onSubmit,
  onCheckAvailability,
  initialData = null,
  vehicles = [],
  loading = false,
  availabilityCheck = null
}) {
  const isEditing = !!initialData
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  // Form setup with validation
  const form = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      vehicle_id: 0,
      mitarbeiter_name: '',
      start_datum: '',
      start_zeit: '',
      end_datum: '',
      end_zeit: '',
      zweck: '',
      geplante_kilometer: 0,
      status: 'aktiv',
      notizen: '',
      ...initialData
    }
  })

  // Watch form fields for availability checking
  const watchedFields = form.watch(['vehicle_id', 'start_datum', 'start_zeit', 'end_datum', 'end_zeit'])

  // Check availability when relevant fields change
  useEffect(() => {
    const [vehicleId, startDate, startTime, endDate, endTime] = watchedFields

    if (vehicleId && startDate && startTime && endDate && endTime && onCheckAvailability) {
      const checkAvailability = async () => {
        setIsCheckingAvailability(true)
        try {
          await onCheckAvailability(vehicleId, startDate, startTime, endDate, endTime)
        } catch (error) {
          console.error('Error checking availability:', error)
        } finally {
          setIsCheckingAvailability(false)
        }
      }

      const timeoutId = setTimeout(checkAvailability, 500) // Debounce
      return () => clearTimeout(timeoutId)
    }
  }, [watchedFields, onCheckAvailability])

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

  // Get available vehicles (not reserved or in maintenance)
  const availableVehicles = vehicles.filter(vehicle =>
    ['verfuegbar'].includes(vehicle.attributes?.status)
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEditing ? 'Reservierung bearbeiten' : 'Neue Reservierung'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Reservierungsdaten.'
              : 'Reservieren Sie ein Fahrzeug für einen bestimmten Zeitraum.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Vehicle Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Fahrzeug & Mitarbeiter
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicle_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fahrzeug *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Fahrzeug auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableVehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                              {vehicle.attributes.kennzeichen} - {vehicle.attributes.marke} {vehicle.attributes.modell}
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
                  name="mitarbeiter_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mitarbeiter *</FormLabel>
                      <FormControl>
                        <Input placeholder="Max Mustermann" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Time Period */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Zeitraum
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_datum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startdatum *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_zeit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startzeit *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="end_datum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enddatum *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_zeit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endzeit *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Availability Check Result */}
              {isCheckingAvailability && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Verfügbarkeit wird geprüft...
                  </AlertDescription>
                </Alert>
              )}

              {availabilityCheck && !isCheckingAvailability && (
                <Alert variant={availabilityCheck.available ? "default" : "destructive"}>
                  <AlertDescription>
                    {availabilityCheck.available
                      ? "✓ Fahrzeug ist für den gewählten Zeitraum verfügbar"
                      : `✗ Fahrzeug ist nicht verfügbar. Konflikte: ${availabilityCheck.conflicts.length}`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Purpose and Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Zweck & Details
              </h3>

              <FormField
                control={form.control}
                name="zweck"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zweck der Fahrt *</FormLabel>
                    <FormControl>
                      <Input placeholder="Kundenbesuch, Materialtransport, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="geplante_kilometer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geplante Kilometer</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Geschätzte Kilometerleistung für die Fahrt
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing && (
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
                )}
              </div>

              <FormField
                control={form.control}
                name="notizen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notizen</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Zusätzliche Informationen zur Reservierung..."
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
              <Button
                type="submit"
                disabled={loading || (availabilityCheck && !availabilityCheck.available)}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Aktualisieren' : 'Reservieren'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}