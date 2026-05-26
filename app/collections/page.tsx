'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, RefreshCw, LogOut, Package } from 'lucide-react'
import { useCollections } from '@/hooks/useCollections'
import { useAuth } from '@/hooks/useAuth'
import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { cn } from '@/lib/utils'

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 animate-pulse space-y-2">
      <div className="h-4 w-2/3 rounded bg-zinc-800" />
      <div className="h-3 w-1/3 rounded bg-zinc-800" />
    </div>
  )
}

export default function CollectionsPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const { data: collections, isLoading, error, refetch, isFetching } = useCollections()
  const [search, setSearch] = useState('')

  const filtered = (collections ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <AppHeader
        title="Collections"
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </button>
            <button
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections…"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-400">
            <p className="font-medium">Failed to load collections</p>
            <p className="text-xs mt-1 text-red-400/70">{(error as Error).message}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs text-red-400 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <Package className="h-12 w-12 text-zinc-700" />
            <p className="text-sm font-medium text-zinc-400">
              {search ? 'No collections match your search' : 'No collections found'}
            </p>
            <p className="text-xs text-zinc-600">
              {search ? 'Try a different search term' : 'Create a collection in Postman first'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((collection) => (
              <button
                key={collection.uid}
                onClick={() => router.push(`/collections/${collection.uid}`)}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-800/60 active:bg-zinc-800"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm text-zinc-100">{collection.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono truncate">{collection.uid}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
