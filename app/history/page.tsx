'use client'

import { useRouter } from 'next/navigation'
import { Trash2, Clock } from 'lucide-react'
import { useStore } from '@/lib/store'
import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { MethodBadge } from '@/components/MethodBadge'
import { cn, truncateUrl, timeAgo, getStatusBgColor } from '@/lib/utils'

export default function HistoryPage() {
  const router = useRouter()
  const { history, removeFromHistory, clearHistory, setCurrentRequest } = useStore()

  function handleSelect(entry: (typeof history)[number]) {
    setCurrentRequest(entry.request)
    router.push(`/request/${entry.request.collectionItemId ?? 'new'}`)
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <AppHeader
        title="History"
        right={
          history.length > 0 ? (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto pb-24">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <Clock className="h-12 w-12 text-zinc-700" />
            <p className="text-sm font-medium text-zinc-400">No request history</p>
            <p className="text-xs text-zinc-600">Requests you send will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleSelect(entry)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-zinc-900/60 active:bg-zinc-900"
              >
                <MethodBadge method={entry.request.method} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-200 font-mono">
                    {truncateUrl(entry.request.url, 50)}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {timeAgo(entry.timestamp)}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold font-mono',
                    getStatusBgColor(entry.response.status)
                  )}
                >
                  {entry.response.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFromHistory(entry.id)
                  }}
                  className="shrink-0 rounded p-1 text-zinc-700 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
