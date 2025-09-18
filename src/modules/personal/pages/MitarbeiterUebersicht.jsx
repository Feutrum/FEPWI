/**
 * EMPLOYEE OVERVIEW PAGE
 *
 * Modern employee management dashboard with Shadcn components
 * Replaces old Material-UI implementation with modern data table
 *
 * Features:
 * - Employee data table with sorting and filtering
 * - Dashboard cards with employee metrics
 * - CRUD operations with modern forms
 * - Export functionality
 *
 * @author BEPWI Development Team
 * @version 2.0 (Shadcn Migration)
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// Components
import EmployeeFormModal from '../components/EmployeeFormModal'

// =================================================================
// COMPONENT
// =================================================================

export default function MitarbeiterUebersicht() {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalHoursThisMonth: 0,
    averageHoursPerEmployee: 0
  })

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  // Modal states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load dashboard data and employees on mount
   */
  useEffect(() => {
    loadDashboardData()
    loadEmployees()
  }, [])

  /**
   * Reload employees when filters change
   */
  useEffect(() => {
    loadEmployees()
  }, [statusFilter, roleFilter, searchTerm])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load dashboard overview data
   */
  const loadDashboardData = async () => {
    try {
      const response = await api.personal.getDashboardData()
      setDashboardData(response)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Fehler beim Laden der Dashboard-Daten')
    }
  }

  /**
   * Load employees with current filters
   */
  const loadEmployees = async () => {
    try {
      setLoading(true)

      const options = {
        pageSize: 100,
        search: searchTerm,
        filters: {}
      }

      if (statusFilter !== 'all') {
        options.filters['filters[status][$eq]'] = statusFilter
      }

      if (roleFilter !== 'all') {
        options.filters['filters[role][$eq]'] = roleFilter
      }

      const response = await api.personal.getEmployees(options)
      setEmployees(response.data || [])
    } catch (error) {
      console.error('Error loading employees:', error)
      toast.error('Fehler beim Laden der Mitarbeiter')
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Export employees to CSV
   */
  const handleExport = async () => {
    try {
      const csvContent = await api.personal.exportEmployees('csv')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `mitarbeiter-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Export erfolgreich')
    } catch (error) {
      console.error('Error exporting employees:', error)
      toast.error('Fehler beim Export')
    }
  }

  /**
   * Delete employee
   */
  const handleDelete = async (employeeId) => {
    if (!confirm('Möchten Sie diesen Mitarbeiter wirklich löschen?')) {
      return
    }

    try {
      await api.personal.deleteEmployee(employeeId)
      toast.success('Mitarbeiter erfolgreich gelöscht')
      loadEmployees()
      loadDashboardData()
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error('Fehler beim Löschen des Mitarbeiters')
    }
  }

  /**
   * Deactivate employee
   */
  const handleDeactivate = async (employeeId) => {
    try {
      await api.personal.deactivateEmployee(employeeId)
      toast.success('Mitarbeiter deaktiviert')
      loadEmployees()
      loadDashboardData()
    } catch (error) {
      console.error('Error deactivating employee:', error)
      toast.error('Fehler beim Deaktivieren des Mitarbeiters')
    }
  }

  /**
   * Open employee modal for creating new employee
   */
  const handleCreateEmployee = () => {
    setSelectedEmployee(null)
    setShowEmployeeModal(true)
  }

  /**
   * Open employee modal for editing existing employee
   */
  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee)
    setShowEmployeeModal(true)
  }

  /**
   * Handle successful employee form submission
   */
  const handleEmployeeFormSuccess = () => {
    loadEmployees()
    loadDashboardData()
  }

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================

  /**
   * Get status badge variant
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Aktiv</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inaktiv</Badge>
      case 'terminated':
        return <Badge variant="destructive">Beendet</Badge>
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  /**
   * Get role display name
   */
  const getRoleDisplayName = (role) => {
    const roleMap = {
      hr: 'Personal',
      manager: 'Manager',
      employee: 'Mitarbeiter',
      admin: 'Administrator'
    }
    return roleMap[role] || role
  }

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Übersicht</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Mitarbeiter und deren Arbeitszeiten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateEmployee}>
            <UserPlus className="h-4 w-4 mr-2" />
            Mitarbeiter hinzufügen
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Alle Mitarbeiter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiv</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Aktive Mitarbeiter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inaktiv</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.inactiveEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Inaktive Mitarbeiter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stunden/Monat</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.totalHoursThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Gesamtstunden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Stunden</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{dashboardData.averageHoursPerEmployee}</div>
            <p className="text-xs text-muted-foreground">
              Pro Mitarbeiter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Mitarbeiter suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="inactive">Inaktiv</SelectItem>
            <SelectItem value="terminated">Beendet</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rolle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Rollen</SelectItem>
            <SelectItem value="hr">Personal</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="employee">Mitarbeiter</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mitarbeiter ({employees.length})</CardTitle>
          <CardDescription>
            Übersicht aller Mitarbeiter mit Details und Aktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Geburtsdatum</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Eintrittsdatum</TableHead>
                  <TableHead>Gehalt</TableHead>
                  <TableHead>Arbeitszeit</TableHead>
                  <TableHead>Qualifikation</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.attributes.name}
                    </TableCell>
                    <TableCell>
                      {formatDate(employee.attributes.birthdate)}
                    </TableCell>
                    <TableCell>
                      {employee.attributes.adress}
                    </TableCell>
                    <TableCell>
                      {formatDate(employee.attributes.entryDate)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(employee.attributes.salary)}
                    </TableCell>
                    <TableCell>
                      {employee.attributes.workTime}h/Woche
                    </TableCell>
                    <TableCell>
                      {employee.attributes.qualification}
                    </TableCell>
                    <TableCell>
                      {getRoleDisplayName(employee.attributes.role)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(employee.attributes.status || 'active')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Aktionen öffnen</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeactivate(employee.id)}>
                            <UserX className="mr-2 h-4 w-4" />
                            Deaktivieren
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                            ? 'Keine Mitarbeiter gefunden, die den Filterkriterien entsprechen.'
                            : 'Noch keine Mitarbeiter angelegt.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Employee Form Modal */}
      <EmployeeFormModal
        open={showEmployeeModal}
        onOpenChange={setShowEmployeeModal}
        employee={selectedEmployee}
        onSuccess={handleEmployeeFormSuccess}
      />
    </div>
  )
}
