import { Badge } from '@/components/ui/badge'
import { TripPriority } from '@/lib/api'
import { cn } from '@/lib/utils'

const config: Record<TripPriority, { label: string; className: string }> = {
  high:   { label: 'High',   className: 'bg-red-50 text-red-600 border-red-200' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: 'Low',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

export function PriorityBadge({ priority }: { priority: TripPriority }) {
  const { label, className } = config[priority] ?? config.medium
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', className)}>
      {label}
    </Badge>
  )
}
