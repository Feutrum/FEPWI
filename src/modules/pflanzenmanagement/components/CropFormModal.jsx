/**
 * CROP FORM MODAL
 *
 * Modern crop creation/editing form with Shadcn components
 * Uses React Hook Form + Zod validation for robust form handling
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2, Sprout, Calendar, Info } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

// Validation schema
import { cropSchema } from '../schemas/plantManagementValidation'

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
import { Calendar as CalendarComponent } from '../../../components/ui/calendar'
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

export default function CropFormModal({
  open,
  onOpenChange,
  crop = null,
  onSuccess
}) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!crop

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      name: '',
      variety: '',
      category: 'grain',
      sowingDate: '',
      harvestDate: '',
      description: '',
      requirements: '',
      expectedYield: 0,
      seedQuantity: 0,
      seedUnit: 'kg',
      status: 'planned'
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load crop data when editing
   */
  useEffect(() => {
    if (crop && open) {
      form.reset({
        name: crop.attributes.name || '',
        variety: crop.attributes.variety || '',
        category: crop.attributes.category || 'grain',
        sowingDate: crop.attributes.sowingDate || '',
        harvestDate: crop.attributes.harvestDate || '',
        description: crop.attributes.description || '',
        requirements: crop.attributes.requirements || '',
        expectedYield: crop.attributes.expectedYield || 0,
        seedQuantity: crop.attributes.seedQuantity || 0,
        seedUnit: crop.attributes.seedUnit || 'kg',
        status: crop.attributes.status || 'planned'
      })
    } else if (!crop && open) {
      form.reset({
        name: '',
        variety: '',
        category: 'grain',
        sowingDate: '',
        harvestDate: '',
        description: '',
        requirements: '',
        expectedYield: 0,
        seedQuantity: 0,
        seedUnit: 'kg',
        status: 'planned'
      })
    }
  }, [crop, open, form])

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
        await api.plantManagement.updateCrop(crop.id, data)
        toast.success('Pflanze erfolgreich aktualisiert')
      } else {
        await api.plantManagement.createCrop(data)
        toast.success('Pflanze erfolgreich erstellt')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving crop:', error)
      toast.error(isEditing ? 'Fehler beim Aktualisieren der Pflanze' : 'Fehler beim Erstellen der Pflanze')
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
   * Crop categories
   */
  const categories = [
    { value: 'grain', label: 'Getreide' },
    { value: 'vegetable', label: 'Gemüse' },
    { value: 'fruit', label: 'Obst' },
    { value: 'herb', label: 'Kräuter' },
    { value: 'flower', label: 'Blumen' },
    { value: 'legume', label: 'Hülsenfrüchte' },
    { value: 'root', label: 'Wurzelgemüse' },
    { value: 'leafy', label: 'Blattgemüse' },
    { value: 'other', label: 'Sonstiges' }
  ]

  /**
   * Seed units
   */
  const seedUnits = [
    { value: 'kg', label: 'Kilogramm' },
    { value: 'g', label: 'Gramm' },
    { value: 'seeds', label: 'Samen' },
    { value: 'plants', label: 'Pflanzen' }
  ]

  /**
   * Status options
   */
  const statusOptions = [
    { value: 'planned', label: 'Geplant' },
    { value: 'sown', label: 'Gesät' },
    { value: 'growing', label: 'Wachsend' },
    { value: 'harvested', label: 'Geerntet' },
    { value: 'completed', label: 'Abgeschlossen' }
  ]

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" />
            {isEditing ? 'Pflanze bearbeiten' : 'Neue Pflanze anlegen'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Pflanzendaten. Änderungen werden sofort gespeichert.'
              : 'Füllen Sie alle erforderlichen Felder aus, um eine neue Pflanze anzulegen.'}
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pflanzenname *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Winterweizen, Tomaten" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sorte</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Hybridsorte, Heirloom" {...field} />
                      </FormControl>
                      <FormDescription>
                        Spezifische Sorte oder Züchtung
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
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
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Status auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Allgemeine Beschreibung der Pflanze, besondere Eigenschaften..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Planting Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Anbauplan
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sowingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Aussaatdatum</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP", { locale: de })
                              ) : (
                                <span>Datum auswählen</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Geplantes oder tatsächliches Aussaatdatum
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="harvestDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Erntedatum</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP", { locale: de })
                              ) : (
                                <span>Datum auswählen</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Geplantes oder tatsächliches Erntedatum
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Cultivation Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Info className="h-5 w-5" />
                Anbaudetails
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="seedQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saatgutmenge</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Benötigte Saatgutmenge
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seedUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Einheit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Einheit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {seedUnits.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
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
                  name="expectedYield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Erwarteter Ertrag (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Geschätzter Gesamtertrag
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anbauanforderungen</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Besondere Anforderungen: Boden, Klima, Pflege, Dünger..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Spezielle Bedingungen und Pflegeanweisungen
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