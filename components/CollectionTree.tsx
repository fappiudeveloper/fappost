'use client'

import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MethodBadge } from './MethodBadge'
import type { CollectionItem } from '@/lib/types'

interface CollectionTreeProps {
  items: CollectionItem[]
  depth?: number
  onSelectRequest: (item: CollectionItem) => void
  selectedId?: string
}

function TreeItem({
  item,
  depth,
  onSelectRequest,
  selectedId,
}: {
  item: CollectionItem
  depth: number
  onSelectRequest: (item: CollectionItem) => void
  selectedId?: string
}) {
  const [open, setOpen] = useState(depth === 0)
  const isFolder = Array.isArray(item.item) && item.item.length >= 0
  const isRequest = !!item.request
  const itemId = item._postman_id ?? item.id
  const isSelected = selectedId === itemId

  if (isFolder) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm',
            'text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors',
            'min-h-[44px]'
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <ChevronRight
            className={cn('h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform', open && 'rotate-90')}
          />
          {open ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-amber-400" />
          )}
          <span className="truncate font-medium">{item.name}</span>
          {item.item && (
            <span className="ml-auto shrink-0 text-[10px] text-zinc-600">
              {item.item.length}
            </span>
          )}
        </button>
        {open && item.item && (
          <CollectionTree
            items={item.item}
            depth={depth + 1}
            onSelectRequest={onSelectRequest}
            selectedId={selectedId}
          />
        )}
      </div>
    )
  }

  if (isRequest) {
    return (
      <button
        onClick={() => onSelectRequest(item)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left text-sm',
          'transition-colors min-h-[44px]',
          isSelected
            ? 'bg-indigo-500/20 text-indigo-300'
            : 'text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700'
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <MethodBadge method={item.request?.method ?? 'GET'} />
        <span className="truncate">{item.name}</span>
      </button>
    )
  }

  return null
}

export function CollectionTree({ items, depth = 0, onSelectRequest, selectedId }: CollectionTreeProps) {
  return (
    <div className="space-y-0.5">
      {items.map((item, i) => (
        <TreeItem
          key={item._postman_id ?? item.id ?? i}
          item={item}
          depth={depth}
          onSelectRequest={onSelectRequest}
          selectedId={selectedId}
        />
      ))}
    </div>
  )
}
