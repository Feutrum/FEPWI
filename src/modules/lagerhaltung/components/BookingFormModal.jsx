/**
 * BOOKING FORM MODAL
 *
 * Modern booking entry form with Shadcn components
 * Handles stock movements: incoming, outgoing, transfers, corrections
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2, ArrowUpDown, Plus, Minus, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

// Validation schema
import { bookingSchema } from '../schemas/inventoryValidation'

// Shadcn UI Components
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Calendar } from '../../../components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover'
import { toast } from 'sonner'
import { cn } from '../../../lib/utils'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// COMPONENT
// =================================================================

export default function BookingFormModal({
  open,
  onOpenChange,
  bookingType = 'eingang',
  preselectedArticle = null,
  preselectedLocation = null,
  onSuccess
}) {
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState([])
  const [storageLocations, setStorageLocations] = useState([])

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      artikelId: preselectedArticle?.id || 0,
      lagerortId: preselectedLocation?.id || 0,
      menge: 0,
      buchungstyp: bookingType,
      grund: '',
      referenz: '',
      kosten: 0,
      zielLagerortId: 0,
      bemerkung: ''
    }
  })

  const selectedBookingType = form.watch('buchungstyp')

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load articles and storage locations when modal opens
   */
  useEffect(() => {
    if (open) {
      loadArticles()
      loadStorageLocations()
    }
  }, [open])

  /**
   * Reset form when modal opens
   */
  useEffect(() => {
    if (open) {
      form.reset({
        artikelId: preselectedArticle?.id || 0,
        lagerortId: preselectedLocation?.id || 0,
        menge: 0,
        buchungstyp: bookingType,
        grund: '',
        referenz: '',
        kosten: 0,
        zielLagerortId: 0,
        bemerkung: ''
      })
    }
  }, [open, bookingType, preselectedArticle, preselectedLocation, form])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load articles for selection
   */
  const loadArticles = async () => {
    try {
      const response = await api.inventory.getArticles({ pageSize: 1000 })
      setArticles(response.data || [])
    } catch (error) {
      console.error('Error loading articles:', error)
      toast.error('Fehler beim Laden der Artikel')
    }
  }

  /**
   * Load storage locations for selection
   */
  const loadStorageLocations = async () => {
    try {
      const response = await api.inventory.getStorageLocations({ pageSize: 1000 })
      setStorageLocations(response.data || [])
    } catch (error) {
      console.error('Error loading storage locations:', error)
      toast.error('Fehler beim Laden der Lagerorte')
    }
  }

  // =================================================================
  // FORM HANDLERS
  // =================================================================

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      setLoading(true)

      await api.inventory.createBooking(data)
      toast.success('Buchung erfolgreich erstellt')

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Fehler beim Erstellen der Buchung')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================

  /**
   * Get booking type icon
   */
  const getBookingTypeIcon = (type) => {
    switch (type) {
      case 'eingang':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'ausgang':
        return <Minus className="h-4 w-4 text-red-600" />
      case 'umbuchung':
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />
      case 'korrektur':
        return <Edit className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  /**
   * Get booking type display name
   */
  const getBookingTypeDisplayName = (type) => {
    const typeMap = {
      eingang: 'Wareneingang',
      ausgang: 'Warenausgang',
      umbuchung: 'Umbuchung',
      korrektur: 'Korrektur'
    }
    return typeMap[type] || type
  }

  /**
   * Common booking reasons
   */
  const getCommonReasons = (type) => {
    switch (type) {
      case 'eingang':
        return ['Lieferung', 'Retoure', 'Produktion', 'Anfangsbestand']
      case 'ausgang':
        return ['Verkauf', 'Verbrauch', 'Verschrottung', 'Retoure']
      case 'umbuchung':
        return ['Lagerplatz optimieren', 'Reorganisation', 'Umzug']
      case 'korrektur':
        return ['Inventur', 'Zählfehler', 'Systemfehler', 'Schwund']
      default:
        return []
    }
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getBookingTypeIcon(bookingType)}
            {getBookingTypeDisplayName(bookingType)} erfassen
          </DialogTitle>
          <DialogDescription>
            Erfassen Sie eine neue Lagerbuchung. Alle Felder mit * sind Pflichtfelder.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Buchungsdetails</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="buchungstyp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buchungstyp *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Buchungstyp auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="eingang">
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4 text-green-600" />
                              Wareneingang
                            </div>
                          </SelectItem>
                          <SelectItem value="ausgang">
                            <div className="flex items-center gap-2">
                              <Minus className="h-4 w-4 text-red-600" />
                              Warenausgang
                            </div>
                          </SelectItem>
                          <SelectItem value="umbuchung">
                            <div className="flex items-center gap-2">
                              <ArrowUpDown className="h-4 w-4 text-blue-600" />
                              Umbuchung
                            </div>
                          </SelectItem>
                          <SelectItem value="korrektur">
                            <div className="flex items-center gap-2">
                              <Edit className="h-4 w-4 text-orange-600" />
                              Korrektur
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="menge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menge *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Anzahl der Einheiten
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="artikelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artikel *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Artikel auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {articles.map((article) => (
                          <SelectItem key={article.id} value={article.id.toString()}>
                            {article.attributes.artikelname} - {article.attributes.einheit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lagerortId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedBookingType === 'umbuchung' ? 'Von Lagerort *' : 'Lagerort *'}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Lagerort auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {storageLocations.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.attributes.lagername} - {location.attributes.standort}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedBookingType === 'umbuchung' && (
                  <FormField
                    control={form.control}
                    name="zielLagerortId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zu Lagerort *</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ziel-Lagerort auswählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {storageLocations.map((location) => (
                              <SelectItem key={location.id} value={location.id.toString()}>
                                {location.attributes.lagername} - {location.attributes.standort}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Zusätzliche Informationen</h3>

              <FormField
                control={form.control}
                name="grund"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grund *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Grund auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getCommonReasons(selectedBookingType).map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                        <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="referenz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referenz</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Lieferschein-Nr., Auftrag-Nr." {...field} />
                      </FormControl>
                      <FormDescription>
                        Externe Referenznummer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kosten"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kosten (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Gesamtkosten für diese Buchung
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bemerkung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bemerkung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Zusätzliche Informationen zur Buchung..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Weitere Details zur Buchung
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buchung erstellen
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}