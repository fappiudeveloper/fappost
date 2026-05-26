'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { cn, generateId } from '@/lib/utils'
import type { RequestState, HttpMethod, KeyValuePair } from '@/lib/types'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const METHOD_COLORS: Record<string, string> = {
  GET:     'text-emerald-400',
  POST:    'text-blue-400',
  PUT:     'text-amber-400',
  PATCH:   'text-purple-400',
  DELETE:  'text-red-400',
  HEAD:    'text-zinc-400',
  OPTIONS: 'text-zinc-400',
}

type FormTab = 'params' | 'headers' | 'body'

interface RequestFormProps {
  value: RequestState
  onChange: (req: RequestState) => void
}

function KVTable({
  rows,
  onChange,
  keyPlaceholder = 'key',
  valuePlaceholder = 'value',
}: {
  rows: KeyValuePair[]
  onChange: (rows: KeyValuePair[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
}) {
  function updateRow(id: string, field: keyof KeyValuePair, val: string | boolean) {
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: val } : r)))
  }

  function removeRow(id: string) {
    onChange(rows.filter((r) => r.id !== id))
  }

  function addRow() {
    onChange([...rows, { id: generateId(), key: '', value: '', enabled: true }])
  }

  return (
    <div className="space-y-1.5">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => updateRow(row.id, 'enabled', e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-zinc-700 bg-zinc-800 accent-indigo-500"
          />
          <input
            type="text"
            value={row.key}
            onChange={(e) => updateRow(row.id, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-800/60 px-2.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
          />
          <input
            type="text"
            value={row.value}
            onChange={(e) => updateRow(row.id, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-800/60 px-2.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => removeRow(row.id)}
            className="shrink-0 rounded p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={addRow}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-700 px-3 py-2 text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors w-full"
      >
        <Plus className="h-3.5 w-3.5" />
        Add row
      </button>
    </div>
  )
}

export function RequestForm({ value, onChange }: RequestFormProps) {
  const [tab, setTab] = useState<FormTab>('params')

  // Sync URL params into the params table when URL changes
  function handleUrlChange(newUrl: string) {
    try {
      const urlObj = new URL(newUrl.startsWith('http') ? newUrl : `https://${newUrl}`)
      const paramEntries: KeyValuePair[] = []
      urlObj.searchParams.forEach((val, key) => {
        paramEntries.push({ id: generateId(), key, value: val, enabled: true })
      })
      if (paramEntries.length > 0) {
        onChange({ ...value, url: newUrl, params: paramEntries })
        return
      }
    } catch {
      // not a valid URL yet, ignore
    }
    onChange({ ...value, url: newUrl })
  }

  const activeParamsCount = value.params.filter((p) => p.enabled && p.key).length
  const activeHeadersCount = value.headers.filter((h) => h.enabled && h.key).length

  return (
    <div className="flex flex-col gap-3">
      {/* URL bar */}
      <div className="flex items-stretch gap-2">
        <div className="relative">
          <select
            value={value.method}
            onChange={(e) => onChange({ ...value, method: e.target.value as HttpMethod })}
            className={cn(
              'h-full appearance-none rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-3 text-sm font-bold font-mono',
              'focus:border-indigo-500 focus:outline-none cursor-pointer',
              METHOD_COLORS[value.method] ?? 'text-zinc-300'
            )}
          >
            {METHODS.map((m) => (
              <option key={m} value={m} className="text-zinc-200 bg-zinc-900">
                {m}
              </option>
            ))}
          </select>
        </div>
        <input
          type="url"
          value={value.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          inputMode="url"
          autoComplete="url"
          className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none font-mono"
        />
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        {(
          [
            { id: 'params', label: 'Params', count: activeParamsCount },
            { id: 'headers', label: 'Headers', count: activeHeadersCount },
            { id: 'body', label: 'Body', count: value.bodyMode !== 'none' ? 1 : 0 },
          ] as const
        ).map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 py-2.5 text-xs font-medium transition-colors',
              tab === id
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {label}
            {count > 0 && (
              <span className="ml-1 rounded-full bg-indigo-500/30 px-1 text-[10px] text-indigo-400">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'params' && (
          <KVTable
            rows={value.params}
            onChange={(params) => onChange({ ...value, params })}
            keyPlaceholder="param"
          />
        )}

        {tab === 'headers' && (
          <KVTable
            rows={value.headers}
            onChange={(headers) => onChange({ ...value, headers })}
            keyPlaceholder="header"
          />
        )}

        {tab === 'body' && (
          <div className="space-y-2">
            <div className="flex gap-1.5 flex-wrap">
              {(['none', 'raw', 'urlencoded'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onChange({ ...value, bodyMode: mode })}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition-colors',
                    value.bodyMode === mode
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                      : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {mode === 'none' ? 'None' : mode === 'raw' ? 'Raw' : 'x-www-form-urlencoded'}
                </button>
              ))}
            </div>

            {value.bodyMode === 'raw' && (
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  {(['json', 'text', 'xml', 'html'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => onChange({ ...value, bodyLanguage: lang })}
                      className={cn(
                        'rounded border px-2 py-0.5 text-[10px] font-mono uppercase transition-colors',
                        value.bodyLanguage === lang
                          ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
                          : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <textarea
                  value={value.bodyRaw}
                  onChange={(e) => onChange({ ...value, bodyRaw: e.target.value })}
                  placeholder={value.bodyLanguage === 'json' ? '{\n  "key": "value"\n}' : 'Request body...'}
                  rows={6}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-3 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>
            )}

            {value.bodyMode === 'urlencoded' && (
              <KVTable
                rows={value.bodyUrlEncoded}
                onChange={(bodyUrlEncoded) => onChange({ ...value, bodyUrlEncoded })}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
