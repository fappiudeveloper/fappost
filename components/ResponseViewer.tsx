'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn, formatBytes, formatDuration, getStatusBgColor } from '@/lib/utils'
import { JsonViewer } from './JsonViewer'
import type { ResponseState } from '@/lib/types'

interface ResponseViewerProps {
  response: ResponseState
}

type Tab = 'pretty' | 'raw' | 'headers'

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [tab, setTab] = useState<Tab>('pretty')
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(response.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusStyle = getStatusBgColor(response.status)

  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 flex-wrap">
        <span className={cn('rounded border px-2 py-0.5 text-xs font-bold font-mono', statusStyle)}>
          {response.status}
        </span>
        <span className="text-xs text-zinc-400">{response.statusText}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
            {formatDuration(response.time)}
          </span>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
            {formatBytes(response.size)}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-zinc-800">
        {(['pretty', 'raw', 'headers'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-xs font-medium capitalize transition-colors',
              tab === t
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {t}
            {t === 'headers' && (
              <span className="ml-1 text-[10px] text-zinc-600">
                ({Object.keys(response.headers).length})
              </span>
            )}
          </button>
        ))}
        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1 px-4 py-2.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="overflow-auto max-h-[50vh] min-h-[120px]">
        {tab === 'pretty' && (
          <div className="p-3">
            {response.bodyJson !== undefined ? (
              <JsonViewer data={response.bodyJson} />
            ) : (
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-all font-mono leading-relaxed">
                {response.body || <span className="text-zinc-600">(empty body)</span>}
              </pre>
            )}
          </div>
        )}

        {tab === 'raw' && (
          <div className="p-3">
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-all font-mono leading-relaxed">
              {response.body || <span className="text-zinc-600">(empty body)</span>}
            </pre>
          </div>
        )}

        {tab === 'headers' && (
          <div className="divide-y divide-zinc-800">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-3 px-4 py-2.5">
                <span className="text-xs font-mono text-purple-400 shrink-0 w-44 truncate">{key}</span>
                <span className="text-xs font-mono text-zinc-300 break-all">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
