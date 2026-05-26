import { NextRequest, NextResponse } from 'next/server'
import { validateProxyUrl, ALLOWED_METHODS } from '@/lib/ssrf-guard'

const MAX_BODY_SIZE = 1 * 1024 * 1024   // 1 MB request body
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024  // 10 MB response
// Vercel Hobby serverless functions have a 10s hard limit; stay under it
const MAX_TIMEOUT = 9 * 1000

// Internal headers that must not be forwarded to the target
const BLOCKED_REQUEST_HEADERS = new Set([
  'host', 'x-forwarded-for', 'x-real-ip', 'x-forwarded-host',
  'x-forwarded-proto', 'x-postman-api-key', 'content-length',
  'transfer-encoding', 'connection', 'upgrade',
])

export async function POST(req: NextRequest) {
  let body: {
    url: string
    method: string
    headers?: Record<string, string>
    body?: string
    timeout?: number
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { url, method, headers = {}, body: requestBody, timeout = 30000 } = body

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  if (!method || !ALLOWED_METHODS.has(method.toUpperCase())) {
    return NextResponse.json({ error: `Method must be one of: ${[...ALLOWED_METHODS].join(', ')}` }, { status: 400 })
  }

  const validation = validateProxyUrl(url)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.reason }, { status: 400 })
  }

  if (requestBody && requestBody.length > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large (max 1 MB)' }, { status: 413 })
  }

  const clampedTimeout = Math.min(Math.max(timeout, 1000), MAX_TIMEOUT)

  // Build forwarded headers, stripping internal ones
  const forwardedHeaders: Record<string, string> = {}
  for (const [k, v] of Object.entries(headers)) {
    if (!BLOCKED_REQUEST_HEADERS.has(k.toLowerCase())) {
      forwardedHeaders[k] = v
    }
  }

  const start = Date.now()

  try {
    const fetchInit: RequestInit = {
      method: method.toUpperCase(),
      headers: forwardedHeaders,
      signal: AbortSignal.timeout(clampedTimeout),
      redirect: 'follow',
    }

    if (requestBody && !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
      fetchInit.body = requestBody
    }

    const res = await fetch(url, fetchInit)
    const elapsed = Date.now() - start

    // Read response body with size limit
    const reader = res.body?.getReader()
    const chunks: Uint8Array[] = []
    let totalSize = 0

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        totalSize += value.length
        if (totalSize > MAX_RESPONSE_SIZE) {
          reader.cancel()
          return NextResponse.json({
            error: `Response too large (max ${MAX_RESPONSE_SIZE / (1024 * 1024)} MB)`,
          }, { status: 413 })
        }
        chunks.push(value)
      }
    }

    const combined = new Uint8Array(totalSize)
    let offset = 0
    for (const chunk of chunks) {
      combined.set(chunk, offset)
      offset += chunk.length
    }
    const responseBody = new TextDecoder().decode(combined)

    // Collect response headers
    const responseHeaders: Record<string, string> = {}
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return NextResponse.json({
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
      body: responseBody,
      time: elapsed,
      size: totalSize,
    })
  } catch (err) {
    const elapsed = Date.now() - start
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: `Request timed out after ${clampedTimeout / 1000}s. The target server is too slow or unreachable.` }, { status: 504 })
    }
    const message = err instanceof Error ? err.message : 'Request failed'
    return NextResponse.json({ error: message, time: elapsed }, { status: 502 })
  }
}
