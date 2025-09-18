/**
 * ACTIVITY FORM MODAL
 *
 * Modern field activity creation/editing form with Shadcn components
 * Uses React Hook Form + Zod validation for robust form handling
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2, Activity, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

// Validation schema
import { fieldActivitySchema } from '../schemas/plantManagementValidation'

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
import { Checkbox } from '../../../components/ui/checkbox'
import { toast } from 'sonner'
import { cn } from '../../../lib/utils'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// COMPONENT
// =================================================================

export default function ActivityFormModal({
  open,
  onOpenChange,
  activity = null,
  fields = [],
  onSuccess
}) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!activity && !activity.prefilledDate

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(fieldActivitySchema),
    defaultValues: {
      fieldId: 0,
      activityType: 'other',
      activityDate: '',
      duration: 0,
      description: '',
      laborHours: 0,
      machineHours: 0,
      results: '',
      nextActivity: '',
      completed: false
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load activity data when editing or prefill date
   */
  useEffect(() => {
    if (activity && open) {
      if (activity.prefilledDate) {
        // New activity with prefilled date
        form.reset({
          fieldId: 0,
          activityType: 'other',
          activityDate: activity.prefilledDate,
          duration: 0,
          description: '',
          laborHours: 0,
          machineHours: 0,
          results: '',
          nextActivity: '',
          completed: false
        })
      } else {
        // Editing existing activity
        form.reset({
          fieldId: activity.attributes.field?.data?.id || 0,
          activityType: activity.attributes.activityType || 'other',
          activityDate: activity.attributes.activityDate || '',
          duration: activity.attributes.duration || 0,
          description: activity.attributes.description || '',
          laborHours: activity.attributes.laborHours || 0,
          machineHours: activity.attributes.machineHours || 0,
          results: activity.attributes.results || '',
          nextActivity: activity.attributes.nextActivity || '',
          completed: activity.attributes.completed || false
        })
      }
    } else if (!activity && open) {
      form.reset({
        fieldId: 0,
        activityType: 'other',
        activityDate: '',
        duration: 0,
        description: '',
        laborHours: 0,
        machineHours: 0,
        results: '',
        nextActivity: '',
        completed: false
      })
    }
  }, [activity, open, form])

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
        await api.plantManagement.updateFieldActivity(activity.id, data)
        toast.success('Aktivität erfolgreich aktualisiert')
      } else {
        await api.plantManagement.createFieldActivity(data)
        toast.success('Aktivität erfolgreich erstellt')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving activity:', error)
      toast.error(isEditing ? 'Fehler beim Aktualisieren der Aktivität' : 'Fehler beim Erstellen der Aktivität')
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
   * Activity types
   */
  const activityTypes = [
    { value: 'sowing', label: 'Aussaat' },
    { value: 'planting', label: 'Pflanzen' },
    { value: 'fertilizing', label: 'Düngung' },
    { value: 'watering', label: 'Bewässerung' },
    { value: 'weeding', label: 'Unkrautbekämpfung' },
    { value: 'pest_control', label: 'Schädlingsbekämpfung' },
    { value: 'harvesting', label: 'Ernte' },
    { value: 'tilling', label: 'Bodenbearbeitung' },
    { value: 'mulching', label: 'Mulchen' },
    { value: 'pruning', label: 'Beschneiden' },
    { value: 'soil_testing', label: 'Bodentest' },
    { value: 'maintenance', label: 'Wartung' },
    { value: 'other', label: 'Sonstiges' }
  ]

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {isEditing ? 'Aktivität bearbeiten' : 'Neue Aktivität anlegen'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Aktivitätsdaten. Änderungen werden sofort gespeichert.'
              : 'Planen Sie eine neue Feldaktivität mit allen wichtigen Details.'}
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
                  name="fieldId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feld *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Feld auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fields.map((field) => (
                            <SelectItem key={field.id} value={field.id.toString()}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {field.attributes.name} (Nr. {field.attributes.nr})
                              </div>
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
                  name="activityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aktivitätstyp *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Typ auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activityTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="activityDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Datum *</FormLabel>
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
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dauer (Stunden)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="0"
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Geschätzte Dauer der Aktivität
                      </FormDescription>
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
                    <FormLabel>Beschreibung *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detaillierte Beschreibung der geplanten Aktivität..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Was soll gemacht werden? Welche Materialien werden benötigt?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Resource Planning */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Ressourcenplanung</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="laborHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arbeitsstunden</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Benötigte Arbeitsstunden
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="machineHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maschinenstunden</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Benötigte Maschinenstunden
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Results and Follow-up */}
            {isEditing && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Ergebnisse und Nachverfolgung</h3>

                <FormField
                  control={form.control}
                  name="results"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ergebnisse</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Wie ist die Aktivität verlaufen? Besondere Beobachtungen..."
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Dokumentation der durchgeführten Arbeiten
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextActivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nächste Aktivität</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Was muss als nächstes gemacht werden?"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Empfehlung für die nächste Aktivität
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="completed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Aktivität abgeschlossen
                        </FormLabel>
                        <FormDescription>
                          Markieren Sie die Aktivität als abgeschlossen
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

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