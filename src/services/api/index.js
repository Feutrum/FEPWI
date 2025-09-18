/**
 * API SERVICES INDEX
 *
 * Central export point for all API services
 * Provides convenient imports for application modules
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import BaseApiService from './BaseApiService.js'
import VertriebService from './VertriebService.js'

// Export service classes
export { BaseApiService, VertriebService }

// Export service instances for direct use
export const baseApiService = new BaseApiService()
export const vertriebService = new VertriebService()

// Future module services will be added here:
// export { default as FuhrparkService } from './FuhrparkService.js'
// export { default as PersonalService } from './PersonalService.js'
// export { default as LagerhaltungService } from './LagerhaltungService.js'
// export { default as PflanzenmanagementService } from './PflanzenmanagementService.js'