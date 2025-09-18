/**
 * VEHICLE SERVICE
 *
 * API service layer for vehicle fleet management operations
 * Handles vehicles, reservations, maintenance, and fuel tracking
 */

import BaseApiService from './BaseApiService.js'

class VehicleService extends BaseApiService {
  constructor() {
    super()
    this.vehiclesUrl = '/vehicles'
    this.reservationsUrl = '/vehicle-reservations'
    this.maintenanceUrl = '/vehicle-maintenance'
    this.fuelUrl = '/vehicle-fuel'
  }

  // =================================================================
  // VEHICLE MANAGEMENT
  // =================================================================

  /**
   * Get vehicles with filtering and pagination
   */
  async getVehicles(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'kennzeichen',
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
      params['filters[$or][0][kennzeichen][$containsi]'] = search
      params['filters[$or][1][marke][$containsi]'] = search
      params['filters[$or][2][modell][$containsi]'] = search
    }

    return this.request(`${this.vehiclesUrl}`, 'GET', null, params)
  }

  /**
   * Get single vehicle by ID
   */
  async getVehicle(id) {
    return this.request(`${this.vehiclesUrl}/${id}`, 'GET')
  }

  /**
   * Create new vehicle
   */
  async createVehicle(vehicleData) {
    return this.request(`${this.vehiclesUrl}`, 'POST', { data: vehicleData })
  }

  /**
   * Update vehicle
   */
  async updateVehicle(id, vehicleData) {
    return this.request(`${this.vehiclesUrl}/${id}`, 'PUT', { data: vehicleData })
  }

  /**
   * Delete vehicle
   */
  async deleteVehicle(id) {
    return this.request(`${this.vehiclesUrl}/${id}`, 'DELETE')
  }

  /**
   * Get available vehicles for date range
   */
  async getAvailableVehicles(startDate, endDate) {
    const params = {
      'filters[status][$eq]': 'verfuegbar',
      'populate': 'reservations'
    }

    // Additional logic would be needed to filter out vehicles with conflicting reservations
    return this.request(`${this.vehiclesUrl}`, 'GET', null, params)
  }

  /**
   * Get vehicles with expiring TÜV
   */
  async getVehiclesWithExpiringTuv(daysAhead = 30) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const params = {
      'filters[tuev_ablauf][$lte]': futureDate.toISOString().split('T')[0],
      'sort': 'tuev_ablauf:asc'
    }

    return this.request(`${this.vehiclesUrl}`, 'GET', null, params)
  }

  // =================================================================
  // VEHICLE RESERVATIONS
  // =================================================================

  /**
   * Get reservations with filtering
   */
  async getReservations(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'start_datum',
      sortOrder = 'desc',
      filters = {},
      search = ''
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      'populate': 'vehicle',
      ...filters
    }

    if (search) {
      params['filters[$or][0][mitarbeiter_name][$containsi]'] = search
      params['filters[$or][1][zweck][$containsi]'] = search
    }

    return this.request(`${this.reservationsUrl}`, 'GET', null, params)
  }

  /**
   * Create new reservation
   */
  async createReservation(reservationData) {
    return this.request(`${this.reservationsUrl}`, 'POST', { data: reservationData })
  }

  /**
   * Update reservation
   */
  async updateReservation(id, reservationData) {
    return this.request(`${this.reservationsUrl}/${id}`, 'PUT', { data: reservationData })
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(id) {
    return this.updateReservation(id, { status: 'storniert' })
  }

  /**
   * Get active reservations for vehicle
   */
  async getActiveReservationsForVehicle(vehicleId) {
    const params = {
      'filters[vehicle][id][$eq]': vehicleId,
      'filters[status][$eq]': 'aktiv',
      'sort': 'start_datum:asc'
    }

    return this.request(`${this.reservationsUrl}`, 'GET', null, params)
  }

  // =================================================================
  // MAINTENANCE MANAGEMENT
  // =================================================================

  /**
   * Get maintenance records
   */
  async getMaintenanceRecords(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'datum',
      sortOrder = 'desc',
      filters = {},
      vehicleId = null
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      'populate': 'vehicle',
      ...filters
    }

    if (vehicleId) {
      params['filters[vehicle][id][$eq]'] = vehicleId
    }

    return this.request(`${this.maintenanceUrl}`, 'GET', null, params)
  }

  /**
   * Create maintenance record
   */
  async createMaintenanceRecord(maintenanceData) {
    return this.request(`${this.maintenanceUrl}`, 'POST', { data: maintenanceData })
  }

  /**
   * Update maintenance record
   */
  async updateMaintenanceRecord(id, maintenanceData) {
    return this.request(`${this.maintenanceUrl}/${id}`, 'PUT', { data: maintenanceData })
  }

  /**
   * Get upcoming maintenance
   */
  async getUpcomingMaintenance(daysAhead = 30) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const params = {
      'filters[$or][0][naechste_wartung_datum][$lte]': futureDate.toISOString().split('T')[0],
      'filters[$or][1][status][$eq]': 'geplant',
      'populate': 'vehicle',
      'sort': 'naechste_wartung_datum:asc'
    }

    return this.request(`${this.maintenanceUrl}`, 'GET', null, params)
  }

  // =================================================================
  // FUEL MANAGEMENT
  // =================================================================

  /**
   * Get fuel records
   */
  async getFuelRecords(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'datum',
      sortOrder = 'desc',
      filters = {},
      vehicleId = null
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      'populate': 'vehicle',
      ...filters
    }

    if (vehicleId) {
      params['filters[vehicle][id][$eq]'] = vehicleId
    }

    return this.request(`${this.fuelUrl}`, 'GET', null, params)
  }

  /**
   * Create fuel record
   */
  async createFuelRecord(fuelData) {
    return this.request(`${this.fuelUrl}`, 'POST', { data: fuelData })
  }

  /**
   * Get fuel statistics
   */
  async getFuelStatistics(vehicleId = null, dateFrom = null, dateTo = null) {
    const params = {
      'populate': 'vehicle'
    }

    if (vehicleId) {
      params['filters[vehicle][id][$eq]'] = vehicleId
    }

    if (dateFrom) {
      params['filters[datum][$gte]'] = dateFrom
    }

    if (dateTo) {
      params['filters[datum][$lte]'] = dateTo
    }

    return this.request(`${this.fuelUrl}`, 'GET', null, params)
  }

  // =================================================================
  // DASHBOARD STATISTICS
  // =================================================================

  /**
   * Get fleet overview statistics
   */
  async getFleetStatistics() {
    try {
      const [vehicles, activeReservations, upcomingMaintenance, recentFuel] = await Promise.all([
        this.getVehicles({ pageSize: 1000 }), // Get all vehicles for stats
        this.getReservations({
          pageSize: 100,
          filters: { 'filters[status][$eq]': 'aktiv' }
        }),
        this.getUpcomingMaintenance(30),
        this.getFuelRecords({ pageSize: 10 })
      ])

      // Calculate statistics from the data
      const vehicleData = vehicles.data || []
      const stats = {
        total_vehicles: vehicleData.length,
        available_vehicles: vehicleData.filter(v => v.attributes?.status === 'verfuegbar').length,
        reserved_vehicles: vehicleData.filter(v => v.attributes?.status === 'reserviert').length,
        maintenance_vehicles: vehicleData.filter(v => v.attributes?.status === 'wartung').length,
        defect_vehicles: vehicleData.filter(v => v.attributes?.status === 'defekt').length,
        active_reservations: activeReservations.data?.length || 0,
        upcoming_maintenance: upcomingMaintenance.data?.length || 0,
        tuv_warnings: vehicleData.filter(v => {
          if (!v.attributes?.tuev_ablauf) return false
          const tuvDate = new Date(v.attributes.tuev_ablauf)
          const warningDate = new Date()
          warningDate.setDate(warningDate.getDate() + 60) // 60 days warning
          return tuvDate <= warningDate
        }).length
      }

      return { data: stats }
    } catch (error) {
      console.error('Error fetching fleet statistics:', error)
      throw error
    }
  }

  // =================================================================
  // UTILITY METHODS
  // =================================================================

  /**
   * Export vehicles to CSV
   */
  async exportVehiclesCSV(filters = {}) {
    const vehicles = await this.getVehicles({ pageSize: 1000, ...filters })

    if (!vehicles.data || vehicles.data.length === 0) {
      throw new Error('Keine Fahrzeuge zum Exportieren gefunden')
    }

    const csvHeaders = [
      'Kennzeichen', 'Marke', 'Modell', 'Baujahr', 'Typ', 'Kraftstoffart',
      'Verbrauch (L/100km)', 'Tankgröße (L)', 'Laufleistung (km)',
      'TÜV Ablauf', 'Versicherung Ablauf', 'Status', 'Standort'
    ]

    const csvRows = vehicles.data.map(vehicle => {
      const attrs = vehicle.attributes
      return [
        attrs.kennzeichen || '',
        attrs.marke || '',
        attrs.modell || '',
        attrs.baujahr || '',
        attrs.typ || '',
        attrs.kraftstoffart || '',
        attrs.verbrauch || '',
        attrs.tankgroesse || '',
        attrs.laufleistung || '',
        attrs.tuev_ablauf || '',
        attrs.versicherung_ablauf || '',
        attrs.status || '',
        attrs.standort || ''
      ]
    })

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(';'))
      .join('\n')

    return csvContent
  }

  /**
   * Check vehicle availability for date range
   */
  async checkVehicleAvailability(vehicleId, startDate, endDate) {
    const params = {
      'filters[vehicle][id][$eq]': vehicleId,
      'filters[status][$eq]': 'aktiv',
      'filters[$or][0][$and][0][start_datum][$lte]': endDate,
      'filters[$or][0][$and][1][end_datum][$gte]': startDate
    }

    const conflictingReservations = await this.request(`${this.reservationsUrl}`, 'GET', null, params)

    return {
      available: !conflictingReservations.data || conflictingReservations.data.length === 0,
      conflicts: conflictingReservations.data || []
    }
  }
}

export default new VehicleService()