/**
 * MAIN DASHBOARD MODERN
 *
 * Comprehensive agricultural management dashboard with cross-module insights
 * Built with Shadcn components for modern design and functionality
 */

import React, { useState, useEffect } from 'react'
import {
  Activity,
  TrendingUp,
  Users,
  Truck,
  Package,
  MapPin,
  Calendar,
  AlertTriangle,
  BarChart3,
  Clock,
  Euro,
  Sprout
} from 'lucide-react'

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Separator } from '../ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

// API Integration
import { api } from '../../utils/api'

// =================================================================
// COMPONENT
// =================================================================

export default function MainDashboardModern({ onModuleChange }) {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRevenue: 0,
      totalFields: 0,
      activeVehicles: 0,
      totalEmployees: 0,
      pendingOrders: 0,
      lowStockItems: 0
    },
    recentActivities: [],
    upcomingTasks: [],
    moduleMetrics: {
      vertrieb: { orders: 0, revenue: 0, trend: 0 },
      fuhrpark: { vehicles: 0, trips: 0, maintenance: 0 },
      personal: { employees: 0, hours: 0, departments: 0 },
      lagerhaltung: { articles: 0, locations: 0, lowStock: 0 },
      pflanzenmanagement: { fields: 0, activities: 0, yields: 0 }
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  // =================================================================
  // DATA LOADING
  // =================================================================

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load data from all modules in parallel
      const [
        vertriebData,
        fuhrparkData,
        personalData,
        lagerhaltungData,
        pflanzenData
      ] = await Promise.allSettled([
        api.vertrieb.getDashboardData(),
        api.fuhrpark.getDashboardData(),
        api.personal.getDashboardData(),
        api.inventory.getDashboardData(),
        api.plantManagement.getDashboardData()
      ])

      // Process and combine data
      const processedData = {
        overview: {
          totalRevenue: vertriebData.status === 'fulfilled' ? vertriebData.value?.revenue || 0 : 0,
          totalFields: pflanzenData.status === 'fulfilled' ? pflanzenData.value?.totalFields || 0 : 0,
          activeVehicles: fuhrparkData.status === 'fulfilled' ? fuhrparkData.value?.activeVehicles || 0 : 0,
          totalEmployees: personalData.status === 'fulfilled' ? personalData.value?.totalEmployees || 0 : 0,
          pendingOrders: vertriebData.status === 'fulfilled' ? vertriebData.value?.pendingOrders || 0 : 0,
          lowStockItems: lagerhaltungData.status === 'fulfilled' ? lagerhaltungData.value?.lowStockItems || 0 : 0
        },
        recentActivities: [
          // Mock data - in real implementation, this would come from activity logs
          {
            id: 1,
            module: 'pflanzenmanagement',
            type: 'field_activity',
            description: 'Neue Bewässerung auf Feld "Westacker" geplant',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 2,
            module: 'vertrieb',
            type: 'order',
            description: 'Bestellung #1234 von Kunde "Müller GmbH" erstellt',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: 3,
            module: 'fuhrpark',
            type: 'trip',
            description: 'Fahrt mit Fahrzeug "MB-AG 123" beendet',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        ],
        upcomingTasks: [
          {
            id: 1,
            module: 'pflanzenmanagement',
            title: 'Düngung Nordfeld',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            priority: 'high'
          },
          {
            id: 2,
            module: 'fuhrpark',
            title: 'TÜV Prüfung LKW-001',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            priority: 'medium'
          },
          {
            id: 3,
            module: 'lagerhaltung',
            title: 'Inventur Lager Nord',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            priority: 'low'
          }
        ],
        moduleMetrics: {
          vertrieb: {
            orders: vertriebData.status === 'fulfilled' ? vertriebData.value?.totalOrders || 0 : 0,
            revenue: vertriebData.status === 'fulfilled' ? vertriebData.value?.revenue || 0 : 0,
            trend: vertriebData.status === 'fulfilled' ? vertriebData.value?.trend || 0 : 0
          },
          fuhrpark: {
            vehicles: fuhrparkData.status === 'fulfilled' ? fuhrparkData.value?.totalVehicles || 0 : 0,
            trips: fuhrparkData.status === 'fulfilled' ? fuhrparkData.value?.totalTrips || 0 : 0,
            maintenance: fuhrparkData.status === 'fulfilled' ? fuhrparkData.value?.maintenance || 0 : 0
          },
          personal: {
            employees: personalData.status === 'fulfilled' ? personalData.value?.totalEmployees || 0 : 0,
            hours: personalData.status === 'fulfilled' ? personalData.value?.totalHours || 0 : 0,
            departments: personalData.status === 'fulfilled' ? personalData.value?.departments || 0 : 0
          },
          lagerhaltung: {
            articles: lagerhaltungData.status === 'fulfilled' ? lagerhaltungData.value?.totalArticles || 0 : 0,
            locations: lagerhaltungData.status === 'fulfilled' ? lagerhaltungData.value?.locations || 0 : 0,
            lowStock: lagerhaltungData.status === 'fulfilled' ? lagerhaltungData.value?.lowStockItems || 0 : 0
          },
          pflanzenmanagement: {
            fields: pflanzenData.status === 'fulfilled' ? pflanzenData.value?.totalFields || 0 : 0,
            activities: pflanzenData.status === 'fulfilled' ? pflanzenData.value?.activities || 0 : 0,
            yields: pflanzenData.status === 'fulfilled' ? pflanzenData.value?.yields || 0 : 0
          }
        }
      }

      setDashboardData(processedData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatRelativeTime = (date) => {
    const now = new Date()
    const diff = Math.abs(now - date)
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return 'vor wenigen Minuten'
    if (hours === 1) return 'vor 1 Stunde'
    if (hours < 24) return `vor ${hours} Stunden`

    const days = Math.floor(hours / 24)
    if (days === 1) return 'vor 1 Tag'
    return `vor ${days} Tagen`
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getModuleIcon = (module) => {
    switch (module) {
      case 'vertrieb': return <Euro className="h-4 w-4" />
      case 'fuhrpark': return <Truck className="h-4 w-4" />
      case 'personal': return <Users className="h-4 w-4" />
      case 'lagerhaltung': return <Package className="h-4 w-4" />
      case 'pflanzenmanagement': return <Sprout className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Übersicht über alle Module und Aktivitäten
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Zeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Letzte 7 Tage</SelectItem>
              <SelectItem value="30">Letzte 30 Tage</SelectItem>
              <SelectItem value="90">Letzte 90 Tage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umsatz</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.overview.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Letzte {timeRange} Tage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Felder</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.totalFields}</div>
            <p className="text-xs text-muted-foreground">
              Bewirtschaftete Flächen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fahrzeuge</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.activeVehicles}</div>
            <p className="text-xs text-muted-foreground">
              Aktive Fahrzeuge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitarbeiter</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Beschäftigte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bestellungen</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Ausstehend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lagerbestand</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Niedrige Bestände
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Module Quick Access */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Module</CardTitle>
            <CardDescription>
              Schnellzugriff auf alle Bereiche
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vertrieb */}
            <div
              className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onModuleChange?.('vertrieb')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Euro className="h-5 w-5" />
                  <h3 className="font-medium">Vertrieb</h3>
                </div>
                <Badge variant="outline">{dashboardData.moduleMetrics.vertrieb.orders}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Aufträge & Kunden</p>
              <div className="text-sm">
                Umsatz: {formatCurrency(dashboardData.moduleMetrics.vertrieb.revenue)}
              </div>
            </div>

            {/* Fuhrpark */}
            <div
              className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onModuleChange?.('fuhrpark')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <h3 className="font-medium">Fuhrpark</h3>
                </div>
                <Badge variant="outline">{dashboardData.moduleMetrics.fuhrpark.vehicles}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Fahrzeuge & Fahrten</p>
              <div className="text-sm">
                Fahrten: {dashboardData.moduleMetrics.fuhrpark.trips}
              </div>
            </div>

            {/* Personal */}
            <div
              className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onModuleChange?.('personal')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <h3 className="font-medium">Personal</h3>
                </div>
                <Badge variant="outline">{dashboardData.moduleMetrics.personal.employees}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Mitarbeiter & Zeiten</p>
              <div className="text-sm">
                Stunden: {dashboardData.moduleMetrics.personal.hours}
              </div>
            </div>

            {/* Lagerhaltung */}
            <div
              className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onModuleChange?.('lagerhaltung')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <h3 className="font-medium">Lagerhaltung</h3>
                </div>
                <Badge variant="outline">{dashboardData.moduleMetrics.lagerhaltung.articles}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Artikel & Bestände</p>
              <div className="text-sm">
                Lagerorte: {dashboardData.moduleMetrics.lagerhaltung.locations}
              </div>
            </div>

            {/* Pflanzenmanagement */}
            <div
              className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onModuleChange?.('pflanzenmanagement')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Sprout className="h-5 w-5" />
                  <h3 className="font-medium">Pflanzenmanagement</h3>
                </div>
                <Badge variant="outline">{dashboardData.moduleMetrics.pflanzenmanagement.fields}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Felder & Kulturen</p>
              <div className="text-sm">
                Aktivitäten: {dashboardData.moduleMetrics.pflanzenmanagement.activities}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
            <CardDescription>
              Neueste Änderungen in allen Modulen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getModuleIcon(activity.module)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Anstehende Aufgaben</CardTitle>
          <CardDescription>
            Wichtige Termine und Aufgaben in den nächsten Tagen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getModuleIcon(task.module)}
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Fällig: {task.dueDate.toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                <Badge variant={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}