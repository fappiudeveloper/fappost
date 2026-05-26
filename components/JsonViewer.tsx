'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Lazy-load the JSON viewer to keep the main bundle small
const ReactJsonView = dynamic(
  () => import('react-json-view-lite').then((m) => ({ default: m.JsonView })),
  { ssr: false, loading: () => <div className="text-zinc-500 text-sm p-2">Loading viewer…</div> }
)

interface JsonViewerProps {
  data: unknown
  className?: string
}

export function JsonViewer({ data, className }: JsonViewerProps) {
  return (
    <div className={cn('rounded-lg bg-zinc-900 p-3 text-xs font-mono leading-relaxed', className)}>
      <ReactJsonView
        data={data as object}
        shouldExpandNode={(level) => level < 2}
        clickToExpandNode
      />
    </div>
  )
}

// Fallback simple collapsible for plain objects when react-json-view-lite is loading
interface SimpleJsonNodeProps {
  value: unknown
  depth?: number
}

export function SimpleJsonNode({ value, depth = 0 }: SimpleJsonNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2)

  if (value === null) return <span className="text-zinc-500">null</span>
  if (typeof value === 'boolean') return <span className="text-amber-400">{String(value)}</span>
  if (typeof value === 'number') return <span className="text-blue-400">{value}</span>
  if (typeof value === 'string') return <span className="text-emerald-400">"{value}"</span>

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-zinc-400">[]</span>
    return (
      <span>
        <button onClick={() => setExpanded((e) => !e)} className="inline-flex items-center text-zinc-400 hover:text-zinc-200">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="text-zinc-400">[{value.length}]</span>
        </button>
        {expanded && (
          <div className="ml-4 border-l border-zinc-700 pl-2">
            {value.map((v, i) => (
              <div key={i} className="flex gap-1">
                <span className="text-zinc-600">{i}:</span>
                <SimpleJsonNode value={v} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    )
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value as object)
    if (keys.length === 0) return <span className="text-zinc-400">{'{}'}</span>
    return (
      <span>
        <button onClick={() => setExpanded((e) => !e)} className="inline-flex items-center text-zinc-400 hover:text-zinc-200">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="text-zinc-400">{'{'}{keys.length}{'}'}</span>
        </button>
        {expanded && (
          <div className="ml-4 border-l border-zinc-700 pl-2">
            {keys.map((k) => (
              <div key={k} className="flex gap-1 flex-wrap">
                <span className="text-purple-400">"{k}"</span>
                <span className="text-zinc-500">:</span>
                <SimpleJsonNode value={(value as Record<string, unknown>)[k]} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    )
  }

  return <span className="text-zinc-400">{String(value)}</span>
}
