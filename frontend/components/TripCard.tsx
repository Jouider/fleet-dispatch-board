'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { MapPin, Clock, User, Truck, MoreVertical, Pencil, Trash2, Play, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { Trip, tripsApi, TripStatus } from '@/lib/api'
import { format } from 'date-fns'

interface Props {
  trip: Trip
  onAssign: (trip: Trip) => void
  onEdit: (trip: Trip) => void
  onDeleted: (id: number) => void
  onStatusChange: (trip: Trip) => void
}

const nextStatus: Partial<Record<TripStatus, TripStatus>> = {
  assigned: 'in_progress',
  in_progress: 'completed',
}

const nextStatusLabel: Partial<Record<TripStatus, string>> = {
  assigned: 'Start Trip',
  in_progress: 'Complete',
}

const nextStatusIcon: Partial<Record<TripStatus, typeof Play>> = {
  assigned: Play,
  in_progress: CheckCircle,
}

export function TripCard({ trip, onAssign, onEdit, onDeleted, onStatusChange }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  const canAssign = trip.status === 'planned' || trip.status === 'assigned'
  const canAdvance = !!nextStatus[trip.status]
  const canEdit = !['in_progress', 'completed', 'cancelled'].includes(trip.status)
  const canDelete = trip.status !== 'in_progress'

  const NextIcon = nextStatusIcon[trip.status]

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
    setLoading(true)
    try {
      await tripsApi.delete(trip.id)
      onDeleted(trip.id)
      toast.success('Trip deleted')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <Card className="bg-card border-border hover:border-primary/40 transition-colors group">
        <CardContent className="p-4 space-y-3">

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge status={trip.status} />
              <PriorityBadge priority={trip.priority} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                {canAssign && (
                  <DropdownMenuItem onClick={() => onAssign(trip)}>
                    <Truck className="mr-2 h-4 w-4" /> Assign
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(trip)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                )}
                {!['completed', 'cancelled'].includes(trip.status) && (
                  <DropdownMenuItem onClick={handleCancel} className="text-red-400 focus:text-red-400">
                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-red-400 focus:text-red-400">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Route */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-foreground truncate">{trip.pickup_address}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span className="text-foreground truncate">{trip.dropoff_address}</span>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Clock className="h-3.5 w-3.5" />
            <span>{format(new Date(trip.scheduled_at), 'MMM d, HH:mm')}</span>
            <span className="text-border">·</span>
            <span>{trip.duration_minutes}min</span>
          </div>

          {/* Driver & Vehicle */}
          {(trip.driver || trip.vehicle) && (
            <div className="pt-1 border-t border-border space-y-1">
              {trip.driver && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span>{trip.driver.name}</span>
                </div>
              )}
              {trip.vehicle && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                  <span>{trip.vehicle.name}</span>
                  <span className="text-border font-mono">{trip.vehicle.plate}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {canAssign && (
              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs border-border" onClick={() => onAssign(trip)}>
                <Truck className="mr-1.5 h-3.5 w-3.5" />
                {trip.status === 'assigned' ? 'Reassign' : 'Assign'}
              </Button>
            )}
            {canAdvance && NextIcon && (
              <Tooltip>
                <TooltipTrigger>
                  <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleAdvance} disabled={loading}>
                    <NextIcon className="mr-1.5 h-3.5 w-3.5" />
                    {nextStatusLabel[trip.status]}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to {nextStatus[trip.status]?.replace('_', ' ')}</TooltipContent>
              </Tooltip>
            )}
          </div>

        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {trip.pickup_address} → {trip.dropoff_address}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
