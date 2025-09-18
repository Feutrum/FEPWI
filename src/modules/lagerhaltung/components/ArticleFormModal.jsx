/**
 * ARTICLE FORM MODAL
 *
 * Modern article creation/editing form with Shadcn components
 * Uses React Hook Form + Zod validation for robust form handling
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Package, Euro, Barcode } from 'lucide-react'

// Validation schema
import { articleSchema } from '../schemas/inventoryValidation'

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
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// COMPONENT
// =================================================================

export default function ArticleFormModal({
  open,
  onOpenChange,
  article = null,
  onSuccess
}) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!article

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      artikelname: '',
      kategorie: '',
      einheit: '',
      mindestbestand: 0,
      preis: 0,
      lieferant: '',
      beschreibung: '',
      artikelnummer: '',
      barcode: ''
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load article data when editing
   */
  useEffect(() => {
    if (article && open) {
      form.reset({
        artikelname: article.attributes.artikelname || '',
        kategorie: article.attributes.kategorie || '',
        einheit: article.attributes.einheit || '',
        mindestbestand: article.attributes.mindestbestand || 0,
        preis: article.attributes.preis || 0,
        lieferant: article.attributes.lieferant || '',
        beschreibung: article.attributes.beschreibung || '',
        artikelnummer: article.attributes.artikelnummer || '',
        barcode: article.attributes.barcode || ''
      })
    } else if (!article && open) {
      form.reset({
        artikelname: '',
        kategorie: '',
        einheit: '',
        mindestbestand: 0,
        preis: 0,
        lieferant: '',
        beschreibung: '',
        artikelnummer: '',
        barcode: ''
      })
    }
  }, [article, open, form])

  // =================================================================
  // FORM HANDLERS
  // =================================================================

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      setLoading(true)

      if (isEditing) {
        await api.inventory.updateArticle(article.id, data)
        toast.success('Artikel erfolgreich aktualisiert')
      } else {
        await api.inventory.createArticle(data)
        toast.success('Artikel erfolgreich erstellt')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error(isEditing ? 'Fehler beim Aktualisieren des Artikels' : 'Fehler beim Erstellen des Artikels')
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
   * Common categories
   */
  const categories = [
    'Saatgut',
    'Düngemittel',
    'Pflanzenschutz',
    'Werkzeuge',
    'Maschinen',
    'Bewässerung',
    'Substrate',
    'Töpfe & Container',
    'Sonstige'
  ]

  /**
   * Common units
   */
  const units = [
    'Stück',
    'kg',
    'g',
    'l',
    'ml',
    'm',
    'cm',
    'm²',
    'cm²',
    'Packung',
    'Karton'
  ]

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditing ? 'Artikel bearbeiten' : 'Neuen Artikel anlegen'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Artikeldaten. Änderungen werden sofort gespeichert.'
              : 'Füllen Sie alle erforderlichen Felder aus, um einen neuen Artikel anzulegen.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Grunddaten</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="artikelname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artikelname *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Tomatensamen Fleischtomate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kategorie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategorie *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kategorie auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="einheit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Einheit *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Einheit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mindestbestand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mindestbestand *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Warnung bei Unterschreitung
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preis (€)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Euro className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Preis pro Einheit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Zusätzliche Informationen</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="artikelnummer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artikelnummer</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. ART-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Interne Artikelnummer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Barcode className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Barcode/EAN"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        EAN oder interner Barcode
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="lieferant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieferant</FormLabel>
                    <FormControl>
                      <Input placeholder="Name des Lieferanten" {...field} />
                    </FormControl>
                    <FormDescription>
                      Hauptlieferant für diesen Artikel
                    </FormDescription>
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
                      <Textarea
                        placeholder="Detaillierte Beschreibung des Artikels..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Zusätzliche Informationen zum Artikel
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
                {isEditing ? 'Aktualisieren' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}