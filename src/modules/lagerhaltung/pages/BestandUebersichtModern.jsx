/**
 * STOCK OVERVIEW PAGE
 *
 * Modern stock management dashboard with Shadcn components
 * Provides comprehensive inventory tracking and booking functionality
 *
 * Features:
 * - Stock data table with real-time quantities
 * - Low stock warnings and alerts
 * - Quick booking actions
 * - Multi-location inventory tracking
 * - Export functionality
 *
 * @author BEPWI Development Team
 * @version 2.0 (Shadcn Migration)
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Package,
  Plus,
  Minus,
  ArrowUpDown,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Edit
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
import BookingFormModal from '../components/BookingFormModal'

// =================================================================
// COMPONENT
// =================================================================

export default function BestandUebersichtModern() {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [loading, setLoading] = useState(true)
  const [stockData, setStockData] = useState([])
  const [storageLocations, setStorageLocations] = useState([])
  const [dashboardData, setDashboardData] = useState({
    totalStockEntries: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalInventoryValue: 0
  })

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [sortBy, setSortBy] = useState('artikel.artikelname')
  const [sortOrder, setSortOrder] = useState('asc')

  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingType, setBookingType] = useState('eingang')
  const [selectedStock, setSelectedStock] = useState(null)

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadDashboardData()
    loadStockData()
    loadStorageLocations()
  }, [])

  /**
   * Reload stock data when filters change
   */
  useEffect(() => {
    loadStockData()
  }, [searchTerm, locationFilter, stockFilter, sortBy, sortOrder])

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
   * Load stock data with current filters
   */
  const loadStockData = async () => {
    try {
      setLoading(true)

      const options = {
        pageSize: 100,
        sortBy,
        sortOrder,
        filters: {}
      }

      if (locationFilter !== 'all') {
        options.lagerortId = parseInt(locationFilter)
      }

      if (stockFilter === 'low_stock') {
        options.lowStock = true
      }

      const response = await api.inventory.getStock(options)
      let stockItems = response.data || []

      // Apply search filter locally for now
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        stockItems = stockItems.filter(stock => {
          const articleName = stock.attributes.artikel?.data?.attributes?.artikelname?.toLowerCase() || ''
          const locationName = stock.attributes.lagerort?.data?.attributes?.lagername?.toLowerCase() || ''
          return articleName.includes(searchLower) || locationName.includes(searchLower)
        })
      }

      // Apply stock status filter
      if (stockFilter === 'out_of_stock') {
        stockItems = stockItems.filter(stock => (stock.attributes.menge || 0) === 0)
      } else if (stockFilter === 'available') {
        stockItems = stockItems.filter(stock => (stock.attributes.menge || 0) > 0)
      }

      setStockData(stockItems)
    } catch (error) {
      console.error('Error loading stock data:', error)
      toast.error('Fehler beim Laden der Bestandsdaten')
      setStockData([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load storage locations for filter
   */
  const loadStorageLocations = async () => {
    try {
      const response = await api.inventory.getStorageLocations({ pageSize: 1000 })
      setStorageLocations(response.data || [])
    } catch (error) {
      console.error('Error loading storage locations:', error)
      setStorageLocations([])
    }
  }

  // =================================================================
  // CALCULATIONS
  // =================================================================

  /**
   * Calculate stock statistics
   */
  const stockStats = useMemo(() => {
    const stats = {
      total: stockData.length,
      available: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0
    }

    stockData.forEach(stock => {
      const quantity = stock.attributes.menge || 0
      const minStock = stock.attributes.mindestbestand || 0
      const price = stock.attributes.artikel?.data?.attributes?.preis || 0

      stats.totalValue += quantity * price

      if (quantity === 0) {
        stats.outOfStock++
      } else if (quantity < minStock) {
        stats.lowStock++
      } else {
        stats.available++
      }
    })

    return stats
  }, [stockData])

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Export stock data to CSV
   */
  const handleExport = async () => {
    try {
      const csvContent = await api.inventory.exportInventory('csv')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `bestand-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Export erfolgreich')
    } catch (error) {
      console.error('Error exporting stock data:', error)
      toast.error('Fehler beim Export')
    }
  }

  /**
   * Open booking modal for stock movement
   */
  const handleBooking = (type, stock = null) => {
    setBookingType(type)
    setSelectedStock(stock)
    setShowBookingModal(true)
  }

  /**
   * Handle successful booking
   */
  const handleBookingSuccess = () => {
    loadStockData()
    loadDashboardData()
  }

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================

  /**
   * Get stock status badge
   */
  const getStockBadge = (stock) => {
    const quantity = stock.attributes.menge || 0
    const minStock = stock.attributes.mindestbestand || 0

    if (quantity === 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Nicht verfügbar
        </Badge>
      )
    }

    if (quantity < minStock) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Niedrig
        </Badge>
      )
    }

    return (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Verfügbar
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
   * Get stock level indicator color
   */
  const getStockLevelColor = (stock) => {
    const quantity = stock.attributes.menge || 0
    const minStock = stock.attributes.mindestbestand || 0

    if (quantity === 0) return 'text-red-600'
    if (quantity < minStock) return 'text-orange-600'
    return 'text-green-600'
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bestand Übersicht</h1>
          <p className="text-muted-foreground">
            Aktuelle Lagerbestände und Buchungen verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Buchung
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBooking('eingang')}>
                <Plus className="mr-2 h-4 w-4 text-green-600" />
                Wareneingang
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBooking('ausgang')}>
                <Minus className="mr-2 h-4 w-4 text-red-600" />
                Warenausgang
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBooking('umbuchung')}>
                <ArrowUpDown className="mr-2 h-4 w-4 text-blue-600" />
                Umbuchung
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBooking('korrektur')}>
                <Edit className="mr-2 h-4 w-4 text-orange-600" />
                Korrektur
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positionen</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Bestandspositionen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verfügbar</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stockStats.available}</div>
            <p className="text-xs text-muted-foreground">
              Gut verfügbar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niedrig</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stockStats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Nachbestellung nötig
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nicht verfügbar</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              Ausverkauft
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
              {formatCurrency(stockStats.totalValue)}
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
              placeholder="Artikel oder Lagerort suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lagerort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Lagerorte</SelectItem>
            {storageLocations.map((location) => (
              <SelectItem key={location.id} value={location.id.toString()}>
                {location.attributes.lagername}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="available">Verfügbar</SelectItem>
            <SelectItem value="low_stock">Niedrig</SelectItem>
            <SelectItem value="out_of_stock">Ausverkauft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sortieren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="artikel.artikelname">Artikel</SelectItem>
            <SelectItem value="lagerort.lagername">Lagerort</SelectItem>
            <SelectItem value="menge">Menge</SelectItem>
            <SelectItem value="mindestbestand">Mindestbestand</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bestandspositionen ({stockData.length})</CardTitle>
          <CardDescription>
            Aktuelle Lagerbestände mit Warnungen und Buchungsmöglichkeiten
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
                  <TableHead>Artikel</TableHead>
                  <TableHead>Lagerort</TableHead>
                  <TableHead>Bestand</TableHead>
                  <TableHead>Mindestbestand</TableHead>
                  <TableHead>Reserviert</TableHead>
                  <TableHead>Verfügbar</TableHead>
                  <TableHead>Wert</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockData.map((stock) => {
                  const article = stock.attributes.artikel?.data?.attributes
                  const location = stock.attributes.lagerort?.data?.attributes
                  const quantity = stock.attributes.menge || 0
                  const reserved = stock.attributes.reserviert || 0
                  const available = quantity - reserved
                  const price = article?.preis || 0
                  const value = quantity * price

                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{article?.artikelname}</div>
                            <div className="text-sm text-muted-foreground">
                              {article?.kategorie}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Warehouse className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{location?.lagername}</div>
                            <div className="text-sm text-muted-foreground">
                              {location?.standort}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${getStockLevelColor(stock)}`}>
                          {quantity} {article?.einheit}
                        </div>
                      </TableCell>
                      <TableCell>
                        {stock.attributes.mindestbestand || 0} {article?.einheit}
                      </TableCell>
                      <TableCell>
                        {reserved > 0 ? `${reserved} ${article?.einheit}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className={available < (stock.attributes.mindestbestand || 0) ? 'text-orange-600' : ''}>
                          {available} {article?.einheit}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(value)}
                      </TableCell>
                      <TableCell>
                        {getStockBadge(stock)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Aktionen öffnen</span>
                              <Package className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleBooking('eingang', stock)}>
                              <Plus className="mr-2 h-4 w-4 text-green-600" />
                              Zugang buchen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBooking('ausgang', stock)}>
                              <Minus className="mr-2 h-4 w-4 text-red-600" />
                              Abgang buchen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBooking('umbuchung', stock)}>
                              <ArrowUpDown className="mr-2 h-4 w-4 text-blue-600" />
                              Umbuchen
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBooking('korrektur', stock)}>
                              <Edit className="mr-2 h-4 w-4 text-orange-600" />
                              Korrektur
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {stockData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || locationFilter !== 'all' || stockFilter !== 'all'
                            ? 'Keine Bestandspositionen gefunden, die den Filterkriterien entsprechen.'
                            : 'Noch keine Bestandspositionen vorhanden.'}
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

      {/* Booking Form Modal */}
      <BookingFormModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        bookingType={bookingType}
        preselectedArticle={selectedStock?.attributes.artikel?.data}
        preselectedLocation={selectedStock?.attributes.lagerort?.data}
        onSuccess={handleBookingSuccess}
      />
    </div>
  )
}