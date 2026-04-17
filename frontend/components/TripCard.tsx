'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Clock, User, Truck, MoreVertical, Pencil, Trash2, Play, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { PriorityBadge } from './PriorityBadge'
import { Trip, tripsApi, TripStatus } from '@/lib/api'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Props {
  trip: Trip
  onAssign: (trip: Trip) => void
  onEdit: (trip: Trip) => void
  onDeleted: (id: number) => void
  onStatusChange: (trip: Trip) => void
}

const nextStatus: Partial<Record<TripStatus, TripStatus>> = {
  assigned:    'in_progress',
  in_progress: 'completed',
}

const advanceConfig: Partial<Record<TripStatus, { label: string; icon: typeof Play; className: string }>> = {
  assigned:    { label: 'Start',    icon: Play,          className: 'bg-blue-600 hover:bg-blue-700 text-white' },
  in_progress: { label: 'Complete', icon: CheckCircle2,  className: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
}

export function TripCard({ trip, onAssign, onEdit, onDeleted, onStatusChange }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  const canAssign  = trip.status === 'planned' || trip.status === 'assigned'
  const canAdvance = !!nextStatus[trip.status]
  const canEdit    = !['in_progress', 'completed', 'cancelled'].includes(trip.status)
  const canDelete  = trip.status !== 'in_progress'
  const isCompleted = trip.status === 'completed'

  const advance = advanceConfig[trip.status]

  async function handleAdvance() {
    const status = nextStatus[trip.status]
    if (!status) return
    setLoading(true)
    try {
      const updated = await tripsApi.updateStatus(trip.id, status)
      onStatusChange(updated)
      toast.success(`Trip marked as ${status.replace('_', ' ')}`)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    setLoading(true)
    try {
      const updated = await tripsApi.updateStatus(trip.id, 'cancelled')
      onStatusChange(updated)
      toast.success('Trip cancelled')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (loading) return
    setLoading(true)
    setConfirmDelete(false)
    try {
      await tripsApi.delete(trip.id)
      onDeleted(trip.id)
      toast.success('Trip deleted')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className={cn(
        'bg-card border-border hover:border-primary/30 transition-colors group shrink-0',
        isCompleted && 'opacity-70'
      )}>
        <CardContent className="p-3.5 space-y-2.5">

          {/* Row 1: priority + menu */}
          <div className="flex items-center justify-between gap-2">
            <PriorityBadge priority={trip.priority} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mr-1"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canAssign && (
                  <DropdownMenuItem onClick={() => onAssign(trip)}>
                    <Truck className="mr-2 h-3.5 w-3.5" />
                    {trip.status === 'assigned' ? 'Reassign' : 'Assign'}
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(trip)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                )}
                {!['completed', 'cancelled'].includes(trip.status) && (
                  <DropdownMenuItem onClick={handleCancel} className="text-red-500 focus:text-red-500">
                    <XCircle className="mr-2 h-3.5 w-3.5" /> Cancel
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-red-500 focus:text-red-500">
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 2: route */}
          <div className="flex gap-2.5">
            {/* Connector dots */}
            <div className="flex flex-col items-center gap-0.5 pt-1 shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="w-px flex-1 bg-border min-h-[10px]" />
              <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
            </div>
            {/* Addresses */}
            <div className="min-w-0 space-y-1 flex-1">
              <p className="text-xs font-medium text-foreground truncate leading-5">{trip.pickup_address}</p>
              <p className="text-xs text-muted-foreground truncate leading-5">{trip.dropoff_address}</p>
            </div>
          </div>

          {/* Row 3: time */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="font-mono">{format(new Date(trip.scheduled_at), 'MMM d, HH:mm')}</span>
            <span className="text-border">·</span>
            <span>{trip.duration_minutes}min</span>
          </div>

          {/* Row 4: driver + vehicle (if assigned) */}
          {(trip.driver || trip.vehicle) && (
            <div className="flex items-center gap-3 pt-0.5 border-t border-border/60 text-xs text-muted-foreground">
              {trip.driver && (
                <span className="flex items-center gap-1 min-w-0">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate">{trip.driver.name}</span>
                </span>
              )}
              {trip.driver && trip.vehicle && (
                <span className="text-border shrink-0">·</span>
              )}
              {trip.vehicle && (
                <span className="flex items-center gap-1 min-w-0">
                  <Truck className="h-3 w-3 shrink-0" />
                  <span className="font-mono truncate">{trip.vehicle.plate}</span>
                </span>
              )}
            </div>
          )}

          {/* Row 5: actions */}
          {(canAssign || canAdvance) && (
            <div className="flex items-center gap-2 pt-0.5">
              {trip.status === 'planned' && (
                <button
                  onClick={() => onAssign(trip)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Assign <ArrowRight className="h-3 w-3" />
                </button>
              )}
              {trip.status === 'assigned' && (
                <button
                  onClick={() => onAssign(trip)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reassign
                </button>
              )}
              {canAdvance && advance && (
                <button
                  onClick={handleAdvance}
                  disabled={loading}
                  className={cn(
                    'ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-colors disabled:opacity-50',
                    advance.className
                  )}
                >
                  <advance.icon className="h-3 w-3" />
                  {advance.label}
                </button>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              {trip.pickup_address} → {trip.dropoff_address}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
