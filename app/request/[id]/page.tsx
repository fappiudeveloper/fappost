'use client'

import { use, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useExecuteRequest } from '@/hooks/useRequest'
import { useActiveEnvironment } from '@/hooks/useEnvironments'
import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { RequestForm } from '@/components/RequestForm'
import { ResponseViewer } from '@/components/ResponseViewer'
import { EnvironmentSelector } from '@/components/EnvironmentSelector'
import { resolveVariables, buildVariableMap } from '@/lib/env-resolver'
import type { RequestState, HttpMethod } from '@/lib/types'

const DEFAULT_REQUEST: RequestState = {
  method: 'GET' as HttpMethod,
  url: '',
  headers: [],
  params: [],
  bodyMode: 'none',
  bodyRaw: '',
  bodyLanguage: 'json',
  bodyUrlEncoded: [],
}

function applyEnvToRequest(
  req: RequestState,
  vars: Record<string, string>
): RequestState {
  if (Object.keys(vars).length === 0) return req

  return {
    ...req,
    url: resolveVariables(req.url, vars),
    headers: req.headers.map((h) => ({
      ...h,
      key: resolveVariables(h.key, vars),
      value: resolveVariables(h.value, vars),
    })),
    params: req.params.map((p) => ({
      ...p,
      key: resolveVariables(p.key, vars),
      value: resolveVariables(p.value, vars),
    })),
    bodyRaw: resolveVariables(req.bodyRaw, vars),
    bodyUrlEncoded: req.bodyUrlEncoded.map((p) => ({
      ...p,
      key: resolveVariables(p.key, vars),
      value: resolveVariables(p.value, vars),
    })),
  }
}

export default function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isNew = id === 'new'

  const storedRequest = useStore((s) => s.currentRequest)
  const setCurrentRequest = useStore((s) => s.setCurrentRequest)

  const [localRequest, setLocalRequest] = useState<RequestState>(
    isNew ? DEFAULT_REQUEST : (storedRequest ?? DEFAULT_REQUEST)
  )

  const { mutate: execute, isPending, data: response, error } = useExecuteRequest()
  const { data: activeEnv } = useActiveEnvironment()

  function handleChange(req: RequestState) {
    setLocalRequest(req)
    setCurrentRequest(req)
  }

  function handleSend() {
    if (!localRequest.url.trim()) return

    const envValues = activeEnv?.environment.values ?? []
    const vars = buildVariableMap(envValues, [])
    const resolved = applyEnvToRequest(localRequest, vars)

    execute(resolved)
  }

  const title = localRequest.collectionItemName ?? (isNew ? 'New Request' : 'Request')

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <AppHeader title={title} showBack />

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-4 space-y-3">
        {/* Environment selector */}
        <EnvironmentSelector />

        {/* Request form */}
        <RequestForm value={localRequest} onChange={handleChange} />

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {(error as Error).message}
          </div>
        )}

        {/* Response */}
        {response && <ResponseViewer response={response} />}

        {/* Loading skeleton */}
        {isPending && !response && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 flex items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending request…
            </div>
          </div>
        )}
      </div>

      {/* Send button — sticky above bottom nav */}
      <div className="fixed bottom-[68px] left-0 right-0 px-4 pb-2 bg-gradient-to-t from-zinc-950 to-transparent">
        <button
          onClick={handleSend}
          disabled={isPending || !localRequest.url.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 active:bg-indigo-700"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send
            </>
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
