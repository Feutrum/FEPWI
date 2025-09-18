/**
 * VERTRIEB API SERVICE
 *
 * Sales module API implementation for BEPWI System
 * Handles all sales-related API operations (customers, offers, orders, deliveries)
 *
 * Endpoints:
 * - /kundes (Customers)
 * - /angebots (Offers)
 * - /auftragskopfs (Orders)
 * - /lieferungs (Deliveries)
 * - /lieferfahrers (Delivery Drivers)
 * - /fahrzeugs (Vehicles)
 * - /artikels (Articles)
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import BaseApiService from './BaseApiService.js'

class VertriebService extends BaseApiService {
  constructor() {
    super()
  }

  // =================================================================
  // CUSTOMER MANAGEMENT (VT-01)
  // =================================================================

  /**
   * Get all customers with optional filtering and population
   * @param {Object} options - Query options {populate, filters, sort, pagination}
   * @returns {Promise<Object>} Customers data with meta
   */
  async getCustomers(options = {}) {
    const defaultOptions = {
      populate: ['angebots', 'auftragskopfs'],
      sort: 'name:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/kundes', params)
  }

  /**
   * Get single customer by ID
   * @param {number} id - Customer ID
   * @param {Array} populate - Relations to populate
   * @returns {Promise<Object>} Customer data
   */
  async getCustomer(id, populate = ['angebots', 'auftragskopfs']) {
    const params = this.buildPopulateParams(populate)
    return this.get(`/kundes/${id}`, params)
  }

  /**
   * Create new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    return this.post('/kundes', customerData)
  }

  /**
   * Update customer
   * @param {number} id - Customer ID
   * @param {Object} customerData - Updated customer data
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(id, customerData) {
    return this.put(`/kundes/${id}`, customerData)
  }

  /**
   * Delete customer
   * @param {number} id - Customer ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteCustomer(id) {
    return this.delete(`/kundes/${id}`)
  }

  // =================================================================
  // OFFER MANAGEMENT (VT-03, VT-04)
  // =================================================================

  /**
   * Get all offers with population
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Offers data
   */
  async getOffers(options = {}) {
    const defaultOptions = {
      populate: ['kunde', 'angebotspositionen', 'angebotspositionen.artikel'],
      sort: 'createdAt:desc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/angebots', params)
  }

  /**
   * Get single offer by ID
   * @param {number} id - Offer ID
   * @returns {Promise<Object>} Offer data
   */
  async getOffer(id) {
    const params = this.buildPopulateParams([
      'kunde',
      'angebotspositionen',
      'angebotspositionen.artikel'
    ])
    return this.get(`/angebots/${id}`, params)
  }

  /**
   * Create new offer
   * @param {Object} offerData - Offer data with positions
   * @returns {Promise<Object>} Created offer
   */
  async createOffer(offerData) {
    return this.post('/angebots', offerData)
  }

  /**
   * Update offer
   * @param {number} id - Offer ID
   * @param {Object} offerData - Updated offer data
   * @returns {Promise<Object>} Updated offer
   */
  async updateOffer(id, offerData) {
    return this.put(`/angebots/${id}`, offerData)
  }

  /**
   * Delete offer
   * @param {number} id - Offer ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteOffer(id) {
    return this.delete(`/angebots/${id}`)
  }

  // =================================================================
  // ORDER MANAGEMENT (VT-05, VT-06)
  // =================================================================

  /**
   * Get all orders with population
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Orders data
   */
  async getOrders(options = {}) {
    const defaultOptions = {
      populate: [
        'kunde',
        'angebot',
        'auftragspositionen',
        'auftragspositionen.artikel',
        'lieferungs'
      ],
      sort: 'createdAt:desc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/auftragskopfs', params)
  }

  /**
   * Get single order by ID
   * @param {number} id - Order ID
   * @returns {Promise<Object>} Order data
   */
  async getOrder(id) {
    const params = this.buildPopulateParams([
      'kunde',
      'angebot',
      'auftragspositionen',
      'auftragspositionen.artikel',
      'lieferungs'
    ])
    return this.get(`/auftragskopfs/${id}`, params)
  }

  /**
   * Create order from offer
   * @param {number} offerId - Source offer ID
   * @param {Object} orderData - Additional order data
   * @returns {Promise<Object>} Created order
   */
  async createOrderFromOffer(offerId, orderData) {
    return this.post('/auftragskopfs', {
      angebot: offerId,
      ...orderData
    })
  }

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(id, status) {
    return this.put(`/auftragskopfs/${id}`, { status })
  }

  /**
   * Update order
   * @param {number} id - Order ID
   * @param {Object} orderData - Updated order data
   * @returns {Promise<Object>} Updated order
   */
  async updateOrder(id, orderData) {
    return this.put(`/auftragskopfs/${id}`, orderData)
  }

  // =================================================================
  // DELIVERY MANAGEMENT (VT-09)
  // =================================================================

  /**
   * Get all deliveries with population
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Deliveries data
   */
  async getDeliveries(options = {}) {
    const defaultOptions = {
      populate: [
        'auftragskopf',
        'auftragskopf.kunde',
        'lieferfahrer',
        'fahrzeug'
      ],
      sort: 'lieferdatum:desc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/lieferungs', params)
  }

  /**
   * Get single delivery by ID
   * @param {number} id - Delivery ID
   * @returns {Promise<Object>} Delivery data
   */
  async getDelivery(id) {
    const params = this.buildPopulateParams([
      'auftragskopf',
      'auftragskopf.kunde',
      'lieferfahrer',
      'fahrzeug'
    ])
    return this.get(`/lieferungs/${id}`, params)
  }

  /**
   * Create new delivery
   * @param {Object} deliveryData - Delivery data
   * @returns {Promise<Object>} Created delivery
   */
  async createDelivery(deliveryData) {
    return this.post('/lieferungs', deliveryData)
  }

  /**
   * Update delivery
   * @param {number} id - Delivery ID
   * @param {Object} deliveryData - Updated delivery data
   * @returns {Promise<Object>} Updated delivery
   */
  async updateDelivery(id, deliveryData) {
    return this.put(`/lieferungs/${id}`, deliveryData)
  }

  /**
   * Update delivery status
   * @param {number} id - Delivery ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated delivery
   */
  async updateDeliveryStatus(id, status) {
    return this.put(`/lieferungs/${id}`, { status })
  }

  // =================================================================
  // DELIVERY DRIVER MANAGEMENT
  // =================================================================

  /**
   * Get all delivery drivers
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Delivery drivers data
   */
  async getDeliveryDrivers(options = {}) {
    const defaultOptions = {
      sort: 'name:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/lieferfahrers', params)
  }

  /**
   * Get available delivery drivers for date
   * @param {string} _date - Delivery date (YYYY-MM-DD) - unused for now
   * @returns {Promise<Object>} Available drivers
   */
  async getAvailableDrivers(_date) {
    const params = this.buildFilterParams({
      verfuegbar: true
    })
    return this.get('/lieferfahrers', params)
  }

  // =================================================================
  // VEHICLE MANAGEMENT
  // =================================================================

  /**
   * Get all vehicles
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Vehicles data
   */
  async getVehicles(options = {}) {
    const defaultOptions = {
      sort: 'bezeichnung:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/fahrzeugs', params)
  }

  /**
   * Get available vehicles for date
   * @param {string} _date - Delivery date (YYYY-MM-DD) - unused for now
   * @returns {Promise<Object>} Available vehicles
   */
  async getAvailableVehicles(_date) {
    const params = this.buildFilterParams({
      verfuegbar: true
    })
    return this.get('/fahrzeugs', params)
  }

  // =================================================================
  // ARTICLE MANAGEMENT
  // =================================================================

  /**
   * Get all articles
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Articles data
   */
  async getArticles(options = {}) {
    const defaultOptions = {
      sort: 'bezeichnung:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/artikels', params)
  }

  /**
   * Search articles by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Filtered articles
   */
  async searchArticles(searchTerm) {
    const params = {
      'filters[bezeichnung][$containsi]': searchTerm
    }
    return this.get('/artikels', params)
  }

  /**
   * Get article by ID
   * @param {number} id - Article ID
   * @returns {Promise<Object>} Article data
   */
  async getArticle(id) {
    return this.get(`/artikels/${id}`)
  }

  // =================================================================
  // DASHBOARD & ANALYTICS
  // =================================================================

  /**
   * Get sales dashboard data
   * @param {string} dateFrom - Start date (YYYY-MM-DD)
   * @param {string} dateTo - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Dashboard metrics
   */
  async getDashboardData(dateFrom, dateTo) {
    const filters = {}
    if (dateFrom) {
      filters['createdAt[$gte]'] = dateFrom
    }
    if (dateTo) {
      filters['createdAt[$lte]'] = dateTo
    }

    const [offers, orders, deliveries] = await Promise.all([
      this.getOffers({ filters, pagination: { pageSize: 100 } }),
      this.getOrders({ filters, pagination: { pageSize: 100 } }),
      this.getDeliveries({ filters, pagination: { pageSize: 100 } })
    ])

    return {
      offers: offers.meta.pagination.total,
      orders: orders.meta.pagination.total,
      deliveries: deliveries.meta.pagination.total,
      totalRevenue: orders.data.reduce((sum, order) => sum + (order.attributes.gesamtsumme || 0), 0)
    }
  }
}

export default VertriebService