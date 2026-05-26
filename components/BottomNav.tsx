'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, Clock, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/collections', icon: Layers, label: 'Collections' },
  { href: '/history', icon: Clock, label: 'History' },
  { href: '/request/new', icon: Plus, label: 'New', featured: true },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pt-1 pb-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, featured }) => {
          const isActive =
            href === '/collections'
              ? pathname === '/collections' || pathname.startsWith('/collections/')
              : pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[10px] font-medium transition-colors min-w-[56px]',
                featured
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 hover:bg-indigo-500'
                  : isActive
                  ? 'text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Icon className={cn('h-5 w-5', featured && 'h-5 w-5')} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
