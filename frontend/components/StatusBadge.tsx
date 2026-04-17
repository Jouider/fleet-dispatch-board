import { Badge } from '@/components/ui/badge'
import { TripStatus } from '@/lib/api'
import { cn } from '@/lib/utils'

const config: Record<TripStatus, { label: string; className: string }> = {
  planned:     { label: 'Planned',     className: 'bg-zinc-100 text-zinc-600 border-zinc-300' },
  assigned:    { label: 'Assigned',    className: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed:   { label: 'Completed',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled:   { label: 'Cancelled',   className: 'bg-red-50 text-red-600 border-red-200' },
}

export function StatusBadge({ status }: { status: TripStatus }) {
  const { label, className } = config[status] ?? config.planned
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', className)}>
      {label}
    </Badge>
  )
}
