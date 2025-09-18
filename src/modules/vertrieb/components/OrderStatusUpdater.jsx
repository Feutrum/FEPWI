/**
 * ORDER STATUS UPDATER COMPONENT
 *
 * Handles updating order status through lifecycle (VT-06)
 * Als Auftragsbearbeiter möchte ich den Status von Aufträgen ändern können
 *
 * Status lifecycle: offen → in_bearbeitung → in_lieferung → geliefert → storniert
 *
 * Features:
 * - Current order status display
 * - Status transition selection
 * - Status change validation
 * - Status update confirmation
 *
 * @author BEPWI Development Team
 * @version 1.0
 */

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  User,
  Calendar,
  Euro
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
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { toast } from 'sonner'

// =================================================================
// VALIDATION SCHEMA
// =================================================================

const statusUpdateSchema = z.object({
  status: z.enum(['offen', 'in_bearbeitung', 'in_lieferung', 'geliefert', 'storniert'])
})

// =================================================================
// STATUS CONFIGURATION
// =================================================================

const statusConfig = {
  offen: {
    icon: Clock,
    variant: 'secondary',
    text: 'Offen',
    color: 'text-yellow-600',
    description: 'Auftrag wurde erstellt und wartet auf Bearbeitung'
  },
  in_bearbeitung: {
    icon: Package,
    variant: 'default',
    text: 'In Bearbeitung',
    color: 'text-blue-600',
    description: 'Auftrag wird derzeit bearbeitet und vorbereitet'
  },
  in_lieferung: {
    icon: Truck,
    variant: 'default',
    text: 'In Lieferung',
    color: 'text-purple-600',
    description: 'Auftrag ist unterwegs zum Kunden'
  },
  geliefert: {
    icon: CheckCircle,
    variant: 'success',
    text: 'Geliefert',
    color: 'text-green-600',
    description: 'Auftrag wurde erfolgreich geliefert'
  },
  storniert: {
    icon: XCircle,
    variant: 'destructive',
    text: 'Storniert',
    color: 'text-red-600',
    description: 'Auftrag wurde storniert und wird nicht ausgeführt'
  }
}

// Valid status transitions
const statusTransitions = {
  offen: ['in_bearbeitung', 'storniert'],
  in_bearbeitung: ['in_lieferung', 'storniert'],
  in_lieferung: ['geliefert', 'storniert'],
  geliefert: [], // Terminal state
  storniert: [] // Terminal state
}

// =================================================================
// COMPONENT
// =================================================================

export default function OrderStatusUpdater({ order, onSubmit, onCancel }) {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [loading, setLoading] = useState(false)

  // =================================================================
  // FORM SETUP
  // =================================================================

  const currentStatus = (order.attributes || order).status || 'offen'

  const form = useForm({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: currentStatus
    }
  })

  // =================================================================
  // FORM HANDLERS
  // =================================================================

  /**
   * Handle form submission
   */
  const handleSubmit = async (data) => {
    if (data.status === currentStatus) {
      toast.error('Status nicht geändert', {
        description: 'Der ausgewählte Status ist bereits der aktuelle Status'
      })
      return
    }

    try {
      setLoading(true)
      await onSubmit(order.id, data.status)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    form.reset()
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

  /**
   * Get available status transitions
   */
  const getAvailableTransitions = () => {
    return statusTransitions[currentStatus] || []
  }

  /**
   * Check if status change is valid
   */
  const isValidTransition = (newStatus) => {
    return getAvailableTransitions().includes(newStatus)
  }

  const availableStatuses = getAvailableTransitions()
  const currentStatusConfig = statusConfig[currentStatus]
  const CurrentStatusIcon = currentStatusConfig.icon

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Current Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Auftragsübersicht
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Auftrags-ID</h4>
                <p className="font-medium">{(order.attributes || order).aufid || `AUF-${order.id}`}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Kunde</h4>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{(order.attributes || order).angebot?.data?.attributes?.kunde?.data?.attributes?.name || 'Unbekannt'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Gesamtpreis</h4>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  <span className="font-semibold">{formatCurrency((order.attributes || order).gesamtpreis)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Lieferdatum</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate((order.attributes || order).lieferdatum)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrentStatusIcon className="h-5 w-5" />
              Aktueller Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={currentStatusConfig.variant} className="gap-2 px-3 py-1">
                <CurrentStatusIcon className="h-4 w-4" />
                {currentStatusConfig.text}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {currentStatusConfig.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Update */}
        {availableStatuses.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Status ändern
              </CardTitle>
              <CardDescription>
                Wählen Sie den neuen Status für diesen Auftrag
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neuer Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Current status (disabled) */}
                        <SelectItem value={currentStatus} disabled>
                          <div className="flex items-center gap-2">
                            <CurrentStatusIcon className="h-4 w-4" />
                            {currentStatusConfig.text} (Aktuell)
                          </div>
                        </SelectItem>

                        {/* Available transitions */}
                        {availableStatuses.map((status) => {
                          const config = statusConfig[status]
                          const StatusIcon = config.icon
                          return (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                <StatusIcon className="h-4 w-4" />
                                {config.text}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Mögliche nächste Schritte für diesen Auftrag
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status change preview */}
              {form.watch('status') !== currentStatus && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Statuswechsel Vorschau</h4>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <Badge variant={currentStatusConfig.variant} className="gap-1">
                        <CurrentStatusIcon className="h-3 w-3" />
                        {currentStatusConfig.text}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Aktuell</p>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />

                    <div className="text-center">
                      {(() => {
                        const newStatus = form.watch('status')
                        const newConfig = statusConfig[newStatus]
                        const NewStatusIcon = newConfig.icon
                        return (
                          <>
                            <Badge variant={newConfig.variant} className="gap-1">
                              <NewStatusIcon className="h-3 w-3" />
                              {newConfig.text}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">Neu</p>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {statusConfig[form.watch('status')]?.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Keine weiteren Statusänderungen möglich
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentStatus === 'geliefert'
                    ? 'Dieser Auftrag wurde bereits erfolgreich geliefert.'
                    : 'Dieser Auftrag wurde storniert.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Abbrechen
          </Button>

          {availableStatuses.length > 0 && (
            <Button
              type="submit"
              disabled={loading || form.watch('status') === currentStatus}
            >
              {loading ? 'Aktualisiere...' : 'Status ändern'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}