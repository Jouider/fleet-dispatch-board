'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, User, Truck, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TripCard } from '@/components/TripCard'
import { AssignModal } from '@/components/AssignModal'
import { TripFormModal } from '@/components/TripFormModal'
import { FilterPopover, FilterOption } from '@/components/FilterPopover'
import { tripsApi, Trip, TripsByStatus, TripStatus } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const COLUMNS: { status: TripStatus; label: string; color: string; dot: string }[] = [
  { status: 'planned',     label: 'Planned',     color: 'bg-zinc-100 border-zinc-200',      dot: 'bg-zinc-400' },
  { status: 'assigned',    label: 'Assigned',    color: 'bg-blue-50 border-blue-200',       dot: 'bg-blue-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-amber-50 border-amber-200',     dot: 'bg-amber-500' },
  { status: 'completed',   label: 'Completed',   color: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
]

export default function DispatchBoard() {
  const [tripsByStatus, setTripsByStatus] = useState<TripsByStatus>({})
  const [loading, setLoading]             = useState(true)
  const [refreshing, setRefreshing]       = useState(false)
  const [assignTrip, setAssignTrip]       = useState<Trip | null>(null)
  const [editTrip, setEditTrip]           = useState<Trip | null>(null)
  const [createOpen, setCreateOpen]       = useState(false)

  // ── Filters ────────────────────────────────────────────────────────────────
  const [driverFilter,  setDriverFilter]  = useState<Set<number>>(new Set())
  const [vehicleFilter, setVehicleFilter] = useState<Set<number>>(new Set())

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

  // ── Derive unique drivers + vehicles from all trips ────────────────────────
  const allTrips = useMemo(
    () => Object.values(tripsByStatus).flat(),
    [tripsByStatus]
  )

  const driverOptions = useMemo<FilterOption[]>(() => {
    const seen = new Map<number, FilterOption>()
    allTrips.forEach(t => {
      if (t.driver && !seen.has(t.driver.id)) {
        seen.set(t.driver.id, {
          id:       t.driver.id,
          label:    t.driver.name,
          sub:      t.driver.license_no ?? undefined,
          initials: t.driver.name.charAt(0).toUpperCase(),
        })
      }
    })
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [allTrips])

  const vehicleOptions = useMemo<FilterOption[]>(() => {
    const seen = new Map<number, FilterOption>()
    allTrips.forEach(t => {
      if (t.vehicle && !seen.has(t.vehicle.id)) {
        seen.set(t.vehicle.id, {
          id:    t.vehicle.id,
          label: t.vehicle.name,
          sub:   t.vehicle.plate,
        })
      }
    })
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [allTrips])

  // ── Toggle helpers ─────────────────────────────────────────────────────────
  function toggleDriver(id: number) {
    setDriverFilter(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleVehicle(id: number) {
    setVehicleFilter(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const hasFilters   = driverFilter.size > 0 || vehicleFilter.size > 0
  const totalFilters = driverFilter.size + vehicleFilter.size

  function clearAll() {
    setDriverFilter(new Set())
    setVehicleFilter(new Set())
  }

  // ── Apply filters ──────────────────────────────────────────────────────────
  const filteredByStatus = useMemo<TripsByStatus>(() => {
    if (!hasFilters) return tripsByStatus

    const filter = (trips: Trip[] = []) =>
      trips.filter(t => {
        const driverOk  = driverFilter.size  === 0 || (t.driver_id  != null && driverFilter.has(t.driver_id))
        const vehicleOk = vehicleFilter.size === 0 || (t.vehicle_id != null && vehicleFilter.has(t.vehicle_id))
        return driverOk && vehicleOk
      })

    return {
      planned:     filter(tripsByStatus.planned),
      assigned:    filter(tripsByStatus.assigned),
      in_progress: filter(tripsByStatus.in_progress),
      completed:   filter(tripsByStatus.completed),
    }
  }, [tripsByStatus, driverFilter, vehicleFilter, hasFilters])

  const totalTrips    = allTrips.length
  const filteredTotal = Object.values(filteredByStatus).flat().length

  // ── Chip helpers ───────────────────────────────────────────────────────────
  const selectedDriverChips = useMemo(
    () => driverOptions.filter(o => driverFilter.has(o.id)),
    [driverOptions, driverFilter]
  )
  const selectedVehicleChips = useMemo(
    () => vehicleOptions.filter(o => vehicleFilter.has(o.id)),
    [vehicleOptions, vehicleFilter]
  )

  // ── Trip handlers ──────────────────────────────────────────────────────────
  function handleTripUpdate(updated: Trip) {
    setTripsByStatus(prev => {
      const next = { ...prev }
      for (const key of Object.keys(next) as TripStatus[]) {
        next[key] = (next[key] ?? []).filter(t => t.id !== updated.id)
      }
      next[updated.status] = [updated, ...(next[updated.status] ?? [])]
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
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Dispatch Board</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasFilters
                ? <>{filteredTotal} of {totalTrips} trips</>
                : <>{totalTrips} trips total</>
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter popovers */}
            <div className="flex items-center gap-1.5">
              <span className={cn(
                'flex items-center gap-1 text-xs text-muted-foreground mr-1 transition-opacity',
                hasFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}>
                <SlidersHorizontal className="h-3 w-3" />
                Filters
              </span>

              <FilterPopover
                label="Driver"
                icon={<User className="h-3.5 w-3.5" />}
                options={driverOptions}
                selected={driverFilter}
                onToggle={toggleDriver}
                onClear={() => setDriverFilter(new Set())}
              />

              <FilterPopover
                label="Vehicle"
                icon={<Truck className="h-3.5 w-3.5" />}
                options={vehicleOptions}
                selected={vehicleFilter}
                onToggle={toggleVehicle}
                onClear={() => setVehicleFilter(new Set())}
              />

              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="w-px h-5 bg-border" />

            <Button variant="ghost" size="sm" onClick={() => load(true)} disabled={refreshing} className="h-8 w-8 p-0">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New Trip
            </Button>
          </div>
        </div>

        {/* ── Active filter chips ──────────────────────────────────────── */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {selectedDriverChips.map(o => (
              <span
                key={`d-${o.id}`}
                className="inline-flex items-center gap-1.5 h-6 pl-2 pr-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
              >
                <User className="h-3 w-3 shrink-0" />
                {o.label}
                <button
                  onClick={() => toggleDriver(o.id)}
                  className="flex items-center justify-center h-4 w-4 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}

            {selectedVehicleChips.map(o => (
              <span
                key={`v-${o.id}`}
                className="inline-flex items-center gap-1.5 h-6 pl-2 pr-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-medium text-violet-700"
              >
                <Truck className="h-3 w-3 shrink-0" />
                {o.label}
                {o.sub && <span className="font-mono text-[10px] text-violet-500">{o.sub}</span>}
                <button
                  onClick={() => toggleVehicle(o.id)}
                  className="flex items-center justify-center h-4 w-4 rounded-full hover:bg-violet-100 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}

            {totalFilters > 1 && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <X className="h-2.5 w-2.5" /> Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Board ────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden px-6 py-5">
        <div className="h-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map(({ status, label, color, dot }) => {
            const trips = filteredByStatus[status] ?? []
            const total = tripsByStatus[status]?.length ?? 0
            const isFiltered = hasFilters && trips.length !== total

            return (
              <div key={status} className="flex flex-col min-h-0 gap-3">
                {/* Column header */}
                <div className={`rounded-lg border px-3 py-2.5 ${color} flex items-center justify-between shrink-0`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isFiltered && (
                      <span className="text-[10px] text-muted-foreground">
                        {trips.length}/{total}
                      </span>
                    )}
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-black/10 text-muted-foreground border-0">
                      {trips.length}
                    </Badge>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-36 rounded-lg bg-muted/40 shrink-0" />
                    ))
                  ) : trips.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 min-h-[120px] gap-1">
                      <p className="text-xs text-muted-foreground">
                        {hasFilters ? 'No matches' : 'No trips'}
                      </p>
                      {hasFilters && (
                        <button onClick={clearAll} className="text-[10px] text-primary hover:underline">
                          Clear filters
                        </button>
                      )}
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
