'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Car, Loader2, Hash, Calendar, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { vehiclesApi, Vehicle, VehicleStatus } from '@/lib/api'

const statusConfig: Record<VehicleStatus, { label: string; className: string; dot: string }> = {
  available:      { label: 'Available',      className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  in_maintenance: { label: 'In Maintenance', className: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  retired:        { label: 'Retired',        className: 'bg-zinc-100 text-zinc-500 border-zinc-300',         dot: 'bg-zinc-400' },
}

const empty = { name: '', plate: '', year: '', status: 'available' as VehicleStatus, mileage: '0' }

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [form, setForm] = useState(empty)

  useEffect(() => {
    vehiclesApi.list().then(setVehicles).finally(() => setLoading(false))
  }, [])

  function openCreate() { setForm(empty); setEditing(null); setOpen(true) }
  function openEdit(v: Vehicle) {
    setForm({ name: v.name, plate: v.plate, year: v.year ?? '', status: v.status, mileage: v.mileage.toString() })
    setEditing(v); setOpen(true)
  }
  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, mileage: Number(form.mileage) }
      if (editing) {
        const updated = await vehiclesApi.update(editing.id, payload)
        setVehicles(p => p.map(v => v.id === editing.id ? updated : v))
        toast.success('Vehicle updated')
        setOpen(false)
      } else {
        const created = await vehiclesApi.create(payload)
        setVehicles(p => [...p, created])
        toast.success('Vehicle created')
        setOpen(false)
      }
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('requires reassignment') || msg.includes('active trips')) {
        toast.error(msg, {
          duration: 8000,
          description: 'Go to Dispatch Board to reassign the active trips first.',
          action: { label: 'Go to Board', onClick: () => window.location.href = '/' },
        })
      } else {
        toast.error(msg)
      }
    }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await vehiclesApi.delete(deleteTarget.id)
      setVehicles(p => p.filter(v => v.id !== deleteTarget.id))
      toast.success('Vehicle deleted')
      setDeleteTarget(null)
    } catch (err) {
      const msg = (err as Error).message
      setDeleteTarget(null)
      toast.error(msg, {
        duration: 8000,
        description: 'Reassign the active trips on the Dispatch Board first.',
        action: { label: 'Go to Board', onClick: () => window.location.href = '/' },
      })
    }
  }

  const filtered = filterStatus === 'all' ? vehicles : vehicles.filter(v => v.status === filterStatus)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold">Vehicles</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{vehicles.length} vehicles total</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v ?? 'all')}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in_maintenance">In Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={openCreate} className="h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Vehicle
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Car className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No vehicles found</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>Add a vehicle</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(vehicle => {
              const sc = statusConfig[vehicle.status]
              return (
                <Card key={vehicle.id} className="border-border hover:border-primary/30 transition-colors group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Car className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{vehicle.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                            <span className="text-xs text-muted-foreground">{sc.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(vehicle)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(vehicle)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Hash className="h-3 w-3 shrink-0" />
                        <span className="font-mono">{vehicle.plate}</span>
                      </div>
                      {vehicle.year && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{vehicle.year}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="text-muted-foreground/60">Mileage:</span>
                        <span className="font-mono">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Badge variant="outline" className={`text-xs ${sc.className}`}>{sc.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Vehicle' : 'New Vehicle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Toyota Hilux" required className="bg-muted/40" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plate</Label>
                <Input value={form.plate} onChange={e => set('plate', e.target.value.toUpperCase())} placeholder="A-1001-BE" required className="bg-muted/40 font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Year <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.year} onChange={e => set('year', e.target.value)} placeholder="2022" maxLength={4} className="bg-muted/40" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set('status', v ?? 'available')}>
                  <SelectTrigger className="bg-muted/40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_maintenance">In Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mileage (km)</Label>
                <Input type="number" min={0} value={form.mileage} onChange={e => set('mileage', e.target.value)} className="bg-muted/40" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This vehicle will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
