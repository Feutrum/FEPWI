/**
 * ARTICLE OVERVIEW PAGE
 *
 * Modern article management dashboard with Shadcn components
 * Provides comprehensive article management functionality
 *
 * Features:
 * - Article data table with sorting and filtering
 * - Category and supplier filtering
 * - Stock level indicators
 * - CRUD operations with modern forms
 * - Export functionality
 *
 * @author BEPWI Development Team
 * @version 2.0 (Shadcn Migration)
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Barcode,
  Euro
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
import ArticleFormModal from '../components/ArticleFormModal'

// =================================================================
// COMPONENT
// =================================================================

export default function ArtikelUebersichtModern() {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState([])
  const [stockData, setStockData] = useState([])

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [sortBy, setSortBy] = useState('artikelname')
  const [sortOrder, setSortOrder] = useState('asc')

  // Modal states
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load articles and stock data on mount
   */
  useEffect(() => {
    loadArticles()
    loadStockData()
  }, [])

  /**
   * Reload articles when filters change
   */
  useEffect(() => {
    loadArticles()
  }, [searchTerm, categoryFilter, sortBy, sortOrder])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load articles with current filters
   */
  const loadArticles = async () => {
    try {
      setLoading(true)

      const options = {
        pageSize: 100,
        search: searchTerm,
        sortBy,
        sortOrder,
        filters: {}
      }

      if (categoryFilter !== 'all') {
        options.filters['filters[kategorie][$eq]'] = categoryFilter
      }

      const response = await api.inventory.getArticles(options)
      setArticles(response.data || [])
    } catch (error) {
      console.error('Error loading articles:', error)
      toast.error('Fehler beim Laden der Artikel')
      setArticles([])
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
   * Calculate stock summary for each article
   */
  const stockSummaryByArticle = useMemo(() => {
    const summaryMap = new Map()

    stockData.forEach(stock => {
      const articleId = stock.attributes.artikel?.data?.id
      if (!articleId) return

      if (!summaryMap.has(articleId)) {
        summaryMap.set(articleId, {
          totalQuantity: 0,
          locations: 0,
          lowStock: false,
          outOfStock: false
        })
      }

      const summary = summaryMap.get(articleId)
      const quantity = stock.attributes.menge || 0
      const minStock = stock.attributes.mindestbestand || 0

      summary.totalQuantity += quantity
      summary.locations += 1

      if (quantity === 0) {
        summary.outOfStock = true
      } else if (quantity < minStock) {
        summary.lowStock = true
      }
    })

    return summaryMap
  }, [stockData])

  /**
   * Get unique categories
   */
  const categories = useMemo(() => {
    const uniqueCategories = new Set()
    articles.forEach(article => {
      if (article.attributes.kategorie) {
        uniqueCategories.add(article.attributes.kategorie)
      }
    })
    return Array.from(uniqueCategories).sort()
  }, [articles])

  /**
   * Filter articles based on stock status
   */
  const filteredArticles = useMemo(() => {
    if (stockFilter === 'all') return articles

    return articles.filter(article => {
      const stockInfo = stockSummaryByArticle.get(article.id)

      switch (stockFilter) {
        case 'in_stock':
          return stockInfo && stockInfo.totalQuantity > 0
        case 'low_stock':
          return stockInfo && stockInfo.lowStock
        case 'out_of_stock':
          return !stockInfo || stockInfo.outOfStock
        default:
          return true
      }
    })
  }, [articles, stockFilter, stockSummaryByArticle])

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Export articles to CSV
   */
  const handleExport = async () => {
    try {
      const csvContent = await api.inventory.exportInventory('csv')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `artikel-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Export erfolgreich')
    } catch (error) {
      console.error('Error exporting articles:', error)
      toast.error('Fehler beim Export')
    }
  }

  /**
   * Delete article
   */
  const handleDelete = async (articleId) => {
    if (!confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
      return
    }

    try {
      await api.inventory.deleteArticle(articleId)
      toast.success('Artikel erfolgreich gelöscht')
      loadArticles()
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error('Fehler beim Löschen des Artikels')
    }
  }

  /**
   * Open article modal for creating new article
   */
  const handleCreateArticle = () => {
    setSelectedArticle(null)
    setShowArticleModal(true)
  }

  /**
   * Open article modal for editing existing article
   */
  const handleEditArticle = (article) => {
    setSelectedArticle(article)
    setShowArticleModal(true)
  }

  /**
   * Handle successful article form submission
   */
  const handleArticleFormSuccess = () => {
    loadArticles()
    loadStockData()
  }

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================

  /**
   * Get stock status badge
   */
  const getStockBadge = (articleId) => {
    const stockInfo = stockSummaryByArticle.get(articleId)

    if (!stockInfo || stockInfo.outOfStock) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Nicht verfügbar
        </Badge>
      )
    }

    if (stockInfo.lowStock) {
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
   * Get stock quantity display
   */
  const getStockQuantity = (articleId) => {
    const stockInfo = stockSummaryByArticle.get(articleId)
    if (!stockInfo) return '0'

    return `${stockInfo.totalQuantity} (${stockInfo.locations} Lager)`
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artikel Übersicht</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Artikel und Bestände
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateArticle}>
            <Plus className="h-4 w-4 mr-2" />
            Artikel hinzufügen
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Artikel</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
            <p className="text-xs text-muted-foreground">
              Verschiedene Artikel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verfügbar</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredArticles.filter(article => {
                const stockInfo = stockSummaryByArticle.get(article.id)
                return stockInfo && stockInfo.totalQuantity > 0 && !stockInfo.lowStock
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Gut verfügbar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niedrige Bestände</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {filteredArticles.filter(article => {
                const stockInfo = stockSummaryByArticle.get(article.id)
                return stockInfo && stockInfo.lowStock
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Benötigen Nachbestellung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nicht verfügbar</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredArticles.filter(article => {
                const stockInfo = stockSummaryByArticle.get(article.id)
                return !stockInfo || stockInfo.outOfStock
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ausverkauft
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
              placeholder="Artikel suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Bestand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="in_stock">Verfügbar</SelectItem>
            <SelectItem value="low_stock">Niedrig</SelectItem>
            <SelectItem value="out_of_stock">Ausverkauft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sortieren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="artikelname">Name</SelectItem>
            <SelectItem value="kategorie">Kategorie</SelectItem>
            <SelectItem value="preis">Preis</SelectItem>
            <SelectItem value="mindestbestand">Mindestbestand</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Artikel ({filteredArticles.length})</CardTitle>
          <CardDescription>
            Übersicht aller Artikel mit Bestandsinformationen
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
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Bestand</TableHead>
                  <TableHead>Einheit</TableHead>
                  <TableHead>Mindestbestand</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {article.attributes.artikelname}
                        </div>
                        {article.attributes.artikelnummer && (
                          <div className="text-sm text-muted-foreground">
                            Art.-Nr.: {article.attributes.artikelnummer}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {article.attributes.kategorie}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStockQuantity(article.id)}
                    </TableCell>
                    <TableCell>
                      {article.attributes.einheit}
                    </TableCell>
                    <TableCell>
                      {article.attributes.mindestbestand}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3 text-muted-foreground" />
                        {formatCurrency(article.attributes.preis || 0)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStockBadge(article.id)}
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
                          <DropdownMenuItem onClick={() => handleEditArticle(article)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Package className="mr-2 h-4 w-4" />
                            Bestände anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(article.id)}
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
                {filteredArticles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                            ? 'Keine Artikel gefunden, die den Filterkriterien entsprechen.'
                            : 'Noch keine Artikel angelegt.'}
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

      {/* Article Form Modal */}
      <ArticleFormModal
        open={showArticleModal}
        onOpenChange={setShowArticleModal}
        article={selectedArticle}
        onSuccess={handleArticleFormSuccess}
      />
    </div>
  )
}