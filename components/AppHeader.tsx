'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  title: string
  showBack?: boolean
  right?: React.ReactNode
  className?: string
}

export function AppHeader({ title, showBack = false, right, className }: AppHeaderProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm px-4',
        className
      )}
    >
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 truncate text-base font-semibold text-zinc-100">{title}</h1>
      {right && <div className="flex shrink-0 items-center gap-1">{right}</div>}
    </header>
  )
}
