/**
 * WAREHOUSE OVERVIEW PAGE
 *
 * Modern warehouse management dashboard with Shadcn components
 * Replaces old basic table implementation with modern data visualization
 *
 * Features:
 * - Storage location data table with sorting and filtering
 * - Dashboard cards with inventory metrics
 * - Low stock warnings and alerts
 * - Export functionality
 *
 * @author BEPWI Development Team
 * @version 2.0 (Shadcn Migration)
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Warehouse,
  Package,
  AlertTriangle,
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  MapPin,
  TrendingUp,
  TrendingDown
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
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// Components
import StorageLocationFormModal from '../components/StorageLocationFormModal'

// =================================================================
// COMPONENT
// =================================================================

export default function LagerUebersichtModern() {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [loading, setLoading] = useState(true)
  const [storageLocations, setStorageLocations] = useState([])
  const [stockData, setStockData] = useState([])
  const [dashboardData, setDashboardData] = useState({
    totalLocations: 0,
    totalArticles: 0,
    totalStockEntries: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalInventoryValue: 0
  })

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('lagername')
  const [sortOrder, setSortOrder] = useState('asc')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load dashboard data and storage locations on mount
   */
  useEffect(() => {
    loadDashboardData()
    loadStorageLocations()
    loadStockData()
  }, [])

  /**
   * Reload data when filters change
   */
  useEffect(() => {
    loadStorageLocations()
  }, [searchTerm, sortBy, sortOrder])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load dashboard overview data
   */
  const loadDashboardData = async () => {
    try {
      const response = await api.inventory.getDashboardData()
      setDashboardData(response)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Fehler beim Laden der Dashboard-Daten')
    }
  }

  /**
   * Load storage locations with current filters
   */
  const loadStorageLocations = async () => {
    try {
      setLoading(true)

      const options = {
        pageSize: 100,
        search: searchTerm,
        sortBy,
        sortOrder
      }

      const response = await api.inventory.getStorageLocations(options)
      setStorageLocations(response.data || [])
    } catch (error) {
      console.error('Error loading storage locations:', error)
      toast.error('Fehler beim Laden der Lagerorte')
      setStorageLocations([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load stock data for calculations
   */
  const loadStockData = async () => {
    try {
      const response = await api.inventory.getStock({ pageSize: 1000 })
      setStockData(response.data || [])
    } catch (error) {
      console.error('Error loading stock data:', error)
      setStockData([])
    }
  }

  // =================================================================
  // CALCULATIONS
  // =================================================================

  /**
   * Calculate stock summary for each storage location
   */
  const stockSummaryByLocation = useMemo(() => {
    const summaryMap = new Map()

    stockData.forEach(stock => {
      const locationId = stock.attributes.lagerort?.data?.id
      if (!locationId) return

      if (!summaryMap.has(locationId)) {
        summaryMap.set(locationId, {
          positions: 0,
          totalQuantity: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          totalValue: 0
        })
      }

      const summary = summaryMap.get(locationId)
      const quantity = stock.attributes.menge || 0
      const minStock = stock.attributes.mindestbestand || 0
      const price = stock.attributes.artikel?.data?.attributes?.preis || 0

      summary.positions += 1
      summary.totalQuantity += quantity
      summary.totalValue += quantity * price

      if (quantity === 0) {
        summary.outOfStockCount += 1
      } else if (quantity < minStock) {
        summary.lowStockCount += 1
      }
    })

    return summaryMap
  }, [stockData])

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Export warehouse data to CSV
   */
  const handleExport = async () => {
    try {
      const csvContent = await api.inventory.exportInventory('csv')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `lageruebersicht-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Export erfolgreich')
    } catch (error) {
      console.error('Error exporting warehouse data:', error)
      toast.error('Fehler beim Export')
    }
  }

  /**
   * Delete storage location
   */
  const handleDelete = async (locationId) => {
    if (!confirm('Möchten Sie diesen Lagerort wirklich löschen?')) {
      return
    }

    try {
      await api.inventory.deleteStorageLocation(locationId)
      toast.success('Lagerort erfolgreich gelöscht')
      loadStorageLocations()
      loadDashboardData()
    } catch (error) {
      console.error('Error deleting storage location:', error)
      toast.error('Fehler beim Löschen des Lagerorts')
    }
  }

  /**
   * Handle successful storage location creation/update
   */
  const handleStorageLocationSuccess = () => {
    loadStorageLocations()
    loadDashboardData()
    setShowCreateModal(false)
    setEditingLocation(null)
  }

  /**
   * Open edit modal for storage location
   */
  const handleEdit = (location) => {
    setEditingLocation(location)
  }

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================

  /**
   * Get warning badge for low stock
   */
  const getWarningBadge = (locationId) => {
    const summary = stockSummaryByLocation.get(locationId)
    if (!summary) return null

    const warningCount = summary.lowStockCount + summary.outOfStockCount
    if (warningCount === 0) return null

    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        {warningCount}
      </Badge>
    )
  }

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  /**
   * Get stock summary text for location
   */
  const getStockSummary = (locationId) => {
    const summary = stockSummaryByLocation.get(locationId)
    if (!summary) return 'Keine Artikel'

    return `${summary.positions} Artikel • ${formatCurrency(summary.totalValue)}`
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lager Übersicht</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Lagerorte und Bestände
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Lagerort
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lagerorte</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalLocations}</div>
            <p className="text-xs text-muted-foreground">
              Gesamte Lagerorte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artikel</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              Verschiedene Artikel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bestandspositionen</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.totalStockEntries}</div>
            <p className="text-xs text-muted-foreground">
              Lagerpositionen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niedrige Bestände</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboardData.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Warnung erforderlich
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nicht verfügbar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Ausverkaufte Artikel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtwert</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(dashboardData.totalInventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lagerwert
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
              placeholder="Lagerorte suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sortieren nach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lagername">Name</SelectItem>
            <SelectItem value="standort">Standort</SelectItem>
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

      {/* Storage Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lagerorte ({storageLocations.length})</CardTitle>
          <CardDescription>
            Übersicht aller Lagerorte mit Bestandsinformationen
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
                  <TableHead>Lagername</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Bestand</TableHead>
                  <TableHead>Warnungen</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storageLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                        {location.attributes.lagername}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {location.attributes.standort}
                      </div>
                    </TableCell>
                    <TableCell>
                      {location.attributes.beschreibung || '-'}
                    </TableCell>
                    <TableCell>
                      {getStockSummary(location.id)}
                    </TableCell>
                    <TableCell>
                      {getWarningBadge(location.id) || (
                        <Badge variant="outline">Okay</Badge>
                      )}
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
                          <DropdownMenuItem onClick={() => handleEdit(location)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Package className="mr-2 h-4 w-4" />
                            Bestände anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(location.id)}
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
                {storageLocations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Warehouse className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? 'Keine Lagerorte gefunden, die den Suchkriterien entsprechen.'
                            : 'Noch keine Lagerorte angelegt.'}
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

      {/* Storage Location Form Modal */}
      <StorageLocationFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleStorageLocationSuccess}
      />

      {/* Edit Storage Location Modal */}
      {editingLocation && (
        <StorageLocationFormModal
          isOpen={!!editingLocation}
          onClose={() => setEditingLocation(null)}
          onSuccess={handleStorageLocationSuccess}
          storageLocation={editingLocation}
        />
      )}
    </div>
  )
}