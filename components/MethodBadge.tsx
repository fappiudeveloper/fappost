import { cn } from '@/lib/utils'

const METHOD_STYLES: Record<string, string> = {
  GET:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  POST:    'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PUT:     'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DELETE:  'bg-red-500/20 text-red-400 border-red-500/30',
  PATCH:   'bg-purple-500/20 text-purple-400 border-purple-500/30',
  HEAD:    'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  OPTIONS: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

interface MethodBadgeProps {
  method: string
  size?: 'sm' | 'md'
  className?: string
}

export function MethodBadge({ method, size = 'sm', className }: MethodBadgeProps) {
  const upper = method.toUpperCase()
  const style = METHOD_STYLES[upper] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'

  return (
    <span
      className={cn(
        'inline-block rounded border font-mono font-bold uppercase tracking-tight',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        style,
        className
      )}
    >
      {upper}
    </span>
  )
}
