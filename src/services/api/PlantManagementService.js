/**
 * PLANT MANAGEMENT API SERVICE
 *
 * API service for agricultural plant management operations
 * Extends BaseApiService for consistent error handling and authentication
 */

import BaseApiService from './BaseApiService.js'

class PlantManagementService extends BaseApiService {
  constructor() {
    super()
    this.fieldsUrl = '/farm/fields'
    this.cropsUrl = '/farm/crops'
    this.activitiesUrl = '/farm/activities'
    this.cultivationUrl = '/farm/cultivation'
    this.yieldsUrl = '/farm/yields'
    this.soilUrl = '/farm/soil'
    this.ownersUrl = '/farm/owners'
  }

  // =================================================================
  // FIELD MANAGEMENT
  // =================================================================

  /**
   * Get all fields with optional filtering and pagination
   */
  async getFields(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'name',
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
      params['filters[$or][0][name][$containsi]'] = search
      params['filters[$or][1][adresse][$containsi]'] = search
      params['filters[$or][2][bemerkung][$containsi]'] = search
    }

    return this.request(`${this.fieldsUrl}`, 'GET', null, params)
  }

  /**
   * Get single field by ID
   */
  async getField(id) {
    return this.request(`${this.fieldsUrl}/${id}`)
  }

  /**
   * Create new field
   */
  async createField(fieldData) {
    const payload = {
      data: {
        name: fieldData.name,
        nr: fieldData.nr,
        adresse: fieldData.adresse,
        groesse: fieldData.groesse,
        bemerkung: fieldData.bemerkung || '',
        coordinates: fieldData.coordinates || null,
        status: fieldData.status || 'active'
      }
    }

    return this.request(this.fieldsUrl, 'POST', payload)
  }

  /**
   * Update existing field
   */
  async updateField(id, fieldData) {
    const payload = {
      data: {
        name: fieldData.name,
        nr: fieldData.nr,
        adresse: fieldData.adresse,
        groesse: fieldData.groesse,
        bemerkung: fieldData.bemerkung,
        coordinates: fieldData.coordinates,
        status: fieldData.status
      }
    }

    return this.request(`${this.fieldsUrl}/${id}`, 'PUT', payload)
  }

  /**
   * Delete field
   */
  async deleteField(id) {
    return this.request(`${this.fieldsUrl}/${id}`, 'DELETE')
  }

  /**
   * Get fields by status
   */
  async getFieldsByStatus(status) {
    const params = {
      'filters[status][$eq]': status,
      'pagination[pageSize]': 1000
    }

    return this.request(this.fieldsUrl, 'GET', null, params)
  }

  // =================================================================
  // CROP MANAGEMENT
  // =================================================================

  /**
   * Get all crops with optional filtering
   */
  async getCrops(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'name',
      sortOrder = 'asc',
      filters = {},
      search = '',
      category
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      ...filters
    }

    if (search) {
      params['filters[$or][0][name][$containsi]'] = search
      params['filters[$or][1][scientificName][$containsi]'] = search
      params['filters[$or][2][variety][$containsi]'] = search
    }

    if (category) {
      params['filters[category][$eq]'] = category
    }

    return this.request(`${this.cropsUrl}`, 'GET', null, params)
  }

  /**
   * Get single crop by ID
   */
  async getCrop(id) {
    return this.request(`${this.cropsUrl}/${id}`)
  }

  /**
   * Create new crop
   */
  async createCrop(cropData) {
    const payload = {
      data: {
        name: cropData.name,
        scientificName: cropData.scientificName || '',
        category: cropData.category,
        variety: cropData.variety || '',
        seedingRate: cropData.seedingRate || 0,
        seedingUnit: cropData.seedingUnit || '',
        growthDuration: cropData.growthDuration || 0,
        harvestWindow: cropData.harvestWindow || null,
        requirements: cropData.requirements || null
      }
    }

    return this.request(this.cropsUrl, 'POST', payload)
  }

  /**
   * Update existing crop
   */
  async updateCrop(id, cropData) {
    const payload = {
      data: {
        name: cropData.name,
        scientificName: cropData.scientificName,
        category: cropData.category,
        variety: cropData.variety,
        seedingRate: cropData.seedingRate,
        seedingUnit: cropData.seedingUnit,
        growthDuration: cropData.growthDuration,
        harvestWindow: cropData.harvestWindow,
        requirements: cropData.requirements
      }
    }

    return this.request(`${this.cropsUrl}/${id}`, 'PUT', payload)
  }

  /**
   * Delete crop
   */
  async deleteCrop(id) {
    return this.request(`${this.cropsUrl}/${id}`, 'DELETE')
  }

  /**
   * Search crops by category
   */
  async getCropsByCategory(category) {
    const params = {
      'filters[category][$eq]': category,
      'pagination[pageSize]': 1000
    }

    return this.request(this.cropsUrl, 'GET', null, params)
  }

  // =================================================================
  // CULTIVATION PLANNING
  // =================================================================

  /**
   * Get cultivation plans with filtering
   */
  async getCultivationPlans(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'plannedSowingDate',
      sortOrder = 'asc',
      filters = {},
      season,
      fieldId,
      status
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      'populate': ['field', 'crop'],
      ...filters
    }

    if (season) {
      params['filters[season][$eq]'] = season
    }

    if (fieldId) {
      params['filters[field][id][$eq]'] = fieldId
    }

    if (status && status !== 'all') {
      params['filters[status][$eq]'] = status
    }

    return this.request(`${this.cultivationUrl}`, 'GET', null, params)
  }

  /**
   * Create cultivation plan
   */
  async createCultivationPlan(planData) {
    const payload = {
      data: {
        field: planData.fieldId,
        crop: planData.cropId,
        season: planData.season,
        plannedSowingDate: planData.plannedSowingDate,
        plannedHarvestDate: planData.plannedHarvestDate,
        plannedArea: planData.plannedArea,
        expectedYield: planData.expectedYield || 0,
        yieldUnit: planData.yieldUnit || '',
        notes: planData.notes || '',
        status: planData.status || 'planned'
      }
    }

    return this.request(this.cultivationUrl, 'POST', payload)
  }

  /**
   * Update cultivation plan
   */
  async updateCultivationPlan(id, planData) {
    const payload = {
      data: {
        field: planData.fieldId,
        crop: planData.cropId,
        season: planData.season,
        plannedSowingDate: planData.plannedSowingDate,
        plannedHarvestDate: planData.plannedHarvestDate,
        plannedArea: planData.plannedArea,
        expectedYield: planData.expectedYield,
        yieldUnit: planData.yieldUnit,
        notes: planData.notes,
        status: planData.status
      }
    }

    return this.request(`${this.cultivationUrl}/${id}`, 'PUT', payload)
  }

  /**
   * Delete cultivation plan
   */
  async deleteCultivationPlan(id) {
    return this.request(`${this.cultivationUrl}/${id}`, 'DELETE')
  }

  // =================================================================
  // FIELD ACTIVITIES
  // =================================================================

  /**
   * Get field activities with filtering
   */
  async getFieldActivities(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'activityDate',
      sortOrder = 'desc',
      filters = {},
      fieldId,
      activityType,
      dateFrom,
      dateTo
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      'populate': ['field'],
      ...filters
    }

    if (fieldId) {
      params['filters[field][id][$eq]'] = fieldId
    }

    if (activityType && activityType !== 'all') {
      params['filters[activityType][$eq]'] = activityType
    }

    if (dateFrom) {
      params['filters[activityDate][$gte]'] = dateFrom
    }

    if (dateTo) {
      params['filters[activityDate][$lte]'] = dateTo
    }

    return this.request(`${this.activitiesUrl}`, 'GET', null, params)
  }

  /**
   * Create field activity
   */
  async createFieldActivity(activityData) {
    const payload = {
      data: {
        field: activityData.fieldId,
        activityType: activityData.activityType,
        activityDate: activityData.activityDate,
        duration: activityData.duration || 0,
        description: activityData.description,
        materials: activityData.materials || [],
        laborHours: activityData.laborHours || 0,
        machineHours: activityData.machineHours || 0,
        weather: activityData.weather || null,
        results: activityData.results || '',
        nextActivity: activityData.nextActivity || '',
        completed: activityData.completed || false
      }
    }

    return this.request(this.activitiesUrl, 'POST', payload)
  }

  /**
   * Update field activity
   */
  async updateFieldActivity(id, activityData) {
    const payload = {
      data: {
        field: activityData.fieldId,
        activityType: activityData.activityType,
        activityDate: activityData.activityDate,
        duration: activityData.duration,
        description: activityData.description,
        materials: activityData.materials,
        laborHours: activityData.laborHours,
        machineHours: activityData.machineHours,
        weather: activityData.weather,
        results: activityData.results,
        nextActivity: activityData.nextActivity,
        completed: activityData.completed
      }
    }

    return this.request(`${this.activitiesUrl}/${id}`, 'PUT', payload)
  }

  /**
   * Delete field activity
   */
  async deleteFieldActivity(id) {
    return this.request(`${this.activitiesUrl}/${id}`, 'DELETE')
  }

  /**
   * Get activities for specific field
   */
  async getActivitiesByField(fieldId, options = {}) {
    const params = {
      'filters[field][id][$eq]': fieldId,
      'sort': 'activityDate:desc',
      'populate': ['field'],
      ...options
    }

    return this.request(`${this.activitiesUrl}`, 'GET', null, params)
  }

  // =================================================================
  // YIELD RECORDS
  // =================================================================

  /**
   * Get yield records with filtering
   */
  async getYieldRecords(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      sortBy = 'harvestDate',
      sortOrder = 'desc',
      filters = {},
      season,
      fieldId,
      cropId
    } = options

    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': `${sortBy}:${sortOrder}`,
      'populate': ['field', 'crop'],
      ...filters
    }

    if (season) {
      params['filters[harvestDate][$gte]'] = `${season}-01-01`
      params['filters[harvestDate][$lte]'] = `${season}-12-31`
    }

    if (fieldId) {
      params['filters[field][id][$eq]'] = fieldId
    }

    if (cropId) {
      params['filters[crop][id][$eq]'] = cropId
    }

    return this.request(`${this.yieldsUrl}`, 'GET', null, params)
  }

  /**
   * Create yield record
   */
  async createYieldRecord(yieldData) {
    const payload = {
      data: {
        field: yieldData.fieldId,
        crop: yieldData.cropId,
        harvestDate: yieldData.harvestDate,
        area: yieldData.area,
        totalYield: yieldData.totalYield,
        yieldPerArea: yieldData.yieldPerArea,
        quality: yieldData.quality || '',
        moistureContent: yieldData.moistureContent || 0,
        storageLocation: yieldData.storageLocation || '',
        marketPrice: yieldData.marketPrice || 0,
        totalRevenue: yieldData.totalRevenue || 0,
        notes: yieldData.notes || ''
      }
    }

    return this.request(this.yieldsUrl, 'POST', payload)
  }

  /**
   * Update yield record
   */
  async updateYieldRecord(id, yieldData) {
    const payload = {
      data: {
        field: yieldData.fieldId,
        crop: yieldData.cropId,
        harvestDate: yieldData.harvestDate,
        area: yieldData.area,
        totalYield: yieldData.totalYield,
        yieldPerArea: yieldData.yieldPerArea,
        quality: yieldData.quality,
        moistureContent: yieldData.moistureContent,
        storageLocation: yieldData.storageLocation,
        marketPrice: yieldData.marketPrice,
        totalRevenue: yieldData.totalRevenue,
        notes: yieldData.notes
      }
    }

    return this.request(`${this.yieldsUrl}/${id}`, 'PUT', payload)
  }

  // =================================================================
  // SOIL MANAGEMENT
  // =================================================================

  /**
   * Get soil quality records
   */
  async getSoilQuality(fieldId) {
    const params = {
      'filters[field][id][$eq]': fieldId,
      'sort': 'testDate:desc',
      'populate': ['field']
    }

    return this.request(`${this.soilUrl}`, 'GET', null, params)
  }

  /**
   * Create soil quality record
   */
  async createSoilQuality(soilData) {
    const payload = {
      data: {
        field: soilData.fieldId,
        pH: soilData.pH || 0,
        organicMatter: soilData.organicMatter || 0,
        nitrogen: soilData.nitrogen || 0,
        phosphorus: soilData.phosphorus || 0,
        potassium: soilData.potassium || 0,
        soilType: soilData.soilType || '',
        drainage: soilData.drainage || '',
        testDate: soilData.testDate || new Date().toISOString().split('T')[0],
        notes: soilData.notes || ''
      }
    }

    return this.request(this.soilUrl, 'POST', payload)
  }

  // =================================================================
  // FIELD OWNERS
  // =================================================================

  /**
   * Get field owners
   */
  async getFieldOwners(fieldId) {
    const params = {
      'filters[field][id][$eq]': fieldId,
      'populate': ['field']
    }

    return this.request(`${this.ownersUrl}`, 'GET', null, params)
  }

  /**
   * Create field owner record
   */
  async createFieldOwner(ownerData) {
    const payload = {
      data: {
        field: ownerData.fieldId,
        ownerName: ownerData.ownerName,
        ownerAddress: ownerData.ownerAddress,
        contactPerson: ownerData.contactPerson || '',
        phone: ownerData.phone || '',
        email: ownerData.email || '',
        contractType: ownerData.contractType || 'owned',
        contractStart: ownerData.contractStart || '',
        contractEnd: ownerData.contractEnd || '',
        rentPrice: ownerData.rentPrice || 0
      }
    }

    return this.request(this.ownersUrl, 'POST', payload)
  }

  // =================================================================
  // DASHBOARD & REPORTING
  // =================================================================

  /**
   * Get plant management dashboard data
   */
  async getDashboardData() {
    try {
      const currentYear = new Date().getFullYear()
      const [fields, crops, activities, cultivation, yields] = await Promise.all([
        this.getFields({ pageSize: 1000 }),
        this.getCrops({ pageSize: 1000 }),
        this.getFieldActivities({
          pageSize: 100,
          dateFrom: `${currentYear}-01-01`,
          dateTo: `${currentYear}-12-31`
        }),
        this.getCultivationPlans({ season: currentYear, pageSize: 1000 }),
        this.getYieldRecords({ season: currentYear, pageSize: 1000 })
      ])

      const totalFields = fields.meta?.pagination?.total || 0
      const totalCrops = crops.meta?.pagination?.total || 0
      const totalActivities = activities.meta?.pagination?.total || 0

      // Calculate active cultivations
      const activeCultivations = cultivation.data?.filter(plan =>
        plan.attributes.status === 'growing' || plan.attributes.status === 'sown'
      ).length || 0

      // Calculate total area under cultivation
      const totalArea = cultivation.data?.reduce((sum, plan) =>
        sum + (plan.attributes.plannedArea || 0), 0) || 0

      // Calculate total yield
      const totalYield = yields.data?.reduce((sum, record) =>
        sum + (record.attributes.totalYield || 0), 0) || 0

      // Calculate average yield per hectare
      const totalHarvestedArea = yields.data?.reduce((sum, record) =>
        sum + (record.attributes.area || 0), 0) || 0
      const averageYield = totalHarvestedArea > 0 ? totalYield / totalHarvestedArea : 0

      return {
        totalFields,
        totalCrops,
        totalActivities,
        activeCultivations,
        totalAreaUnderCultivation: Math.round(totalArea * 100) / 100,
        totalYield: Math.round(totalYield * 100) / 100,
        averageYieldPerHa: Math.round(averageYield * 100) / 100,
        completedActivities: activities.data?.filter(activity =>
          activity.attributes.completed
        ).length || 0
      }
    } catch (error) {
      console.error('Error fetching plant management dashboard data:', error)
      throw error
    }
  }

  /**
   * Get season report
   */
  async getSeasonReport(year, filters = {}) {
    try {
      const [cultivation, activities, yields] = await Promise.all([
        this.getCultivationPlans({ season: year, pageSize: 1000 }),
        this.getFieldActivities({
          dateFrom: `${year}-01-01`,
          dateTo: `${year}-12-31`,
          pageSize: 1000
        }),
        this.getYieldRecords({ season: year, pageSize: 1000 })
      ])

      return {
        year,
        cultivation: cultivation.data || [],
        activities: activities.data || [],
        yields: yields.data || [],
        summary: {
          totalPlannedArea: cultivation.data?.reduce((sum, plan) =>
            sum + (plan.attributes.plannedArea || 0), 0) || 0,
          totalActivities: activities.data?.length || 0,
          totalHarvested: yields.data?.reduce((sum, record) =>
            sum + (record.attributes.totalYield || 0), 0) || 0,
          averageYield: yields.data?.length > 0 ?
            yields.data.reduce((sum, record) => sum + (record.attributes.yieldPerArea || 0), 0) / yields.data.length : 0
        }
      }
    } catch (error) {
      console.error('Error fetching season report:', error)
      throw error
    }
  }

  /**
   * Export plant management data to CSV
   */
  async exportPlantData(type = 'fields', format = 'csv') {
    try {
      let response
      let headers
      let dataRows

      switch (type) {
        case 'fields':
          response = await this.getFields({ pageSize: 1000 })
          headers = ['Nr', 'Name', 'Adresse', 'Größe', 'Status', 'Bemerkung']
          dataRows = (response.data || []).map(field => [
            field.attributes.nr,
            field.attributes.name,
            field.attributes.adresse,
            field.attributes.groesse,
            field.attributes.status,
            field.attributes.bemerkung || ''
          ])
          break

        case 'activities':
          response = await this.getFieldActivities({ pageSize: 1000 })
          headers = ['Datum', 'Feld', 'Aktivität', 'Beschreibung', 'Dauer', 'Abgeschlossen']
          dataRows = (response.data || []).map(activity => [
            activity.attributes.activityDate,
            activity.attributes.field?.data?.attributes?.name || '',
            activity.attributes.activityType,
            activity.attributes.description,
            activity.attributes.duration || 0,
            activity.attributes.completed ? 'Ja' : 'Nein'
          ])
          break

        case 'yields':
          response = await this.getYieldRecords({ pageSize: 1000 })
          headers = ['Erntedatum', 'Feld', 'Pflanze', 'Fläche', 'Gesamtertrag', 'Ertrag/ha', 'Qualität']
          dataRows = (response.data || []).map(record => [
            record.attributes.harvestDate,
            record.attributes.field?.data?.attributes?.name || '',
            record.attributes.crop?.data?.attributes?.name || '',
            record.attributes.area,
            record.attributes.totalYield,
            record.attributes.yieldPerArea,
            record.attributes.quality || ''
          ])
          break

        default:
          throw new Error('Unknown export type')
      }

      if (format === 'csv') {
        const csvContent = [
          headers.join(','),
          ...dataRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        return csvContent
      }

      return { headers, data: dataRows }
    } catch (error) {
      console.error('Error exporting plant management data:', error)
      throw error
    }
  }
}

export default new PlantManagementService()