'use client'

import { useState } from 'react'
import { LogOut, Key, Trash2, ChevronRight, Shield } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/hooks/useAuth'
import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'

export default function SettingsPage() {
  const { apiKey, logout } = useAuth()
  const { history, clearHistory } = useStore()
  const [showKey, setShowKey] = useState(false)

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 6)}${'•'.repeat(Math.max(0, apiKey.length - 10))}${apiKey.slice(-4)}`
    : null

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <AppHeader title="Settings" />

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
        {/* API Key section */}
        <section className="space-y-1">
          <h2 className="px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Authentication
          </h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800">
              <Key className="h-4 w-4 text-indigo-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-400 mb-0.5">Postman API Key</p>
                <button
                  onClick={() => setShowKey((s) => !s)}
                  className="font-mono text-xs text-zinc-300 truncate block w-full text-left"
                >
                  {showKey ? apiKey : maskedKey ?? 'Not set'}
                </button>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
              <ChevronRight className="h-4 w-4 ml-auto text-zinc-700" />
            </button>
          </div>
        </section>

        {/* Data section */}
        <section className="space-y-1">
          <h2 className="px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Data
          </h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <button
              onClick={clearHistory}
              disabled={history.length === 0}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-zinc-300 hover:bg-zinc-800/60 transition-colors disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4 shrink-0 text-zinc-500" />
              Clear request history
              <span className="ml-auto text-xs text-zinc-600">{history.length} entries</span>
            </button>
          </div>
        </section>

        {/* About section */}
        <section className="space-y-1">
          <h2 className="px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            About
          </h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden divide-y divide-zinc-800">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Shield className="h-4 w-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-sm text-zinc-300">FapPost</p>
                <p className="text-xs text-zinc-600">Mobile Postman API Client</p>
              </div>
              <span className="ml-auto text-xs text-zinc-600">v0.1.0</span>
            </div>
            <div className="px-4 py-3 text-xs text-zinc-600 leading-relaxed">
              Your API key is stored locally on this device and never sent to any server
              other than api.getpostman.com through this app's secure proxy.
            </div>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
