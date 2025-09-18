/**
 * OFFER WIZARD COMPONENT
 *
 * Multi-step wizard for creating and editing offers
 * Implements VT-03 (Create) and VT-04 (Edit) user stories
 *
 * Steps:
 * 1. Customer Selection
 * 2. Article Selection with availability check
 * 3. Pricing and Terms
 * 4. Review and Create
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  ArrowRight,
  User,
  Package,
  Calculator,
  FileText,
  Check,
  Search,
  Plus,
  Minus,
  Trash2,
  AlertTriangle
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
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// VALIDATION SCHEMAS
// =================================================================

const offerSchema = z.object({
  kunde: z.string().min(1, 'Kunde ist erforderlich'),
  beschreibung: z.string().optional(),
  gueltigkeitsdatum: z.string().min(1, 'Gültigkeitsdatum ist erforderlich'),
  status: z.enum(['erstellt', 'gesendet', 'angenommen', 'abgelehnt']).default('erstellt')
})

// =================================================================
// COMPONENT
// =================================================================

export default function OfferWizard({ offer, onSubmit, onCancel }) {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [currentStep, setCurrentStep] = useState(1)
  const [customers, setCustomers] = useState([])
  const [articles, setArticles] = useState([])
  const [selectedArticles, setSelectedArticles] = useState([])
  const [loading, setLoading] = useState(false)

  // Search states
  const [customerSearch, setCustomerSearch] = useState('')
  const [articleSearch, setArticleSearch] = useState('')

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      kunde: '',
      beschreibung: '',
      gueltigkeitsdatum: '',
      status: 'erstellt'
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load customers and articles on mount
   */
  useEffect(() => {
    loadCustomers()
    loadArticles()
  }, [])

  /**
   * Populate form when editing existing offer
   */
  useEffect(() => {
    if (offer) {
      const attrs = offer.attributes || offer

      form.reset({
        kunde: attrs.kunde?.data?.id?.toString() || '',
        beschreibung: attrs.beschreibung || '',
        gueltigkeitsdatum: attrs.gueltigkeitsdatum?.split('T')[0] || '',
        status: attrs.status || 'erstellt'
      })

      // Load existing offer articles
      if (attrs.angebotspositionen?.data) {
        setSelectedArticles(
          attrs.angebotspositionen.data.map(pos => ({
            artikel: pos.attributes.artikel.data,
            menge: pos.attributes.menge,
            einzelpreis: pos.attributes.einzelpreis,
            gesamtpreis: pos.attributes.gesamtpreis
          }))
        )
      }
    }
  }, [offer, form])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load customers
   */
  const loadCustomers = async () => {
    try {
      const response = await api.vertrieb.getCustomers({
        sort: 'name:asc',
        pagination: { pageSize: 100 }
      })
      setCustomers(response.data || [])
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Fehler beim Laden der Kunden')
    }
  }

  /**
   * Load articles
   */
  const loadArticles = async () => {
    try {
      const response = await api.vertrieb.getArticles({
        sort: 'bezeichnung:asc',
        pagination: { pageSize: 200 }
      })
      setArticles(response.data || [])
    } catch (error) {
      console.error('Error loading articles:', error)
      toast.error('Fehler beim Laden der Artikel')
    }
  }

  // =================================================================
  // ARTICLE MANAGEMENT
  // =================================================================

  /**
   * Add article to offer
   */
  const addArticleToOffer = (article) => {
    const existing = selectedArticles.find(
      item => item.artikel.id === article.id
    )

    if (existing) {
      toast.error('Artikel bereits hinzugefügt')
      return
    }

    const newItem = {
      artikel: article,
      menge: 1,
      einzelpreis: article.attributes?.verkaufspreis || 0,
      gesamtpreis: article.attributes?.verkaufspreis || 0
    }

    setSelectedArticles(prev => [...prev, newItem])
  }

  /**
   * Update article quantity
   */
  const updateArticleQuantity = (articleId, newQuantity) => {
    if (newQuantity <= 0) {
      removeArticleFromOffer(articleId)
      return
    }

    setSelectedArticles(prev =>
      prev.map(item =>
        item.artikel.id === articleId
          ? {
              ...item,
              menge: newQuantity,
              gesamtpreis: item.einzelpreis * newQuantity
            }
          : item
      )
    )
  }

  /**
   * Update article price
   */
  const updateArticlePrice = (articleId, newPrice) => {
    setSelectedArticles(prev =>
      prev.map(item =>
        item.artikel.id === articleId
          ? {
              ...item,
              einzelpreis: newPrice,
              gesamtpreis: newPrice * item.menge
            }
          : item
      )
    )
  }

  /**
   * Remove article from offer
   */
  const removeArticleFromOffer = (articleId) => {
    setSelectedArticles(prev =>
      prev.filter(item => item.artikel.id !== articleId)
    )
  }

  // =================================================================
  // CALCULATIONS
  // =================================================================

  /**
   * Calculate total offer price
   */
  const calculateTotalPrice = () => {
    return selectedArticles.reduce((sum, item) => sum + item.gesamtpreis, 0)
  }

  // =================================================================
  // NAVIGATION
  // =================================================================

  /**
   * Go to next step
   */
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    }
  }

  /**
   * Go to previous step
   */
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  /**
   * Validate current step
   */
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Customer selection
        return form.watch('kunde') !== ''
      case 2: // Article selection
        return selectedArticles.length > 0
      case 3: // Pricing and terms
        return form.watch('gueltigkeitsdatum') !== ''
      default:
        return true
    }
  }

  // =================================================================
  // FORM SUBMISSION
  // =================================================================

  /**
   * Handle form submission
   */
  const handleSubmit = async (data) => {
    try {
      setLoading(true)

      const offerData = {
        ...data,
        gesamtpreis: calculateTotalPrice(),
        angebotspositionen: selectedArticles.map(item => ({
          artikel: item.artikel.id,
          menge: item.menge,
          einzelpreis: item.einzelpreis,
          gesamtpreis: item.gesamtpreis
        }))
      }

      await onSubmit(offerData)
    } catch (error) {
      toast.error('Fehler beim Speichern des Angebots')
    } finally {
      setLoading(false)
    }
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

  const filteredCustomers = customers.filter(customer => {
    const attrs = customer.attributes || customer
    return attrs.name?.toLowerCase().includes(customerSearch.toLowerCase())
  })

  const filteredArticles = articles.filter(article => {
    const attrs = article.attributes || article
    return attrs.bezeichnung?.toLowerCase().includes(articleSearch.toLowerCase())
  })

  // =================================================================
  // RENDER STEP CONTENT
  // =================================================================

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Kunde auswählen
              </CardTitle>
              <CardDescription>
                Wählen Sie den Kunden für dieses Angebot aus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="kunde"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kunde *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kunde auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCustomers.map((customer) => {
                          const attrs = customer.attributes || customer
                          return (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {attrs.name}
                              {attrs.ort && ` (${attrs.ort})`}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="beschreibung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optionale Beschreibung des Angebots"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Artikel auswählen
                </CardTitle>
                <CardDescription>
                  Fügen Sie Artikel zu diesem Angebot hinzu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Artikel suchen..."
                      value={articleSearch}
                      onChange={(e) => setArticleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Artikel</TableHead>
                          <TableHead>Preis</TableHead>
                          <TableHead>Lagerbestand</TableHead>
                          <TableHead className="text-right">Aktion</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredArticles.map((article) => {
                          const attrs = article.attributes || article
                          const isAdded = selectedArticles.some(
                            item => item.artikel.id === article.id
                          )

                          return (
                            <TableRow key={article.id}>
                              <TableCell>{attrs.bezeichnung}</TableCell>
                              <TableCell>
                                {formatCurrency(attrs.verkaufspreis)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {attrs.lagerbestand || 0} Stk.
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant={isAdded ? "secondary" : "default"}
                                  onClick={() => addArticleToOffer(article)}
                                  disabled={isAdded}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      Hinzugefügt
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-1" />
                                      Hinzufügen
                                    </>
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ausgewählte Artikel</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Artikel</TableHead>
                        <TableHead>Menge</TableHead>
                        <TableHead>Einzelpreis</TableHead>
                        <TableHead>Gesamtpreis</TableHead>
                        <TableHead className="text-right">Aktion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedArticles.map((item) => (
                        <TableRow key={item.artikel.id}>
                          <TableCell>
                            {item.artikel.attributes?.bezeichnung}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateArticleQuantity(
                                    item.artikel.id,
                                    item.menge - 1
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center">{item.menge}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateArticleQuantity(
                                    item.artikel.id,
                                    item.menge + 1
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.einzelpreis}
                              onChange={(e) =>
                                updateArticlePrice(
                                  item.artikel.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.gesamtpreis)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeArticleFromOffer(item.artikel.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Konditionen & Preise
              </CardTitle>
              <CardDescription>
                Legen Sie die Konditionen für das Angebot fest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="gueltigkeitsdatum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gültigkeitsdatum *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Bis wann ist dieses Angebot gültig?
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
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="erstellt">Erstellt</SelectItem>
                        <SelectItem value="gesendet">Gesendet</SelectItem>
                        <SelectItem value="angenommen">Angenommen</SelectItem>
                        <SelectItem value="abgelehnt">Abgelehnt</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Gesamtpreis:</span>
                  <span>{formatCurrency(calculateTotalPrice())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        const selectedCustomer = customers.find(
          c => c.id.toString() === form.watch('kunde')
        )

        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Angebot überprüfen
              </CardTitle>
              <CardDescription>
                Überprüfen Sie alle Angaben vor dem Speichern
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Kunde</h4>
                  <p>{selectedCustomer?.attributes?.name || 'Unbekannt'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Gültigkeitsdatum</h4>
                  <p>{form.watch('gueltigkeitsdatum')}</p>
                </div>
              </div>

              {form.watch('beschreibung') && (
                <div>
                  <h4 className="font-semibold">Beschreibung</h4>
                  <p>{form.watch('beschreibung')}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Artikel ({selectedArticles.length})</h4>
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
                    {selectedArticles.map((item) => (
                      <TableRow key={item.artikel.id}>
                        <TableCell>
                          {item.artikel.attributes?.bezeichnung}
                        </TableCell>
                        <TableCell>{item.menge}</TableCell>
                        <TableCell>{formatCurrency(item.einzelpreis)}</TableCell>
                        <TableCell>{formatCurrency(item.gesamtpreis)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Gesamtpreis:</span>
                  <span>{formatCurrency(calculateTotalPrice())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step
                )}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 w-16 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Titles */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className={`text-sm ${currentStep === 1 ? 'font-semibold' : 'text-muted-foreground'}`}>
              Kunde
            </p>
          </div>
          <div>
            <p className={`text-sm ${currentStep === 2 ? 'font-semibold' : 'text-muted-foreground'}`}>
              Artikel
            </p>
          </div>
          <div>
            <p className={`text-sm ${currentStep === 3 ? 'font-semibold' : 'text-muted-foreground'}`}>
              Konditionen
            </p>
          </div>
          <div>
            <p className={`text-sm ${currentStep === 4 ? 'font-semibold' : 'text-muted-foreground'}`}>
              Überprüfung
            </p>
          </div>
        </div>

        <Separator />

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Abbrechen
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
                className="gap-2"
              >
                Weiter
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !canProceedToNextStep()}
                className="gap-2"
              >
                {loading ? 'Speichern...' : (
                  <>
                    <Check className="h-4 w-4" />
                    {offer ? 'Änderungen speichern' : 'Angebot erstellen'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}