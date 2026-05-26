'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, FileText } from 'lucide-react'
import { useCollection } from '@/hooks/useCollections'
import { useStore } from '@/lib/store'
import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { CollectionTree } from '@/components/CollectionTree'
import { cn } from '@/lib/utils'
import type { CollectionItem, RequestState, HttpMethod, KeyValuePair } from '@/lib/types'
import { generateId } from '@/lib/utils'

function parsePostmanUrl(url: { raw: string; query?: { key: string; value: string; disabled?: boolean }[] } | string): { baseUrl: string; params: KeyValuePair[] } {
  const raw = typeof url === 'string' ? url : url.raw ?? ''
  const queryPart = typeof url === 'object' ? url.query : undefined

  // Strip query string from base URL
  const [baseUrl] = raw.split('?')

  const params: KeyValuePair[] = (queryPart ?? []).map((p) => ({
    id: generateId(),
    key: p.key ?? '',
    value: p.value ?? '',
    enabled: !p.disabled,
  }))

  return { baseUrl, params }
}

function buildRequestState(item: CollectionItem): RequestState {
  const req = item.request
  if (!req) {
    return {
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      bodyMode: 'none',
      bodyRaw: '',
      bodyLanguage: 'json',
      bodyUrlEncoded: [],
      collectionItemId: item._postman_id ?? item.id,
      collectionItemName: item.name,
    }
  }

  const { baseUrl, params } = parsePostmanUrl(req.url ?? '')

  const headers: KeyValuePair[] = (req.header ?? []).map((h) => ({
    id: generateId(),
    key: h.key ?? '',
    value: h.value ?? '',
    enabled: !h.disabled,
  }))

  let bodyMode: RequestState['bodyMode'] = 'none'
  let bodyRaw = ''
  let bodyLanguage: RequestState['bodyLanguage'] = 'json'
  let bodyUrlEncoded: KeyValuePair[] = []

  if (req.body) {
    if (req.body.mode === 'raw') {
      bodyMode = 'raw'
      bodyRaw = req.body.raw ?? ''
      const lang = req.body.options?.raw?.language
      bodyLanguage = (lang === 'json' || lang === 'text' || lang === 'html' || lang === 'xml') ? lang : 'json'
    } else if (req.body.mode === 'urlencoded') {
      bodyMode = 'urlencoded'
      bodyUrlEncoded = (req.body.urlencoded ?? []).map((p) => ({
        id: generateId(),
        key: p.key ?? '',
        value: p.value ?? '',
        enabled: !p.disabled,
      }))
    }
  }

  return {
    collectionItemId: item._postman_id ?? item.id,
    collectionItemName: item.name,
    method: (req.method?.toUpperCase() ?? 'GET') as HttpMethod,
    url: baseUrl,
    headers,
    params,
    bodyMode,
    bodyRaw,
    bodyLanguage,
    bodyUrlEncoded,
  }
}

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data, isLoading, error, refetch, isFetching } = useCollection(id)
  const setCurrentRequest = useStore((s) => s.setCurrentRequest)
  const [selectedId, setSelectedId] = useState<string | undefined>()

  function handleSelectRequest(item: CollectionItem) {
    const reqState = buildRequestState(item)
    setCurrentRequest(reqState)
    const itemId = item._postman_id ?? item.id
    setSelectedId(itemId)
    router.push(`/request/${itemId ?? 'new'}`)
  }

  const collection = data?.collection
  const title = collection?.info.name ?? 'Collection'

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <AppHeader
        title={title}
        showBack
        right={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto pb-24 px-2 pt-2">
        {isLoading ? (
          <div className="space-y-1 px-2 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 rounded-lg bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="m-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-400">
            <p className="font-medium">Failed to load collection</p>
            <p className="text-xs mt-1 text-red-400/70">{(error as Error).message}</p>
          </div>
        ) : collection?.item.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <FileText className="h-12 w-12 text-zinc-700" />
            <p className="text-sm font-medium text-zinc-400">Empty collection</p>
          </div>
        ) : (
          <CollectionTree
            items={collection?.item ?? []}
            onSelectRequest={handleSelectRequest}
            selectedId={selectedId}
          />
        )}
      </div>

      <BottomNav />
    </div>
  )
}
