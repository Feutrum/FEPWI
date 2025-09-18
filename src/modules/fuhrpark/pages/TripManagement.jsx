/**
 * TRIP MANAGEMENT & FAHRTENBUCH SYSTEM
 *
 * Comprehensive trip logging and fahrtenbuch management (FM-08, FM-09)
 * Als Fahrer möchte ich Fahrten protokollieren können
 * Als Fuhrparkverwalter möchte ich Fahrtenbücher einsehen und exportieren können
 *
 * Features:
 * - Trip logging for drivers with start/end functionality
 * - Comprehensive fahrtenbuch overview for administrators
 * - Trip filtering and search capabilities
 * - Export functionality for reporting
 * - Real-time trip status management
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
  Play,
  Square,
  Clock,
  MapPin,
  User,
  Car,
  Truck,
  Calendar,
  Filter,
  Search,
  Download,
  FileText,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  Route,
  Fuel,
  Timer,
  CheckCircle,
  AlertCircle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'
import { Label } from '../../../components/ui/label'
import { Checkbox } from '../../../components/ui/checkbox'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// VALIDATION SCHEMAS
// =================================================================

const startTripSchema = z.object({
  fahrzeug: z.string().min(1, 'Fahrzeug ist erforderlich'),
  fahrer: z.string().min(1, 'Fahrer ist erforderlich'),
  zweck: z.string().min(1, 'Fahrtenzweck ist erforderlich'),
  startort: z.string().optional(),
  zielort: z.string().optional(),
  start_km: z.number().min(0, 'Kilometerstand kann nicht negativ sein'),
  notizen: z.string().optional()
})

const endTripSchema = z.object({
  end_km: z.number().min(0, 'End-Kilometerstand kann nicht negativ sein'),
  zielort: z.string().optional(),
  notizen: z.string().optional()
}).refine(
  (data, ctx) => {
    const startKm = ctx.parent?.start_km || 0
    return data.end_km >= startKm
  },
  {
    message: 'End-Kilometerstand muss größer oder gleich Start-Kilometerstand sein',
    path: ['end_km']
  }
)

// =================================================================
// COMPONENT
// =================================================================

export default function TripManagement() {
  // =================================================================
  // SETUP & STATE
  // =================================================================

  const navigate = useNavigate()
  const { vehicleId, tripId } = useParams()

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [trips, setTrips] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [activeTrips, setActiveTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  })

  // Dialog States
  const [startTripDialogOpen, setStartTripDialogOpen] = useState(false)
  const [endTripDialogOpen, setEndTripDialogOpen] = useState(false)
  const [viewTripDialogOpen, setViewTripDialogOpen] = useState(false)

  // =================================================================
  // FORM SETUP
  // =================================================================

  const startTripForm = useForm({
    resolver: zodResolver(startTripSchema),
    defaultValues: {
      fahrzeug: vehicleId || '',
      fahrer: '',
      zweck: '',
      startort: '',
      zielort: '',
      start_km: 0,
      notizen: ''
    }
  })

  const endTripForm = useForm({
    resolver: zodResolver(endTripSchema),
    defaultValues: {
      end_km: 0,
      zielort: '',
      notizen: ''
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadTrips()
    loadVehicles()
    loadDrivers()
    loadActiveTrips()
  }, [])

  /**
   * Reload trips when filters change
   */
  useEffect(() => {
    loadTrips()
  }, [vehicleFilter, statusFilter, dateFilter, searchTerm])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load trips with current filters
   */
  const loadTrips = async () => {
    try {
      setLoading(true)

      const options = {
        populate: ['fahrzeug', 'fahrer'],
        sort: 'startzeit:desc'
      }

      // Add filters
      const filters = {}

      if (vehicleFilter) {
        filters.fahrzeug = vehicleFilter
      }

      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }

      if (dateFilter.from) {
        filters['startzeit[$gte]'] = new Date(dateFilter.from).toISOString()
      }

      if (dateFilter.to) {
        filters['startzeit[$lte]'] = new Date(dateFilter.to + 'T23:59:59').toISOString()
      }

      if (searchTerm) {
        filters['$or'] = [
          { zweck: { $containsi: searchTerm } },
          { startort: { $containsi: searchTerm } },
          { zielort: { $containsi: searchTerm } }
        ]
      }

      if (Object.keys(filters).length > 0) {
        options.filters = filters
      }

      const response = await api.fuhrpark.getTrips(options)
      setTrips(response.data || [])
    } catch (error) {
      console.error('Error loading trips:', error)
      toast.error('Fehler beim Laden der Fahrten')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load vehicles for selection
   */
  const loadVehicles = async () => {
    try {
      const response = await api.fuhrpark.getVehicles({
        populate: ['modell'],
        sort: 'kennzeichen:asc'
      })
      setVehicles(response.data || [])
    } catch (error) {
      console.error('Error loading vehicles:', error)
    }
  }

  /**
   * Load drivers for selection
   */
  const loadDrivers = async () => {
    try {
      // This would need to be implemented in the backend
      // For now, using placeholder data
      setDrivers([
        { id: 1, attributes: { vorname: 'Max', nachname: 'Mustermann' } },
        { id: 2, attributes: { vorname: 'Anna', nachname: 'Schmidt' } },
        { id: 3, attributes: { vorname: 'Peter', nachname: 'Müller' } },
        { id: 4, attributes: { vorname: 'Lisa', nachname: 'Weber' } }
      ])
    } catch (error) {
      console.error('Error loading drivers:', error)
    }
  }

  /**
   * Load currently active trips
   */
  const loadActiveTrips = async () => {
    try {
      const response = await api.fuhrpark.getTrips({
        populate: ['fahrzeug', 'fahrer'],
        filters: { status: 'aktiv' },
        sort: 'startzeit:desc'
      })
      setActiveTrips(response.data || [])
    } catch (error) {
      console.error('Error loading active trips:', error)
    }
  }

  // =================================================================
  // TRIP OPERATIONS
  // =================================================================

  /**
   * Start a new trip
   */
  const handleStartTrip = async (data) => {
    try {
      setLoading(true)

      const tripData = {
        fahrzeug: parseInt(data.fahrzeug),
        fahrer: parseInt(data.fahrer),
        zweck: data.zweck,
        startort: data.startort,
        zielort: data.zielort,
        start_km: data.start_km,
        notizen: data.notizen,
        startzeit: new Date().toISOString(),
        status: 'aktiv'
      }

      await api.fuhrpark.createTrip(tripData)
      toast.success('Fahrt erfolgreich gestartet')

      // Reload data
      loadTrips()
      loadActiveTrips()

      // Reset form and close dialog
      startTripForm.reset()
      setStartTripDialogOpen(false)

    } catch (error) {
      console.error('Error starting trip:', error)
      toast.error('Fehler beim Starten der Fahrt')
    } finally {
      setLoading(false)
    }
  }

  /**
   * End an active trip
   */
  const handleEndTrip = async (tripId, data) => {
    try {
      setLoading(true)

      const endData = {
        endzeit: new Date().toISOString(),
        end_km: data.end_km,
        zielort: data.zielort || selectedTrip?.attributes?.zielort,
        notizen: data.notizen ?
          `${selectedTrip?.attributes?.notizen || ''}\n\nBeendet: ${data.notizen}`.trim() :
          selectedTrip?.attributes?.notizen,
        status: 'beendet'
      }

      await api.fuhrpark.endTrip(tripId, endData)
      toast.success('Fahrt erfolgreich beendet')

      // Reload data
      loadTrips()
      loadActiveTrips()

      // Reset form and close dialog
      endTripForm.reset()
      setEndTripDialogOpen(false)
      setSelectedTrip(null)

    } catch (error) {
      console.error('Error ending trip:', error)
      toast.error('Fehler beim Beenden der Fahrt')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Export fahrtenbuch data
   */
  const handleExportFahrtenbuch = async () => {
    try {
      setLoading(true)

      // Get all trips for export
      const response = await api.fuhrpark.getTrips({
        populate: ['fahrzeug', 'fahrer'],
        sort: 'startzeit:desc',
        pagination: { pageSize: 10000 } // Get all data
      })

      const exportData = response.data?.map(trip => {
        const attrs = trip.attributes
        return {
          'Fahrzeug': attrs.fahrzeug?.data?.attributes?.kennzeichen || 'Unbekannt',
          'Fahrer': `${attrs.fahrer?.data?.attributes?.vorname || ''} ${attrs.fahrer?.data?.attributes?.nachname || ''}`.trim() || 'Unbekannt',
          'Startzeit': formatDateTime(attrs.startzeit),
          'Endzeit': formatDateTime(attrs.endzeit) || 'Läuft noch',
          'Start-KM': attrs.start_km || 0,
          'End-KM': attrs.end_km || 'Läuft noch',
          'Distanz': attrs.start_km && attrs.end_km ? (attrs.end_km - attrs.start_km) : 'Läuft noch',
          'Startort': attrs.startort || '',
          'Zielort': attrs.zielort || '',
          'Zweck': attrs.zweck || '',
          'Status': attrs.status || '',
          'Notizen': attrs.notizen || ''
        }
      })

      // Convert to CSV
      const csvContent = convertToCSV(exportData)
      downloadCSV(csvContent, `fahrtenbuch_${new Date().toISOString().split('T')[0]}.csv`)

      toast.success('Fahrtenbuch erfolgreich exportiert')

    } catch (error) {
      console.error('Error exporting fahrtenbuch:', error)
      toast.error('Fehler beim Exportieren des Fahrtenbuchs')
    } finally {
      setLoading(false)
    }
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  /**
   * Get vehicle display name
   */
  const getVehicleDisplayName = (vehicle) => {
    if (!vehicle) return 'Unbekannt'
    const attrs = vehicle.attributes || vehicle
    return `${attrs.kennzeichen} - ${attrs.hersteller || 'Unbekannt'}`
  }

  /**
   * Get driver display name
   */
  const getDriverDisplayName = (driver) => {
    if (!driver) return 'Unbekannt'
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
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'aktiv': return 'default'
      case 'beendet': return 'secondary'
      case 'geplant': return 'outline'
      case 'storniert': return 'destructive'
      default: return 'secondary'
    }
  }

  /**
   * Format date and time
   */
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return null
    return new Date(dateTimeString).toLocaleString('de-DE')
  }

  /**
   * Format date only
   */
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return null
    return new Date(dateTimeString).toLocaleDateString('de-DE')
  }

  /**
   * Calculate trip duration
   */
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return null
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end - start
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  /**
   * Calculate distance
   */
  const calculateDistance = (startKm, endKm) => {
    if (!startKm || !endKm) return null
    return endKm - startKm
  }

  /**
   * Convert data to CSV
   */
  const convertToCSV = (data) => {
    if (!data.length) return ''

    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')

    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )

    return [csvHeaders, ...csvRows].join('\n')
  }

  /**
   * Download CSV file
   */
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // =================================================================
  // EVENT HANDLERS
  // =================================================================

  /**
   * Handle search input
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  /**
   * Handle vehicle filter change
   */
  const handleVehicleFilterChange = (value) => {
    setVehicleFilter(value === 'all' ? '' : value)
  }

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
  }

  /**
   * Handle date filter change
   */
  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({ ...prev, [field]: value }))
  }

  /**
   * Open end trip dialog
   */
  const openEndTripDialog = (trip) => {
    setSelectedTrip(trip)
    const attrs = trip.attributes
    endTripForm.reset({
      end_km: attrs.start_km || 0,
      zielort: attrs.zielort || '',
      notizen: ''
    })
    setEndTripDialogOpen(true)
  }

  /**
   * Open view trip dialog
   */
  const openViewTripDialog = (trip) => {
    setSelectedTrip(trip)
    setViewTripDialogOpen(true)
  }

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    navigate('/fuhrpark/vehicle-overview')
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
            <h1 className="text-3xl font-bold">Fahrtenverwaltung</h1>
            <p className="text-muted-foreground">
              Fahrten protokollieren und Fahrtenbücher verwalten
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportFahrtenbuch} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Fahrtenbuch exportieren
          </Button>
          <Dialog open={startTripDialogOpen} onOpenChange={setStartTripDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Fahrt starten
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Neue Fahrt starten</DialogTitle>
                <DialogDescription>
                  Protokollieren Sie den Beginn einer neuen Fahrt
                </DialogDescription>
              </DialogHeader>
              <Form {...startTripForm}>
                <form onSubmit={startTripForm.handleSubmit(handleStartTrip)} className="space-y-4">
                  <FormField
                    control={startTripForm.control}
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
                            {vehicles.map((vehicle) => (
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
                    control={startTripForm.control}
                    name="fahrer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fahrer *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Fahrer auswählen" />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={startTripForm.control}
                    name="zweck"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fahrtenzweck *</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Feldarbeit, Transport" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={startTripForm.control}
                      name="startort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Startort</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. Haupthof" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={startTripForm.control}
                      name="zielort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zielort</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. Feld 3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={startTripForm.control}
                    name="start_km"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start-Kilometerstand *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={startTripForm.control}
                    name="notizen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notizen</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Zusätzliche Informationen..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStartTripDialogOpen(false)}
                      className="flex-1"
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Fahrt starten
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Trips Alert */}
      {activeTrips.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Timer className="h-5 w-5" />
              Aktive Fahrten ({activeTrips.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    {getVehicleTypeIcon(trip.attributes?.fahrzeug?.data?.attributes?.typ)}
                    <div>
                      <div className="font-medium">
                        {getVehicleDisplayName(trip.attributes?.fahrzeug?.data)} - {getDriverDisplayName(trip.attributes?.fahrer?.data)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trip.attributes?.zweck} • Gestartet: {formatDateTime(trip.attributes?.startzeit)}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openEndTripDialog(trip)}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Beenden
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Fahrtenbuch</TabsTrigger>
          <TabsTrigger value="statistics">Statistiken</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter und Suche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Fahrt suchen (Zweck, Start-/Zielort...)"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="max-w-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="vehicle-filter">Fahrzeug:</Label>
                  <Select value={vehicleFilter || 'all'} onValueChange={handleVehicleFilterChange}>
                    <SelectTrigger id="vehicle-filter" className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Fahrzeuge</SelectItem>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {getVehicleDisplayName(vehicle)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="status-filter">Status:</Label>
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger id="status-filter" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Status</SelectItem>
                      <SelectItem value="aktiv">Aktiv</SelectItem>
                      <SelectItem value="beendet">Beendet</SelectItem>
                      <SelectItem value="geplant">Geplant</SelectItem>
                      <SelectItem value="storniert">Storniert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Zeitraum:</Label>
                  <Input
                    type="date"
                    value={dateFilter.from}
                    onChange={(e) => handleDateFilterChange('from', e.target.value)}
                    className="w-40"
                  />
                  <span className="text-muted-foreground">bis</span>
                  <Input
                    type="date"
                    value={dateFilter.to}
                    onChange={(e) => handleDateFilterChange('to', e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trips Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Fahrten ({trips.length})
                {loading && <span className="text-sm font-normal text-muted-foreground ml-2">Laden...</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-muted-foreground">Lade Fahrten...</div>
                </div>
              ) : trips.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Fahrten gefunden
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fahrzeug</TableHead>
                        <TableHead>Fahrer</TableHead>
                        <TableHead>Zeitraum</TableHead>
                        <TableHead>Strecke</TableHead>
                        <TableHead>Zweck</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trips.map((trip) => {
                        const attrs = trip.attributes
                        const distance = calculateDistance(attrs.start_km, attrs.end_km)
                        const duration = calculateDuration(attrs.startzeit, attrs.endzeit)

                        return (
                          <TableRow key={trip.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getVehicleTypeIcon(attrs.fahrzeug?.data?.attributes?.typ)}
                                <div>
                                  <div className="font-medium">
                                    {getVehicleDisplayName(attrs.fahrzeug?.data)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {attrs.fahrzeug?.data?.attributes?.typ}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {getDriverDisplayName(attrs.fahrer?.data)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-sm">
                                  {formatDateTime(attrs.startzeit)}
                                </div>
                                {attrs.endzeit && (
                                  <div className="text-sm text-muted-foreground">
                                    bis {formatDateTime(attrs.endzeit)}
                                  </div>
                                )}
                                {duration && (
                                  <div className="text-xs text-muted-foreground">
                                    Dauer: {duration}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-sm">
                                  {attrs.start_km} - {attrs.end_km || '?'} km
                                </div>
                                {distance && (
                                  <div className="text-sm font-medium">
                                    {distance} km
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{attrs.zweck}</div>
                                {(attrs.startort || attrs.zielort) && (
                                  <div className="text-sm text-muted-foreground">
                                    {attrs.startort} → {attrs.zielort}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(attrs.status)}>
                                {attrs.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Aktionen öffnen</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => openViewTripDialog(trip)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Details anzeigen
                                  </DropdownMenuItem>
                                  {attrs.status === 'aktiv' && (
                                    <DropdownMenuItem
                                      onClick={() => openEndTripDialog(trip)}
                                    >
                                      <Square className="mr-2 h-4 w-4" />
                                      Fahrt beenden
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fahrtstatistiken</CardTitle>
              <CardDescription>
                Übersicht über Fahrtaktivitäten und Kennzahlen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Statistiken werden in einer zukünftigen Version implementiert
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* End Trip Dialog */}
      <Dialog open={endTripDialogOpen} onOpenChange={setEndTripDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fahrt beenden</DialogTitle>
            <DialogDescription>
              Vervollständigen Sie die Fahrtdaten zum Abschluss
            </DialogDescription>
          </DialogHeader>
          {selectedTrip && (
            <div className="mb-4 p-3 bg-muted rounded">
              <div className="font-medium">
                {getVehicleDisplayName(selectedTrip.attributes?.fahrzeug?.data)}
              </div>
              <div className="text-sm text-muted-foreground">
                Gestartet: {formatDateTime(selectedTrip.attributes?.startzeit)}
              </div>
            </div>
          )}
          <Form {...endTripForm}>
            <form onSubmit={endTripForm.handleSubmit((data) => handleEndTrip(selectedTrip?.id, data))} className="space-y-4">
              <FormField
                control={endTripForm.control}
                name="end_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End-Kilometerstand *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={selectedTrip?.attributes?.start_km || 0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Mindestens: {selectedTrip?.attributes?.start_km || 0} km
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={endTripForm.control}
                name="zielort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endgültiger Zielort</FormLabel>
                    <FormControl>
                      <Input placeholder="Falls abweichend vom geplanten Ziel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={endTripForm.control}
                name="notizen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abschlussnotizen</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Besonderheiten, Probleme, etc..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEndTripDialogOpen(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  <Square className="h-4 w-4 mr-2" />
                  Fahrt beenden
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Trip Dialog */}
      <Dialog open={viewTripDialogOpen} onOpenChange={setViewTripDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fahrtdetails</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zur Fahrt
            </DialogDescription>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fahrzeug</Label>
                  <div className="flex items-center gap-2">
                    {getVehicleTypeIcon(selectedTrip.attributes?.fahrzeug?.data?.attributes?.typ)}
                    {getVehicleDisplayName(selectedTrip.attributes?.fahrzeug?.data)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fahrer</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {getDriverDisplayName(selectedTrip.attributes?.fahrer?.data)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Startzeit</Label>
                  <div>{formatDateTime(selectedTrip.attributes?.startzeit)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Endzeit</Label>
                  <div>{formatDateTime(selectedTrip.attributes?.endzeit) || 'Läuft noch'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start-KM</Label>
                  <div>{selectedTrip.attributes?.start_km || 0} km</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">End-KM</Label>
                  <div>{selectedTrip.attributes?.end_km || 'Läuft noch'} km</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Distanz</Label>
                  <div>
                    {calculateDistance(selectedTrip.attributes?.start_km, selectedTrip.attributes?.end_km) || 'Läuft noch'} km
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dauer</Label>
                  <div>
                    {calculateDuration(selectedTrip.attributes?.startzeit, selectedTrip.attributes?.endzeit) || 'Läuft noch'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Startort</Label>
                  <div>{selectedTrip.attributes?.startort || 'Nicht angegeben'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Zielort</Label>
                  <div>{selectedTrip.attributes?.zielort || 'Nicht angegeben'}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Zweck</Label>
                <div>{selectedTrip.attributes?.zweck}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div>
                  <Badge variant={getStatusBadgeVariant(selectedTrip.attributes?.status)}>
                    {selectedTrip.attributes?.status}
                  </Badge>
                </div>
              </div>
              {selectedTrip.attributes?.notizen && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notizen</Label>
                  <div className="whitespace-pre-wrap">{selectedTrip.attributes.notizen}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}