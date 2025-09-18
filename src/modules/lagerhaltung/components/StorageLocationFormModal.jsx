/**
 * STORAGE LOCATION FORM MODAL
 *
 * Modal component for creating and editing storage locations
 * Uses Shadcn components and React Hook Form with Zod validation
 */

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  MapPin,
  Warehouse,
  FileText,
  Loader2
} from 'lucide-react'

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
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// VALIDATION SCHEMA
// =================================================================

const storageLocationSchema = z.object({
  lagername: z
    .string()
    .min(2, 'Lagername muss mindestens 2 Zeichen lang sein')
    .max(100, 'Lagername darf nicht länger als 100 Zeichen sein'),
  standort: z
    .string()
    .min(2, 'Standort muss mindestens 2 Zeichen lang sein')
    .max(200, 'Standort darf nicht länger als 200 Zeichen sein'),
  beschreibung: z
    .string()
    .max(500, 'Beschreibung darf nicht länger als 500 Zeichen sein')
    .optional()
})

// =================================================================
// COMPONENT
// =================================================================

export default function StorageLocationFormModal({
  isOpen,
  onClose,
  onSuccess,
  storageLocation = null
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!storageLocation

  // Form setup with validation
  const form = useForm({
    resolver: zodResolver(storageLocationSchema),
    defaultValues: {
      lagername: storageLocation?.attributes?.lagername || '',
      standort: storageLocation?.attributes?.standort || '',
      beschreibung: storageLocation?.attributes?.beschreibung || ''
    }
  })

  // =================================================================
  // FORM SUBMISSION
  // =================================================================

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      let response

      if (isEditing) {
        // Update existing storage location
        response = await api.inventory.updateStorageLocation(storageLocation.id, {
          data: {
            lagername: data.lagername,
            standort: data.standort,
            beschreibung: data.beschreibung
          }
        })
        toast.success('Lagerort erfolgreich aktualisiert')
      } else {
        // Create new storage location
        response = await api.inventory.createStorageLocation({
          data: {
            lagername: data.lagername,
            standort: data.standort,
            beschreibung: data.beschreibung
          }
        })
        toast.success('Lagerort erfolgreich erstellt')
      }

      // Reset form and close modal
      form.reset()
      onClose()

      // Notify parent component
      if (onSuccess) {
        onSuccess(response.data)
      }

    } catch (error) {
      console.error('Error saving storage location:', error)

      if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message)
      } else {
        toast.error(
          isEditing
            ? 'Fehler beim Aktualisieren des Lagerorts'
            : 'Fehler beim Erstellen des Lagerorts'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // =================================================================
  // EVENT HANDLERS
  // =================================================================

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset()
      onClose()
    }
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            {isEditing ? 'Lagerort bearbeiten' : 'Neuer Lagerort'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Eigenschaften des Lagerorts.'
              : 'Erstellen Sie einen neuen Lagerort für Ihr Inventar.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Lagername */}
            <FormField
              control={form.control}
              name="lagername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    Lagername *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Hauptlager, Außenlager A, etc."
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Ein eindeutiger Name für den Lagerort
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Standort */}
            <FormField
              control={form.control}
              name="standort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Standort *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Halle 1, Gebäude A, Feldweg 123"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Die physische Adresse oder Lage des Lagers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Beschreibung */}
            <FormField
              control={form.control}
              name="beschreibung"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Beschreibung
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Zusätzliche Informationen über den Lagerort..."
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Optionale zusätzliche Informationen zum Lagerort
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Aktualisieren...' : 'Erstellen...'}
                  </>
                ) : (
                  <>
                    <Warehouse className="mr-2 h-4 w-4" />
                    {isEditing ? 'Aktualisieren' : 'Erstellen'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}