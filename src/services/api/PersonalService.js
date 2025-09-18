/**
 * PERSONAL API SERVICE
 *
 * API service for HR/Personal module operations
 * Extends BaseApiService for consistent error handling and authentication
 */

import BaseApiService from './BaseApiService.js'

class PersonalService extends BaseApiService {
  constructor() {
    super()
    this.baseUrl = '/workers'
  }

  // =================================================================
  // EMPLOYEE MANAGEMENT
  // =================================================================

  /**
   * Get all employees with optional filtering and pagination
   */
  async getEmployees(options = {}) {
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
      params['filters[name][$containsi]'] = search
    }

    return this.request(`${this.baseUrl}`, 'GET', null, params)
  }

  /**
   * Get single employee by ID
   */
  async getEmployee(id) {
    return this.request(`${this.baseUrl}/${id}`)
  }

  /**
   * Create new employee
   */
  async createEmployee(employeeData) {
    const payload = {
      data: {
        name: employeeData.name,
        birthdate: employeeData.birthdate,
        adress: employeeData.address, // Note: API uses 'adress' (typo)
        entryDate: employeeData.entryDate,
        salary: employeeData.salary,
        workTime: employeeData.workTime,
        qualification: employeeData.qualification,
        role: employeeData.role,
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        status: employeeData.status || 'active'
      }
    }

    return this.request(this.baseUrl, 'POST', payload)
  }

  /**
   * Update existing employee
   */
  async updateEmployee(id, employeeData) {
    const payload = {
      data: {
        name: employeeData.name,
        birthdate: employeeData.birthdate,
        adress: employeeData.address,
        entryDate: employeeData.entryDate,
        salary: employeeData.salary,
        workTime: employeeData.workTime,
        qualification: employeeData.qualification,
        role: employeeData.role,
        email: employeeData.email,
        phone: employeeData.phone,
        status: employeeData.status
      }
    }

    return this.request(`${this.baseUrl}/${id}`, 'PUT', payload)
  }

  /**
   * Delete employee (soft delete - set status to terminated)
   */
  async deleteEmployee(id) {
    return this.request(`${this.baseUrl}/${id}`, 'DELETE')
  }

  /**
   * Deactivate employee (set status to inactive)
   */
  async deactivateEmployee(id) {
    const payload = {
      data: {
        status: 'inactive'
      }
    }

    return this.request(`${this.baseUrl}/${id}`, 'PUT', payload)
  }

  // =================================================================
  // TIME TRACKING
  // =================================================================

  /**
   * Get time entries for employee
   */
  async getTimeEntries(employeeId, options = {}) {
    const {
      startDate,
      endDate,
      status = 'all'
    } = options

    const params = {
      'filters[employee][id][$eq]': employeeId
    }

    if (startDate) {
      params['filters[date][$gte]'] = startDate
    }

    if (endDate) {
      params['filters[date][$lte]'] = endDate
    }

    if (status !== 'all') {
      params['filters[approved][$eq]'] = status === 'approved'
    }

    return this.request('/time-entries', 'GET', null, params)
  }

  /**
   * Create time entry
   */
  async createTimeEntry(timeData) {
    const payload = {
      data: {
        employee: timeData.employeeId,
        date: timeData.date,
        startTime: timeData.startTime,
        endTime: timeData.endTime,
        breakTime: timeData.breakTime || 0,
        description: timeData.description || '',
        approved: false
      }
    }

    return this.request('/time-entries', 'POST', payload)
  }

  /**
   * Update time entry
   */
  async updateTimeEntry(id, timeData) {
    const payload = {
      data: {
        date: timeData.date,
        startTime: timeData.startTime,
        endTime: timeData.endTime,
        breakTime: timeData.breakTime,
        description: timeData.description,
        approved: timeData.approved
      }
    }

    return this.request(`/time-entries/${id}`, 'PUT', payload)
  }

  /**
   * Approve/reject time entries
   */
  async approveTimeEntry(id, approved = true) {
    const payload = {
      data: {
        approved
      }
    }

    return this.request(`/time-entries/${id}`, 'PUT', payload)
  }

  // =================================================================
  // DEPARTMENT MANAGEMENT
  // =================================================================

  /**
   * Get all departments
   */
  async getDepartments() {
    return this.request('/departments')
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(departmentId) {
    const params = {
      'filters[department][id][$eq]': departmentId,
      'populate': ['department']
    }

    return this.request(this.baseUrl, 'GET', null, params)
  }

  // =================================================================
  // REPORTING & ANALYTICS
  // =================================================================

  /**
   * Get employee dashboard data
   */
  async getDashboardData() {
    try {
      const [employees, activeCount, timeEntries] = await Promise.all([
        this.getEmployees({ pageSize: 1000 }),
        this.getEmployees({
          filters: { 'filters[status][$eq]': 'active' },
          pageSize: 1000
        }),
        this.request('/time-entries', 'GET', null, {
          'filters[date][$gte]': new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
          'pagination[pageSize]': 1000
        })
      ])

      const totalEmployees = employees.meta?.pagination?.total || 0
      const activeEmployees = activeCount.meta?.pagination?.total || 0
      const totalHours = timeEntries.data?.reduce((sum, entry) => {
        const start = new Date(`2000-01-01T${entry.attributes.startTime}`)
        const end = new Date(`2000-01-01T${entry.attributes.endTime}`)
        const hours = (end - start) / (1000 * 60 * 60)
        return sum + hours - (entry.attributes.breakTime || 0) / 60
      }, 0) || 0

      return {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        totalHoursThisMonth: Math.round(totalHours * 100) / 100,
        averageHoursPerEmployee: activeEmployees > 0 ? Math.round((totalHours / activeEmployees) * 100) / 100 : 0
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }

  /**
   * Export employee data to CSV
   */
  async exportEmployees(format = 'csv') {
    try {
      const response = await this.getEmployees({ pageSize: 1000 })
      const employees = response.data || []

      if (format === 'csv') {
        const headers = ['Name', 'Geburtsdatum', 'Adresse', 'Eintrittsdatum', 'Gehalt', 'Arbeitszeit', 'Qualifikation', 'Rolle', 'Status']
        const csvContent = [
          headers.join(','),
          ...employees.map(emp => [
            emp.attributes.name,
            emp.attributes.birthdate,
            emp.attributes.adress,
            emp.attributes.entryDate,
            emp.attributes.salary,
            emp.attributes.workTime,
            emp.attributes.qualification,
            emp.attributes.role,
            emp.attributes.status || 'active'
          ].join(','))
        ].join('\n')

        return csvContent
      }

      return employees
    } catch (error) {
      console.error('Error exporting employees:', error)
      throw error
    }
  }
}

export default new PersonalService()