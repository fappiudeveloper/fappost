'use client'

import { useMutation } from '@tanstack/react-query'
import { useStore } from '@/lib/store'
import type { RequestState, ResponseState } from '@/lib/types'

export function useExecuteRequest() {
  const addToHistory = useStore((s) => s.addToHistory)

  return useMutation({
    mutationFn: async (req: RequestState): Promise<ResponseState> => {
      // Build URL with params
      let url = req.url
      const enabledParams = req.params.filter((p) => p.enabled && p.key)
      if (enabledParams.length > 0) {
        const searchParams = new URLSearchParams(
          enabledParams.map((p) => [p.key, p.value])
        )
        const separator = url.includes('?') ? '&' : '?'
        url = `${url}${separator}${searchParams.toString()}`
      }

      // Build headers
      const headers: Record<string, string> = {}
      for (const h of req.headers) {
        if (h.enabled && h.key) headers[h.key] = h.value
      }

      // Build body
      let bodyStr: string | undefined
      if (req.bodyMode === 'raw' && req.bodyRaw) {
        bodyStr = req.bodyRaw
        if (!headers['Content-Type'] && !headers['content-type']) {
          const ctMap: Record<string, string> = {
            json: 'application/json',
            text: 'text/plain',
            html: 'text/html',
            xml: 'application/xml',
          }
          headers['Content-Type'] = ctMap[req.bodyLanguage] ?? 'text/plain'
        }
      } else if (req.bodyMode === 'urlencoded') {
        const encoded = req.bodyUrlEncoded
          .filter((p) => p.enabled && p.key)
          .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
          .join('&')
        bodyStr = encoded
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
      }

      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          method: req.method,
          headers,
          body: bodyStr,
          timeout: 30000,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? `Proxy error ${res.status}`)
      }

      let bodyJson: unknown
      try {
        bodyJson = JSON.parse(data.body)
      } catch {
        // not JSON, leave undefined
      }

      return {
        status: data.status,
        statusText: data.statusText,
        headers: data.headers,
        body: data.body,
        bodyJson,
        time: data.time,
        size: data.size,
      }
    },
    onSuccess: (response, req) => {
      addToHistory({ request: req, response, timestamp: Date.now() })
    },
  })
}
