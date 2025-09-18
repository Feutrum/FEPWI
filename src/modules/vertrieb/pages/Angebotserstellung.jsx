/**
 * ANGEBOTSERSTELLUNG - Offer Creation Page
 *
 * User Stories: VT-03, VT-04 - Multi-step offer creation and editing
 * VT-03: Als Vertriebsmitarbeiter möchte ich für Kunden Angebote mit ausgewählten Produkten und Preisen erstellen können
 * VT-04: Als Vertriebsmitarbeiter möchte ich bestehende Angebote anpassen können
 *
 * Features:
 * - Multi-step offer creation wizard
 * - Customer selection
 * - Article selection with availability check
 * - Pricing and terms configuration
 * - Offer review and creation
 * - Edit existing offers
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  ShoppingCart,
  Calculator,
  FileText,
  Check,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  User,
  Package,
  Calendar,
  Euro
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
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { toast } from 'sonner'

// Components
import OfferWizard from '../components/OfferWizard'

// API Integration
import { api } from '../../../utils/api'

export default function Angebotserstellung() {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOffer, setSelectedOffer] = useState(null)

  // Dialog States
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false)
  const [isEditWizardOpen, setIsEditWizardOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [offerToDelete, setOfferToDelete] = useState(null)

  // Filter States
  const [statusFilter, setStatusFilter] = useState('all')

  // =================================================================
  // DATA FETCHING
  // =================================================================

  /**
   * Load offers from API
   */
  const loadOffers = async () => {
    try {
      setLoading(true)
      const response = await api.vertrieb.getOffers({
        sort: 'createdAt:desc',
        pagination: { pageSize: 100 }
      })

      setOffers(response.data || [])

    } catch (error) {
      console.error('Error loading offers:', error)
      toast.error('Fehler beim Laden der Angebote', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  // Load offers on component mount
  useEffect(() => {
    loadOffers()
  }, [])

  // =================================================================
  // OFFER OPERATIONS
  // =================================================================

  /**
   * Handle offer creation
   */
  const handleCreateOffer = async (offerData) => {
    try {
      const response = await api.vertrieb.createOffer(offerData)

      setOffers(prev => [response.data, ...prev])
      setIsCreateWizardOpen(false)

      toast.success('Angebot erfolgreich erstellt', {
        description: `Angebot für ${offerData.kunde?.name} wurde erstellt`
      })

    } catch (error) {
      console.error('Error creating offer:', error)
      toast.error('Fehler beim Erstellen des Angebots', {
        description: error.message
      })
    }
  }

  /**
   * Handle offer update
   */
  const handleUpdateOffer = async (offerData) => {
    try {
      const response = await api.vertrieb.updateOffer(selectedOffer.id, offerData)

      setOffers(prev =>
        prev.map(offer =>
          offer.id === selectedOffer.id ? response.data : offer
        )
      )

      setIsEditWizardOpen(false)
      setSelectedOffer(null)

      toast.success('Angebot erfolgreich aktualisiert', {
        description: 'Die Änderungen wurden gespeichert'
      })

    } catch (error) {
      console.error('Error updating offer:', error)
      toast.error('Fehler beim Aktualisieren des Angebots', {
        description: error.message
      })
    }
  }

  /**
   * Handle offer deletion
   */
  const handleDeleteOffer = async () => {
    try {
      await api.vertrieb.deleteOffer(offerToDelete.id)

      setOffers(prev =>
        prev.filter(offer => offer.id !== offerToDelete.id)
      )

      setIsDeleteDialogOpen(false)
      setOfferToDelete(null)

      toast.success('Angebot erfolgreich gelöscht', {
        description: 'Das Angebot wurde entfernt'
      })

    } catch (error) {
      console.error('Error deleting offer:', error)
      toast.error('Fehler beim Löschen des Angebots', {
        description: error.message
      })
    }
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  /**
   * Filter offers based on search term and status
   */
  const filteredOffers = offers.filter(offer => {
    const attrs = offer.attributes || offer
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch = (
      attrs.beschreibung?.toLowerCase().includes(searchLower) ||
      attrs.kunde?.data?.attributes?.name?.toLowerCase().includes(searchLower) ||
      attrs.anid?.toLowerCase().includes(searchLower)
    )

    const matchesStatus = statusFilter === 'all' || attrs.status === statusFilter

    return matchesSearch && matchesStatus
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
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'erstellt': return 'secondary'
      case 'gesendet': return 'default'
      case 'angenommen': return 'success'
      case 'abgelehnt': return 'destructive'
      default: return 'secondary'
    }
  }

  /**
   * Get status display text
   */
  const getStatusDisplayText = (status) => {
    switch (status) {
      case 'erstellt': return 'Erstellt'
      case 'gesendet': return 'Gesendet'
      case 'angenommen': return 'Angenommen'
      case 'abgelehnt': return 'Abgelehnt'
      default: return status || 'Unbekannt'
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
          <h1 className="text-3xl font-bold tracking-tight">Angebotserstellung</h1>
          <p className="text-muted-foreground">
            Erstellen und verwalten Sie Angebote für Ihre Kunden
          </p>
        </div>

        <Button
          onClick={() => setIsCreateWizardOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Neues Angebot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{offers.length}</div>
            <p className="text-xs text-muted-foreground">Gesamt Angebote</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {offers.filter(o => (o.attributes || o).status === 'erstellt').length}
            </div>
            <p className="text-xs text-muted-foreground">Erstellt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {offers.filter(o => (o.attributes || o).status === 'gesendet').length}
            </div>
            <p className="text-xs text-muted-foreground">Gesendet</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {offers.filter(o => (o.attributes || o).status === 'angenommen').length}
            </div>
            <p className="text-xs text-muted-foreground">Angenommen</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Angebots-ID, Kunde oder Beschreibung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">Alle</TabsTrigger>
                <TabsTrigger value="erstellt">Erstellt</TabsTrigger>
                <TabsTrigger value="gesendet">Gesendet</TabsTrigger>
                <TabsTrigger value="angenommen">Angenommen</TabsTrigger>
                <TabsTrigger value="abgelehnt">Abgelehnt</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Angebote</CardTitle>
          <CardDescription>
            Übersicht aller Angebote mit Status und Kundeninformationen
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Lade Angebote...</div>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Keine Angebote gefunden'
                  : 'Noch keine Angebote vorhanden'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  onClick={() => setIsCreateWizardOpen(true)}
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Erstes Angebot erstellen
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Angebots-ID</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Gesamtpreis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gültigkeitsdatum</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
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
                        <Badge variant={getStatusBadgeVariant(attrs.status)}>
                          {getStatusDisplayText(attrs.status)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(attrs.gueltigkeitsdatum)}
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
                                setSelectedOffer(offer)
                                setIsEditWizardOpen(true)
                              }}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Bearbeiten
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setOfferToDelete(offer)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="gap-2 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Löschen
                            </DropdownMenuItem>
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

      {/* Create Offer Wizard */}
      <Dialog open={isCreateWizardOpen} onOpenChange={setIsCreateWizardOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neues Angebot erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie ein neues Angebot für einen Kunden
            </DialogDescription>
          </DialogHeader>

          <OfferWizard
            onSubmit={handleCreateOffer}
            onCancel={() => setIsCreateWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Offer Wizard */}
      <Dialog open={isEditWizardOpen} onOpenChange={setIsEditWizardOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Angebot bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie das ausgewählte Angebot
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <OfferWizard
              offer={selectedOffer}
              onSubmit={handleUpdateOffer}
              onCancel={() => {
                setIsEditWizardOpen(false)
                setSelectedOffer(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Angebot löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie dieses Angebot löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setOfferToDelete(null)
              }}
            >
              Abbrechen
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteOffer}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}