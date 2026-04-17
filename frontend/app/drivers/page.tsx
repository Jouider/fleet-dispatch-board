'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Users, Loader2, Phone, CreditCard, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { driversApi, Driver, DriverStatus } from '@/lib/api'
import Link from 'next/link'

const statusConfig: Record<DriverStatus, { label: string; className: string; dot: string }> = {
  available:   { label: 'Available',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  unavailable: { label: 'Unavailable', className: 'bg-red-50 text-red-600 border-red-200',             dot: 'bg-red-500' },
  on_leave:    { label: 'On Leave',    className: 'bg-amber-50 text-amber-700 border-amber-200',        dot: 'bg-amber-500' },
}

const empty = { name: '', phone: '', license_no: '', status: 'available' as DriverStatus }

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Driver | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [form, setForm] = useState(empty)

  useEffect(() => {
    driversApi.list().then(setDrivers).finally(() => setLoading(false))
  }, [])

  function openCreate() { setForm(empty); setEditing(null); setOpen(true) }
  function openEdit(d: Driver) {
    setForm({ name: d.name, phone: d.phone ?? '', license_no: d.license_no ?? '', status: d.status })
    setEditing(d); setOpen(true)
  }
  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) {
        const updated = await driversApi.update(editing.id, form)
        setDrivers(p => p.map(d => d.id === editing.id ? updated : d))
        toast.success('Driver updated')
        setOpen(false)
      } else {
        const created = await driversApi.create(form)
        setDrivers(p => [...p, created])
        toast.success('Driver created')
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
      await driversApi.delete(deleteTarget.id)
      setDrivers(p => p.filter(d => d.id !== deleteTarget.id))
      toast.success('Driver deleted')
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

  const filtered = filterStatus === 'all' ? drivers : drivers.filter(d => d.status === filterStatus)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold">Drivers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{drivers.length} drivers total</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v ?? 'all')}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={openCreate} className="h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Driver
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No drivers found</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>Add a driver</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(driver => {
              const sc = statusConfig[driver.status]
              return (
                <Card key={driver.id} className="border-border hover:border-primary/30 transition-colors group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                          {driver.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{driver.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                            <span className="text-xs text-muted-foreground">{sc.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(driver)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(driver)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {driver.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="truncate">{driver.phone}</span>
                        </div>
                      )}
                      {driver.license_no && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CreditCard className="h-3 w-3 shrink-0" />
                          <span className="font-mono">{driver.license_no}</span>
                        </div>
                      )}
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
            <DialogTitle>{editing ? 'Edit Driver' : 'New Driver'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ahmed Benali" required className="bg-muted/40" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="06XXXXXXXX" pattern="^(\+212|0)(6|7)\d{8}$" title="Numéro marocain valide : 06XXXXXXXX, 07XXXXXXXX ou +212XXXXXXXXX" className="bg-muted/40" />
              </div>
              <div className="space-y-2">
                <Label>License No <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.license_no} onChange={e => set('license_no', e.target.value)} placeholder="DL-001" className="bg-muted/40 font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v ?? 'available')}>
                <SelectTrigger className="bg-muted/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
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
            <AlertDialogDescription>This driver will be permanently removed.</AlertDialogDescription>
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
