'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, MapPin, Clock, User, Truck, CheckCircle2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { driversApi, vehiclesApi, tripsApi, Trip, Driver, Vehicle } from '@/lib/api'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Props {
  trip: Trip | null
  open: boolean
  onClose: () => void
  onAssigned: (trip: Trip) => void
}

const driverStatusStyle: Record<string, string> = {
  available:   'text-emerald-600 bg-emerald-50 border-emerald-200',
  unavailable: 'text-red-500 bg-red-50 border-red-200',
  on_leave:    'text-amber-600 bg-amber-50 border-amber-200',
}

const vehicleStatusStyle: Record<string, string> = {
  available:      'text-emerald-600 bg-emerald-50 border-emerald-200',
  in_maintenance: 'text-amber-600 bg-amber-50 border-amber-200',
  retired:        'text-zinc-500 bg-zinc-100 border-zinc-200',
}

function SelectCard({
  selected, onClick, disabled, children,
}: { selected: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left rounded-lg border px-3 py-2.5 transition-all',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
          : 'border-border hover:border-primary/40 hover:bg-muted/40',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
      )}
    >
      {children}
    </button>
  )
}

export function AssignModal({ trip, open, onClose, onAssigned }: Props) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [driverId, setDriverId] = useState<number | null>(null)
  const [vehicleId, setVehicleId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!open) return
    setFetching(true)
    setDriverId(trip?.driver_id ?? null)
    setVehicleId(trip?.vehicle_id ?? null)
    Promise.all([driversApi.list(), vehiclesApi.list()])
      .then(([d, v]) => { setDrivers(d); setVehicles(v) })
      .finally(() => setFetching(false))
  }, [open, trip])

  async function handleSubmit() {
    if (!trip || !driverId || !vehicleId) return
    setLoading(true)
    try {
      const updated = await tripsApi.assign(trip.id, driverId, vehicleId)
      toast.success('Trip assigned successfully')
      onAssigned(updated)
      onClose()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const availableDrivers = drivers.filter(d => d.status === 'available')
  const otherDrivers = drivers.filter(d => d.status !== 'available')
  const availableVehicles = vehicles.filter(v => v.status === 'available')
  const otherVehicles = vehicles.filter(v => v.status !== 'available')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Trip</DialogTitle>
        </DialogHeader>

        {/* Trip summary */}
        {trip && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <div className="w-px h-4 bg-border" />
                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{trip.pickup_address}</p>
                <p className="text-sm text-muted-foreground truncate">{trip.dropoff_address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono pt-1 border-t border-border">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(trip.scheduled_at), 'EEE dd MMM, HH:mm')}
              </span>
              <span className="text-border">·</span>
              <span>{trip.duration_minutes} min</span>
            </div>
          </div>
        )}

        <Separator />

        {/* Driver selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Select Driver</span>
            {driverId && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />}
          </div>

          {fetching ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {availableDrivers.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground px-1">Available</p>
                  {availableDrivers.map(d => (
                    <SelectCard key={d.id} selected={driverId === d.id} onClick={() => setDriverId(d.id)}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
                            {d.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium truncate">{d.name}</span>
                          {d.license_no && <span className="text-xs text-muted-foreground font-mono hidden sm:block">{d.license_no}</span>}
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border shrink-0', driverStatusStyle[d.status])}>
                          {d.status}
                        </span>
                      </div>
                    </SelectCard>
                  ))}
                </>
              )}
              {otherDrivers.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground px-1 mt-2">Unavailable</p>
                  {otherDrivers.map(d => (
                    <SelectCard key={d.id} selected={driverId === d.id} onClick={() => setDriverId(d.id)} disabled>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground">
                            {d.name.charAt(0)}
                          </div>
                          <span className="text-sm text-muted-foreground truncate">{d.name}</span>
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border shrink-0', driverStatusStyle[d.status])}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </div>
                    </SelectCard>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Vehicle selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Select Vehicle</span>
            {vehicleId && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />}
          </div>

          {fetching ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {availableVehicles.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground px-1">Available</p>
                  {availableVehicles.map(v => (
                    <SelectCard key={v.id} selected={vehicleId === v.id} onClick={() => setVehicleId(v.id)}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Truck className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-medium truncate block">{v.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{v.plate}</span>
                          </div>
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border shrink-0', vehicleStatusStyle[v.status])}>
                          {v.status}
                        </span>
                      </div>
                    </SelectCard>
                  ))}
                </>
              )}
              {otherVehicles.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground px-1 mt-2">Unavailable</p>
                  {otherVehicles.map(v => (
                    <SelectCard key={v.id} selected={vehicleId === v.id} onClick={() => setVehicleId(v.id)} disabled>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm text-muted-foreground truncate block">{v.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{v.plate}</span>
                          </div>
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border shrink-0', vehicleStatusStyle[v.status])}>
                          {v.status.replace('_', ' ')}
                        </span>
                      </div>
                    </SelectCard>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Warning if selecting unavailable */}
        {(driverId && drivers.find(d => d.id === driverId)?.status !== 'available') && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Selected driver is not available — assignment may fail.
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !driverId || !vehicleId} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Assign Trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
