/**
 * VEHICLE RESERVATION SYSTEM
 *
 * Comprehensive vehicle reservation management with conflict detection (FM-06, FM-07)
 * Als Fuhrparkverwalter möchte ich Fahrzeuge für bestimmte Zeiträume reservieren können
 * Als Fuhrparkverwalter möchte ich Reservierungskonflikte automatisch erkennen
 *
 * Features:
 * - Create vehicle reservations for specific time periods
 * - Automatic conflict detection with existing reservations
 * - Visual calendar interface for reservation management
 * - Real-time availability checking
 * - Conflict resolution suggestions
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  User,
  Car,
  Truck,
  CalendarDays,
  MapPin,
  FileText,
  Save,
  RefreshCw
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
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../components/ui/alert'
import { Label } from '../../../components/ui/label'
import { Checkbox } from '../../../components/ui/checkbox'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// VALIDATION SCHEMA
// =================================================================

const reservationSchema = z.object({
  fahrzeug: z.string().min(1, 'Fahrzeug ist erforderlich'),
  fahrer: z.string().optional(),
  startdatum: z.string().min(1, 'Startdatum ist erforderlich'),
  enddatum: z.string().min(1, 'Enddatum ist erforderlich'),
  startzeit: z.string().min(1, 'Startzeit ist erforderlich'),
  endzeit: z.string().min(1, 'Endzeit ist erforderlich'),
  zweck: z.string().min(1, 'Verwendungszweck ist erforderlich'),
  startort: z.string().optional(),
  zielort: z.string().optional(),
  notizen: z.string().optional()
}).refine(
  (data) => {
    const start = new Date(`${data.startdatum}T${data.startzeit}`)
    const end = new Date(`${data.enddatum}T${data.endzeit}`)
    return end > start
  },
  {
    message: 'Enddatum und -zeit müssen nach Startdatum und -zeit liegen',
    path: ['enddatum']
  }
)

// =================================================================
// COMPONENT
// =================================================================

export default function VehicleReservation() {
  // =================================================================
  // SETUP & STATE
  // =================================================================

  const navigate = useNavigate()
  const { vehicleId } = useParams()

  const [loading, setLoading] = useState(false)
  const [checkingConflicts, setCheckingConflicts] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [availabilityResults, setAvailabilityResults] = useState(null)

  // Search and Filter
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [showAvailableOnly, setShowAvailableOnly] = useState(true)

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      fahrzeug: vehicleId || '',
      fahrer: '',
      startdatum: '',
      enddatum: '',
      startzeit: '08:00',
      endzeit: '18:00',
      zweck: '',
      startort: '',
      zielort: '',
      notizen: ''
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load vehicles and drivers on mount
   */
  useEffect(() => {
    loadVehicles()
    loadDrivers()
  }, [])

  /**
   * Load vehicle details if vehicleId is provided
   */
  useEffect(() => {
    if (vehicleId) {
      loadVehicleDetails(vehicleId)
    }
  }, [vehicleId])

  /**
   * Check for conflicts when form values change
   */
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (value.fahrzeug && value.startdatum && value.enddatum && value.startzeit && value.endzeit) {
        checkReservationConflicts(value)
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load available vehicles
   */
  const loadVehicles = async () => {
    try {
      const response = await api.fuhrpark.getVehicles({
        populate: ['modell'],
        filters: showAvailableOnly ? { status: 'verfügbar' } : {},
        sort: 'kennzeichen:asc'
      })
      setVehicles(response.data || [])
    } catch (error) {
      console.error('Error loading vehicles:', error)
      toast.error('Fehler beim Laden der Fahrzeuge')
    }
  }

  /**
   * Load available drivers
   */
  const loadDrivers = async () => {
    try {
      // This would need to be implemented in the backend
      // For now, using a placeholder
      setDrivers([
        { id: 1, attributes: { vorname: 'Max', nachname: 'Mustermann' } },
        { id: 2, attributes: { vorname: 'Anna', nachname: 'Schmidt' } },
        { id: 3, attributes: { vorname: 'Peter', nachname: 'Müller' } }
      ])
    } catch (error) {
      console.error('Error loading drivers:', error)
      toast.error('Fehler beim Laden der Fahrer')
    }
  }

  /**
   * Load specific vehicle details
   */
  const loadVehicleDetails = async (id) => {
    try {
      const response = await api.fuhrpark.getVehicle(id, ['modell'])
      setSelectedVehicle(response.data)
    } catch (error) {
      console.error('Error loading vehicle details:', error)
      toast.error('Fehler beim Laden der Fahrzeugdetails')
    }
  }

  /**
   * Check for reservation conflicts
   */
  const checkReservationConflicts = async (formData) => {
    try {
      setCheckingConflicts(true)

      const startDateTime = new Date(`${formData.startdatum}T${formData.startzeit}`)
      const endDateTime = new Date(`${formData.enddatum}T${formData.endzeit}`)

      // Get existing trips for the vehicle in the time range
      const response = await api.fuhrpark.getVehicleTrips(formData.fahrzeug, {
        filters: {
          $or: [
            {
              startzeit: { $lte: endDateTime.toISOString() },
              endzeit: { $gte: startDateTime.toISOString() }
            }
          ]
        }
      })

      const existingTrips = response.data || []
      setConflicts(existingTrips)

      if (existingTrips.length > 0) {
        toast.warning(`${existingTrips.length} Konflikt(e) gefunden`)
      }

    } catch (error) {
      console.error('Error checking conflicts:', error)
      // Don't show error toast for conflict checking as it's automatic
    } finally {
      setCheckingConflicts(false)
    }
  }

  /**
   * Check vehicle availability for time range
   */
  const checkAvailability = async () => {
    const formData = form.getValues()

    if (!formData.startdatum || !formData.enddatum) {
      toast.error('Bitte geben Sie Start- und Enddatum an')
      return
    }

    try {
      setLoading(true)

      const response = await api.fuhrpark.getAvailableVehicles(
        formData.startdatum,
        formData.enddatum
      )

      setAvailabilityResults(response.data || [])
      toast.success(`${response.data?.length || 0} verfügbare Fahrzeuge gefunden`)

    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error('Fehler bei der Verfügbarkeitsprüfung')
    } finally {
      setLoading(false)
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

      // Check for conflicts one final time
      await checkReservationConflicts(data)

      if (conflicts.length > 0) {
        toast.error('Reservierung kann nicht erstellt werden - Konflikte vorhanden')
        return
      }

      // Prepare trip data for API
      const tripData = {
        fahrzeug: parseInt(data.fahrzeug),
        fahrer: data.fahrer ? parseInt(data.fahrer) : null,
        startzeit: new Date(`${data.startdatum}T${data.startzeit}`).toISOString(),
        endzeit: new Date(`${data.enddatum}T${data.endzeit}`).toISOString(),
        zweck: data.zweck,
        startort: data.startort,
        zielort: data.zielort,
        notizen: data.notizen,
        status: 'geplant' // Mark as planned reservation
      }

      await api.fuhrpark.createTrip(tripData)
      toast.success('Reservierung erfolgreich erstellt')
      navigate('/fuhrpark/vehicle-overview')

    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('Fehler beim Erstellen der Reservierung')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    navigate('/fuhrpark/vehicle-overview')
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  /**
   * Get vehicle display name
   */
  const getVehicleDisplayName = (vehicle) => {
    const attrs = vehicle.attributes || vehicle
    return `${attrs.kennzeichen} - ${attrs.hersteller} ${attrs.modell?.data?.attributes?.name || ''}`
  }

  /**
   * Get driver display name
   */
  const getDriverDisplayName = (driver) => {
    const attrs = driver.attributes || driver
    return `${attrs.vorname} ${attrs.nachname}`
  }

  /**
   * Get vehicle type icon
   */
  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case 'traktor': return <Truck className="h-4 w-4" />
      case 'lkw': return <Truck className="h-4 w-4" />
      case 'pkw': return <Car className="h-4 w-4" />
      case 'anhänger': return <Truck className="h-4 w-4" />
      default: return <Car className="h-4 w-4" />
    }
  }

  /**
   * Format date for display
   */
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Unbekannt'
    return new Date(dateTimeString).toLocaleString('de-DE')
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-3xl font-bold">Fahrzeug reservieren</h1>
            <p className="text-muted-foreground">
              Erstellen Sie eine neue Fahrzeugreservierung mit automatischer Konfliktprüfung
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={checkAvailability} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Verfügbarkeit prüfen
        </Button>
      </div>

      {/* Selected Vehicle Info */}
      {selectedVehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getVehicleTypeIcon(selectedVehicle.attributes?.typ)}
              Ausgewähltes Fahrzeug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <div className="font-medium">
                  {getVehicleDisplayName(selectedVehicle)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedVehicle.attributes?.typ} • {selectedVehicle.attributes?.status}
                </div>
              </div>
              <Badge variant="secondary">
                {selectedVehicle.attributes?.standort || 'Unbekannter Standort'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflict Alert */}
      {conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Reservierungskonflikt erkannt!</AlertTitle>
          <AlertDescription>
            Das ausgewählte Fahrzeug ist bereits für {conflicts.length} Zeitraum(e) reserviert.
            Bitte wählen Sie einen anderen Zeitraum oder ein anderes Fahrzeug.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservation Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Vehicle Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Fahrzeugauswahl
                  </CardTitle>
                  <CardDescription>
                    Wählen Sie das zu reservierende Fahrzeug
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fahrzeug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fahrzeug *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Fahrzeug auswählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicles
                              .filter(v => !vehicleFilter ||
                                getVehicleDisplayName(v).toLowerCase().includes(vehicleFilter.toLowerCase())
                              )
                              .map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    {getVehicleTypeIcon(vehicle.attributes?.typ)}
                                    {getVehicleDisplayName(vehicle)}
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
                    name="fahrer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fahrer (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Fahrer auswählen (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {drivers.map((driver) => (
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
                          Wählen Sie einen Fahrer oder lassen Sie das Feld leer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Time Period */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Zeitraum
                    {checkingConflicts && (
                      <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Definieren Sie den Reservierungszeitraum
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startdatum"
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
                      name="enddatum"
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
                      name="startzeit"
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

                    <FormField
                      control={form.control}
                      name="endzeit"
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
                </CardContent>
              </Card>

              {/* Purpose and Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Verwendungsdetails
                  </CardTitle>
                  <CardDescription>
                    Beschreiben Sie den Zweck der Reservierung
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="zweck"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verwendungszweck *</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Feldarbeit, Transport, Wartung" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Startort</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. Haupthof, Werkstatt" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zielort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zielort</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. Feld 3, Markt" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notizen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zusätzliche Notizen</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Besondere Hinweise oder Anforderungen..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={loading || conflicts.length > 0 || checkingConflicts}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Erstelle...' : 'Reservierung erstellen'}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Conflict Details */}
          {conflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Konflikte ({conflicts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-destructive/5">
                      <div className="text-sm font-medium">
                        {formatDateTime(conflict.attributes?.startzeit)} - {formatDateTime(conflict.attributes?.endzeit)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conflict.attributes?.zweck || 'Unbekannter Zweck'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Vehicles (if checked) */}
          {availabilityResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Verfügbare Fahrzeuge ({availabilityResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availabilityResults.slice(0, 5).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center gap-2 text-sm">
                      {getVehicleTypeIcon(vehicle.attributes?.typ)}
                      <span>{getVehicleDisplayName(vehicle)}</span>
                    </div>
                  ))}
                  {availabilityResults.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      +{availabilityResults.length - 5} weitere...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Reservierungs-Hinweise
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>• Konflikte werden automatisch erkannt</div>
              <div>• Reservierungen können nicht überlappend sein</div>
              <div>• Fahrzeuge müssen verfügbar sein</div>
              <div>• Endzeit muss nach Startzeit liegen</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}