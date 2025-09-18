/**
 * KUNDENVERWALTUNG - Customer Management Page
 *
 * User Story: VT-01 - Customer CRUD operations
 * Als Vertriebsmitarbeiter möchte ich Kunden anlegen, bearbeiten und löschen können,
 * damit ich sie für Angebote und Aufträge verwende.
 *
 * Features:
 * - Customer list with search and filter
 * - Add new customer dialog
 * - Edit customer functionality
 * - Delete customer with confirmation
 * - Export customer data
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
  Trash2,
  Phone,
  MapPin,
  CreditCard,
  MoreHorizontal,
  Download
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
  DialogTrigger,
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
import { toast } from 'sonner'

// Components
import CustomerForm from '../components/CustomerForm'

// API Integration
import { api } from '../../../utils/api'

export default function Kundenverwaltung() {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)

  // =================================================================
  // DATA FETCHING
  // =================================================================

  /**
   * Load customers from API
   */
  const loadCustomers = async () => {
    try {
      setLoading(true)
      const response = await api.vertrieb.getCustomers({
        sort: 'name:asc',
        pagination: { pageSize: 100 }
      })

      setCustomers(response.data || [])

    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Fehler beim Laden der Kunden', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  // Load customers on component mount
  useEffect(() => {
    loadCustomers()
  }, [])

  // =================================================================
  // CUSTOMER OPERATIONS
  // =================================================================

  /**
   * Handle customer creation
   */
  const handleCreateCustomer = async (customerData) => {
    try {
      const response = await api.vertrieb.createCustomer(customerData)

      setCustomers(prev => [...prev, response.data])
      setIsAddDialogOpen(false)

      toast.success('Kunde erfolgreich erstellt', {
        description: `${customerData.name} wurde hinzugefügt`
      })

    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('Fehler beim Erstellen des Kunden', {
        description: error.message
      })
    }
  }

  /**
   * Handle customer update
   */
  const handleUpdateCustomer = async (customerData) => {
    try {
      const response = await api.vertrieb.updateCustomer(selectedCustomer.id, customerData)

      setCustomers(prev =>
        prev.map(customer =>
          customer.id === selectedCustomer.id ? response.data : customer
        )
      )

      setIsEditDialogOpen(false)
      setSelectedCustomer(null)

      toast.success('Kunde erfolgreich aktualisiert', {
        description: `${customerData.name} wurde gespeichert`
      })

    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Fehler beim Aktualisieren des Kunden', {
        description: error.message
      })
    }
  }

  /**
   * Handle customer deletion
   */
  const handleDeleteCustomer = async () => {
    try {
      await api.vertrieb.deleteCustomer(customerToDelete.id)

      setCustomers(prev =>
        prev.filter(customer => customer.id !== customerToDelete.id)
      )

      setIsDeleteDialogOpen(false)
      setCustomerToDelete(null)

      toast.success('Kunde erfolgreich gelöscht', {
        description: `${customerToDelete.attributes.name} wurde entfernt`
      })

    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Fehler beim Löschen des Kunden', {
        description: error.message
      })
    }
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  /**
   * Filter customers based on search term
   */
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase()
    const attrs = customer.attributes || customer

    return (
      attrs.name?.toLowerCase().includes(searchLower) ||
      attrs.ort?.toLowerCase().includes(searchLower) ||
      attrs.plz?.includes(searchTerm) ||
      attrs.telefon?.includes(searchTerm)
    )
  })

  /**
   * Format customer address
   */
  const formatAddress = (customer) => {
    const attrs = customer.attributes || customer
    return `${attrs.strasse || ''} ${attrs.hausnummer || ''}, ${attrs.plz || ''} ${attrs.ort || ''}`.trim()
  }

  /**
   * Handle export customers (placeholder)
   */
  const handleExportCustomers = () => {
    toast.info('Export-Funktion', {
      description: 'Export wird in zukünftiger Version implementiert'
    })
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kundenverwaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Kunden für Angebote und Aufträge
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCustomers}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Neuer Kunde
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Name, Ort, PLZ oder Telefon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Gesamt Kunden</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredCustomers.length}</div>
            <p className="text-xs text-muted-foreground">Gefilterte Kunden</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Aktive Angebote</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Offene Aufträge</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kundenliste</CardTitle>
          <CardDescription>
            Alle Kunden mit ihren wichtigsten Informationen
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Lade Kunden...</div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Keine Kunden gefunden' : 'Noch keine Kunden vorhanden'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ersten Kunden hinzufügen
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCustomers.map((customer) => {
                  const attrs = customer.attributes || customer

                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {attrs.name || 'Unbekannt'}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {attrs.telefon && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {attrs.telefon}
                            </div>
                          )}
                          {attrs.iban && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CreditCard className="h-3 w-3" />
                              {attrs.iban.slice(-4)}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {formatAddress(customer) || 'Keine Adresse'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary">Aktiv</Badge>
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
                                setSelectedCustomer(customer)
                                setIsEditDialogOpen(true)
                              }}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Bearbeiten
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setCustomerToDelete(customer)
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

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neuen Kunden hinzufügen</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen neuen Kunden für Angebote und Aufträge
            </DialogDescription>
          </DialogHeader>

          <CustomerForm
            onSubmit={handleCreateCustomer}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kunde bearbeiten</DialogTitle>
            <DialogDescription>
              Ändern Sie die Kundendaten
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <CustomerForm
              customer={selectedCustomer}
              onSubmit={handleUpdateCustomer}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedCustomer(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kunde löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie den Kunden "{customerToDelete?.attributes?.name}" löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setCustomerToDelete(null)
              }}
            >
              Abbrechen
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteCustomer}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}