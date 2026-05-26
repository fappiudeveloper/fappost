import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-postman-api-key')
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.getpostman.com/environments', {
      headers: { 'X-Api-Key': apiKey },
      signal: AbortSignal.timeout(30000),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message ?? `Error ${res.status}` }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
