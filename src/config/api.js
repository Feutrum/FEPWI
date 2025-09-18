/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Environment-based configuration
const config = {
  development: {
    BASE_URL: import.meta.env.REACT_APP_API_URL || 'http://localhost:1337/api',
    TIMEOUT: parseInt(import.meta.env.REACT_APP_API_TIMEOUT) || 10000,
    ENABLE_LOGGING: import.meta.env.REACT_APP_ENABLE_API_LOGGING === 'true',
    OFFLINE_MODE: import.meta.env.REACT_APP_OFFLINE_MODE === 'true'
  },
  production: {
    BASE_URL: import.meta.env.REACT_APP_API_URL || 'https://your-production-api.com/api',
    TIMEOUT: parseInt(import.meta.env.REACT_APP_API_TIMEOUT) || 15000,
    ENABLE_LOGGING: false,
    OFFLINE_MODE: false
  }
}

// Determine current environment
const environment = import.meta.env.MODE || 'development'

// Export current configuration
export const apiConfig = {
  ...config[environment],
  ENVIRONMENT: environment
}

// API Endpoints
export const endpoints = {
  AUTH: {
    LOGIN: '/auth/local',
    VALIDATE: '/users/me',
    REGISTER: '/auth/local/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  USERS: '/users',
  HEALTH: '/_health'
}

export default apiConfig