/**
 * MAINTENANCE MANAGEMENT & TÜV TRACKING SYSTEM
 *
 * Comprehensive maintenance scheduling and TÜV tracking (FM-12, FM-13, FM-03)
 * Als Fuhrparkverwalter möchte ich Wartungstermine planen und verfolgen können
 * Als Fuhrparkverwalter möchte ich bei ablaufenden TÜV-Terminen benachrichtigt werden
 * Als Fuhrparkverwalter möchte ich den Wartungsstatus von Fahrzeugen einsehen
 *
 * Features:
 * - Maintenance scheduling and tracking
 * - TÜV expiration monitoring and alerts
 * - Workshop management
 * - Maintenance history and documentation
 * - Automated reminders and notifications
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
  Wrench,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Bell,
  Car,
  Truck,
  MapPin,
  User,
  FileText,
  Edit,
  Eye,
  MoreHorizontal,
  Settings,
  Shield,
  Timer,
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

const maintenanceSchema = z.object({
  fahrzeug: z.string().min(1, 'Fahrzeug ist erforderlich'),
  werkstatt: z.string().optional(),
  wartungstyp: z.enum(['routine', 'reparatur', 'tuev', 'inspektion'], {
    required_error: 'Wartungstyp ist erforderlich'
  }),
  geplantes_datum: z.string().min(1, 'Geplantes Datum ist erforderlich'),
  prioritaet: z.enum(['niedrig', 'normal', 'hoch', 'kritisch'], {
    required_error: 'Priorität ist erforderlich'
  }),
  beschreibung: z.string().min(1, 'Beschreibung ist erforderlich'),
  geschaetzte_kosten: z.number().min(0, 'Kosten können nicht negativ sein').optional(),
  kilometerstand: z.number().min(0, 'Kilometerstand kann nicht negativ sein').optional(),
  notizen: z.string().optional()
})

const maintenanceUpdateSchema = z.object({
  status: z.enum(['geplant', 'in_bearbeitung', 'abgeschlossen', 'verschoben'], {
    required_error: 'Status ist erforderlich'
  }),
  tatsaechliches_datum: z.string().optional(),
  tatsaechliche_kosten: z.number().min(0, 'Kosten können nicht negativ sein').optional(),
  durchgefuehrt_von: z.string().optional(),
  notizen: z.string().optional()
})

// =================================================================
// COMPONENT
// =================================================================

export default function MaintenanceManagement() {
  // =================================================================
  // SETUP & STATE
  // =================================================================

  const navigate = useNavigate()
  const { vehicleId } = useParams()

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [workshops, setWorkshops] = useState([])
  const [tuvAlerts, setTuvAlerts] = useState([])
  const [maintenanceStats, setMaintenanceStats] = useState({
    totalMaintenance: 0,
    pendingMaintenance: 0,
    overdueMaintenance: 0,
    upcomingTuv: 0,
    totalCosts: 0
  })

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState(vehicleId || '')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  })

  // Dialog States
  const [addMaintenanceDialogOpen, setAddMaintenanceDialogOpen] = useState(false)
  const [updateMaintenanceDialogOpen, setUpdateMaintenanceDialogOpen] = useState(false)
  const [viewMaintenanceDialogOpen, setViewMaintenanceDialogOpen] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)

  // =================================================================
  // FORM SETUP
  // =================================================================

  const addForm = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      fahrzeug: vehicleId || '',
      werkstatt: '',
      wartungstyp: 'routine',
      geplantes_datum: '',
      prioritaet: 'normal',
      beschreibung: '',
      geschaetzte_kosten: 0,
      kilometerstand: 0,
      notizen: ''
    }
  })

  const updateForm = useForm({
    resolver: zodResolver(maintenanceUpdateSchema),
    defaultValues: {
      status: 'geplant',
      tatsaechliches_datum: '',
      tatsaechliche_kosten: 0,
      durchgefuehrt_von: '',
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
    loadMaintenanceRecords()
    loadVehicles()
    loadWorkshops()
    loadTuvAlerts()
  }, [])

  /**
   * Reload data when filters change
   */
  useEffect(() => {
    loadMaintenanceRecords()
    calculateMaintenanceStats()
  }, [vehicleFilter, statusFilter, typeFilter, priorityFilter, dateFilter, searchTerm])

  /**
   * Calculate stats when records change
   */
  useEffect(() => {
    calculateMaintenanceStats()
  }, [maintenanceRecords])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load maintenance records with current filters
   */
  const loadMaintenanceRecords = async () => {
    try {
      setLoading(true)

      // For now, using mock data since the backend endpoints need to be implemented
      const mockRecords = [
        {
          id: 1,
          attributes: {
            fahrzeug: { data: { id: 1, attributes: { kennzeichen: 'BN-AB 123', typ: 'traktor', hersteller: 'John Deere' } } },
            werkstatt: { data: { attributes: { name: 'Landmaschinen Weber GmbH' } } },
            wartungstyp: 'routine',
            geplantes_datum: '2024-02-15',
            tatsaechliches_datum: '2024-02-16',
            prioritaet: 'normal',
            status: 'abgeschlossen',
            beschreibung: 'Ölwechsel und Filteraustausch',
            geschaetzte_kosten: 250.00,
            tatsaechliche_kosten: 275.50,
            durchgefuehrt_von: 'Max Mustermann',
            kilometerstand: 15420,
            notizen: 'Zusätzlicher Luftfilter wurde getauscht'
          }
        },
        {
          id: 2,
          attributes: {
            fahrzeug: { data: { id: 1, attributes: { kennzeichen: 'BN-AB 123', typ: 'traktor', hersteller: 'John Deere' } } },
            werkstatt: { data: { attributes: { name: 'TÜV Rheinland' } } },
            wartungstyp: 'tuev',
            geplantes_datum: '2024-03-20',
            prioritaet: 'hoch',
            status: 'geplant',
            beschreibung: 'TÜV-Hauptuntersuchung',
            geschaetzte_kosten: 150.00,
            kilometerstand: 15800,
            notizen: 'Vorab Bremsen prüfen'
          }
        },
        {
          id: 3,
          attributes: {
            fahrzeug: { data: { id: 2, attributes: { kennzeichen: 'BN-CD 456', typ: 'lkw', hersteller: 'Mercedes' } } },
            werkstatt: { data: { attributes: { name: 'Mercedes Service Center' } } },
            wartungstyp: 'reparatur',
            geplantes_datum: '2024-02-10',
            prioritaet: 'kritisch',
            status: 'in_bearbeitung',
            beschreibung: 'Getriebeschaden - Reparatur erforderlich',
            geschaetzte_kosten: 2500.00,
            kilometerstand: 87650,
            notizen: 'Fahrzeug außer Betrieb bis Reparatur abgeschlossen'
          }
        },
        {
          id: 4,
          attributes: {
            fahrzeug: { data: { id: 3, attributes: { kennzeichen: 'BN-EF 789', typ: 'pkw', hersteller: 'VW' } } },
            werkstatt: { data: { attributes: { name: 'Auto Schmidt' } } },
            wartungstyp: 'inspektion',
            geplantes_datum: '2024-02-25',
            prioritaet: 'normal',
            status: 'verschoben',
            beschreibung: 'Jahresinspektion',
            geschaetzte_kosten: 180.00,
            kilometerstand: 45200,
            notizen: 'Verschoben wegen Terminkonflikt'
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

      if (statusFilter !== 'all') {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.status === statusFilter
        )
      }

      if (typeFilter !== 'all') {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.wartungstyp === typeFilter
        )
      }

      if (priorityFilter !== 'all') {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.prioritaet === priorityFilter
        )
      }

      if (dateFilter.from) {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.geplantes_datum >= dateFilter.from
        )
      }

      if (dateFilter.to) {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.geplantes_datum <= dateFilter.to
        )
      }

      if (searchTerm) {
        filteredRecords = filteredRecords.filter(record =>
          record.attributes.beschreibung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.attributes.notizen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.attributes.werkstatt?.data?.attributes?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      setMaintenanceRecords(filteredRecords)
    } catch (error) {
      console.error('Error loading maintenance records:', error)
      toast.error('Fehler beim Laden der Wartungsdaten')
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
   * Load workshops
   */
  const loadWorkshops = async () => {
    try {
      const response = await api.fuhrpark.getWorkshops()
      setWorkshops(response.data || [])

      // If no workshops from API, use mock data
      if (!response.data?.length) {
        setWorkshops([
          { id: 1, attributes: { name: 'Landmaschinen Weber GmbH', adresse: 'Industriestraße 12, 53111 Bonn' } },
          { id: 2, attributes: { name: 'Mercedes Service Center', adresse: 'Autobahnstraße 45, 53115 Bonn' } },
          { id: 3, attributes: { name: 'TÜV Rheinland', adresse: 'Prüfstraße 1, 53119 Bonn' } },
          { id: 4, attributes: { name: 'Auto Schmidt', adresse: 'Werkstattweg 8, 53113 Bonn' } }
        ])
      }
    } catch (error) {
      console.error('Error loading workshops:', error)
      // Use mock data as fallback
      setWorkshops([
        { id: 1, attributes: { name: 'Landmaschinen Weber GmbH', adresse: 'Industriestraße 12, 53111 Bonn' } },
        { id: 2, attributes: { name: 'Mercedes Service Center', adresse: 'Autobahnstraße 45, 53115 Bonn' } },
        { id: 3, attributes: { name: 'TÜV Rheinland', adresse: 'Prüfstraße 1, 53119 Bonn' } },
        { id: 4, attributes: { name: 'Auto Schmidt', adresse: 'Werkstattweg 8, 53113 Bonn' } }
      ])
    }
  }

  /**
   * Load TÜV alerts
   */
  const loadTuvAlerts = async () => {
    try {
      const response = await api.fuhrpark.getUpcomingTUV(60) // Next 60 days
      setTuvAlerts(response.data || [])

      // If no data from API, use mock data
      if (!response.data?.length) {
        setTuvAlerts([
          {
            id: 1,
            attributes: {
              kennzeichen: 'BN-AB 123',
              hersteller: 'John Deere',
              typ: 'traktor',
              tuev_bis: '2024-03-15'
            }
          },
          {
            id: 3,
            attributes: {
              kennzeichen: 'BN-EF 789',
              hersteller: 'VW',
              typ: 'pkw',
              tuev_bis: '2024-02-28'
            }
          }
        ])
      }
    } catch (error) {
      console.error('Error loading TÜV alerts:', error)
      // Use mock data as fallback
      setTuvAlerts([
        {
          id: 1,
          attributes: {
            kennzeichen: 'BN-AB 123',
            hersteller: 'John Deere',
            typ: 'traktor',
            tuev_bis: '2024-03-15'
          }
        },
        {
          id: 3,
          attributes: {
            kennzeichen: 'BN-EF 789',
            hersteller: 'VW',
            typ: 'pkw',
            tuev_bis: '2024-02-28'
          }
        }
      ])
    }
  }

  /**
   * Calculate maintenance statistics
   */
  const calculateMaintenanceStats = () => {
    if (!maintenanceRecords.length) {
      setMaintenanceStats({
        totalMaintenance: 0,
        pendingMaintenance: 0,
        overdueMaintenance: 0,
        upcomingTuv: 0,
        totalCosts: 0
      })
      return
    }

    const totalMaintenance = maintenanceRecords.length
    const pendingMaintenance = maintenanceRecords.filter(r =>
      ['geplant', 'in_bearbeitung'].includes(r.attributes.status)
    ).length

    const today = new Date()
    const overdueMaintenance = maintenanceRecords.filter(r =>
      r.attributes.status === 'geplant' &&
      new Date(r.attributes.geplantes_datum) < today
    ).length

    const upcomingTuv = tuvAlerts.length

    const totalCosts = maintenanceRecords.reduce((sum, record) =>
      sum + (record.attributes.tatsaechliche_kosten || record.attributes.geschaetzte_kosten || 0), 0
    )

    setMaintenanceStats({
      totalMaintenance,
      pendingMaintenance,
      overdueMaintenance,
      upcomingTuv,
      totalCosts
    })
  }

  // =================================================================
  // CRUD OPERATIONS
  // =================================================================

  /**
   * Add new maintenance record
   */
  const handleAddMaintenance = async (data) => {
    try {
      setLoading(true)

      // In a real implementation, this would call the API
      // const response = await api.fuhrpark.createMaintenanceRecord(data)

      toast.success('Wartung erfolgreich geplant')

      // Reload data
      loadMaintenanceRecords()

      // Reset form and close dialog
      addForm.reset()
      setAddMaintenanceDialogOpen(false)

    } catch (error) {
      console.error('Error adding maintenance record:', error)
      toast.error('Fehler beim Planen der Wartung')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update maintenance record
   */
  const handleUpdateMaintenance = async (data) => {
    try {
      setLoading(true)

      // In a real implementation, this would call the API
      // const response = await api.fuhrpark.updateMaintenanceRecord(selectedMaintenance.id, data)

      toast.success('Wartung erfolgreich aktualisiert')

      // Reload data
      loadMaintenanceRecords()

      // Reset form and close dialog
      updateForm.reset()
      setUpdateMaintenanceDialogOpen(false)
      setSelectedMaintenance(null)

    } catch (error) {
      console.error('Error updating maintenance record:', error)
      toast.error('Fehler beim Aktualisieren der Wartung')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Export maintenance data
   */
  const handleExportMaintenanceData = async () => {
    try {
      setLoading(true)

      const exportData = maintenanceRecords.map(record => {
        const attrs = record.attributes
        return {
          'Fahrzeug': getVehicleDisplayName(attrs.fahrzeug?.data),
          'Wartungstyp': attrs.wartungstyp,
          'Beschreibung': attrs.beschreibung,
          'Status': attrs.status,
          'Priorität': attrs.prioritaet,
          'Geplantes Datum': formatDate(attrs.geplantes_datum),
          'Tatsächliches Datum': formatDate(attrs.tatsaechliches_datum) || 'Noch nicht durchgeführt',
          'Werkstatt': attrs.werkstatt?.data?.attributes?.name || 'Unbekannt',
          'Geschätzte Kosten': attrs.geschaetzte_kosten ? `€${attrs.geschaetzte_kosten.toFixed(2)}` : '',
          'Tatsächliche Kosten': attrs.tatsaechliche_kosten ? `€${attrs.tatsaechliche_kosten.toFixed(2)}` : '',
          'Durchgeführt von': attrs.durchgefuehrt_von || '',
          'Kilometerstand': attrs.kilometerstand || '',
          'Notizen': attrs.notizen || ''
        }
      })

      // Convert to CSV
      const csvContent = convertToCSV(exportData)
      downloadCSV(csvContent, `wartungsplanung_${new Date().toISOString().split('T')[0]}.csv`)

      toast.success('Wartungsdaten erfolgreich exportiert')

    } catch (error) {
      console.error('Error exporting maintenance data:', error)
      toast.error('Fehler beim Exportieren der Wartungsdaten')
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
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'geplant': return 'outline'
      case 'in_bearbeitung': return 'default'
      case 'abgeschlossen': return 'secondary'
      case 'verschoben': return 'destructive'
      default: return 'secondary'
    }
  }

  /**
   * Get priority badge variant
   */
  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'niedrig': return 'secondary'
      case 'normal': return 'outline'
      case 'hoch': return 'default'
      case 'kritisch': return 'destructive'
      default: return 'outline'
    }
  }

  /**
   * Get maintenance type display name
   */
  const getMaintenanceTypeDisplayName = (type) => {
    switch (type) {
      case 'routine': return 'Routinewartung'
      case 'reparatur': return 'Reparatur'
      case 'tuev': return 'TÜV'
      case 'inspektion': return 'Inspektion'
      default: return type
    }
  }

  /**
   * Get days until TÜV expiration
   */
  const getDaysUntilTuv = (tuevDate) => {
    if (!tuevDate) return null
    const today = new Date()
    const tuev = new Date(tuevDate)
    return Math.ceil((tuev - today) / (1000 * 60 * 60 * 24))
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
    if (!dateString) return null
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
   * Handle filter changes
   */
  const handleVehicleFilterChange = (value) => {
    setVehicleFilter(value === 'all' ? '' : value)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
  }

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value)
  }

  const handlePriorityFilterChange = (value) => {
    setPriorityFilter(value)
  }

  /**
   * Handle date filter change
   */
  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({ ...prev, [field]: value }))
  }

  /**
   * Open update maintenance dialog
   */
  const openUpdateMaintenanceDialog = (maintenance) => {
    setSelectedMaintenance(maintenance)
    const attrs = maintenance.attributes
    updateForm.reset({
      status: attrs.status,
      tatsaechliches_datum: attrs.tatsaechliches_datum || '',
      tatsaechliche_kosten: attrs.tatsaechliche_kosten || 0,
      durchgefuehrt_von: attrs.durchgefuehrt_von || '',
      notizen: attrs.notizen || ''
    })
    setUpdateMaintenanceDialogOpen(true)
  }

  /**
   * Open view maintenance dialog
   */
  const openViewMaintenanceDialog = (maintenance) => {
    setSelectedMaintenance(maintenance)
    setViewMaintenanceDialogOpen(true)
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
            <h1 className="text-3xl font-bold">Wartungsplanung</h1>
            <p className="text-muted-foreground">
              Wartungen planen und TÜV-Termine überwachen
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportMaintenanceData} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Daten exportieren
          </Button>
          <Dialog open={addMaintenanceDialogOpen} onOpenChange={setAddMaintenanceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Wartung planen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neue Wartung planen</DialogTitle>
                <DialogDescription>
                  Planen Sie eine Wartung oder Inspektion für ein Fahrzeug
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddMaintenance)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
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
                      control={addForm.control}
                      name="wartungstyp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wartungstyp *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="routine">Routinewartung</SelectItem>
                              <SelectItem value="reparatur">Reparatur</SelectItem>
                              <SelectItem value="tuev">TÜV</SelectItem>
                              <SelectItem value="inspektion">Inspektion</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={addForm.control}
                    name="beschreibung"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beschreibung *</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Ölwechsel, Bremsenprüfung..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="geplantes_datum"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Geplantes Datum *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="prioritaet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priorität *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="niedrig">Niedrig</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="hoch">Hoch</SelectItem>
                              <SelectItem value="kritisch">Kritisch</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={addForm.control}
                    name="werkstatt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Werkstatt</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Werkstatt auswählen (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workshops.map((workshop) => (
                              <SelectItem key={workshop.id} value={workshop.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Wrench className="h-4 w-4" />
                                  {workshop.attributes?.name || 'Unbekannt'}
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
                      control={addForm.control}
                      name="geschaetzte_kosten"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Geschätzte Kosten</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
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
                      control={addForm.control}
                      name="kilometerstand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kilometerstand</FormLabel>
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
                    control={addForm.control}
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
                      onClick={() => setAddMaintenanceDialogOpen(false)}
                      className="flex-1"
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      <Wrench className="h-4 w-4 mr-2" />
                      Wartung planen
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TÜV Alerts */}
      {tuvAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>TÜV-Termine ablaufend!</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {tuvAlerts.map((alert) => {
                const days = getDaysUntilTuv(alert.attributes.tuev_bis)
                return (
                  <div key={alert.id} className="text-sm">
                    <strong>{alert.attributes.kennzeichen}</strong> - TÜV läuft ab am {formatDate(alert.attributes.tuev_bis)}
                    {days !== null && (
                      <span className="ml-2">
                        ({days > 0 ? `in ${days} Tagen` : `vor ${Math.abs(days)} Tagen abgelaufen`})
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wartungen gesamt</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceStats.totalMaintenance}</div>
            <p className="text-xs text-muted-foreground">Alle Wartungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Timer className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{maintenanceStats.pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground">Geplant/In Bearbeitung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Überfällig</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{maintenanceStats.overdueMaintenance}</div>
            <p className="text-xs text-muted-foreground">Verspätet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TÜV bald fällig</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{maintenanceStats.upcomingTuv}</div>
            <p className="text-xs text-muted-foreground">Nächste 60 Tage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wartungskosten</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(maintenanceStats.totalCosts)}</div>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Wartungen</TabsTrigger>
          <TabsTrigger value="tuv">TÜV-Überwachung</TabsTrigger>
          <TabsTrigger value="workshops">Werkstätten</TabsTrigger>
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
                  placeholder="Wartung suchen (Beschreibung, Notizen, Werkstatt...)"
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
                      <SelectItem value="geplant">Geplant</SelectItem>
                      <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                      <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                      <SelectItem value="verschoben">Verschoben</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="type-filter">Typ:</Label>
                  <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                    <SelectTrigger id="type-filter" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Typen</SelectItem>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="reparatur">Reparatur</SelectItem>
                      <SelectItem value="tuev">TÜV</SelectItem>
                      <SelectItem value="inspektion">Inspektion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="priority-filter">Priorität:</Label>
                  <Select value={priorityFilter} onValueChange={handlePriorityFilterChange}>
                    <SelectTrigger id="priority-filter" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Prioritäten</SelectItem>
                      <SelectItem value="niedrig">Niedrig</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hoch">Hoch</SelectItem>
                      <SelectItem value="kritisch">Kritisch</SelectItem>
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

          {/* Maintenance Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Wartungen ({maintenanceRecords.length})
                {loading && <span className="text-sm font-normal text-muted-foreground ml-2">Laden...</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-muted-foreground">Lade Wartungen...</div>
                </div>
              ) : maintenanceRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Wartungen gefunden
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fahrzeug</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Beschreibung</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priorität</TableHead>
                        <TableHead>Kosten</TableHead>
                        <TableHead>Werkstatt</TableHead>
                        <TableHead className="w-[100px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceRecords.map((record) => {
                        const attrs = record.attributes
                        const isOverdue = attrs.status === 'geplant' && new Date(attrs.geplantes_datum) < new Date()

                        return (
                          <TableRow key={record.id} className={isOverdue ? 'bg-red-50' : ''}>
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
                              <Badge variant="outline">
                                {getMaintenanceTypeDisplayName(attrs.wartungstyp)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{attrs.beschreibung}</div>
                                {attrs.kilometerstand && (
                                  <div className="text-sm text-muted-foreground">
                                    bei {attrs.kilometerstand.toLocaleString('de-DE')} km
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-sm">
                                  Geplant: {formatDate(attrs.geplantes_datum)}
                                  {isOverdue && <AlertTriangle className="inline h-3 w-3 ml-1 text-red-500" />}
                                </div>
                                {attrs.tatsaechliches_datum && (
                                  <div className="text-sm text-muted-foreground">
                                    Durchgeführt: {formatDate(attrs.tatsaechliches_datum)}
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
                              <Badge variant={getPriorityBadgeVariant(attrs.prioritaet)}>
                                {attrs.prioritaet}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                {attrs.geschaetzte_kosten && (
                                  <div className="text-sm">
                                    Geschätzt: {formatCurrency(attrs.geschaetzte_kosten)}
                                  </div>
                                )}
                                {attrs.tatsaechliche_kosten && (
                                  <div className="text-sm font-medium">
                                    Tatsächlich: {formatCurrency(attrs.tatsaechliche_kosten)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4 text-muted-foreground" />
                                {attrs.werkstatt?.data?.attributes?.name || 'Unbekannt'}
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
                                    onClick={() => openViewMaintenanceDialog(record)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Details anzeigen
                                  </DropdownMenuItem>
                                  {attrs.status !== 'abgeschlossen' && (
                                    <DropdownMenuItem
                                      onClick={() => openUpdateMaintenanceDialog(record)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Status aktualisieren
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

        <TabsContent value="tuv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                TÜV-Überwachung
              </CardTitle>
              <CardDescription>
                Übersicht über ablaufende TÜV-Termine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tuvAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Alle TÜV-Termine sind aktuell
                </div>
              ) : (
                <div className="space-y-4">
                  {tuvAlerts.map((alert) => {
                    const days = getDaysUntilTuv(alert.attributes.tuev_bis)
                    const isExpired = days !== null && days < 0
                    const isUrgent = days !== null && days <= 30

                    return (
                      <div key={alert.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                        isExpired ? 'border-red-200 bg-red-50' :
                        isUrgent ? 'border-amber-200 bg-amber-50' :
                        'border-border'
                      }`}>
                        <div className="flex items-center gap-3">
                          {getVehicleTypeIcon(alert.attributes.typ)}
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {alert.attributes.kennzeichen} - {alert.attributes.hersteller}
                              {isExpired && <XCircle className="h-4 w-4 text-red-500" />}
                              {isUrgent && !isExpired && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              TÜV gültig bis: {formatDate(alert.attributes.tuev_bis)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={isExpired ? 'destructive' : isUrgent ? 'outline' : 'default'}>
                            {days !== null && (
                              days > 0 ? `${days} Tage` : `${Math.abs(days)} Tage überfällig`
                            )}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workshops" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Werkstätten</CardTitle>
              <CardDescription>
                Verfügbare Werkstätten und Service-Partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workshops.map((workshop) => (
                  <div key={workshop.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{workshop.attributes?.name || 'Unbekannt'}</div>
                        <div className="text-sm text-muted-foreground">
                          {workshop.attributes?.adresse || 'Adresse nicht verfügbar'}
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

      {/* Update Maintenance Dialog */}
      <Dialog open={updateMaintenanceDialogOpen} onOpenChange={setUpdateMaintenanceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Wartung aktualisieren</DialogTitle>
            <DialogDescription>
              Status und Details der Wartung aktualisieren
            </DialogDescription>
          </DialogHeader>
          {selectedMaintenance && (
            <div className="mb-4 p-3 bg-muted rounded">
              <div className="font-medium">
                {getVehicleDisplayName(selectedMaintenance.attributes?.fahrzeug?.data)}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedMaintenance.attributes?.beschreibung}
              </div>
            </div>
          )}
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(handleUpdateMaintenance)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="geplant">Geplant</SelectItem>
                        <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                        <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                        <SelectItem value="verschoben">Verschoben</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="tatsaechliches_datum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tatsächliches Datum</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="tatsaechliche_kosten"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tatsächliche Kosten</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
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
                control={updateForm.control}
                name="durchgefuehrt_von"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durchgeführt von</FormLabel>
                    <FormControl>
                      <Input placeholder="Name des Mechanikers/Technikers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="notizen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zusätzliche Notizen</FormLabel>
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
                  onClick={() => setUpdateMaintenanceDialogOpen(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aktualisieren
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Maintenance Dialog */}
      <Dialog open={viewMaintenanceDialogOpen} onOpenChange={setViewMaintenanceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Wartungsdetails</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zur Wartung
            </DialogDescription>
          </DialogHeader>
          {selectedMaintenance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fahrzeug</Label>
                  <div className="flex items-center gap-2">
                    {getVehicleTypeIcon(selectedMaintenance.attributes?.fahrzeug?.data?.attributes?.typ)}
                    {getVehicleDisplayName(selectedMaintenance.attributes?.fahrzeug?.data)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Wartungstyp</Label>
                  <div>
                    <Badge variant="outline">
                      {getMaintenanceTypeDisplayName(selectedMaintenance.attributes?.wartungstyp)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Geplantes Datum</Label>
                  <div>{formatDate(selectedMaintenance.attributes?.geplantes_datum)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tatsächliches Datum</Label>
                  <div>{formatDate(selectedMaintenance.attributes?.tatsaechliches_datum) || 'Noch nicht durchgeführt'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div>
                    <Badge variant={getStatusBadgeVariant(selectedMaintenance.attributes?.status)}>
                      {selectedMaintenance.attributes?.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Priorität</Label>
                  <div>
                    <Badge variant={getPriorityBadgeVariant(selectedMaintenance.attributes?.prioritaet)}>
                      {selectedMaintenance.attributes?.prioritaet}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Geschätzte Kosten</Label>
                  <div>{formatCurrency(selectedMaintenance.attributes?.geschaetzte_kosten)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tatsächliche Kosten</Label>
                  <div>
                    {selectedMaintenance.attributes?.tatsaechliche_kosten ?
                      formatCurrency(selectedMaintenance.attributes.tatsaechliche_kosten) :
                      'Noch nicht verfügbar'
                    }
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Werkstatt</Label>
                  <div>{selectedMaintenance.attributes?.werkstatt?.data?.attributes?.name || 'Unbekannt'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Durchgeführt von</Label>
                  <div>{selectedMaintenance.attributes?.durchgefuehrt_von || 'Noch nicht verfügbar'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Kilometerstand</Label>
                  <div>
                    {selectedMaintenance.attributes?.kilometerstand ?
                      `${selectedMaintenance.attributes.kilometerstand.toLocaleString('de-DE')} km` :
                      'Nicht angegeben'
                    }
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Beschreibung</Label>
                <div>{selectedMaintenance.attributes?.beschreibung}</div>
              </div>
              {selectedMaintenance.attributes?.notizen && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notizen</Label>
                  <div className="whitespace-pre-wrap">{selectedMaintenance.attributes.notizen}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}