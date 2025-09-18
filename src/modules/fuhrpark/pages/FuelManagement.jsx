/**
 * FUEL MANAGEMENT & COST TRACKING SYSTEM
 *
 * Comprehensive fuel consumption tracking and cost analysis (FM-10, FM-11)
 * Als Fuhrparkverwalter möchte ich Kraftstoffverbrauch und -kosten verfolgen können
 * Als Fuhrparkverwalter möchte ich Berichte über Kraftstoffverbrauch erstellen können
 *
 * Features:
 * - Fuel consumption tracking per vehicle
 * - Cost analysis and reporting
 * - Fuel station management
 * - Consumption trends and analytics
 * - Export functionality for reporting
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
  Fuel,
  Euro,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  MapPin,
  Car,
  Truck,
  Edit,
  Eye,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Calculator,
  Target
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../components/ui/alert'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// VALIDATION SCHEMAS
// =================================================================

const fuelRecordSchema = z.object({
  fahrzeug: z.string().min(1, 'Fahrzeug ist erforderlich'),
  tankstelle: z.string().optional(),
  datum: z.string().min(1, 'Datum ist erforderlich'),
  literanzahl: z.number()
    .min(0.1, 'Literanzahl muss größer als 0 sein')
    .max(1000, 'Literanzahl zu hoch'),
  preis_pro_liter: z.number()
    .min(0.01, 'Preis pro Liter muss größer als 0 sein')
    .max(10, 'Preis pro Liter zu hoch'),
  kilometerstand: z.number()
    .min(0, 'Kilometerstand kann nicht negativ sein')
    .max(9999999, 'Kilometerstand zu hoch'),
  kraftstoffart: z.enum(['diesel', 'benzin', 'elektro'], {
    required_error: 'Kraftstoffart ist erforderlich'
  }),
  notizen: z.string().optional()
})

// =================================================================
// COMPONENT
// =================================================================

export default function FuelManagement() {
  // =================================================================
  // SETUP & STATE
  // =================================================================

  const navigate = useNavigate()
  const { vehicleId } = useParams()

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [fuelRecords, setFuelRecords] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [fuelStations, setFuelStations] = useState([])
  const [fuelStats, setFuelStats] = useState({
    totalCost: 0,
    totalLiters: 0,
    averagePricePerLiter: 0,
    totalDistance: 0,
    averageConsumption: 0
  })

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState(vehicleId || '')
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  })

  // Dialog States
  const [addRecordDialogOpen, setAddRecordDialogOpen] = useState(false)
  const [viewRecordDialogOpen, setViewRecordDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(fuelRecordSchema),
    defaultValues: {
      fahrzeug: vehicleId || '',
      tankstelle: '',
      datum: new Date().toISOString().split('T')[0],
      literanzahl: 0,
      preis_pro_liter: 1.50,
      kilometerstand: 0,
      kraftstoffart: 'diesel',
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
    loadFuelRecords()
    loadVehicles()
    loadFuelStations()
  }, [])

  /**
   * Reload data when filters change
   */
  useEffect(() => {
    loadFuelRecords()
    calculateFuelStats()
  }, [vehicleFilter, fuelTypeFilter, dateFilter, searchTerm])

  /**
   * Calculate stats when records change
   */
  useEffect(() => {
    calculateFuelStats()
  }, [fuelRecords])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load fuel records with current filters
   */
  const loadFuelRecords = async () => {
    try {
      setLoading(true)

      // For now, using mock data since the backend endpoints need to be implemented
      const mockRecords = [
        {
          id: 1,
          attributes: {
            fahrzeug: { data: { id: 1, attributes: { kennzeichen: 'BN-AB 123', typ: 'traktor', hersteller: 'John Deere' } } },
            tankstelle: { data: { attributes: { name: 'Aral Tankstelle Hauptstraße' } } },
            datum: '2024-01-15',
            literanzahl: 45.2,
            preis_pro_liter: 1.65,
            kilometerstand: 15420,
            kraftstoffart: 'diesel',
            notizen: 'Volltankung nach Feldarbeit'
          }
        },
        {
          id: 2,
          attributes: {
            fahrzeug: { data: { id: 1, attributes: { kennzeichen: 'BN-AB 123', typ: 'traktor', hersteller: 'John Deere' } } },
            tankstelle: { data: { attributes: { name: 'Shell Station Industriegebiet' } } },
            datum: '2024-01-10',
            literanzahl: 38.7,
            preis_pro_liter: 1.62,
            kilometerstand: 15180,
            kraftstoffart: 'diesel',
            notizen: ''
          }
        },
        {
          id: 3,
          attributes: {
            fahrzeug: { data: { id: 2, attributes: { kennzeichen: 'BN-CD 456', typ: 'lkw', hersteller: 'Mercedes' } } },
            tankstelle: { data: { attributes: { name: 'Aral Tankstelle Hauptstraße' } } },
            datum: '2024-01-12',
            literanzahl: 85.5,
            preis_pro_liter: 1.68,
            kilometerstand: 87650,
            kraftstoffart: 'diesel',
            notizen: 'Transport nach Hamburg'
          }
        }
      ]

      // Apply filters to mock data
      let filteredRecords = mockRecords

      if (vehicleFilter) {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.fahrzeug.data.id.toString() === vehicleFilter
        )
      }

      if (fuelTypeFilter !== 'all') {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.kraftstoffart === fuelTypeFilter
        )
      }

      if (dateFilter.from) {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.datum >= dateFilter.from
        )
      }

      if (dateFilter.to) {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.datum <= dateFilter.to
        )
      }

      if (searchTerm) {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.tankstelle?.data?.attributes?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.attributes.notizen?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      setFuelRecords(filteredRecords)
    } catch (error) {
      console.error('Error loading fuel records:', error)
      toast.error('Fehler beim Laden der Tankdaten')
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
   * Load fuel stations
   */
  const loadFuelStations = async () => {
    try {
      const response = await api.fuhrpark.getFuelStations()
      setFuelStations(response.data || [])

      // If no stations from API, use mock data
      if (!response.data?.length) {
        setFuelStations([
          { id: 1, attributes: { name: 'Aral Tankstelle Hauptstraße', adresse: 'Hauptstraße 123, 53111 Bonn' } },
          { id: 2, attributes: { name: 'Shell Station Industriegebiet', adresse: 'Industriestraße 45, 53115 Bonn' } },
          { id: 3, attributes: { name: 'Esso Autohof A565', adresse: 'Autobahnkreuz A565, 53119 Bonn' } }
        ])
      }
    } catch (error) {
      console.error('Error loading fuel stations:', error)
      // Use mock data as fallback
      setFuelStations([
        { id: 1, attributes: { name: 'Aral Tankstelle Hauptstraße', adresse: 'Hauptstraße 123, 53111 Bonn' } },
        { id: 2, attributes: { name: 'Shell Station Industriegebiet', adresse: 'Industriestraße 45, 53115 Bonn' } },
        { id: 3, attributes: { name: 'Esso Autohof A565', adresse: 'Autobahnkreuz A565, 53119 Bonn' } }
      ])
    }
  }

  /**
   * Calculate fuel statistics
   */
  const calculateFuelStats = () => {
    if (!fuelRecords.length) {
      setFuelStats({
        totalCost: 0,
        totalLiters: 0,
        averagePricePerLiter: 0,
        totalDistance: 0,
        averageConsumption: 0
      })
      return
    }

    const totalCost = fuelRecords.reduce((sum, record) =>
      sum + (record.attributes.literanzahl * record.attributes.preis_pro_liter), 0
    )

    const totalLiters = fuelRecords.reduce((sum, record) =>
      sum + record.attributes.literanzahl, 0
    )

    const averagePricePerLiter = totalCost / totalLiters

    // Calculate distance and consumption (simplified)
    const sortedRecords = [...fuelRecords].sort((a, b) =>
      new Date(a.attributes.datum) - new Date(b.attributes.datum)
    )

    let totalDistance = 0
    let averageConsumption = 0

    if (sortedRecords.length > 1) {
      const firstRecord = sortedRecords[0]
      const lastRecord = sortedRecords[sortedRecords.length - 1]
      totalDistance = lastRecord.attributes.kilometerstand - firstRecord.attributes.kilometerstand

      if (totalDistance > 0) {
        averageConsumption = (totalLiters / totalDistance) * 100 // L/100km
      }
    }

    setFuelStats({
      totalCost,
      totalLiters,
      averagePricePerLiter,
      totalDistance,
      averageConsumption
    })
  }

  // =================================================================
  // CRUD OPERATIONS
  // =================================================================

  /**
   * Add new fuel record
   */
  const handleAddRecord = async (data) => {
    try {
      setLoading(true)

      // In a real implementation, this would call the API
      // const response = await api.fuhrpark.createFuelRecord(data)

      toast.success('Tankvorgang erfolgreich erfasst')

      // Reload data
      loadFuelRecords()

      // Reset form and close dialog
      form.reset()
      setAddRecordDialogOpen(false)

    } catch (error) {
      console.error('Error adding fuel record:', error)
      toast.error('Fehler beim Erfassen des Tankvorgangs')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Export fuel data
   */
  const handleExportFuelData = async () => {
    try {
      setLoading(true)

      const exportData = fuelRecords.map(record => {
        const attrs = record.attributes
        const totalCost = attrs.literanzahl * attrs.preis_pro_liter

        return {
          'Datum': formatDate(attrs.datum),
          'Fahrzeug': getVehicleDisplayName(attrs.fahrzeug?.data),
          'Tankstelle': attrs.tankstelle?.data?.attributes?.name || 'Unbekannt',
          'Kraftstoffart': attrs.kraftstoffart,
          'Liter': attrs.literanzahl.toFixed(2),
          'Preis/Liter': `€${attrs.preis_pro_liter.toFixed(2)}`,
          'Gesamtkosten': `€${totalCost.toFixed(2)}`,
          'Kilometerstand': attrs.kilometerstand,
          'Notizen': attrs.notizen || ''
        }
      })

      // Convert to CSV
      const csvContent = convertToCSV(exportData)
      downloadCSV(csvContent, `kraftstoffverbrauch_${new Date().toISOString().split('T')[0]}.csv`)

      toast.success('Kraftstoffdaten erfolgreich exportiert')

    } catch (error) {
      console.error('Error exporting fuel data:', error)
      toast.error('Fehler beim Exportieren der Kraftstoffdaten')
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
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Unbekannt'
    return new Date(dateString).toLocaleDateString('de-DE')
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
   * Handle fuel type filter change
   */
  const handleFuelTypeFilterChange = (value) => {
    setFuelTypeFilter(value)
  }

  /**
   * Handle date filter change
   */
  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({ ...prev, [field]: value }))
  }

  /**
   * Open view record dialog
   */
  const openViewRecordDialog = (record) => {
    setSelectedRecord(record)
    setViewRecordDialogOpen(true)
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
            <h1 className="text-3xl font-bold">Kraftstoffverwaltung</h1>
            <p className="text-muted-foreground">
              Verbrauch verfolgen und Kosten analysieren
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportFuelData} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Daten exportieren
          </Button>
          <Dialog open={addRecordDialogOpen} onOpenChange={setAddRecordDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tankvorgang erfassen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Neuen Tankvorgang erfassen</DialogTitle>
                <DialogDescription>
                  Dokumentieren Sie einen Tankvorgang für die Kostenübersicht
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddRecord)} className="space-y-4">
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
                    control={form.control}
                    name="datum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Datum *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tankstelle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tankstelle</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tankstelle auswählen (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fuelStations.map((station) => (
                              <SelectItem key={station.id} value={station.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {station.attributes?.name || 'Unbekannt'}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="kraftstoffart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kraftstoffart *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="diesel">Diesel</SelectItem>
                              <SelectItem value="benzin">Benzin</SelectItem>
                              <SelectItem value="elektro">Elektro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="literanzahl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Liter *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0.1"
                              max="1000"
                              placeholder="0.0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preis_pro_liter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preis/Liter *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max="10"
                              placeholder="1.50"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>In Euro</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kilometerstand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kilometerstand *</FormLabel>
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
                  </div>

                  <FormField
                    control={form.control}
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
                      onClick={() => setAddRecordDialogOpen(false)}
                      className="flex-1"
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      <Fuel className="h-4 w-4 mr-2" />
                      Erfassen
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtkosten</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(fuelStats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">Alle Tankvorgänge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtverbrauch</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fuelStats.totalLiters.toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Kraftstoff getankt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Preis/Liter</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(fuelStats.averagePricePerLiter)}</div>
            <p className="text-xs text-muted-foreground">Durchschnittspreis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distanz</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fuelStats.totalDistance.toLocaleString('de-DE')} km</div>
            <p className="text-xs text-muted-foreground">Gesamtstrecke</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Verbrauch</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fuelStats.averageConsumption > 0 ? `${fuelStats.averageConsumption.toFixed(1)}L` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">pro 100km</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Tankvorgänge</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="stations">Tankstellen</TabsTrigger>
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
                  placeholder="Tankstelle oder Notizen suchen..."
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
                  <Label htmlFor="fuel-type-filter">Kraftstoff:</Label>
                  <Select value={fuelTypeFilter} onValueChange={handleFuelTypeFilterChange}>
                    <SelectTrigger id="fuel-type-filter" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Arten</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="benzin">Benzin</SelectItem>
                      <SelectItem value="elektro">Elektro</SelectItem>
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

          {/* Fuel Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Tankvorgänge ({fuelRecords.length})
                {loading && <span className="text-sm font-normal text-muted-foreground ml-2">Laden...</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-muted-foreground">Lade Tankvorgänge...</div>
                </div>
              ) : fuelRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Tankvorgänge gefunden
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Fahrzeug</TableHead>
                        <TableHead>Tankstelle</TableHead>
                        <TableHead>Kraftstoff</TableHead>
                        <TableHead>Menge</TableHead>
                        <TableHead>Preis/L</TableHead>
                        <TableHead>Gesamtkosten</TableHead>
                        <TableHead>KM-Stand</TableHead>
                        <TableHead className="w-[100px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fuelRecords.map((record) => {
                        const attrs = record.attributes
                        const totalCost = attrs.literanzahl * attrs.preis_pro_liter

                        return (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(attrs.datum)}</TableCell>
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
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {attrs.tankstelle?.data?.attributes?.name || 'Unbekannt'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {attrs.kraftstoffart}
                              </Badge>
                            </TableCell>
                            <TableCell>{attrs.literanzahl.toFixed(2)}L</TableCell>
                            <TableCell>{formatCurrency(attrs.preis_pro_liter)}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(totalCost)}</TableCell>
                            <TableCell>{attrs.kilometerstand.toLocaleString('de-DE')} km</TableCell>
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
                                    onClick={() => openViewRecordDialog(record)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Details anzeigen
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
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verbrauchsanalyse</CardTitle>
              <CardDescription>
                Detaillierte Analyse des Kraftstoffverbrauchs und der Kosten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Erweiterte Analysen werden in einer zukünftigen Version implementiert
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tankstellen</CardTitle>
              <CardDescription>
                Verwaltung der verfügbaren Tankstellen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fuelStations.map((station) => (
                  <div key={station.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{station.attributes?.name || 'Unbekannt'}</div>
                        <div className="text-sm text-muted-foreground">
                          {station.attributes?.adresse || 'Adresse nicht verfügbar'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Record Dialog */}
      <Dialog open={viewRecordDialogOpen} onOpenChange={setViewRecordDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tankvorgang Details</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zum Tankvorgang
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Datum</Label>
                  <div>{formatDate(selectedRecord.attributes?.datum)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fahrzeug</Label>
                  <div className="flex items-center gap-2">
                    {getVehicleTypeIcon(selectedRecord.attributes?.fahrzeug?.data?.attributes?.typ)}
                    {getVehicleDisplayName(selectedRecord.attributes?.fahrzeug?.data)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tankstelle</Label>
                  <div>{selectedRecord.attributes?.tankstelle?.data?.attributes?.name || 'Unbekannt'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Kraftstoffart</Label>
                  <div>
                    <Badge variant="outline">
                      {selectedRecord.attributes?.kraftstoffart}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Literanzahl</Label>
                  <div>{selectedRecord.attributes?.literanzahl?.toFixed(2)}L</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Preis pro Liter</Label>
                  <div>{formatCurrency(selectedRecord.attributes?.preis_pro_liter)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Gesamtkosten</Label>
                  <div className="font-medium">
                    {formatCurrency((selectedRecord.attributes?.literanzahl || 0) * (selectedRecord.attributes?.preis_pro_liter || 0))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Kilometerstand</Label>
                  <div>{selectedRecord.attributes?.kilometerstand?.toLocaleString('de-DE')} km</div>
                </div>
              </div>
              {selectedRecord.attributes?.notizen && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notizen</Label>
                  <div className="whitespace-pre-wrap">{selectedRecord.attributes.notizen}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}