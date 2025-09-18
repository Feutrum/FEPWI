/**
 * AUFTRAGSMANAGEMENT - Order Management Page
 *
 * User Stories: VT-05, VT-06 - Order conversion and status management
 * VT-05: Als Vertriebsmitarbeiter möchte ich Angebote in Aufträge umwandeln können
 * VT-06: Als Auftragsbearbeiter möchte ich den Status von Aufträgen ändern können
 *
 * Features:
 * - Convert offers to orders
 * - Order status management
 * - Order listing and filtering
 * - Order details view
 * - Status tracking and updates
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Package,
  Truck,
  User,
  Calendar,
  Euro,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  ArrowUpDown,
  FileText
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { toast } from 'sonner'

// Components
import OfferToOrderConverter from '../components/OfferToOrderConverter'
import OrderStatusUpdater from '../components/OrderStatusUpdater'
import DeliveryAssigner from '../components/DeliveryAssigner'

// API Integration
import { api } from '../../../utils/api'

export default function Auftragsmanagement() {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [orders, setOrders] = useState([])
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Dialog States
  const [isConverterOpen, setIsConverterOpen] = useState(false)
  const [isStatusUpdaterOpen, setIsStatusUpdaterOpen] = useState(false)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
  const [isDeliveryAssignerOpen, setIsDeliveryAssignerOpen] = useState(false)

  // Filter States
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('orders')

  // =================================================================
  // DATA FETCHING
  // =================================================================

  /**
   * Load orders from API
   */
  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await api.vertrieb.getOrders({
        sort: 'createdAt:desc',
        pagination: { pageSize: 100 }
      })

      setOrders(response.data || [])

    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Fehler beim Laden der Aufträge', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load convertible offers (status: angenommen)
   */
  const loadConvertibleOffers = async () => {
    try {
      const response = await api.vertrieb.getOffers({
        filters: { status: 'angenommen' },
        sort: 'createdAt:desc',
        pagination: { pageSize: 50 }
      })

      // Filter out offers that already have orders
      const availableOffers = (response.data || []).filter(offer => {
        const attrs = offer.attributes || offer
        return !attrs.auftrag
      })

      setOffers(availableOffers)

    } catch (error) {
      console.error('Error loading offers:', error)
      toast.error('Fehler beim Laden der Angebote')
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadOrders()
    loadConvertibleOffers()
  }, [])

  // =================================================================
  // ORDER OPERATIONS
  // =================================================================

  /**
   * Handle order conversion from offer
   */
  const handleConvertOffer = async (offerId, orderData) => {
    try {
      const response = await api.vertrieb.createOrderFromOffer(offerId, orderData)

      setOrders(prev => [response.data, ...prev])
      setIsConverterOpen(false)

      // Refresh offers list
      loadConvertibleOffers()

      toast.success('Auftrag erfolgreich erstellt', {
        description: 'Das Angebot wurde in einen Auftrag umgewandelt'
      })

    } catch (error) {
      console.error('Error converting offer:', error)
      toast.error('Fehler beim Umwandeln des Angebots', {
        description: error.message
      })
    }
  }

  /**
   * Handle order status update
   */
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.vertrieb.updateOrderStatus(orderId, newStatus)

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? response.data : order
        )
      )

      setIsStatusUpdaterOpen(false)
      setSelectedOrder(null)

      toast.success('Status erfolgreich aktualisiert', {
        description: `Auftrag wurde auf "${getStatusDisplayText(newStatus)}" gesetzt`
      })

    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Fehler beim Aktualisieren des Status', {
        description: error.message
      })
    }
  }

  /**
   * Handle delivery assignment
   */
  const handleAssignDelivery = async (orderId, assignmentData) => {
    try {
      const response = await api.vertrieb.updateOrder(orderId, assignmentData)

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? response.data : order
        )
      )

      setIsDeliveryAssignerOpen(false)
      setSelectedOrder(null)

      toast.success('Lieferung erfolgreich zugewiesen', {
        description: 'Fahrer und Fahrzeug wurden dem Auftrag zugewiesen'
      })

    } catch (error) {
      console.error('Error assigning delivery:', error)
      toast.error('Fehler beim Zuweisen der Lieferung', {
        description: error.message
      })
    }
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  /**
   * Filter orders based on search term and status
   */
  const filteredOrders = orders.filter(order => {
    const attrs = order.attributes || order
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch = (
      attrs.aufid?.toLowerCase().includes(searchLower) ||
      attrs.angebot?.data?.attributes?.kunde?.data?.attributes?.name?.toLowerCase().includes(searchLower) ||
      attrs.fahrzeug?.data?.attributes?.bezeichnung?.toLowerCase().includes(searchLower)
    )

    const matchesStatus = statusFilter === 'all' || attrs.status === statusFilter

    return matchesSearch && matchesStatus
  })

  /**
   * Get filtered offers for conversion
   */
  const filteredOffers = offers.filter(offer => {
    const attrs = offer.attributes || offer
    const searchLower = searchTerm.toLowerCase()

    return (
      attrs.anid?.toLowerCase().includes(searchLower) ||
      attrs.kunde?.data?.attributes?.name?.toLowerCase().includes(searchLower) ||
      attrs.beschreibung?.toLowerCase().includes(searchLower)
    )
  })

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Unbekannt'
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  /**
   * Get status badge variant and icon
   */
  const getStatusInfo = (status) => {
    switch (status) {
      case 'offen':
        return { variant: 'secondary', icon: Clock, text: 'Offen' }
      case 'in_bearbeitung':
        return { variant: 'default', icon: Package, text: 'In Bearbeitung' }
      case 'in_lieferung':
        return { variant: 'default', icon: Truck, text: 'In Lieferung' }
      case 'geliefert':
        return { variant: 'success', icon: CheckCircle, text: 'Geliefert' }
      case 'storniert':
        return { variant: 'destructive', icon: XCircle, text: 'Storniert' }
      default:
        return { variant: 'secondary', icon: AlertCircle, text: status || 'Unbekannt' }
    }
  }

  /**
   * Get status display text
   */
  const getStatusDisplayText = (status) => {
    return getStatusInfo(status).text
  }

  /**
   * Get order statistics
   */
  const getOrderStats = () => {
    return {
      total: orders.length,
      offen: orders.filter(o => (o.attributes || o).status === 'offen').length,
      in_bearbeitung: orders.filter(o => (o.attributes || o).status === 'in_bearbeitung').length,
      in_lieferung: orders.filter(o => (o.attributes || o).status === 'in_lieferung').length,
      geliefert: orders.filter(o => (o.attributes || o).status === 'geliefert').length,
      storniert: orders.filter(o => (o.attributes || o).status === 'storniert').length
    }
  }

  const stats = getOrderStats()

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auftragsmanagement</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Aufträge und wandeln Sie Angebote um
          </p>
        </div>

        <Button
          onClick={() => setIsConverterOpen(true)}
          className="gap-2"
          disabled={offers.length === 0}
        >
          <Plus className="h-4 w-4" />
          Angebot umwandeln
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.offen}</div>
            <p className="text-xs text-muted-foreground">Offen</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.in_bearbeitung}</div>
            <p className="text-xs text-muted-foreground">In Bearbeitung</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.in_lieferung}</div>
            <p className="text-xs text-muted-foreground">In Lieferung</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.geliefert}</div>
            <p className="text-xs text-muted-foreground">Geliefert</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.storniert}</div>
            <p className="text-xs text-muted-foreground">Storniert</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            Aufträge ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="offers">
            <FileText className="h-4 w-4 mr-2" />
            Umwandelbare Angebote ({offers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Suchen nach Auftrags-ID, Kunde oder Fahrzeug..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="offen">Offen</SelectItem>
                    <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                    <SelectItem value="in_lieferung">In Lieferung</SelectItem>
                    <SelectItem value="geliefert">Geliefert</SelectItem>
                    <SelectItem value="storniert">Storniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Aufträge</CardTitle>
              <CardDescription>
                Übersicht aller Aufträge mit Status und Details
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Lade Aufträge...</div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Keine Aufträge gefunden'
                      : 'Noch keine Aufträge vorhanden'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && offers.length > 0 && (
                    <Button
                      onClick={() => setIsConverterOpen(true)}
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Erstes Angebot umwandeln
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Auftrags-ID</TableHead>
                      <TableHead>Kunde</TableHead>
                      <TableHead>Gesamtpreis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Auftragsdatum</TableHead>
                      <TableHead>Lieferdatum</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredOrders.map((order) => {
                      const attrs = order.attributes || order
                      const statusInfo = getStatusInfo(attrs.status)
                      const StatusIcon = statusInfo.icon

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {attrs.aufid || `AUF-${order.id}`}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {attrs.angebot?.data?.attributes?.kunde?.data?.attributes?.name || 'Unbekannt'}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Euro className="h-3 w-3" />
                              {formatCurrency(attrs.gesamtpreis)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant={statusInfo.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.text}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {formatDate(attrs.auftragsdatum)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {formatDate(attrs.lieferdatum)}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>

                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setIsOrderDetailsOpen(true)
                                  }}
                                  className="gap-2"
                                >
                                  <FileText className="h-4 w-4" />
                                  Details anzeigen
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setIsStatusUpdaterOpen(true)
                                  }}
                                  className="gap-2"
                                >
                                  <ArrowUpDown className="h-4 w-4" />
                                  Status ändern
                                </DropdownMenuItem>

                                {(attrs.status === 'in_bearbeitung' || attrs.status === 'in_lieferung') && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedOrder(order)
                                      setIsDeliveryAssignerOpen(true)
                                    }}
                                    className="gap-2"
                                  >
                                    <Truck className="h-4 w-4" />
                                    Lieferung zuweisen
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          {/* Convertible Offers */}
          <Card>
            <CardHeader>
              <CardTitle>Umwandelbare Angebote</CardTitle>
              <CardDescription>
                Angenommene Angebote, die in Aufträge umgewandelt werden können
              </CardDescription>
            </CardHeader>

            <CardContent>
              {offers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Keine umwandelbaren Angebote vorhanden
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Angebote müssen den Status "Angenommen" haben, um umgewandelt werden zu können
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Angebots-ID</TableHead>
                      <TableHead>Kunde</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead>Gesamtpreis</TableHead>
                      <TableHead>Gültigkeitsdatum</TableHead>
                      <TableHead className="text-right">Aktion</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredOffers.map((offer) => {
                      const attrs = offer.attributes || offer

                      return (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium">
                            {attrs.anid || `ANB-${offer.id}`}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {attrs.kunde?.data?.attributes?.name || 'Unbekannt'}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="max-w-[200px] truncate">
                              {attrs.beschreibung || 'Keine Beschreibung'}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Euro className="h-3 w-3" />
                              {formatCurrency(attrs.gesamtpreis)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {formatDate(attrs.gueltigkeitsdatum)}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(offer)
                                setIsConverterOpen(true)
                              }}
                              className="gap-2"
                            >
                              <ArrowUpDown className="h-4 w-4" />
                              Umwandeln
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Offer to Order Converter Dialog */}
      <Dialog open={isConverterOpen} onOpenChange={setIsConverterOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Angebot in Auftrag umwandeln</DialogTitle>
            <DialogDescription>
              Wandeln Sie das ausgewählte Angebot in einen Auftrag um
            </DialogDescription>
          </DialogHeader>

          <OfferToOrderConverter
            offers={offers}
            selectedOffer={selectedOrder}
            onSubmit={handleConvertOffer}
            onCancel={() => {
              setIsConverterOpen(false)
              setSelectedOrder(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Order Status Updater Dialog */}
      <Dialog open={isStatusUpdaterOpen} onOpenChange={setIsStatusUpdaterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auftragsstatus ändern</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie den Status des ausgewählten Auftrags
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <OrderStatusUpdater
              order={selectedOrder}
              onSubmit={handleUpdateOrderStatus}
              onCancel={() => {
                setIsStatusUpdaterOpen(false)
                setSelectedOrder(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Auftragsdetails</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order details content would go here */}
              <p>Auftragsdetails für {(selectedOrder.attributes || selectedOrder).aufid}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsOrderDetailsOpen(false)
                setSelectedOrder(null)
              }}
            >
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Assigner Dialog */}
      <Dialog open={isDeliveryAssignerOpen} onOpenChange={setIsDeliveryAssignerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lieferung zuweisen</DialogTitle>
            <DialogDescription>
              Weisen Sie dem Auftrag einen Fahrer und ein Fahrzeug zu
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <DeliveryAssigner
              order={selectedOrder}
              onSubmit={handleAssignDelivery}
              onCancel={() => {
                setIsDeliveryAssignerOpen(false)
                setSelectedOrder(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}