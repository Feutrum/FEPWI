/**
 * FUHRPARK API SERVICE
 *
 * Fleet management API implementation for BEPWI System
 * Handles all fleet-related API operations (vehicles, trips, maintenance)
 *
 * Endpoints:
 * - /fahrzeugs (Vehicles)
 * - /modells (Vehicle Models)
 * - /fuehrerscheins (License Types)
 * - /fahrts (Trips)
 * - /tankstelles (Fuel Stations)
 * - /ausstattungs (Equipment)
 * - /werkstatts (Workshops)
 * - /standorts (Locations)
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import BaseApiService from './BaseApiService.js'

class FuhrparkService extends BaseApiService {
  constructor() {
    super()
  }

  // =================================================================
  // VEHICLE MANAGEMENT (FM-01, FM-02)
  // =================================================================

  /**
   * Get all vehicles with optional filtering and population
   * @param {Object} options - Query options {populate, filters, sort, pagination}
   * @returns {Promise<Object>} Vehicles data with meta
   */
  async getVehicles(options = {}) {
    const defaultOptions = {
      populate: ['modell', 'fuehrerschein', 'fahrts'],
      sort: 'kennzeichen:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/fahrzeugs', params)
  }

  /**
   * Get single vehicle by ID
   * @param {number} id - Vehicle ID
   * @param {Array} populate - Relations to populate
   * @returns {Promise<Object>} Vehicle data
   */
  async getVehicle(id, populate = ['modell', 'fuehrerschein', 'fahrts']) {
    const params = this.buildPopulateParams(populate)
    return this.get(`/fahrzeugs/${id}`, params)
  }

  /**
   * Create new vehicle
   * @param {Object} vehicleData - Vehicle data
   * @returns {Promise<Object>} Created vehicle
   */
  async createVehicle(vehicleData) {
    return this.post('/fahrzeugs', vehicleData)
  }

  /**
   * Update vehicle
   * @param {number} id - Vehicle ID
   * @param {Object} vehicleData - Updated vehicle data
   * @returns {Promise<Object>} Updated vehicle
   */
  async updateVehicle(id, vehicleData) {
    return this.put(`/fahrzeugs/${id}`, vehicleData)
  }

  /**
   * Delete vehicle
   * @param {number} id - Vehicle ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteVehicle(id) {
    return this.delete(`/fahrzeugs/${id}`)
  }

  /**
   * Get vehicles by status for dashboard (FM-02)
   * @param {string} status - Vehicle status
   * @returns {Promise<Object>} Filtered vehicles
   */
  async getVehiclesByStatus(status) {
    const params = this.buildFilterParams({ status })
    return this.get('/fahrzeugs', params)
  }

  /**
   * Get vehicle availability for date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Available vehicles
   */
  async getAvailableVehicles(startDate, endDate) {
    // This would need complex filtering based on trip data
    // For now, return vehicles with status 'verfügbar'
    return this.getVehiclesByStatus('verfügbar')
  }

  // =================================================================
  // VEHICLE MODELS & EQUIPMENT
  // =================================================================

  /**
   * Get all vehicle models
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Vehicle models data
   */
  async getVehicleModels(options = {}) {
    const defaultOptions = {
      sort: 'name:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/modells', params)
  }

  /**
   * Get all license types
   * @param {Object} options - Query options
   * @returns {Promise<Object>} License types data
   */
  async getLicenseTypes(options = {}) {
    const defaultOptions = {
      sort: 'bezeichnung:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/fuehrerscheins', params)
  }

  /**
   * Get all equipment
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Equipment data
   */
  async getEquipment(options = {}) {
    const defaultOptions = {
      sort: 'bezeichnung:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/ausstattungs', params)
  }

  // =================================================================
  // TRIP MANAGEMENT (FM-08, FM-09)
  // =================================================================

  /**
   * Get all trips with population
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Trips data
   */
  async getTrips(options = {}) {
    const defaultOptions = {
      populate: ['fahrzeug', 'fahrer'],
      sort: 'startzeit:desc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/fahrts', params)
  }

  /**
   * Get single trip by ID
   * @param {number} id - Trip ID
   * @returns {Promise<Object>} Trip data
   */
  async getTrip(id) {
    const params = this.buildPopulateParams(['fahrzeug', 'fahrer'])
    return this.get(`/fahrts/${id}`, params)
  }

  /**
   * Create new trip
   * @param {Object} tripData - Trip data
   * @returns {Promise<Object>} Created trip
   */
  async createTrip(tripData) {
    return this.post('/fahrts', tripData)
  }

  /**
   * Update trip
   * @param {number} id - Trip ID
   * @param {Object} tripData - Updated trip data
   * @returns {Promise<Object>} Updated trip
   */
  async updateTrip(id, tripData) {
    return this.put(`/fahrts/${id}`, tripData)
  }

  /**
   * End trip (update end time and km)
   * @param {number} id - Trip ID
   * @param {Object} endData - End trip data {endzeit, end_km}
   * @returns {Promise<Object>} Updated trip
   */
  async endTrip(id, endData) {
    return this.updateTrip(id, endData)
  }

  /**
   * Get trips for specific vehicle
   * @param {number} vehicleId - Vehicle ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Vehicle trips
   */
  async getVehicleTrips(vehicleId, options = {}) {
    const filters = { fahrzeug: vehicleId }
    const defaultOptions = {
      filters,
      populate: ['fahrer'],
      sort: 'startzeit:desc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/fahrts', params)
  }

  // =================================================================
  // FUEL MANAGEMENT (FM-10, FM-11)
  // =================================================================

  /**
   * Get all fuel stations
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Fuel stations data
   */
  async getFuelStations(options = {}) {
    const defaultOptions = {
      sort: 'name:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/tankstelles', params)
  }

  /**
   * Get fuel consumption data for vehicle
   * @param {number} vehicleId - Vehicle ID
   * @param {string} dateFrom - Start date
   * @param {string} dateTo - End date
   * @returns {Promise<Object>} Fuel consumption data
   */
  async getVehicleFuelConsumption(vehicleId, dateFrom, dateTo) {
    // This would typically involve aggregating trip data
    // For now, get trips for the vehicle in the date range
    const filters = {
      fahrzeug: vehicleId,
      'startzeit[$gte]': dateFrom,
      'startzeit[$lte]': dateTo
    }

    const params = this.buildQueryParams({ filters })
    return this.get('/fahrts', params)
  }

  // =================================================================
  // MAINTENANCE MANAGEMENT (FM-03, FM-12, FM-13)
  // =================================================================

  /**
   * Get vehicles with upcoming TÜV deadlines
   * @param {number} days - Days ahead to check
   * @returns {Promise<Object>} Vehicles with upcoming TÜV
   */
  async getUpcomingTUV(days = 30) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    const filters = {
      'tuev_bis[$lte]': futureDate.toISOString().split('T')[0]
    }

    const params = this.buildQueryParams({ filters })
    return this.get('/fahrzeugs', params)
  }

  /**
   * Get vehicles requiring maintenance
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Vehicles needing maintenance
   */
  async getMaintenanceVehicles(options = {}) {
    const filters = { status: 'wartung' }
    const defaultOptions = {
      filters,
      populate: ['modell'],
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/fahrzeugs', params)
  }

  /**
   * Update vehicle maintenance status
   * @param {number} id - Vehicle ID
   * @param {string} status - New status
   * @param {Object} maintenanceData - Additional maintenance data
   * @returns {Promise<Object>} Updated vehicle
   */
  async updateMaintenanceStatus(id, status, maintenanceData = {}) {
    const updateData = {
      status,
      ...maintenanceData
    }
    return this.updateVehicle(id, updateData)
  }

  /**
   * Get all workshops
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Workshops data
   */
  async getWorkshops(options = {}) {
    const defaultOptions = {
      sort: 'name:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/werkstatts', params)
  }

  /**
   * Get all locations
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Locations data
   */
  async getLocations(options = {}) {
    const defaultOptions = {
      sort: 'name:asc',
      ...options
    }

    const params = this.buildQueryParams(defaultOptions)
    return this.get('/standorts', params)
  }

  // =================================================================
  // DASHBOARD & ANALYTICS
  // =================================================================

  /**
   * Get fleet dashboard data
   * @returns {Promise<Object>} Dashboard metrics
   */
  async getDashboardData() {
    try {
      const [allVehicles, availableVehicles, inUseVehicles, maintenanceVehicles, upcomingTuv] = await Promise.all([
        this.getVehicles({ pagination: { pageSize: 1000 } }),
        this.getVehiclesByStatus('verfügbar'),
        this.getVehiclesByStatus('im_einsatz'),
        this.getVehiclesByStatus('wartung'),
        this.getUpcomingTUV(30)
      ])

      return {
        totalVehicles: allVehicles.meta?.pagination?.total || 0,
        availableVehicles: availableVehicles.meta?.pagination?.total || 0,
        inUseVehicles: inUseVehicles.meta?.pagination?.total || 0,
        maintenanceVehicles: maintenanceVehicles.meta?.pagination?.total || 0,
        upcomingTuvCount: upcomingTuv.meta?.pagination?.total || 0,
        vehicles: allVehicles.data || []
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }

  /**
   * Search vehicles by license plate or type
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Filtered vehicles
   */
  async searchVehicles(searchTerm) {
    const params = {
      'filters[$or][0][kennzeichen][$containsi]': searchTerm,
      'filters[$or][1][typ][$containsi]': searchTerm,
      'filters[$or][2][hersteller][$containsi]': searchTerm
    }
    return this.get('/fahrzeugs', params)
  }
}

export default FuhrparkService