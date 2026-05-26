'use client'

import { Layers2, ChevronDown, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useEnvironments } from '@/hooks/useEnvironments'
import { cn } from '@/lib/utils'

export function EnvironmentSelector() {
  const { data: environments, isLoading } = useEnvironments()
  const activeEnvironmentId = useStore((s) => s.activeEnvironmentId)
  const setActiveEnvironment = useStore((s) => s.setActiveEnvironment)

  const active = environments?.find((e) => e.id === activeEnvironmentId)

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
        <Layers2 className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
        <select
          value={activeEnvironmentId ?? ''}
          onChange={(e) => setActiveEnvironment(e.target.value || null)}
          className={cn(
            'flex-1 appearance-none bg-transparent text-xs focus:outline-none cursor-pointer',
            active ? 'text-zinc-200' : 'text-zinc-500'
          )}
          disabled={isLoading}
        >
          <option value="">No Environment</option>
          {environments?.map((env) => (
            <option key={env.id} value={env.id} className="bg-zinc-900 text-zinc-200">
              {env.name}
            </option>
          ))}
        </select>
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 text-zinc-600 animate-spin" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-600 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
