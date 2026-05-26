'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey.trim()) return

    setLoading(true)
    setError(null)

    const result = await login(apiKey.trim())
    setLoading(false)

    if (result.success) {
      router.replace('/collections')
    } else {
      setError(result.error ?? 'Connection failed')
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white text-2xl font-bold shadow-lg shadow-indigo-900/50">
            Fp
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">FapPost</h1>
          <p className="text-sm text-zinc-500">Mobile Postman API Client</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Postman API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="PMAK-xxxxxxxxxxxx…"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 pr-12 font-mono text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !apiKey.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 active:bg-indigo-700"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Connecting…' : 'Connect to Postman'}
          </button>
        </form>

        {/* Help */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 space-y-2">
          <p className="text-xs font-medium text-zinc-400">How to get your API key:</p>
          <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
            <li>Open Postman on desktop or web</li>
            <li>Go to Settings → API Keys</li>
            <li>Click "Generate API Key"</li>
            <li>Copy and paste the key above</li>
          </ol>
          <a
            href="https://learning.postman.com/docs/developer/postman-api/authentication/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1"
          >
            Postman API Key docs
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
