/**
 * OFFER TO ORDER CONVERTER COMPONENT
 *
 * Handles conversion of accepted offers to orders (VT-05)
 * Als Vertriebsmitarbeiter möchte ich Angebote in Aufträge umwandeln können
 *
 * Features:
 * - Offer selection and review
 * - Order details configuration
 * - Delivery date setting
 * - Order creation
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Calendar,
  User,
  Package,
  Euro,
  FileText,
  CheckCircle
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'

// =================================================================
// VALIDATION SCHEMA
// =================================================================

const orderSchema = z.object({
  angebot: z.string().min(1, 'Angebot ist erforderlich'),
  lieferdatum: z.string().min(1, 'Lieferdatum ist erforderlich'),
  status: z.enum(['offen', 'in_bearbeitung', 'in_lieferung', 'geliefert', 'storniert']).default('offen')
})

// =================================================================
// COMPONENT
// =================================================================

export default function OfferToOrderConverter({ offers, selectedOffer, onSubmit, onCancel }) {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [loading, setLoading] = useState(false)
  const [selectedOfferData, setSelectedOfferData] = useState(null)

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      angebot: '',
      lieferdatum: '',
      status: 'offen'
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Set default offer if one is selected
   */
  useEffect(() => {
    if (selectedOffer) {
      form.setValue('angebot', selectedOffer.id.toString())
      setSelectedOfferData(selectedOffer)
    }
  }, [selectedOffer, form])

  /**
   * Watch for offer selection changes
   */
  const watchedOffer = form.watch('angebot')
  useEffect(() => {
    if (watchedOffer && watchedOffer !== selectedOffer?.id?.toString()) {
      const offer = offers.find(o => o.id.toString() === watchedOffer)
      setSelectedOfferData(offer)
    }
  }, [watchedOffer, offers, selectedOffer])

  // =================================================================
  // FORM HANDLERS
  // =================================================================

  /**
   * Handle form submission
   */
  const handleSubmit = async (data) => {
    try {
      setLoading(true)

      // Calculate order date (today)
      const orderData = {
        ...data,
        auftragsdatum: new Date().toISOString(),
        gesamtpreis: selectedOfferData?.attributes?.gesamtpreis || 0
      }

      await onSubmit(data.angebot, orderData)
    } catch (error) {
      console.error('Error converting offer:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    form.reset()
    setSelectedOfferData(null)
    onCancel()
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unbekannt'
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Offer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Angebot auswählen
            </CardTitle>
            <CardDescription>
              Wählen Sie das Angebot aus, das in einen Auftrag umgewandelt werden soll
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="angebot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Angebot *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Angebot auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {offers.map((offer) => {
                        const attrs = offer.attributes || offer
                        return (
                          <SelectItem key={offer.id} value={offer.id.toString()}>
                            {attrs.anid || `ANB-${offer.id}`} - {attrs.kunde?.data?.attributes?.name}
                            ({formatCurrency(attrs.gesamtpreis)})
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Offer Details Preview */}
        {selectedOfferData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Angebotsdetails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Kunde</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{selectedOfferData.attributes?.kunde?.data?.attributes?.name || 'Unbekannt'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Gesamtpreis</h4>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    <span className="text-lg font-semibold">
                      {formatCurrency(selectedOfferData.attributes?.gesamtpreis)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Angenommen
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Gültigkeitsdatum</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedOfferData.attributes?.gueltigkeitsdatum)}</span>
                  </div>
                </div>
              </div>

              {selectedOfferData.attributes?.beschreibung && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Beschreibung</h4>
                  <p className="text-sm">{selectedOfferData.attributes.beschreibung}</p>
                </div>
              )}

              {/* Article Details */}
              {selectedOfferData.attributes?.angebotspositionen?.data && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Artikel ({selectedOfferData.attributes.angebotspositionen.data.length})
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Artikel</TableHead>
                        <TableHead>Menge</TableHead>
                        <TableHead>Einzelpreis</TableHead>
                        <TableHead>Gesamtpreis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOfferData.attributes.angebotspositionen.data.map((position, index) => {
                        const posAttrs = position.attributes || position
                        return (
                          <TableRow key={position.id || index}>
                            <TableCell>
                              {posAttrs.artikel?.data?.attributes?.bezeichnung || 'Unbekannt'}
                            </TableCell>
                            <TableCell>{posAttrs.menge}</TableCell>
                            <TableCell>{formatCurrency(posAttrs.einzelpreis)}</TableCell>
                            <TableCell>{formatCurrency(posAttrs.gesamtpreis)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Auftragsdetails
            </CardTitle>
            <CardDescription>
              Konfigurieren Sie die Details für den neuen Auftrag
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="lieferdatum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gewünschtes Lieferdatum *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormDescription>
                    Wann soll der Auftrag geliefert werden?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anfangsstatus</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="offen">Offen</SelectItem>
                      <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Mit welchem Status soll der Auftrag erstellt werden?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Zusammenfassung</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Auftragsdatum:</span>
                  <span>{formatDate(new Date().toISOString())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lieferdatum:</span>
                  <span>{form.watch('lieferdatum') ? formatDate(form.watch('lieferdatum')) : 'Nicht festgelegt'}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Gesamtpreis:</span>
                  <span>{formatCurrency(selectedOfferData?.attributes?.gesamtpreis || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Abbrechen
          </Button>

          <Button
            type="submit"
            disabled={loading || !selectedOfferData}
          >
            {loading ? 'Erstelle Auftrag...' : 'Auftrag erstellen'}
          </Button>
        </div>
      </form>
    </Form>
  )
}