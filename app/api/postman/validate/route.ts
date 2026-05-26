import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-postman-api-key')
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.getpostman.com/me', {
      headers: { 'X-Api-Key': apiKey },
      signal: AbortSignal.timeout(15000),
    })

    if (res.status === 401) {
      return NextResponse.json({ valid: false, error: 'Invalid API key' }, { status: 401 })
    }

    if (!res.ok) {
      return NextResponse.json({ valid: false, error: `Postman API error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      valid: true,
      username: data.user?.username,
      email: data.user?.email,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ valid: false, error: message }, { status: 500 })
  }
}
