/**
 * BASE API SERVICE
 *
 * Zentrale HTTP-Client Implementierung für BEPWI System
 * Ersetzt das Mock-System mit echter API-Integration
 *
 * Features:
 * - JWT Authentication mit localStorage Integration
 * - Automatische Token-Erneuerung und Session-Management
 * - Einheitliche Error-Behandlung für alle Module
 * - Strapi CMS API Integration
 * - Role-based Access Control Support
 * - Environment-based configuration
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import { apiConfig, endpoints } from '../../config/api.js'

class BaseApiService {
  constructor() {
    this.baseURL = apiConfig.BASE_URL
    this.timeout = apiConfig.TIMEOUT
    this.enableLogging = apiConfig.ENABLE_LOGGING
    this.offlineMode = apiConfig.OFFLINE_MODE
    this.token = localStorage.getItem('auth_token')

    if (this.enableLogging) {
      console.log(`🔧 API Service initialized for ${apiConfig.ENVIRONMENT} environment`)
      console.log(`🌐 Base URL: ${this.baseURL}`)
      console.log(`📱 Offline mode: ${this.offlineMode ? 'Enabled' : 'Disabled'}`)
    }
  }

  /**
   * Check if API is available
   * @returns {Promise<boolean>} API availability status
   */
  async isApiAvailable() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

      const response = await fetch(`${this.baseURL}${endpoints.HEALTH}`, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      if (this.enableLogging) {
        console.log('🔍 API availability check failed:', error.message)
      }
      return false
    }
  }

  /**
   * Zentrale HTTP Request Methode
   * @param {string} endpoint - API Endpoint (z.B. '/kundes')
   * @param {Object} options - Fetch options (method, body, headers, etc.)
   * @returns {Promise<Object>} API Response Daten
   */
  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      if (this.enableLogging) {
        console.log(`🌐 API ${options.method || 'GET'} ${this.baseURL}${endpoint}`)
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config)

      // Spezielle Behandlung für 401 (Unauthorized)
      if (response.status === 401) {
        this.handleSessionExpired()
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
      }

      // Allgemeine Fehlerbehandlung
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (this.enableLogging) {
        console.log(`✅ API Success:`, data)
      }
      return data

    } catch (error) {
      console.error(`❌ API Request failed for ${endpoint}:`, error)

      // Session-Expired Event für 401 Fehler
      if (error.message.includes('Authentication failed')) {
        this.handleSessionExpired()
      }

      throw error
    }
  }

  /**
   * Session-Expired Handler
   * Räumt lokalen Auth-State auf und triggert globales Event
   */
  handleSessionExpired() {
    console.log('🚨 Session expired - cleaning up auth state')

    // Token aus localStorage entfernen
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')

    // Token im Service zurücksetzen
    this.token = null

    // Custom Event für AuthContext dispatch
    window.dispatchEvent(new CustomEvent('session-expired'))
  }

  /**
   * Token Update Method
   * Wird vom AuthContext aufgerufen bei Login/Logout
   * @param {string} newToken - JWT Token oder null
   */
  updateToken(newToken) {
    this.token = newToken
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  // =================================================================
  // HTTP METHOD HELPERS
  // =================================================================

  /**
   * GET Request
   * @param {string} endpoint - API Endpoint
   * @param {Object} params - Query Parameters
   * @returns {Promise<Object>} Response Data
   */
  async get(endpoint, params = {}) {
    const queryString = Object.keys(params).length
      ? `?${new URLSearchParams(params).toString()}`
      : ''

    return this.request(`${endpoint}${queryString}`, {
      method: 'GET'
    })
  }

  /**
   * POST Request (Create)
   * @param {string} endpoint - API Endpoint
   * @param {Object} data - Request Body Data
   * @returns {Promise<Object>} Created Resource
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ data }),
    })
  }

  /**
   * PUT Request (Update)
   * @param {string} endpoint - API Endpoint
   * @param {Object} data - Update Data
   * @returns {Promise<Object>} Updated Resource
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    })
  }

  /**
   * DELETE Request
   * @param {string} endpoint - API Endpoint
   * @returns {Promise<Object>} Deletion Confirmation
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    })
  }

  // =================================================================
  // STRAPI-SPECIFIC HELPERS
  // =================================================================

  /**
   * Strapi Population Helper
   * Generiert Strapi-konforme Populate-Parameter
   * @param {Array|string} relations - Relations zu populieren
   * @returns {Object} Populate-Parameter für Query
   */
  buildPopulateParams(relations) {
    if (typeof relations === 'string') {
      return { populate: relations }
    }

    if (Array.isArray(relations)) {
      return { populate: relations.join(',') }
    }

    return {}
  }

  /**
   * Strapi Filter Helper
   * Generiert Strapi-konforme Filter-Parameter
   * @param {Object} filters - Filter-Object
   * @returns {Object} Filter-Parameter für Query
   */
  buildFilterParams(filters) {
    const params = {}

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params[`filters[${key}][$eq]`] = value
      }
    })

    return params
  }

  /**
   * Kombinierte Query Builder
   * @param {Object} options - Query Options {populate, filters, sort, pagination}
   * @returns {Object} Komplette Query Parameters
   */
  buildQueryParams(options = {}) {
    let params = {}

    // Population
    if (options.populate) {
      Object.assign(params, this.buildPopulateParams(options.populate))
    }

    // Filtering
    if (options.filters) {
      Object.assign(params, this.buildFilterParams(options.filters))
    }

    // Sorting
    if (options.sort) {
      params.sort = options.sort
    }

    // Pagination
    if (options.pagination) {
      if (options.pagination.page) {
        params['pagination[page]'] = options.pagination.page
      }
      if (options.pagination.pageSize) {
        params['pagination[pageSize]'] = options.pagination.pageSize
      }
    }

    return params
  }

  // =================================================================
  // AUTHENTICATION METHODS
  // =================================================================

  /**
   * Login API Call
   * @param {Object} credentials - {identifier, password}
   * @returns {Promise<Object>} JWT Response {jwt, user}
   */
  async login(credentials) {
    return this.request(endpoints.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  /**
   * Validate Current Token
   * @returns {Promise<Object>} User Data if token valid
   */
  async validateToken() {
    if (!this.token) {
      throw new Error('No token available')
    }

    return this.request(endpoints.AUTH.VALIDATE, {
      method: 'GET'
    })
  }

  // =================================================================
  // UTILITY METHODS
  // =================================================================

  /**
   * API Health Check
   * @returns {Promise<boolean>} API Erreichbarkeit
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}${endpoints.HEALTH}`)
      return response.ok
    } catch (error) {
      if (this.enableLogging) {
        console.warn('❌ API Health Check failed:', error)
      }
      return false
    }
  }

  /**
   * Get API Base URL
   * @returns {string} Base URL
   */
  getBaseURL() {
    return this.baseURL
  }
}

export default BaseApiService