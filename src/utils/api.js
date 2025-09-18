/**
 * API Client Service
 * Zentrale HTTP-Kommunikationsschicht mit echtem Backend-Integration
 */

import BaseApiService from '../services/api/BaseApiService.js'
import VertriebService from '../services/api/VertriebService.js'
import FuhrparkService from '../services/api/FuhrparkService.js'
import PersonalService from '../services/api/PersonalService.js'
import InventoryService from '../services/api/InventoryService.js'
import PlantManagementService from '../services/api/PlantManagementService.js'

// Service Instances
const baseApiService = new BaseApiService()
const vertriebService = new VertriebService()
const fuhrparkService = new FuhrparkService()
const personalService = PersonalService // Already instantiated in service file
const inventoryService = InventoryService // Already instantiated in service file
const plantManagementService = PlantManagementService // Already instantiated in service file

// Module Service Registry
const moduleServices = {
  vertrieb: vertriebService,
  fuhrpark: fuhrparkService,
  personal: personalService,
  inventory: inventoryService,
  plantManagement: plantManagementService,
}

export const api = {
  /**
   * Zentrale Request-Methode für alle HTTP-Calls
   * @param {string} method - HTTP-Methode (GET, POST, PUT, DELETE)
   * @param {string} endpoint - API-Endpoint
   * @param {Object|null} data - Request-Body-Daten
   * @returns {Promise<Object>} API Response
   */
  request: async (method, endpoint, data = null) => {
    return baseApiService.request(endpoint, {
      method,
      ...(data && { body: JSON.stringify(data) })
    })
  },

  /**
   * Behandelt abgelaufene Sessions und führt Cleanup durch
   */
  handleSessionExpired: () => {
    baseApiService.handleSessionExpired()
  },

  /**
   * GET-Request
   * @param {string} endpoint - API-Endpoint
   * @param {Object} params - Query Parameters
   * @returns {Promise<Object>} API Response
   */
  get: (endpoint, params = {}) => baseApiService.get(endpoint, params),

  /**
   * POST-Request mit Daten
   * @param {string} endpoint - API-Endpoint
   * @param {Object} data - Request-Body
   * @returns {Promise<Object>} API Response
   */
  post: (endpoint, data) => baseApiService.post(endpoint, data),

  /**
   * PUT-Request für Updates
   * @param {string} endpoint - API-Endpoint
   * @param {Object} data - Update-Daten
   * @returns {Promise<Object>} API Response
   */
  put: (endpoint, data) => baseApiService.put(endpoint, data),

  /**
   * DELETE-Request
   * @param {string} endpoint - API-Endpoint
   * @returns {Promise<Object>} API Response
   */
  delete: (endpoint) => baseApiService.delete(endpoint),

  // =================================================================
  // MODULE-SPECIFIC API METHODS
  // =================================================================

  /**
   * Authentication Methods
   */
  auth: {
    login: (credentials) => baseApiService.login(credentials),
    validateToken: () => baseApiService.validateToken(),
    updateToken: (token) => baseApiService.updateToken(token)
  },

  /**
   * Vertrieb Module Methods
   */
  vertrieb: {
    // Customer Management
    getCustomers: (options) => vertriebService.getCustomers(options),
    getCustomer: (id, populate) => vertriebService.getCustomer(id, populate),
    createCustomer: (data) => vertriebService.createCustomer(data),
    updateCustomer: (id, data) => vertriebService.updateCustomer(id, data),
    deleteCustomer: (id) => vertriebService.deleteCustomer(id),

    // Offer Management
    getOffers: (options) => vertriebService.getOffers(options),
    getOffer: (id) => vertriebService.getOffer(id),
    createOffer: (data) => vertriebService.createOffer(data),
    updateOffer: (id, data) => vertriebService.updateOffer(id, data),
    deleteOffer: (id) => vertriebService.deleteOffer(id),

    // Order Management
    getOrders: (options) => vertriebService.getOrders(options),
    getOrder: (id) => vertriebService.getOrder(id),
    createOrderFromOffer: (offerId, data) => vertriebService.createOrderFromOffer(offerId, data),
    updateOrder: (id, data) => vertriebService.updateOrder(id, data),
    updateOrderStatus: (id, status) => vertriebService.updateOrderStatus(id, status),

    // Delivery Management
    getDeliveries: (options) => vertriebService.getDeliveries(options),
    getDelivery: (id) => vertriebService.getDelivery(id),
    createDelivery: (data) => vertriebService.createDelivery(data),
    updateDelivery: (id, data) => vertriebService.updateDelivery(id, data),
    updateDeliveryStatus: (id, status) => vertriebService.updateDeliveryStatus(id, status),

    // Resource Management
    getDeliveryDrivers: (options) => vertriebService.getDeliveryDrivers(options),
    getAvailableDrivers: (date) => vertriebService.getAvailableDrivers(date),
    getVehicles: (options) => vertriebService.getVehicles(options),
    getAvailableVehicles: (date) => vertriebService.getAvailableVehicles(date),

    // Article Management
    getArticles: (options) => vertriebService.getArticles(options),
    getArticle: (id) => vertriebService.getArticle(id),
    searchArticles: (searchTerm) => vertriebService.searchArticles(searchTerm),

    // Dashboard
    getDashboardData: (dateFrom, dateTo) => vertriebService.getDashboardData(dateFrom, dateTo)
  },

  /**
   * Fuhrpark Module Methods
   */
  fuhrpark: {
    // Vehicle Management
    getVehicles: (options) => fuhrparkService.getVehicles(options),
    getVehicle: (id, populate) => fuhrparkService.getVehicle(id, populate),
    createVehicle: (data) => fuhrparkService.createVehicle(data),
    updateVehicle: (id, data) => fuhrparkService.updateVehicle(id, data),
    deleteVehicle: (id) => fuhrparkService.deleteVehicle(id),
    getVehiclesByStatus: (status) => fuhrparkService.getVehiclesByStatus(status),
    getAvailableVehicles: (startDate, endDate) => fuhrparkService.getAvailableVehicles(startDate, endDate),
    searchVehicles: (searchTerm) => fuhrparkService.searchVehicles(searchTerm),

    // Vehicle Models & Equipment
    getVehicleModels: (options) => fuhrparkService.getVehicleModels(options),
    getLicenseTypes: (options) => fuhrparkService.getLicenseTypes(options),
    getEquipment: (options) => fuhrparkService.getEquipment(options),

    // Trip Management
    getTrips: (options) => fuhrparkService.getTrips(options),
    getTrip: (id) => fuhrparkService.getTrip(id),
    createTrip: (data) => fuhrparkService.createTrip(data),
    updateTrip: (id, data) => fuhrparkService.updateTrip(id, data),
    endTrip: (id, endData) => fuhrparkService.endTrip(id, endData),
    getVehicleTrips: (vehicleId, options) => fuhrparkService.getVehicleTrips(vehicleId, options),

    // Fuel Management
    getFuelStations: (options) => fuhrparkService.getFuelStations(options),
    getVehicleFuelConsumption: (vehicleId, dateFrom, dateTo) => fuhrparkService.getVehicleFuelConsumption(vehicleId, dateFrom, dateTo),

    // Maintenance Management
    getUpcomingTUV: (days) => fuhrparkService.getUpcomingTUV(days),
    getMaintenanceVehicles: (options) => fuhrparkService.getMaintenanceVehicles(options),
    updateMaintenanceStatus: (id, status, data) => fuhrparkService.updateMaintenanceStatus(id, status, data),
    getWorkshops: (options) => fuhrparkService.getWorkshops(options),
    getLocations: (options) => fuhrparkService.getLocations(options),

    // Dashboard
    getDashboardData: () => fuhrparkService.getDashboardData()
  },

  /**
   * Personal Module Methods
   */
  personal: {
    // Employee Management
    getEmployees: (options) => personalService.getEmployees(options),
    getEmployee: (id) => personalService.getEmployee(id),
    createEmployee: (data) => personalService.createEmployee(data),
    updateEmployee: (id, data) => personalService.updateEmployee(id, data),
    deleteEmployee: (id) => personalService.deleteEmployee(id),
    deactivateEmployee: (id) => personalService.deactivateEmployee(id),

    // Time Tracking
    getTimeEntries: (employeeId, options) => personalService.getTimeEntries(employeeId, options),
    createTimeEntry: (data) => personalService.createTimeEntry(data),
    updateTimeEntry: (id, data) => personalService.updateTimeEntry(id, data),
    approveTimeEntry: (id, approved) => personalService.approveTimeEntry(id, approved),

    // Department Management
    getDepartments: () => personalService.getDepartments(),
    getEmployeesByDepartment: (departmentId) => personalService.getEmployeesByDepartment(departmentId),

    // Reporting & Analytics
    getDashboardData: () => personalService.getDashboardData(),
    exportEmployees: (format) => personalService.exportEmployees(format)
  },

  /**
   * Inventory Module Methods
   */
  inventory: {
    // Storage Location Management
    getStorageLocations: (options) => inventoryService.getStorageLocations(options),
    getStorageLocation: (id) => inventoryService.getStorageLocation(id),
    createStorageLocation: (data) => inventoryService.createStorageLocation(data),
    updateStorageLocation: (id, data) => inventoryService.updateStorageLocation(id, data),
    deleteStorageLocation: (id) => inventoryService.deleteStorageLocation(id),

    // Article Management
    getArticles: (options) => inventoryService.getArticles(options),
    getArticle: (id) => inventoryService.getArticle(id),
    createArticle: (data) => inventoryService.createArticle(data),
    updateArticle: (id, data) => inventoryService.updateArticle(id, data),
    deleteArticle: (id) => inventoryService.deleteArticle(id),
    searchArticles: (searchTerm) => inventoryService.searchArticles(searchTerm),

    // Stock Management
    getStock: (options) => inventoryService.getStock(options),
    getStockByLocation: (artikelId, lagerortId) => inventoryService.getStockByLocation(artikelId, lagerortId),
    updateStock: (id, data) => inventoryService.updateStock(id, data),
    createStock: (data) => inventoryService.createStock(data),

    // Booking/Transaction Management
    getBookings: (options) => inventoryService.getBookings(options),
    createBooking: (data) => inventoryService.createBooking(data),
    getArticleBookings: (artikelId, options) => inventoryService.getArticleBookings(artikelId, options),

    // Dashboard & Reporting
    getDashboardData: () => inventoryService.getDashboardData(),
    getLowStockWarnings: () => inventoryService.getLowStockWarnings(),
    exportInventory: (format) => inventoryService.exportInventory(format),
    exportBookingsJournal: (dateFrom, dateTo, format) => inventoryService.exportBookingsJournal(dateFrom, dateTo, format)
  },

  /**
   * Plant Management Module Methods
   */
  plantManagement: {
    // Field Management
    getFields: (options) => plantManagementService.getFields(options),
    getField: (id) => plantManagementService.getField(id),
    createField: (data) => plantManagementService.createField(data),
    updateField: (id, data) => plantManagementService.updateField(id, data),
    deleteField: (id) => plantManagementService.deleteField(id),
    getFieldsByStatus: (status) => plantManagementService.getFieldsByStatus(status),

    // Crop Management
    getCrops: (options) => plantManagementService.getCrops(options),
    getCrop: (id) => plantManagementService.getCrop(id),
    createCrop: (data) => plantManagementService.createCrop(data),
    updateCrop: (id, data) => plantManagementService.updateCrop(id, data),
    deleteCrop: (id) => plantManagementService.deleteCrop(id),
    getCropsByCategory: (category) => plantManagementService.getCropsByCategory(category),

    // Cultivation Planning
    getCultivationPlans: (options) => plantManagementService.getCultivationPlans(options),
    createCultivationPlan: (data) => plantManagementService.createCultivationPlan(data),
    updateCultivationPlan: (id, data) => plantManagementService.updateCultivationPlan(id, data),
    deleteCultivationPlan: (id) => plantManagementService.deleteCultivationPlan(id),

    // Field Activities
    getFieldActivities: (options) => plantManagementService.getFieldActivities(options),
    createFieldActivity: (data) => plantManagementService.createFieldActivity(data),
    updateFieldActivity: (id, data) => plantManagementService.updateFieldActivity(id, data),
    deleteFieldActivity: (id) => plantManagementService.deleteFieldActivity(id),
    getActivitiesByField: (fieldId, options) => plantManagementService.getActivitiesByField(fieldId, options),

    // Yield Records
    getYieldRecords: (options) => plantManagementService.getYieldRecords(options),
    createYieldRecord: (data) => plantManagementService.createYieldRecord(data),
    updateYieldRecord: (id, data) => plantManagementService.updateYieldRecord(id, data),

    // Soil Management
    getSoilQuality: (fieldId) => plantManagementService.getSoilQuality(fieldId),
    createSoilQuality: (data) => plantManagementService.createSoilQuality(data),

    // Field Owners
    getFieldOwners: (fieldId) => plantManagementService.getFieldOwners(fieldId),
    createFieldOwner: (data) => plantManagementService.createFieldOwner(data),

    // Dashboard & Reporting
    getDashboardData: () => plantManagementService.getDashboardData(),
    getSeasonReport: (year, filters) => plantManagementService.getSeasonReport(year, filters),
    exportPlantData: (type, format) => plantManagementService.exportPlantData(type, format)
  },

  // =================================================================
  // UTILITY METHODS
  // =================================================================

  /**
   * API Health Check
   * @returns {Promise<boolean>} API Erreichbarkeit
   */
  healthCheck: () => baseApiService.healthCheck(),

  /**
   * Get API Base URL
   * @returns {string} Base URL
   */
  getBaseURL: () => baseApiService.getBaseURL(),

  /**
   * Get Module Service
   * @param {string} moduleName - Module name
   * @returns {Object} Module service instance
   */
  getModuleService: (moduleName) => moduleServices[moduleName]
};

// Export default api object for backward compatibility
export default api
