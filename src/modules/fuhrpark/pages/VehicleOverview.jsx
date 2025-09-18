/**
 * VEHICLE DASHBOARD PAGE
 *
 * Fleet management dashboard with vehicle status overview (FM-01, FM-02)
 * Als Fuhrparkverwalter möchte ich eine Übersicht über alle Fahrzeuge sehen
 * Als Fuhrparkverwalter möchte ich den Status von Fahrzeugbuchungen einsehen
 *
 * Features:
 * - Real-time vehicle status dashboard
 * - Vehicle filtering and search
 * - TÜV expiration warnings
 * - Quick status overview cards
 * - Responsive vehicle table
 *
 * @author BEPWI Development Team
 * @version 2.0 (Shadcn Migration)
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  BookOpen,
  Fuel
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
import { Badge } from '../../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Checkbox } from '../../../components/ui/checkbox'
import { Label } from '../../../components/ui/label'
import { Separator } from '../../../components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// COMPONENT
// =================================================================

export default function VehicleOverview() {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState([])
  const [dashboardData, setDashboardData] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    inUseVehicles: 0,
    maintenanceVehicles: 0,
    upcomingTuvCount: 0
  })

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showExpiringOnly, setShowExpiringOnly] = useState(false)

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load dashboard data and vehicles on mount
   */
  useEffect(() => {
    loadDashboardData()
    loadVehicles()
  }, [])

  /**
   * Reload vehicles when filters change
   */
  useEffect(() => {
    loadVehicles()
  }, [statusFilter, typeFilter, searchTerm])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load dashboard overview data
   */
  const loadDashboardData = async () => {
    try {
      const response = await api.fuhrpark.getDashboardData()
      setDashboardData(response)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Fehler beim Laden der Dashboard-Daten')
    }
  }

  /**
   * Load vehicles with current filters
   */
  const loadVehicles = async () => {
    try {
      setLoading(true)

      const options = {
        populate: ['modell', 'fuehrerschein'],
        sort: 'kennzeichen:asc'
      }

      // Add filters
      const filters = {}

      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }

      if (typeFilter !== 'all') {
        filters.typ = typeFilter
      }

      if (searchTerm) {
        filters['$or'] = [
          { kennzeichen: { $containsi: searchTerm } },
          { hersteller: { $containsi: searchTerm } },
          { typ: { $containsi: searchTerm } }
        ]
      }

      if (Object.keys(filters).length > 0) {
        options.filters = filters
      }

      const response = await api.fuhrpark.getVehicles(options)
      let vehicleData = response.data || []

      // Apply TÜV expiration filter on frontend
      if (showExpiringOnly) {
        vehicleData = vehicleData.filter(vehicle => {
          const attrs = vehicle.attributes || vehicle
          return getDaysUntilTuv(attrs.tuev_bis) <= 30
        })
      }

      setVehicles(vehicleData)
    } catch (error) {
      console.error('Error loading vehicles:', error)
      toast.error('Fehler beim Laden der Fahrzeuge')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  /**
   * Calculate days until TÜV expiration
   */
  const getDaysUntilTuv = (tuevDate) => {
    if (!tuevDate) return null
    const today = new Date()
    const tuev = new Date(tuevDate)
    return Math.ceil((tuev - today) / (1000 * 60 * 60 * 24))
  }

  /**
   * Get TÜV badge variant based on days until expiration
   */
  const getTuvBadgeVariant = (tuevDate) => {
    const days = getDaysUntilTuv(tuevDate)
    if (days === null) return 'secondary'
    if (days < 0) return 'destructive' // Expired
    if (days <= 30) return 'outline' // Warning
    return 'default' // OK
  }

  /**
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'verfügbar': return 'default'
      case 'im_einsatz': return 'secondary'
      case 'wartung': return 'outline'
      case 'defekt': return 'destructive'
      default: return 'secondary'
    }
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
   * Format date to German locale
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Unbekannt'
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  /**
   * Get vehicle display name with fallback
   */
  const getVehicleDisplayName = (vehicle) => {
    const attrs = vehicle.attributes || vehicle
    return attrs.bezeichnung || `${attrs.hersteller || 'Unbekannt'} ${attrs.modell?.data?.attributes?.name || ''}`
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
   * Handle filter changes
   */
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
  }

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value)
  }

  /**
   * Handle TÜV expiration filter toggle
   */
  const handleExpiringToggle = (checked) => {
    setShowExpiringOnly(checked)
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fahrzeugübersicht</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Fahrzeugflotte und überwachen Sie den Status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/fuhrpark/trip-management')}>
            <BookOpen className="h-4 w-4 mr-2" />
            Fahrtenbuch
          </Button>
          <Button variant="outline" onClick={() => navigate('/fuhrpark/fuel-management')}>
            <Fuel className="h-4 w-4 mr-2" />
            Kraftstoff
          </Button>
          <Button variant="outline" onClick={() => navigate('/fuhrpark/maintenance-management')}>
            <Wrench className="h-4 w-4 mr-2" />
            Wartung
          </Button>
          <Button variant="outline" onClick={() => navigate('/fuhrpark/reserve-vehicle')}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Reservierung erstellen
          </Button>
          <Button onClick={() => navigate('/fuhrpark/add-vehicle')}>
            <Plus className="h-4 w-4 mr-2" />
            Fahrzeug hinzufügen
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Fahrzeuge insgesamt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verfügbar</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.availableVehicles}</div>
            <p className="text-xs text-muted-foreground">Einsatzbereit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Im Einsatz</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.inUseVehicles}</div>
            <p className="text-xs text-muted-foreground">Derzeit unterwegs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wartung</CardTitle>
            <Wrench className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{dashboardData.maintenanceVehicles}</div>
            <p className="text-xs text-muted-foreground">In der Werkstatt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TÜV bald fällig</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.upcomingTuvCount}</div>
            <p className="text-xs text-muted-foreground">Nächste 30 Tage</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter und Suche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Fahrzeug suchen (Kennzeichen, Hersteller, Typ...)"
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter">Status:</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger id="status-filter" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="verfügbar">Verfügbar</SelectItem>
                  <SelectItem value="im_einsatz">Im Einsatz</SelectItem>
                  <SelectItem value="wartung">Wartung</SelectItem>
                  <SelectItem value="defekt">Defekt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="type-filter">Typ:</Label>
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger id="type-filter" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="traktor">Traktor</SelectItem>
                  <SelectItem value="lkw">LKW</SelectItem>
                  <SelectItem value="pkw">PKW</SelectItem>
                  <SelectItem value="anhänger">Anhänger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* TÜV Expiration Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expiring-filter"
                checked={showExpiringOnly}
                onCheckedChange={handleExpiringToggle}
              />
              <Label htmlFor="expiring-filter" className="text-sm">
                Nur TÜV bald fällig (≤30 Tage)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Fahrzeuge ({vehicles.length})
            {loading && <span className="text-sm font-normal text-muted-foreground ml-2">Laden...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Lade Fahrzeuge...</div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Fahrzeuge gefunden
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fahrzeug</TableHead>
                    <TableHead>Kennzeichen</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>TÜV bis</TableHead>
                    <TableHead>Kilometerstand</TableHead>
                    <TableHead>Führerschein</TableHead>
                    <TableHead>Standort</TableHead>
                    <TableHead className="w-[100px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => {
                    const attrs = vehicle.attributes || vehicle
                    const tuevDays = getDaysUntilTuv(attrs.tuev_bis)

                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getVehicleTypeIcon(attrs.typ)}
                            <div>
                              <div className="font-medium">
                                {getVehicleDisplayName(vehicle)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {attrs.hersteller}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{attrs.kennzeichen || 'Unbekannt'}</TableCell>
                        <TableCell className="capitalize">{attrs.typ || 'Unbekannt'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(attrs.status)}>
                            {attrs.status || 'Unbekannt'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={getTuvBadgeVariant(attrs.tuev_bis)}>
                              {formatDate(attrs.tuev_bis)}
                            </Badge>
                            {tuevDays !== null && tuevDays <= 30 && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {attrs.kilometerstand ? `${attrs.kilometerstand.toLocaleString('de-DE')} km` : 'Unbekannt'}
                        </TableCell>
                        <TableCell>
                          {attrs.fuehrerschein?.data?.attributes?.bezeichnung || 'Unbekannt'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {attrs.standort || 'Unbekannt'}
                          </div>
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
                                onClick={() => navigate(`/fuhrpark/reserve-vehicle/${vehicle.id}`)}
                              >
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                Reservieren
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/fuhrpark/edit-vehicle/${vehicle.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </DropdownMenuItem>
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
    </div>
  )
}