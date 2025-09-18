/**
 * FIELD OVERVIEW PAGE
 *
 * Modern field management dashboard with Shadcn components
 * Replaces old basic card implementation with modern data visualization
 *
 * Features:
 * - Field data table with sorting and filtering
 * - Field creation and editing with modern forms
 * - Soil quality and owner management
 * - Activity tracking integration
 * - Export functionality
 *
 * @author BEPWI Development Team
 * @version 2.0 (Shadcn Migration)
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  MapPin,
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  MoreHorizontal,
  Sprout,
  Calendar,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// Components
import FieldFormModal from '../components/FieldFormModal'

// =================================================================
// COMPONENT
// =================================================================

export default function SchlagUebersichtModern() {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [loading, setLoading] = useState(true)
  const [fields, setFields] = useState([])
  const [dashboardData, setDashboardData] = useState({
    totalFields: 0,
    totalCrops: 0,
    activeCultivations: 0,
    totalAreaUnderCultivation: 0,
    totalActivities: 0
  })

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  // Modal states
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [selectedField, setSelectedField] = useState(null)

  // Selection for navigation
  const [selectedFieldId, setSelectedFieldId] = useState(null)

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load dashboard data and fields on mount
   */
  useEffect(() => {
    loadDashboardData()
    loadFields()
    loadSelectedField()
  }, [])

  /**
   * Reload fields when filters change
   */
  useEffect(() => {
    loadFields()
  }, [searchTerm, statusFilter, sortBy, sortOrder])

  /**
   * Load previously selected field from localStorage
   */
  const loadSelectedField = () => {
    const stored = localStorage.getItem('selectedSchlagNr')
    if (stored) {
      setSelectedFieldId(Number(stored))
    }
  }

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load dashboard overview data
   */
  const loadDashboardData = async () => {
    try {
      const response = await api.plantManagement.getDashboardData()
      setDashboardData(response)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Fehler beim Laden der Dashboard-Daten')
    }
  }

  /**
   * Load fields with current filters
   */
  const loadFields = async () => {
    try {
      setLoading(true)

      const options = {
        pageSize: 100,
        search: searchTerm,
        sortBy,
        sortOrder,
        filters: {}
      }

      if (statusFilter !== 'all') {
        options.filters['filters[status][$eq]'] = statusFilter
      }

      const response = await api.plantManagement.getFields(options)
      setFields(response.data || [])
    } catch (error) {
      console.error('Error loading fields:', error)
      toast.error('Fehler beim Laden der Felder')
      setFields([])
    } finally {
      setLoading(false)
    }
  }

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Export fields data to CSV
   */
  const handleExport = async () => {
    try {
      const csvContent = await api.plantManagement.exportPlantData('fields', 'csv')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `felder-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Export erfolgreich')
    } catch (error) {
      console.error('Error exporting fields:', error)
      toast.error('Fehler beim Export')
    }
  }

  /**
   * Delete field
   */
  const handleDelete = async (fieldId) => {
    if (!confirm('Möchten Sie dieses Feld wirklich löschen?')) {
      return
    }

    try {
      await api.plantManagement.deleteField(fieldId)
      toast.success('Feld erfolgreich gelöscht')
      loadFields()
      loadDashboardData()
    } catch (error) {
      console.error('Error deleting field:', error)
      toast.error('Fehler beim Löschen des Feldes')
    }
  }

  /**
   * Select field for navigation
   */
  const handleSelectField = (field) => {
    setSelectedFieldId(field.id)
    localStorage.setItem('selectedSchlagNr', field.attributes.nr)
    localStorage.setItem('selectedSchlag', JSON.stringify({
      id: field.id,
      nr: field.attributes.nr,
      name: field.attributes.name,
      adresse: field.attributes.adresse,
      groesse: field.attributes.groesse,
      bemerkung: field.attributes.bemerkung
    }))
    toast.success(`Feld "${field.attributes.name}" ausgewählt`)
  }

  /**
   * Open field modal for creating new field
   */
  const handleCreateField = () => {
    setSelectedField(null)
    setShowFieldModal(true)
  }

  /**
   * Open field modal for editing existing field
   */
  const handleEditField = (field) => {
    setSelectedField(field)
    setShowFieldModal(true)
  }

  /**
   * Handle successful field form submission
   */
  const handleFieldFormSuccess = () => {
    loadFields()
    loadDashboardData()
  }

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================

  /**
   * Get status badge
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Aktiv
          </Badge>
        )
      case 'inactive':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Inaktiv
          </Badge>
        )
      case 'fallow':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            Brache
          </Badge>
        )
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  /**
   * Check if field is selected
   */
  const isFieldSelected = (field) => {
    return selectedFieldId === field.id || selectedFieldId === field.attributes.nr
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schlag Übersicht</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre landwirtschaftlichen Flächen und Aktivitäten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateField}>
            <Plus className="h-4 w-4 mr-2" />
            Feld hinzufügen
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Felder</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalFields}</div>
            <p className="text-xs text-muted-foreground">
              Gesamte Felder
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kulturen</CardTitle>
            <Sprout className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.totalCrops}</div>
            <p className="text-xs text-muted-foreground">
              Verschiedene Kulturen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Anbau</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.activeCultivations}</div>
            <p className="text-xs text-muted-foreground">
              Laufende Kultivierung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anbaufläche</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.totalAreaUnderCultivation} ha
            </div>
            <p className="text-xs text-muted-foreground">
              Gesamte Anbaufläche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivitäten</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboardData.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              Dieses Jahr
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Felder suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="inactive">Inaktiv</SelectItem>
            <SelectItem value="fallow">Brache</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sortieren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="nr">Nummer</SelectItem>
            <SelectItem value="groesse">Größe</SelectItem>
            <SelectItem value="createdAt">Erstellt</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Reihenfolge" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Aufsteigend</SelectItem>
            <SelectItem value="desc">Absteigend</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fields Table */}
      <Card>
        <CardHeader>
          <CardTitle>Felder ({fields.length})</CardTitle>
          <CardDescription>
            Übersicht aller landwirtschaftlichen Flächen mit Details und Aktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nr.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bemerkung</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow
                    key={field.id}
                    className={isFieldSelected(field) ? 'bg-muted/50' : ''}
                  >
                    <TableCell className="font-medium">
                      <Badge variant="outline">
                        {field.attributes.nr}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="font-medium cursor-pointer hover:text-primary"
                        onClick={() => handleSelectField(field)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {field.attributes.name}
                          {isFieldSelected(field) && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {field.attributes.adresse}
                    </TableCell>
                    <TableCell>
                      {field.attributes.groesse}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(field.attributes.status || 'active')}
                    </TableCell>
                    <TableCell>
                      {field.attributes.bemerkung || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Aktionen öffnen</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSelectField(field)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Auswählen
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditField(field)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Sprout className="mr-2 h-4 w-4" />
                            Aktivitäten anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            Eigentümer verwalten
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(field.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {fields.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Keine Felder gefunden, die den Filterkriterien entsprechen.'
                            : 'Noch keine Felder angelegt.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Field Form Modal */}
      <FieldFormModal
        open={showFieldModal}
        onOpenChange={setShowFieldModal}
        field={selectedField}
        onSuccess={handleFieldFormSuccess}
      />
    </div>
  )
}