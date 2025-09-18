/**
 * VEHICLE OVERVIEW MODERN
 *
 * Comprehensive vehicle management dashboard with all operations
 * Handles: vehicle CRUD, reservations, maintenance, fuel tracking
 * Replaces all separate vehicle management pages
 */

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Truck,
  Car,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Search,
  Filter,
  Plus,
  BarChart3,
  MapPin,
  Edit,
  MoreHorizontal,
  CalendarPlus,
  Fuel,
  Settings,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  TrendingUp
} from 'lucide-react'

// Services and Validation
import VehicleService from '../../../services/api/VehicleService'
import { vehicleSearchSchema } from '../schemas/vehicleValidation'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../../components/ui/dropdown-menu'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog'

// Form Modals
import VehicleFormModal from '../components/VehicleFormModal'
import ReservationFormModal from '../components/ReservationFormModal'

// Mock data (replace with actual API calls)
const mockVehicles = [
  {
    id: 1,
    attributes: {
      kennzeichen: 'ABC-123',
      marke: 'Volkswagen',
      modell: 'Golf',
      baujahr: 2020,
      typ: 'car',
      kraftstoffart: 'diesel',
      verbrauch: 5.5,
      tankgroesse: 50,
      laufleistung: 45000,
      tuev_ablauf: '2025-03-15',
      versicherung_ablauf: '2025-12-31',
      status: 'verfuegbar',
      standort: 'Hauptstandort'
    }
  },
  {
    id: 2,
    attributes: {
      kennzeichen: 'DEF-456',
      marke: 'Mercedes',
      modell: 'Sprinter',
      baujahr: 2019,
      typ: 'van',
      kraftstoffart: 'diesel',
      verbrauch: 8.2,
      tankgroesse: 75,
      laufleistung: 78000,
      tuev_ablauf: '2024-11-20',
      versicherung_ablauf: '2025-06-30',
      status: 'reserviert',
      standort: 'Außenstelle Nord'
    }
  }
]

const mockReservations = [
  {
    id: 1,
    attributes: {
      mitarbeiter_name: 'Max Mustermann',
      start_datum: '2024-10-20',
      start_zeit: '08:00',
      end_datum: '2024-10-20',
      end_zeit: '16:00',
      zweck: 'Kundenbesuch',
      status: 'aktiv',
      vehicle: { data: { id: 1 } }
    }
  }
]

export default function VehicleOverviewModern() {
  // State management
  const [vehicles, setVehicles] = useState(mockVehicles)
  const [reservations, setReservations] = useState(mockReservations)
  const [statistics, setStatistics] = useState({
    total_vehicles: 0,
    available_vehicles: 0,
    reserved_vehicles: 0,
    maintenance_vehicles: 0,
    tuv_warnings: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    status: 'alle',
    typ: 'alle',
    tuv_warnung: false
  })

  // Modal states
  const [vehicleFormModal, setVehicleFormModal] = useState({
    open: false,
    data: null,
    loading: false
  })
  const [reservationFormModal, setReservationFormModal] = useState({
    open: false,
    data: null,
    loading: false,
    availabilityCheck: null
  })
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    vehicle: null
  })

  // Selected tab
  const [activeTab, setActiveTab] = useState('vehicles')

  // =================================================================
  // EFFECTS
  // =================================================================

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    calculateStatistics()
  }, [vehicles])

  // =================================================================
  // DATA LOADING
  // =================================================================

  const loadData = async () => {
    try {
      setLoading(true)
      // In real implementation, load from API
      // const [vehiclesResponse, reservationsResponse, statsResponse] = await Promise.all([
      //   VehicleService.getVehicles(),
      //   VehicleService.getReservations(),
      //   VehicleService.getFleetStatistics()
      // ])

      // For now, use mock data
      setVehicles(mockVehicles)
      setReservations(mockReservations)

    } catch (error) {
      console.error('Error loading vehicle data:', error)
      toast.error('Fehler beim Laden der Fahrzeugdaten')
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = () => {
    const stats = {
      total_vehicles: vehicles.length,
      available_vehicles: vehicles.filter(v => v.attributes.status === 'verfuegbar').length,
      reserved_vehicles: vehicles.filter(v => v.attributes.status === 'reserviert').length,
      maintenance_vehicles: vehicles.filter(v => v.attributes.status === 'wartung').length,
      tuv_warnings: vehicles.filter(v => {
        const tuvDate = new Date(v.attributes.tuev_ablauf)
        const warningDate = new Date()
        warningDate.setDate(warningDate.getDate() + 60)
        return tuvDate <= warningDate
      }).length
    }
    setStatistics(stats)
  }

  // =================================================================
  // VEHICLE OPERATIONS
  // =================================================================

  const handleCreateVehicle = async (vehicleData) => {
    try {
      setVehicleFormModal(prev => ({ ...prev, loading: true }))

      // In real implementation:
      // const response = await VehicleService.createVehicle(vehicleData)

      // Mock implementation
      const newVehicle = {
        id: vehicles.length + 1,
        attributes: vehicleData
      }

      setVehicles(prev => [...prev, newVehicle])
      setVehicleFormModal({ open: false, data: null, loading: false })
      toast.success('Fahrzeug erfolgreich erstellt')

    } catch (error) {
      console.error('Error creating vehicle:', error)
      toast.error('Fehler beim Erstellen des Fahrzeugs')
      setVehicleFormModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleUpdateVehicle = async (vehicleData) => {
    try {
      setVehicleFormModal(prev => ({ ...prev, loading: true }))

      // In real implementation:
      // const response = await VehicleService.updateVehicle(vehicleFormModal.data.id, vehicleData)

      // Mock implementation
      setVehicles(prev => prev.map(vehicle =>
        vehicle.id === vehicleFormModal.data.id
          ? { ...vehicle, attributes: vehicleData }
          : vehicle
      ))

      setVehicleFormModal({ open: false, data: null, loading: false })
      toast.success('Fahrzeug erfolgreich aktualisiert')

    } catch (error) {
      console.error('Error updating vehicle:', error)
      toast.error('Fehler beim Aktualisieren des Fahrzeugs')
      setVehicleFormModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleDeleteVehicle = async () => {
    try {
      // In real implementation:
      // await VehicleService.deleteVehicle(deleteDialog.vehicle.id)

      // Mock implementation
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== deleteDialog.vehicle.id))
      setDeleteDialog({ open: false, vehicle: null })
      toast.success('Fahrzeug erfolgreich gelöscht')

    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Fehler beim Löschen des Fahrzeugs')
    }
  }

  // =================================================================
  // RESERVATION OPERATIONS
  // =================================================================

  const handleCreateReservation = async (reservationData) => {
    try {
      setReservationFormModal(prev => ({ ...prev, loading: true }))

      // In real implementation:
      // const response = await VehicleService.createReservation(reservationData)

      // Mock implementation
      const newReservation = {
        id: reservations.length + 1,
        attributes: {
          ...reservationData,
          vehicle: { data: { id: reservationData.vehicle_id } }
        }
      }

      setReservations(prev => [...prev, newReservation])

      // Update vehicle status
      setVehicles(prev => prev.map(vehicle =>
        vehicle.id === reservationData.vehicle_id
          ? { ...vehicle, attributes: { ...vehicle.attributes, status: 'reserviert' } }
          : vehicle
      ))

      setReservationFormModal({ open: false, data: null, loading: false, availabilityCheck: null })
      toast.success('Reservierung erfolgreich erstellt')

    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('Fehler beim Erstellen der Reservierung')
      setReservationFormModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleCheckAvailability = async (vehicleId, startDate, startTime, endDate, endTime) => {
    try {
      // In real implementation:
      // const result = await VehicleService.checkVehicleAvailability(vehicleId, startDate, endDate)

      // Mock implementation
      const hasConflict = reservations.some(reservation => {
        if (reservation.attributes.vehicle.data.id !== vehicleId) return false
        if (reservation.attributes.status !== 'aktiv') return false

        const resStart = new Date(`${reservation.attributes.start_datum}T${reservation.attributes.start_zeit}`)
        const resEnd = new Date(`${reservation.attributes.end_datum}T${reservation.attributes.end_zeit}`)
        const checkStart = new Date(`${startDate}T${startTime}`)
        const checkEnd = new Date(`${endDate}T${endTime}`)

        return !(checkEnd <= resStart || checkStart >= resEnd)
      })

      const result = {
        available: !hasConflict,
        conflicts: hasConflict ? ['Overlapping reservation found'] : []
      }

      setReservationFormModal(prev => ({ ...prev, availabilityCheck: result }))

    } catch (error) {
      console.error('Error checking availability:', error)
    }
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  const getStatusBadge = (status) => {
    const statusConfig = {
      verfuegbar: { label: 'Verfügbar', variant: 'default', icon: CheckCircle },
      reserviert: { label: 'Reserviert', variant: 'secondary', icon: Calendar },
      wartung: { label: 'Wartung', variant: 'destructive', icon: Wrench },
      defekt: { label: 'Defekt', variant: 'destructive', icon: AlertTriangle }
    }

    const config = statusConfig[status] || statusConfig.verfuegbar
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getVehicleIcon = (typ) => {
    const icons = {
      car: Car,
      truck: Truck,
      van: Truck,
      tractor: Truck,
      trailer: Truck
    }
    return icons[typ] || Car
  }

  const isExpiringTuv = (tuvDate) => {
    const tuv = new Date(tuvDate)
    const warning = new Date()
    warning.setDate(warning.getDate() + 60) // 60 days warning
    return tuv <= warning
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const attrs = vehicle.attributes
    const matchesSearch = !searchFilters.search ||
      attrs.kennzeichen.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      attrs.marke.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      attrs.modell.toLowerCase().includes(searchFilters.search.toLowerCase())

    const matchesStatus = searchFilters.status === 'alle' || attrs.status === searchFilters.status
    const matchesType = searchFilters.typ === 'alle' || attrs.typ === searchFilters.typ
    const matchesTuv = !searchFilters.tuv_warnung || isExpiringTuv(attrs.tuev_ablauf)

    return matchesSearch && matchesStatus && matchesType && matchesTuv
  })

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuhrpark Management</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Fahrzeuge, Reservierungen und Wartung zentral
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setVehicleFormModal({ open: true, data: null, loading: false })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Fahrzeug hinzufügen
          </Button>
          <Button
            variant="outline"
            onClick={() => setReservationFormModal({
              open: true,
              data: null,
              loading: false,
              availabilityCheck: null
            })}
            className="gap-2"
          >
            <CalendarPlus className="h-4 w-4" />
            Reservierung
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fahrzeuge gesamt</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_vehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verfügbar</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.available_vehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserviert</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.reserved_vehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wartung</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.maintenance_vehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TÜV Warnungen</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.tuv_warnings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Fahrzeuge</TabsTrigger>
          <TabsTrigger value="reservations">Reservierungen</TabsTrigger>
          <TabsTrigger value="maintenance">Wartung</TabsTrigger>
          <TabsTrigger value="fuel">Kraftstoff</TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Suche & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Kennzeichen, Marke, Modell..."
                  value={searchFilters.search}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, search: e.target.value }))}
                />

                <Select
                  value={searchFilters.status}
                  onValueChange={(value) => setSearchFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Status</SelectItem>
                    <SelectItem value="verfuegbar">Verfügbar</SelectItem>
                    <SelectItem value="reserviert">Reserviert</SelectItem>
                    <SelectItem value="wartung">Wartung</SelectItem>
                    <SelectItem value="defekt">Defekt</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={searchFilters.typ}
                  onValueChange={(value) => setSearchFilters(prev => ({ ...prev, typ: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Typen</SelectItem>
                    <SelectItem value="car">PKW</SelectItem>
                    <SelectItem value="truck">LKW</SelectItem>
                    <SelectItem value="van">Transporter</SelectItem>
                    <SelectItem value="tractor">Traktor</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vehicles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Fahrzeuge ({filteredVehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fahrzeug</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Kraftstoff</TableHead>
                    <TableHead>Laufleistung</TableHead>
                    <TableHead>TÜV</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Standort</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => {
                    const attrs = vehicle.attributes
                    const VehicleIcon = getVehicleIcon(attrs.typ)
                    const tuvExpiring = isExpiringTuv(attrs.tuev_ablauf)

                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <VehicleIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{attrs.kennzeichen}</div>
                              <div className="text-sm text-muted-foreground">
                                {attrs.marke} {attrs.modell} ({attrs.baujahr})
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{attrs.typ}</TableCell>
                        <TableCell className="capitalize">{attrs.kraftstoffart}</TableCell>
                        <TableCell>{attrs.laufleistung?.toLocaleString()} km</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${tuvExpiring ? 'text-red-600' : ''}`}>
                            {tuvExpiring && <AlertCircle className="h-3 w-3" />}
                            {new Date(attrs.tuev_ablauf).toLocaleDateString('de-DE')}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(attrs.status)}</TableCell>
                        <TableCell>{attrs.standort}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => setVehicleFormModal({
                                  open: true,
                                  data: vehicle,
                                  loading: false
                                })}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setReservationFormModal({
                                  open: true,
                                  data: { vehicle_id: vehicle.id },
                                  loading: false,
                                  availabilityCheck: null
                                })}
                              >
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                Reservieren
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteDialog({ open: true, vehicle })}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {filteredVehicles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Fahrzeuge gefunden
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Reservierungen</CardTitle>
              <CardDescription>
                Übersicht aller Fahrzeugreservierungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fahrzeug</TableHead>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Zeitraum</TableHead>
                    <TableHead>Zweck</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => {
                    const attrs = reservation.attributes
                    const vehicle = vehicles.find(v => v.id === attrs.vehicle.data.id)

                    return (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          {vehicle ? `${vehicle.attributes.kennzeichen} - ${vehicle.attributes.marke}` : 'Unbekannt'}
                        </TableCell>
                        <TableCell>{attrs.mitarbeiter_name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(attrs.start_datum).toLocaleDateString('de-DE')} {attrs.start_zeit}</div>
                            <div className="text-muted-foreground">
                              bis {new Date(attrs.end_datum).toLocaleDateString('de-DE')} {attrs.end_zeit}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{attrs.zweck}</TableCell>
                        <TableCell>
                          <Badge variant={attrs.status === 'aktiv' ? 'default' : 'secondary'}>
                            {attrs.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Stornieren
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {reservations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Reservierungen vorhanden
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wartung & TÜV</CardTitle>
              <CardDescription>
                Wartungstermine und TÜV-Überwachung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Wartungsübersicht in Entwicklung
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fuel Tab */}
        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kraftstoffverwaltung</CardTitle>
              <CardDescription>
                Tankungen und Verbrauchsstatistiken
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Kraftstoffverwaltung in Entwicklung
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vehicle Form Modal */}
      <VehicleFormModal
        open={vehicleFormModal.open}
        onClose={() => setVehicleFormModal({ open: false, data: null, loading: false })}
        onSubmit={vehicleFormModal.data ? handleUpdateVehicle : handleCreateVehicle}
        initialData={vehicleFormModal.data?.attributes}
        loading={vehicleFormModal.loading}
      />

      {/* Reservation Form Modal */}
      <ReservationFormModal
        open={reservationFormModal.open}
        onClose={() => setReservationFormModal({
          open: false,
          data: null,
          loading: false,
          availabilityCheck: null
        })}
        onSubmit={handleCreateReservation}
        onCheckAvailability={handleCheckAvailability}
        initialData={reservationFormModal.data}
        vehicles={vehicles}
        loading={reservationFormModal.loading}
        availabilityCheck={reservationFormModal.availabilityCheck}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, vehicle: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fahrzeug löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie das Fahrzeug "{deleteDialog.vehicle?.attributes?.kennzeichen}"
              löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehicle} className="bg-red-600 hover:bg-red-700">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}