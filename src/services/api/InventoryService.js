/**
 * INVENTORY API SERVICE
 *
 * API service for warehouse/inventory module operations
 * Extends BaseApiService for consistent error handling and authentication
 */

import BaseApiService from './BaseApiService.js'

class InventoryService extends BaseApiService {
  constructor() {
    super()
    this.storageUrl = '/storage'
    this.articlesUrl = '/articles'
    this.stockUrl = '/stock'
    this.bookingsUrl = '/bookings'
  }

  // =================================================================
  // STORAGE LOCATION MANAGEMENT
  // =================================================================

  /**
   * Get all storage locations with optional filtering and pagination
   */
  async getStorageLocations(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'lagername',
      sortOrder = 'asc',
      filters = {},
      search = ''
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      ...filters
    }

    if (search) {
      params['filters[$or][0][lagername][$containsi]'] = search
      params['filters[$or][1][standort][$containsi]'] = search
    }

    return this.request(`${this.storageUrl}`, 'GET', null, params)
  }

  /**
   * Get single storage location by ID
   */
  async getStorageLocation(id) {
    return this.request(`${this.storageUrl}/${id}`)
  }

  /**
   * Create new storage location
   */
  async createStorageLocation(locationData) {
    const payload = {
      data: {
        lagername: locationData.lagername,
        standort: locationData.standort,
        beschreibung: locationData.beschreibung || ''
      }
    }

    return this.request(this.storageUrl, 'POST', payload)
  }

  /**
   * Update existing storage location
   */
  async updateStorageLocation(id, locationData) {
    const payload = {
      data: {
        lagername: locationData.lagername,
        standort: locationData.standort,
        beschreibung: locationData.beschreibung
      }
    }

    return this.request(`${this.storageUrl}/${id}`, 'PUT', payload)
  }

  /**
   * Delete storage location
   */
  async deleteStorageLocation(id) {
    return this.request(`${this.storageUrl}/${id}`, 'DELETE')
  }

  // =================================================================
  // ARTICLE MANAGEMENT
  // =================================================================

  /**
   * Get all articles with optional filtering and pagination
   */
  async getArticles(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'artikelname',
      sortOrder = 'asc',
      filters = {},
      search = ''
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      ...filters
    }

    if (search) {
      params['filters[$or][0][artikelname][$containsi]'] = search
      params['filters[$or][1][kategorie][$containsi]'] = search
      params['filters[$or][2][artikelnummer][$containsi]'] = search
    }

    return this.request(`${this.articlesUrl}`, 'GET', null, params)
  }

  /**
   * Get single article by ID
   */
  async getArticle(id) {
    return this.request(`${this.articlesUrl}/${id}`)
  }

  /**
   * Create new article
   */
  async createArticle(articleData) {
    const payload = {
      data: {
        artikelname: articleData.artikelname,
        kategorie: articleData.kategorie,
        einheit: articleData.einheit,
        mindestbestand: articleData.mindestbestand || 0,
        preis: articleData.preis || 0,
        lieferant: articleData.lieferant || '',
        beschreibung: articleData.beschreibung || '',
        artikelnummer: articleData.artikelnummer || '',
        barcode: articleData.barcode || ''
      }
    }

    return this.request(this.articlesUrl, 'POST', payload)
  }

  /**
   * Update existing article
   */
  async updateArticle(id, articleData) {
    const payload = {
      data: {
        artikelname: articleData.artikelname,
        kategorie: articleData.kategorie,
        einheit: articleData.einheit,
        mindestbestand: articleData.mindestbestand,
        preis: articleData.preis,
        lieferant: articleData.lieferant,
        beschreibung: articleData.beschreibung,
        artikelnummer: articleData.artikelnummer,
        barcode: articleData.barcode
      }
    }

    return this.request(`${this.articlesUrl}/${id}`, 'PUT', payload)
  }

  /**
   * Delete article
   */
  async deleteArticle(id) {
    return this.request(`${this.articlesUrl}/${id}`, 'DELETE')
  }

  /**
   * Search articles by name or category
   */
  async searchArticles(searchTerm) {
    const params = {
      'filters[$or][0][artikelname][$containsi]': searchTerm,
      'filters[$or][1][kategorie][$containsi]': searchTerm,
      'filters[$or][2][artikelnummer][$containsi]': searchTerm,
      'pagination[pageSize]': 100
    }

    return this.request(this.articlesUrl, 'GET', null, params)
  }

  // =================================================================
  // STOCK MANAGEMENT
  // =================================================================

  /**
   * Get stock entries with optional filtering
   */
  async getStock(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'artikel.artikelname',
      sortOrder = 'asc',
      filters = {},
      lagerortId,
      artikelId,
      lowStock = false
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      'populate': ['artikel', 'lagerort'],
      ...filters
    }

    if (lagerortId) {
      params['filters[lagerort][id][$eq]'] = lagerortId
    }

    if (artikelId) {
      params['filters[artikel][id][$eq]'] = artikelId
    }

    if (lowStock) {
      params['filters[menge][$lt]'] = 'mindestbestand'
    }

    return this.request(`${this.stockUrl}`, 'GET', null, params)
  }

  /**
   * Get stock for specific article in specific location
   */
  async getStockByLocation(artikelId, lagerortId) {
    const params = {
      'filters[artikel][id][$eq]': artikelId,
      'filters[lagerort][id][$eq]': lagerortId,
      'populate': ['artikel', 'lagerort']
    }

    return this.request(`${this.stockUrl}`, 'GET', null, params)
  }

  /**
   * Update stock quantity
   */
  async updateStock(id, stockData) {
    const payload = {
      data: {
        menge: stockData.menge,
        mindestbestand: stockData.mindestbestand,
        reserviert: stockData.reserviert || 0
      }
    }

    return this.request(`${this.stockUrl}/${id}`, 'PUT', payload)
  }

  /**
   * Create new stock entry
   */
  async createStock(stockData) {
    const payload = {
      data: {
        artikel: stockData.artikelId,
        lagerort: stockData.lagerortId,
        menge: stockData.menge,
        mindestbestand: stockData.mindestbestand || 0,
        reserviert: stockData.reserviert || 0
      }
    }

    return this.request(this.stockUrl, 'POST', payload)
  }

  // =================================================================
  // BOOKING/TRANSACTION MANAGEMENT
  // =================================================================

  /**
   * Get booking entries with filtering
   */
  async getBookings(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filters = {},
      dateFrom,
      dateTo,
      buchungstyp
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      'populate': ['artikel', 'lagerort', 'zielLagerort'],
      ...filters
    }

    if (dateFrom) {
      params['filters[createdAt][$gte]'] = dateFrom
    }

    if (dateTo) {
      params['filters[createdAt][$lte]'] = dateTo
    }

    if (buchungstyp && buchungstyp !== 'all') {
      params['filters[buchungstyp][$eq]'] = buchungstyp
    }

    return this.request(`${this.bookingsUrl}`, 'GET', null, params)
  }

  /**
   * Create new booking entry
   */
  async createBooking(bookingData) {
    const payload = {
      data: {
        artikel: bookingData.artikelId,
        lagerort: bookingData.lagerortId,
        menge: bookingData.menge,
        buchungstyp: bookingData.buchungstyp,
        grund: bookingData.grund,
        referenz: bookingData.referenz || '',
        kosten: bookingData.kosten || 0,
        zielLagerort: bookingData.zielLagerortId || null,
        bemerkung: bookingData.bemerkung || ''
      }
    }

    return this.request(this.bookingsUrl, 'POST', payload)
  }

  /**
   * Get bookings for specific article
   */
  async getArticleBookings(artikelId, options = {}) {
    const params = {
      'filters[artikel][id][$eq]': artikelId,
      'sort': 'createdAt:desc',
      'populate': ['artikel', 'lagerort', 'zielLagerort'],
      ...options
    }

    return this.request(`${this.bookingsUrl}`, 'GET', null, params)
  }

  // =================================================================
  // DASHBOARD & REPORTING
  // =================================================================

  /**
   * Get inventory dashboard data
   */
  async getDashboardData() {
    try {
      const [locations, articles, stock, bookings] = await Promise.all([
        this.getStorageLocations({ pageSize: 1000 }),
        this.getArticles({ pageSize: 1000 }),
        this.getStock({ pageSize: 1000 }),
        this.getBookings({
          pageSize: 100,
          dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
        })
      ])

      const totalLocations = locations.meta?.pagination?.total || 0
      const totalArticles = articles.meta?.pagination?.total || 0
      const totalStockEntries = stock.meta?.pagination?.total || 0

      // Calculate low stock warnings
      const lowStockItems = stock.data?.filter(item => {
        const currentStock = item.attributes.menge || 0
        const minStock = item.attributes.mindestbestand || 0
        return currentStock < minStock
      }) || []

      // Calculate total inventory value
      const totalValue = stock.data?.reduce((sum, item) => {
        const quantity = item.attributes.menge || 0
        const price = item.attributes.artikel?.data?.attributes?.preis || 0
        return sum + (quantity * price)
      }, 0) || 0

      // Recent bookings count
      const recentBookings = bookings.meta?.pagination?.total || 0

      return {
        totalLocations,
        totalArticles,
        totalStockEntries,
        lowStockCount: lowStockItems.length,
        totalInventoryValue: Math.round(totalValue * 100) / 100,
        recentBookings,
        outOfStockCount: stock.data?.filter(item => (item.attributes.menge || 0) === 0).length || 0
      }
    } catch (error) {
      console.error('Error fetching inventory dashboard data:', error)
      throw error
    }
  }

  /**
   * Get low stock warnings
   */
  async getLowStockWarnings() {
    try {
      const response = await this.getStock({
        pageSize: 1000,
        lowStock: true,
        populate: ['artikel', 'lagerort']
      })

      return response.data?.filter(item => {
        const currentStock = item.attributes.menge || 0
        const minStock = item.attributes.mindestbestand || 0
        return currentStock < minStock
      }) || []
    } catch (error) {
      console.error('Error fetching low stock warnings:', error)
      throw error
    }
  }

  /**
   * Export inventory data to CSV
   */
  async exportInventory(format = 'csv') {
    try {
      const response = await this.getStock({
        pageSize: 1000,
        populate: ['artikel', 'lagerort']
      })
      const stockItems = response.data || []

      if (format === 'csv') {
        const headers = ['Artikel', 'Kategorie', 'Lagerort', 'Standort', 'Bestand', 'Einheit', 'Mindestbestand', 'Reserviert', 'Verfügbar', 'Wert']
        const csvContent = [
          headers.join(','),
          ...stockItems.map(item => {
            const artikel = item.attributes.artikel?.data?.attributes
            const lagerort = item.attributes.lagerort?.data?.attributes
            const menge = item.attributes.menge || 0
            const reserviert = item.attributes.reserviert || 0
            const verfügbar = menge - reserviert
            const preis = artikel?.preis || 0
            const wert = menge * preis

            return [
              artikel?.artikelname || '',
              artikel?.kategorie || '',
              lagerort?.lagername || '',
              lagerort?.standort || '',
              menge,
              artikel?.einheit || '',
              item.attributes.mindestbestand || 0,
              reserviert,
              verfügbar,
              wert.toFixed(2)
            ].join(',')
          })
        ].join('\n')

        return csvContent
      }

      return stockItems
    } catch (error) {
      console.error('Error exporting inventory:', error)
      throw error
    }
  }

  /**
   * Export bookings journal to CSV
   */
  async exportBookingsJournal(dateFrom, dateTo, format = 'csv') {
    try {
      const response = await this.getBookings({
        pageSize: 1000,
        dateFrom,
        dateTo,
        populate: ['artikel', 'lagerort', 'zielLagerort']
      })
      const bookings = response.data || []

      if (format === 'csv') {
        const headers = ['Datum', 'Artikel', 'Lagerort', 'Buchungstyp', 'Menge', 'Grund', 'Referenz', 'Kosten', 'Bemerkung']
        const csvContent = [
          headers.join(','),
          ...bookings.map(booking => {
            const artikel = booking.attributes.artikel?.data?.attributes
            const lagerort = booking.attributes.lagerort?.data?.attributes
            const createdAt = new Date(booking.attributes.createdAt).toLocaleDateString('de-DE')

            return [
              createdAt,
              artikel?.artikelname || '',
              lagerort?.lagername || '',
              booking.attributes.buchungstyp || '',
              booking.attributes.menge || 0,
              booking.attributes.grund || '',
              booking.attributes.referenz || '',
              booking.attributes.kosten || 0,
              booking.attributes.bemerkung || ''
            ].join(',')
          })
        ].join('\n')

        return csvContent
      }

      return bookings
    } catch (error) {
      console.error('Error exporting bookings journal:', error)
      throw error
    }
  }
}

export default new InventoryService()