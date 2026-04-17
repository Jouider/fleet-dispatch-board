'use client'

import { useState, useMemo } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FilterOption {
  id: number
  label: string
  sub?: string           // secondary line (e.g. plate number)
  initials?: string      // for avatar-style rendering
}

interface Props {
  label: string          // "Driver" | "Vehicle"
  icon: React.ReactNode
  options: FilterOption[]
  selected: Set<number>
  onToggle: (id: number) => void
  onClear: () => void
}

export function FilterPopover({ label, icon, options, selected, onToggle, onClear }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() =>
    query.trim()
      ? options.filter(o =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.sub?.toLowerCase().includes(query.toLowerCase())
        )
      : options,
    [options, query]
  )

  const count = selected.size

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 gap-1.5 text-xs font-medium border-border transition-colors',
            count > 0 && 'border-primary/50 bg-primary/5 text-primary hover:bg-primary/10'
          )}
        >
          {icon}
          {label}
          {count > 0 && (
            <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
              {count}
            </span>
          )}
          <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-60 p-0 shadow-lg">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground/60"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Options */}
        <div className="max-h-52 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No results</p>
          ) : (
            filtered.map(opt => {
              const isSelected = selected.has(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => onToggle(opt.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/60 transition-colors',
                    isSelected && 'bg-primary/5'
                  )}
                >
                  {/* Checkbox */}
                  <span className={cn(
                    'h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-border bg-background'
                  )}>
                    {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </span>

                  {/* Avatar / initials */}
                  {opt.initials !== undefined && (
                    <span className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold',
                      isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      {opt.initials}
                    </span>
                  )}

                  {/* Label */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{opt.label}</p>
                    {opt.sub && (
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{opt.sub}</p>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        {count > 0 && (
          <div className="border-t border-border px-3 py-2">
            <button
              onClick={() => { onClear(); setOpen(false) }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear {count} selection{count > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
