'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TripCard } from '@/components/TripCard'
import { AssignModal } from '@/components/AssignModal'
import { TripFormModal } from '@/components/TripFormModal'
import { tripsApi, Trip, TripsByStatus, TripStatus } from '@/lib/api'
import { toast } from 'sonner'

const COLUMNS: { status: TripStatus; label: string; color: string; dot: string }[] = [
  { status: 'planned',     label: 'Planned',     color: 'bg-zinc-100 border-zinc-200',        dot: 'bg-zinc-400' },
  { status: 'assigned',    label: 'Assigned',    color: 'bg-blue-50 border-blue-200',         dot: 'bg-blue-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-amber-50 border-amber-200',       dot: 'bg-amber-500' },
  { status: 'completed',   label: 'Completed',   color: 'bg-emerald-50 border-emerald-200',   dot: 'bg-emerald-500' },
]

export default function DispatchBoard() {
  const [tripsByStatus, setTripsByStatus] = useState<TripsByStatus>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [assignTrip, setAssignTrip] = useState<Trip | null>(null)
  const [editTrip, setEditTrip] = useState<Trip | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await tripsApi.list()
      setTripsByStatus(data)
    } catch {
      toast.error('Failed to load trips')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const totalTrips = Object.values(tripsByStatus).flat().length

  function handleTripUpdate(updated: Trip) {
    setTripsByStatus(prev => {
      const next = { ...prev }
      for (const key of Object.keys(next) as TripStatus[]) {
        next[key] = (next[key] ?? []).filter(t => t.id !== updated.id)
      }
      const col = updated.status
      next[col] = [updated, ...(next[col] ?? [])]
      return next
    })
  }

  function handleTripDelete(id: number) {
    setTripsByStatus(prev => {
      const next = { ...prev }
      for (const key of Object.keys(next) as TripStatus[]) {
        next[key] = (next[key] ?? []).filter(t => t.id !== id)
      }
      return next
    })
  }

  function handleTripCreated(trip: Trip) {
    setTripsByStatus(prev => ({
      ...prev,
      planned: [trip, ...(prev.planned ?? [])],
    }))
  }

  return (
    <>
      {/* Page header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Dispatch Board</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{totalTrips} trips total</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => load(true)} disabled={refreshing} className="h-8 w-8 p-0">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Trip
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 min-h-0 overflow-hidden px-6 py-5">
        <div className="h-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map(({ status, label, color, dot }) => {
            const trips = tripsByStatus[status] ?? []
            return (
              <div key={status} className="flex flex-col min-h-0 gap-3">
                {/* Sticky column header */}
                <div className={`rounded-lg border px-3 py-2.5 ${color} flex items-center justify-between shrink-0`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-black/10 text-muted-foreground border-0">
                    {trips.length}
                  </Badge>
                </div>

                {/* Scrollable card list */}
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1
                  scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-40 rounded-lg bg-muted/40 shrink-0" />
                    ))
                  ) : trips.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-border/50 min-h-[120px]">
                      <p className="text-xs text-muted-foreground">No trips</p>
                    </div>
                  ) : (
                    trips.map(trip => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onAssign={setAssignTrip}
                        onEdit={setEditTrip}
                        onDeleted={handleTripDelete}
                        onStatusChange={handleTripUpdate}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AssignModal
        trip={assignTrip}
        open={!!assignTrip}
        onClose={() => setAssignTrip(null)}
        onAssigned={handleTripUpdate}
      />
      <TripFormModal
        trip={null}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={handleTripCreated}
      />
      <TripFormModal
        trip={editTrip}
        open={!!editTrip}
        onClose={() => setEditTrip(null)}
        onSaved={handleTripUpdate}
      />
    </>
  )
}
