/**
 * DELIVERY ASSIGNER COMPONENT
 *
 * Handles assignment of drivers and vehicles to orders (VT-09)
 * Als Auftragsbearbeiter möchte ich Fahrer und Fahrzeuge Aufträgen zuweisen können
 *
 * Features:
 * - View orders ready for delivery assignment
 * - Select available drivers for delivery date
 * - Select available vehicles for delivery date
 * - Assign driver and vehicle to order
 * - Validate resource availability
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Truck,
  User,
  Calendar,
  Package,
  CheckCircle,
  AlertTriangle,
  Euro,
  MapPin
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// VALIDATION SCHEMA
// =================================================================

const deliveryAssignmentSchema = z.object({
  fahrer: z.string().min(1, 'Fahrer ist erforderlich'),
  fahrzeug: z.string().min(1, 'Fahrzeug ist erforderlich')
})

// =================================================================
// COMPONENT
// =================================================================

export default function DeliveryAssigner({ order, onSubmit, onCancel }) {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [loading, setLoading] = useState(false)
  const [driversLoading, setDriversLoading] = useState(true)
  const [vehiclesLoading, setVehiclesLoading] = useState(true)
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [availableVehicles, setAvailableVehicles] = useState([])

  // =================================================================
  // FORM SETUP
  // =================================================================

  const orderAttrs = order.attributes || order

  const form = useForm({
    resolver: zodResolver(deliveryAssignmentSchema),
    defaultValues: {
      fahrer: orderAttrs.fahrer?.data?.id?.toString() || '',
      fahrzeug: orderAttrs.fahrzeug?.data?.id?.toString() || ''
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load available resources on mount and when delivery date changes
   */
  useEffect(() => {
    if (orderAttrs.lieferdatum) {
      loadAvailableDrivers(orderAttrs.lieferdatum)
      loadAvailableVehicles(orderAttrs.lieferdatum)
    }
  }, [orderAttrs.lieferdatum])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load available drivers for delivery date
   */
  const loadAvailableDrivers = async (date) => {
    try {
      setDriversLoading(true)
      const response = await api.vertrieb.getAvailableDrivers(date)
      setAvailableDrivers(response.data || [])
    } catch (error) {
      console.error('Error loading drivers:', error)
      toast.error('Fehler beim Laden der Fahrer')
      setAvailableDrivers([])
    } finally {
      setDriversLoading(false)
    }
  }

  /**
   * Load available vehicles for delivery date
   */
  const loadAvailableVehicles = async (date) => {
    try {
      setVehiclesLoading(true)
      const response = await api.vertrieb.getAvailableVehicles(date)
      setAvailableVehicles(response.data || [])
    } catch (error) {
      console.error('Error loading vehicles:', error)
      toast.error('Fehler beim Laden der Fahrzeuge')
      setAvailableVehicles([])
    } finally {
      setVehiclesLoading(false)
    }
  }

  // =================================================================
  // FORM HANDLERS
  // =================================================================

  /**
   * Handle form submission
   */
  const handleSubmit = async (data) => {
    try {
      setLoading(true)

      // Update order with driver and vehicle assignments
      const updateData = {
        fahrer: parseInt(data.fahrer),
        fahrzeug: parseInt(data.fahrzeug)
      }

      await onSubmit(order.id, updateData)
    } catch (error) {
      console.error('Error assigning delivery:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    form.reset()
    onCancel()
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unbekannt'
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  /**
   * Get driver display name
   */
  const getDriverDisplayName = (driver) => {
    const attrs = driver.attributes || driver
    return `${attrs.vorname || ''} ${attrs.nachname || ''}`.trim() || 'Unbekannt'
  }

  /**
   * Get vehicle display name
   */
  const getVehicleDisplayName = (vehicle) => {
    const attrs = vehicle.attributes || vehicle
    return `${attrs.bezeichnung || 'Unbekannt'} (${attrs.kennzeichen || 'Kein Kennzeichen'})`
  }

  /**
   * Check if current assignments are valid
   */
  const hasValidAssignments = () => {
    return form.watch('fahrer') && form.watch('fahrzeug')
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Auftragsdetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Auftrags-ID</h4>
                <p className="font-medium">{orderAttrs.aufid || `AUF-${order.id}`}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Kunde</h4>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{orderAttrs.angebot?.data?.attributes?.kunde?.data?.attributes?.name || 'Unbekannt'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Lieferdatum</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(orderAttrs.lieferdatum)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Gesamtpreis</h4>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  <span className="font-semibold">{formatCurrency(orderAttrs.gesamtpreis)}</span>
                </div>
              </div>
            </div>

            {/* Customer Address */}
            {orderAttrs.angebot?.data?.attributes?.kunde?.data?.attributes && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Lieferadresse</h4>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {(() => {
                      const customerAttrs = orderAttrs.angebot.data.attributes.kunde.data.attributes
                      return `${customerAttrs.strasse || ''} ${customerAttrs.hausnummer || ''}, ${customerAttrs.plz || ''} ${customerAttrs.ort || ''}`.trim()
                    })()}
                  </span>
                </div>
              </div>
            )}

            {/* Current Assignments */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Aktueller Fahrer</h4>
                {orderAttrs.fahrer?.data ? (
                  <Badge variant="secondary" className="gap-1">
                    <User className="h-3 w-3" />
                    {getDriverDisplayName(orderAttrs.fahrer.data)}
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">Nicht zugewiesen</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Aktuelles Fahrzeug</h4>
                {orderAttrs.fahrzeug?.data ? (
                  <Badge variant="secondary" className="gap-1">
                    <Truck className="h-3 w-3" />
                    {getVehicleDisplayName(orderAttrs.fahrzeug.data)}
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">Nicht zugewiesen</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Fahrer zuweisen
            </CardTitle>
            <CardDescription>
              Wählen Sie einen verfügbaren Fahrer für das Lieferdatum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="fahrer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fahrer *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={driversLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          driversLoading
                            ? "Lade Fahrer..."
                            : availableDrivers.length === 0
                              ? "Keine Fahrer verfügbar"
                              : "Fahrer auswählen"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {getDriverDisplayName(driver)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {driversLoading ? (
                      "Lade verfügbare Fahrer..."
                    ) : availableDrivers.length === 0 ? (
                      "Keine Fahrer für das gewählte Datum verfügbar"
                    ) : (
                      `${availableDrivers.length} Fahrer verfügbar für ${formatDate(orderAttrs.lieferdatum)}`
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Vehicle Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Fahrzeug zuweisen
            </CardTitle>
            <CardDescription>
              Wählen Sie ein verfügbares Fahrzeug für das Lieferdatum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="fahrzeug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fahrzeug *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={vehiclesLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          vehiclesLoading
                            ? "Lade Fahrzeuge..."
                            : availableVehicles.length === 0
                              ? "Keine Fahrzeuge verfügbar"
                              : "Fahrzeug auswählen"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            {getVehicleDisplayName(vehicle)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {vehiclesLoading ? (
                      "Lade verfügbare Fahrzeuge..."
                    ) : availableVehicles.length === 0 ? (
                      "Keine Fahrzeuge für das gewählte Datum verfügbar"
                    ) : (
                      `${availableVehicles.length} Fahrzeuge verfügbar für ${formatDate(orderAttrs.lieferdatum)}`
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Assignment Summary */}
        {hasValidAssignments() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Lieferzuweisung Zusammenfassung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Zuweisung für {formatDate(orderAttrs.lieferdatum)}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Fahrer:
                    </span>
                    <span className="font-medium">
                      {(() => {
                        const selectedDriver = availableDrivers.find(d => d.id.toString() === form.watch('fahrer'))
                        return selectedDriver ? getDriverDisplayName(selectedDriver) : 'Nicht ausgewählt'
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Fahrzeug:
                    </span>
                    <span className="font-medium">
                      {(() => {
                        const selectedVehicle = availableVehicles.find(v => v.id.toString() === form.watch('fahrzeug'))
                        return selectedVehicle ? getVehicleDisplayName(selectedVehicle) : 'Nicht ausgewählt'
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resource Availability Warnings */}
        {(!availableDrivers.length || !availableVehicles.length) && !driversLoading && !vehiclesLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Ressourcen-Warnung</span>
              </div>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {!availableDrivers.length && (
                  <p>• Keine Fahrer für {formatDate(orderAttrs.lieferdatum)} verfügbar</p>
                )}
                {!availableVehicles.length && (
                  <p>• Keine Fahrzeuge für {formatDate(orderAttrs.lieferdatum)} verfügbar</p>
                )}
                <p className="mt-2 text-xs">
                  Überprüfen Sie das Lieferdatum oder kontaktieren Sie die Fuhrparkverwaltung.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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
            disabled={loading || !hasValidAssignments() || driversLoading || vehiclesLoading}
          >
            {loading ? 'Zuweisen...' : 'Lieferung zuweisen'}
          </Button>
        </div>
      </form>
    </Form>
  )
}