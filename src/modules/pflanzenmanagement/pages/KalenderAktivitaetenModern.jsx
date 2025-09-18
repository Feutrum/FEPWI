/**
 * CALENDAR ACTIVITIES PAGE
 *
 * Modern agricultural calendar with activity management
 * Combines field activities, cultivation planning and calendar view
 *
 * Features:
 * - Interactive calendar with activity visualization
 * - Field activities management
 * - Activity creation and tracking
 * - Weather integration
 * - Export functionality
 *
 * @author BEPWI Development Team
 * @version 2.0 (Shadcn Migration)
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Download,
  Activity,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Cloud,
  Search
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
import { Calendar } from '../../../components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// Components
import ActivityFormModal from '../components/ActivityFormModal'

// =================================================================
// COMPONENT
// =================================================================

export default function KalenderAktivitaetenModern() {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [loading, setLoading] = useState(true)
  const [fields, setFields] = useState([])
  const [activities, setActivities] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  // Filters
  const [selectedField, setSelectedField] = useState('all')
  const [activityTypeFilter, setActivityTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)

  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalActivities: 0,
    completedActivities: 0,
    upcomingActivities: 0,
    overdueActivities: 0
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadFields()
    loadActivities()
    loadDashboardData()
  }, [])

  /**
   * Reload activities when filters change
   */
  useEffect(() => {
    loadActivities()
  }, [selectedField, activityTypeFilter, statusFilter, selectedMonth])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load available fields
   */
  const loadFields = async () => {
    try {
      const response = await api.plantManagement.getFields({ pageSize: 1000 })
      setFields(response.data || [])
    } catch (error) {
      console.error('Error loading fields:', error)
      toast.error('Fehler beim Laden der Felder')
    }
  }

  /**
   * Load activities for the selected month
   */
  const loadActivities = async () => {
    try {
      setLoading(true)

      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth() + 1
      const dateFrom = `${year}-${month.toString().padStart(2, '0')}-01`
      const dateTo = `${year}-${month.toString().padStart(2, '0')}-31`

      const options = {
        pageSize: 1000,
        dateFrom,
        dateTo,
        fieldId: selectedField !== 'all' ? parseInt(selectedField) : undefined,
        activityType: activityTypeFilter !== 'all' ? activityTypeFilter : undefined
      }

      const response = await api.plantManagement.getFieldActivities(options)
      setActivities(response.data || [])
    } catch (error) {
      console.error('Error loading activities:', error)
      toast.error('Fehler beim Laden der Aktivitäten')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    try {
      const currentYear = new Date().getFullYear()
      const response = await api.plantManagement.getFieldActivities({
        pageSize: 1000,
        dateFrom: `${currentYear}-01-01`,
        dateTo: `${currentYear}-12-31`
      })

      const allActivities = response.data || []
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const completed = allActivities.filter(activity => activity.attributes.completed).length
      const upcoming = allActivities.filter(activity => {
        const activityDate = new Date(activity.attributes.activityDate)
        return !activity.attributes.completed && activityDate >= today
      }).length
      const overdue = allActivities.filter(activity => {
        const activityDate = new Date(activity.attributes.activityDate)
        return !activity.attributes.completed && activityDate < today
      }).length

      setDashboardData({
        totalActivities: allActivities.length,
        completedActivities: completed,
        upcomingActivities: upcoming,
        overdueActivities: overdue
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  // =================================================================
  // CALCULATIONS
  // =================================================================

  /**
   * Get activities for a specific date
   */
  const getActivitiesForDate = (date) => {
    const dateString = date.toISOString().split('T')[0]
    return activities.filter(activity =>
      activity.attributes.activityDate === dateString
    )
  }

  /**
   * Get filtered activities for the activity list
   */
  const filteredActivities = useMemo(() => {
    let filtered = [...activities]

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(activity =>
        activity.attributes.description.toLowerCase().includes(searchLower) ||
        activity.attributes.field?.data?.attributes?.name?.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        filtered = filtered.filter(activity => activity.attributes.completed)
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(activity => !activity.attributes.completed)
      } else if (statusFilter === 'overdue') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        filtered = filtered.filter(activity => {
          const activityDate = new Date(activity.attributes.activityDate)
          return !activity.attributes.completed && activityDate < today
        })
      }
    }

    return filtered.sort((a, b) =>
      new Date(a.attributes.activityDate) - new Date(b.attributes.activityDate)
    )
  }, [activities, searchTerm, statusFilter])

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Handle activity creation
   */
  const handleCreateActivity = (date = null) => {
    setSelectedActivity(null)
    if (date) {
      // Pre-fill with selected date
      setSelectedActivity({ prefilledDate: date.toISOString().split('T')[0] })
    }
    setShowActivityModal(true)
  }

  /**
   * Handle activity editing
   */
  const handleEditActivity = (activity) => {
    setSelectedActivity(activity)
    setShowActivityModal(true)
  }

  /**
   * Handle successful activity form submission
   */
  const handleActivityFormSuccess = () => {
    loadActivities()
    loadDashboardData()
  }

  /**
   * Export activities
   */
  const handleExport = async () => {
    try {
      const csvContent = await api.plantManagement.exportPlantData('activities', 'csv')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `aktivitaeten-${selectedMonth.getFullYear()}-${selectedMonth.getMonth() + 1}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Export erfolgreich')
    } catch (error) {
      console.error('Error exporting activities:', error)
      toast.error('Fehler beim Export')
    }
  }

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================

  /**
   * Get activity type icon and color
   */
  const getActivityTypeInfo = (type) => {
    const typeMap = {
      sowing: { label: 'Aussaat', color: 'bg-green-100 text-green-800' },
      planting: { label: 'Pflanzen', color: 'bg-green-100 text-green-800' },
      fertilizing: { label: 'Düngung', color: 'bg-yellow-100 text-yellow-800' },
      watering: { label: 'Bewässerung', color: 'bg-blue-100 text-blue-800' },
      weeding: { label: 'Unkraut', color: 'bg-orange-100 text-orange-800' },
      pest_control: { label: 'Schädlingsbekämpfung', color: 'bg-red-100 text-red-800' },
      harvesting: { label: 'Ernte', color: 'bg-purple-100 text-purple-800' },
      tilling: { label: 'Bodenbearbeitung', color: 'bg-gray-100 text-gray-800' },
      maintenance: { label: 'Wartung', color: 'bg-gray-100 text-gray-800' },
      other: { label: 'Sonstiges', color: 'bg-gray-100 text-gray-800' }
    }
    return typeMap[type] || typeMap.other
  }

  /**
   * Get status badge
   */
  const getStatusBadge = (activity) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activityDate = new Date(activity.attributes.activityDate)

    if (activity.attributes.completed) {
      return <Badge variant="default">Abgeschlossen</Badge>
    } else if (activityDate < today) {
      return <Badge variant="destructive">Überfällig</Badge>
    } else {
      return <Badge variant="secondary">Geplant</Badge>
    }
  }

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kalender & Aktivitäten</h1>
          <p className="text-muted-foreground">
            Planen und verwalten Sie Ihre Feldaktivitäten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => handleCreateActivity()}>
            <Plus className="h-4 w-4 mr-2" />
            Aktivität hinzufügen
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              Aktivitäten dieses Jahr
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.completedActivities}</div>
            <p className="text-xs text-muted-foreground">
              Erledigte Aufgaben
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geplant</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.upcomingActivities}</div>
            <p className="text-xs text-muted-foreground">
              Bevorstehende Aufgaben
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Überfällig</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.overdueActivities}</div>
            <p className="text-xs text-muted-foreground">
              Verpasste Termine
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Kalender
            </CardTitle>
            <CardDescription>
              Wählen Sie ein Datum für Aktivitäten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onMonthChange={setSelectedMonth}
              className="rounded-md border"
              modifiers={{
                hasActivities: (date) => getActivitiesForDate(date).length > 0
              }}
              modifiersClassNames={{
                hasActivities: 'bg-primary/10 text-primary'
              }}
            />

            {selectedDate && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">
                  Aktivitäten für {formatDate(selectedDate.toISOString())}
                </h4>
                {getActivitiesForDate(selectedDate).length > 0 ? (
                  <div className="space-y-2">
                    {getActivitiesForDate(selectedDate).map((activity) => {
                      const typeInfo = getActivityTypeInfo(activity.attributes.activityType)
                      return (
                        <div key={activity.id} className="p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                            {getStatusBadge(activity)}
                          </div>
                          <p className="text-sm mt-1">{activity.attributes.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.attributes.field?.data?.attributes?.name}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Keine Aktivitäten</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCreateActivity(selectedDate)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aktivität hinzufügen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktivitäten ({filteredActivities.length})</CardTitle>
            <CardDescription>
              Alle Feldaktivitäten für {selectedMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Aktivitäten suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Feld" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Felder</SelectItem>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id.toString()}>
                      {field.attributes.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="sowing">Aussaat</SelectItem>
                  <SelectItem value="fertilizing">Düngung</SelectItem>
                  <SelectItem value="harvesting">Ernte</SelectItem>
                  <SelectItem value="maintenance">Wartung</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="pending">Geplant</SelectItem>
                  <SelectItem value="overdue">Überfällig</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activities List */}
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity) => {
                  const typeInfo = getActivityTypeInfo(activity.attributes.activityType)
                  return (
                    <div key={activity.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                         onClick={() => handleEditActivity(activity)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                            {getStatusBadge(activity)}
                          </div>
                          <h4 className="font-medium">{activity.attributes.description}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {activity.attributes.field?.data?.attributes?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {formatDate(activity.attributes.activityDate)}
                            </span>
                            {activity.attributes.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.attributes.duration}h
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredActivities.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Keine Aktivitäten gefunden.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Form Modal */}
      <ActivityFormModal
        open={showActivityModal}
        onOpenChange={setShowActivityModal}
        activity={selectedActivity}
        fields={fields}
        onSuccess={handleActivityFormSuccess}
      />
    </div>
  )
}