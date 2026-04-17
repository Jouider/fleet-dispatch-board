'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, MapPin, ArrowRight, CalendarClock, Timer, AlignLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Trip, tripsApi } from '@/lib/api'
import { format, addMinutes } from 'date-fns'
import { cn } from '@/lib/utils'

interface Props {
  trip?: Trip | null
  open: boolean
  onClose: () => void
  onSaved: (trip: Trip) => void
}

const PRIORITY_OPTIONS = [
  { value: 'high',   label: 'High',   color: 'border-red-300 bg-red-50 text-red-700 data-[selected=true]:ring-red-400 data-[selected=true]:border-red-400 data-[selected=true]:bg-red-100' },
  { value: 'medium', label: 'Medium', color: 'border-amber-300 bg-amber-50 text-amber-700 data-[selected=true]:ring-amber-400 data-[selected=true]:border-amber-400 data-[selected=true]:bg-amber-100' },
  { value: 'low',    label: 'Low',    color: 'border-emerald-300 bg-emerald-50 text-emerald-700 data-[selected=true]:ring-emerald-400 data-[selected=true]:border-emerald-400 data-[selected=true]:bg-emerald-100' },
]

const DURATION_PRESETS = [
  { label: '30m',  value: 30 },
  { label: '1h',   value: 60 },
  { label: '1h30', value: 90 },
  { label: '2h',   value: 120 },
  { label: '3h',   value: 180 },
  { label: '4h',   value: 240 },
]

const defaultForm = {
  pickup_address: '',
  dropoff_address: '',
  scheduled_date: '',
  scheduled_time: '',
  duration_minutes: 120,
  priority: 'medium',
  notes: '',
}

export function TripFormModal({ trip, open, onClose, onSaved }: Props) {
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && trip) {
      const dt = new Date(trip.scheduled_at)
      setForm({
        pickup_address:   trip.pickup_address,
        dropoff_address:  trip.dropoff_address,
        scheduled_date:   format(dt, 'yyyy-MM-dd'),
        scheduled_time:   format(dt, 'HH:mm'),
        duration_minutes: trip.duration_minutes,
        priority:         trip.priority,
        notes:            trip.notes ?? '',
      })
    } else if (open) {
      // Default to tomorrow 08:00
      const tomorrow = addMinutes(new Date(), 24 * 60)
      setForm({
        ...defaultForm,
        scheduled_date: format(tomorrow, 'yyyy-MM-dd'),
        scheduled_time: '08:00',
      })
    }
  }, [open, trip])

  function set(key: string, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Compute end time preview
  const endTime = form.scheduled_date && form.scheduled_time
    ? format(
        addMinutes(new Date(`${form.scheduled_date}T${form.scheduled_time}`), form.duration_minutes),
        'HH:mm'
      )
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const scheduled_at = `${form.scheduled_date} ${form.scheduled_time}:00`
      const payload: Partial<Trip> = {
        pickup_address:   form.pickup_address,
        dropoff_address:  form.dropoff_address,
        scheduled_at,
        duration_minutes: form.duration_minutes,
        priority:         form.priority as Trip['priority'],
        notes:            form.notes || null,
      }
      const saved = trip
        ? await tripsApi.update(trip.id, payload)
        : await tripsApi.create(payload)
      toast.success(trip ? 'Trip updated' : 'Trip created')
      onSaved(saved)
      onClose()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{trip ? 'Edit Trip' : 'New Trip'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Route */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" /> Route
            </Label>
            <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <Input
                  placeholder="Pickup address"
                  value={form.pickup_address}
                  onChange={e => set('pickup_address', e.target.value)}
                  required
                  className="border-0 bg-transparent px-0 h-7 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                <Input
                  placeholder="Dropoff address"
                  value={form.dropoff_address}
                  onChange={e => set('dropoff_address', e.target.value)}
                  required
                  className="border-0 bg-transparent px-0 h-7 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="h-4 w-4 text-muted-foreground" /> Schedule
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Date</p>
                <Input
                  type="date"
                  value={form.scheduled_date}
                  onChange={e => set('scheduled_date', e.target.value)}
                  required
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Time</p>
                <Input
                  type="time"
                  value={form.scheduled_time}
                  onChange={e => set('scheduled_time', e.target.value)}
                  required
                  className="bg-muted/30"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Timer className="h-4 w-4 text-muted-foreground" /> Duration
              </Label>
              {endTime && form.scheduled_time && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {form.scheduled_time} <ArrowRight className="h-3 w-3" /> {endTime}
                </span>
              )}
            </div>
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set('duration_minutes', p.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                    form.duration_minutes === p.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* Custom input */}
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={15}
                max={1440}
                value={form.duration_minutes}
                onChange={e => set('duration_minutes', Number(e.target.value))}
                required
                className="bg-muted/30 w-28"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
              <span className="text-xs text-muted-foreground">
                ({Math.floor(form.duration_minutes / 60)}h{form.duration_minutes % 60 > 0 ? ` ${form.duration_minutes % 60}m` : ''})
              </span>
            </div>
          </div>

          <Separator />

          {/* Priority */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('priority', opt.value)}
                  data-selected={form.priority === opt.value}
                  className={cn(
                    'px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    opt.color,
                    form.priority === opt.value
                      ? 'ring-2 ring-offset-1'
                      : 'opacity-60 hover:opacity-90'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              Notes <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </Label>
            <Textarea
              placeholder="Additional instructions or context…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              className="bg-muted/30 resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {trip ? 'Save Changes' : 'Create Trip'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
