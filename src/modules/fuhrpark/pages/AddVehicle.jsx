/**
 * VEHICLE MANAGEMENT PAGE
 *
 * Comprehensive vehicle CRUD operations with validation (FM-01)
 * Als Fuhrparkverwalter möchte ich Fahrzeuge hinzufügen, bearbeiten und löschen können
 *
 * Features:
 * - Create new vehicles with full validation
 * - Edit existing vehicles
 * - Delete vehicles with confirmation
 * - Real API integration with Strapi backend
 * - Modern Shadcn UI components
 *
 * @author BEPWI Development Team
 * @version 2.0 (Shadcn Migration)
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  Car,
  Truck,
  Save,
  Trash2,
  AlertTriangle,
  Calendar,
  MapPin,
  Fuel,
  IdCard,
  FileText
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { toast } from 'sonner'

// API Integration
import { api } from '../../../utils/api'

// =================================================================
// VALIDATION SCHEMA
// =================================================================

const vehicleSchema = z.object({
  kennzeichen: z.string().min(1, 'Kennzeichen ist erforderlich').max(20, 'Kennzeichen zu lang'),
  typ: z.enum(['traktor', 'lkw', 'pkw', 'anhänger'], {
    required_error: 'Fahrzeugtyp ist erforderlich'
  }),
  hersteller: z.string().min(1, 'Hersteller ist erforderlich').max(100, 'Hersteller zu lang'),
  modell: z.string().optional(),
  baujahr: z.number()
    .min(1950, 'Baujahr muss nach 1950 liegen')
    .max(new Date().getFullYear() + 1, 'Baujahr kann nicht in der Zukunft liegen'),
  kilometerstand: z.number()
    .min(0, 'Kilometerstand kann nicht negativ sein')
    .max(9999999, 'Kilometerstand zu hoch'),
  kraftstoffart: z.enum(['diesel', 'benzin', 'elektro'], {
    required_error: 'Kraftstoffart ist erforderlich'
  }),
  status: z.enum(['verfügbar', 'im_einsatz', 'wartung', 'defekt'], {
    required_error: 'Status ist erforderlich'
  }),
  tuev_bis: z.string().min(1, 'TÜV-Datum ist erforderlich'),
  standort: z.string().optional(),
  bezeichnung: z.string().optional(),
  nutzungsbeschreibung: z.string().optional()
})

// =================================================================
// COMPONENT
// =================================================================

export default function VehicleManagement() {
  // =================================================================
  // SETUP & STATE
  // =================================================================

  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [vehicleModels, setVehicleModels] = useState([])
  const [licenseTypes, setLicenseTypes] = useState([])

  // =================================================================
  // FORM SETUP
  // =================================================================

  const form = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      kennzeichen: '',
      typ: 'traktor',
      hersteller: '',
      modell: '',
      baujahr: new Date().getFullYear(),
      kilometerstand: 0,
      kraftstoffart: 'diesel',
      status: 'verfügbar',
      tuev_bis: '',
      standort: '',
      bezeichnung: '',
      nutzungsbeschreibung: ''
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  /**
   * Load form data and dependencies on mount
   */
  useEffect(() => {
    loadDependencies()
    if (isEditMode) {
      loadVehicle()
    }
  }, [id])

  // =================================================================
  // DATA LOADING
  // =================================================================

  /**
   * Load vehicle models and license types
   */
  const loadDependencies = async () => {
    try {
      const [modelsResponse, licenseResponse] = await Promise.all([
        api.fuhrpark.getVehicleModels(),
        api.fuhrpark.getLicenseTypes()
      ])

      setVehicleModels(modelsResponse.data || [])
      setLicenseTypes(licenseResponse.data || [])
    } catch (error) {
      console.error('Error loading dependencies:', error)
      toast.error('Fehler beim Laden der Auswahloptionen')
    }
  }

  /**
   * Load vehicle data for editing
   */
  const loadVehicle = async () => {
    try {
      setLoading(true)
      const response = await api.fuhrpark.getVehicle(id, ['modell', 'fuehrerschein'])
      const vehicleData = response.data

      if (vehicleData) {
        const attrs = vehicleData.attributes || vehicleData

        // Populate form with vehicle data
        form.reset({
          kennzeichen: attrs.kennzeichen || '',
          typ: attrs.typ || 'traktor',
          hersteller: attrs.hersteller || '',
          modell: attrs.modell?.data?.id?.toString() || '',
          baujahr: attrs.baujahr || new Date().getFullYear(),
          kilometerstand: attrs.kilometerstand || 0,
          kraftstoffart: attrs.kraftstoffart || 'diesel',
          status: attrs.status || 'verfügbar',
          tuev_bis: attrs.tuev_bis || '',
          standort: attrs.standort || '',
          bezeichnung: attrs.bezeichnung || '',
          nutzungsbeschreibung: attrs.nutzungsbeschreibung || ''
        })
      }
    } catch (error) {
      console.error('Error loading vehicle:', error)
      toast.error('Fehler beim Laden des Fahrzeugs')
      navigate('/fuhrpark/vehicle-overview')
    } finally {
      setLoading(false)
    }
  }

  // =================================================================
  // FORM HANDLERS
  // =================================================================

  /**
   * Handle form submission
   */
  const handleSubmit = async (data) => {
    try {
      setLoading(true)

      // Prepare API data
      const vehicleData = {
        kennzeichen: data.kennzeichen,
        typ: data.typ,
        hersteller: data.hersteller,
        baujahr: data.baujahr,
        kilometerstand: data.kilometerstand,
        kraftstoffart: data.kraftstoffart,
        status: data.status,
        tuev_bis: data.tuev_bis,
        standort: data.standort,
        bezeichnung: data.bezeichnung,
        nutzungsbeschreibung: data.nutzungsbeschreibung
      }

      // Add model relation if selected
      if (data.modell) {
        vehicleData.modell = parseInt(data.modell)
      }

      let response
      if (isEditMode) {
        response = await api.fuhrpark.updateVehicle(id, vehicleData)
        toast.success('Fahrzeug erfolgreich aktualisiert')
      } else {
        response = await api.fuhrpark.createVehicle(vehicleData)
        toast.success('Fahrzeug erfolgreich erstellt')
      }

      // Navigate back to overview
      navigate('/fuhrpark/vehicle-overview')
    } catch (error) {
      console.error('Error saving vehicle:', error)
      toast.error(isEditMode ? 'Fehler beim Aktualisieren des Fahrzeugs' : 'Fehler beim Erstellen des Fahrzeugs')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle vehicle deletion
   */
  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await api.fuhrpark.deleteVehicle(id)
      toast.success('Fahrzeug erfolgreich gelöscht')
      navigate('/fuhrpark/vehicle-overview')
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Fehler beim Löschen des Fahrzeugs')
    } finally {
      setDeleteLoading(false)
    }
  }

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    navigate('/fuhrpark/vehicle-overview')
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  /**
   * Get vehicle type icon
   */
  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case 'traktor': return <Truck className="h-4 w-4" />
      case 'lkw': return <Truck className="h-4 w-4" />
      case 'pkw': return <Car className="h-4 w-4" />
      case 'anhänger': return <Truck className="h-4 w-4" />
      default: return <Car className="h-4 w-4" />
    }
  }

  /**
   * Get vehicle type display name
   */
  const getVehicleTypeDisplayName = (type) => {
    switch (type) {
      case 'traktor': return 'Traktor'
      case 'lkw': return 'LKW'
      case 'pkw': return 'PKW'
      case 'anhänger': return 'Anhänger'
      default: return type
    }
  }

  // =================================================================
  // RENDER
  // =================================================================

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-muted-foreground">Lade Fahrzeugdaten...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Fahrzeug bearbeiten' : 'Fahrzeug hinzufügen'}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? 'Bearbeiten Sie die Fahrzeugdaten'
                : 'Fügen Sie ein neues Fahrzeug zur Flotte hinzu'
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        {isEditMode && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Fahrzeug löschen</AlertDialogTitle>
                <AlertDialogDescription>
                  Sind Sie sicher, dass Sie dieses Fahrzeug löschen möchten?
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Lösche...' : 'Löschen'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Vehicle Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getVehicleTypeIcon(form.watch('typ'))}
                Grunddaten
              </CardTitle>
              <CardDescription>
                Grundlegende Informationen zum Fahrzeug
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* License Plate */}
                <FormField
                  control={form.control}
                  name="kennzeichen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kennzeichen *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. BN-AB 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vehicle Type */}
                <FormField
                  control={form.control}
                  name="typ"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fahrzeugtyp *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Typ auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="traktor">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              Traktor
                            </div>
                          </SelectItem>
                          <SelectItem value="lkw">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              LKW
                            </div>
                          </SelectItem>
                          <SelectItem value="pkw">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              PKW
                            </div>
                          </SelectItem>
                          <SelectItem value="anhänger">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              Anhänger
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Manufacturer */}
                <FormField
                  control={form.control}
                  name="hersteller"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hersteller *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. John Deere, Mercedes, BMW" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vehicle Model */}
                <FormField
                  control={form.control}
                  name="modell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modell</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Modell auswählen (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleModels.map((model) => (
                            <SelectItem key={model.id} value={model.id.toString()}>
                              {model.attributes?.name || model.name || 'Unbekannt'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Wählen Sie ein vordefiniertes Modell oder lassen Sie das Feld leer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Build Year */}
                <FormField
                  control={form.control}
                  name="baujahr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baujahr *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1950"
                          max={new Date().getFullYear() + 1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mileage */}
                <FormField
                  control={form.control}
                  name="kilometerstand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilometerstand *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Aktueller Kilometerstand in km</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Technische Daten
              </CardTitle>
              <CardDescription>
                Kraftstoff, Status und technische Eigenschaften
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fuel Type */}
                <FormField
                  control={form.control}
                  name="kraftstoffart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kraftstoffart *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kraftstoff auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="diesel">
                            <div className="flex items-center gap-2">
                              <Fuel className="h-4 w-4" />
                              Diesel
                            </div>
                          </SelectItem>
                          <SelectItem value="benzin">
                            <div className="flex items-center gap-2">
                              <Fuel className="h-4 w-4" />
                              Benzin
                            </div>
                          </SelectItem>
                          <SelectItem value="elektro">
                            <div className="flex items-center gap-2">
                              <Fuel className="h-4 w-4" />
                              Elektro
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Status auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="verfügbar">Verfügbar</SelectItem>
                          <SelectItem value="im_einsatz">Im Einsatz</SelectItem>
                          <SelectItem value="wartung">Wartung</SelectItem>
                          <SelectItem value="defekt">Defekt</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TÜV Date */}
                <FormField
                  control={form.control}
                  name="tuev_bis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TÜV gültig bis *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="standort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standort</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Hof 1, Werkstatt, Garage A" {...field} />
                      </FormControl>
                      <FormDescription>Aktueller Standort des Fahrzeugs</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Weitere Informationen
              </CardTitle>
              <CardDescription>
                Zusätzliche Bezeichnung und Beschreibung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Designation */}
              <FormField
                control={form.control}
                name="bezeichnung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bezeichnung</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Feldtraktor 1, Lieferwagen Nord" {...field} />
                    </FormControl>
                    <FormDescription>Interne Bezeichnung für das Fahrzeug</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Usage Description */}
              <FormField
                control={form.control}
                name="nutzungsbeschreibung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nutzungsbeschreibung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschreiben Sie den hauptsächlichen Einsatzbereich..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Beschreibung des Einsatzbereichs und der Verwendung
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading
                ? (isEditMode ? 'Aktualisiere...' : 'Erstelle...')
                : (isEditMode ? 'Fahrzeug aktualisieren' : 'Fahrzeug erstellen')
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}