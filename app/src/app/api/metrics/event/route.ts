import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PII_KEYS = new Set(['name','email','nric','phone','address','username'])

function sanitize(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).filter(([k]) => !PII_KEYS.has(k.toLowerCase()))
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      client_id?: string
      session_id?: string | null
      event?: string
      properties?: Record<string, unknown> | null
    }
    if (!body.client_id || !body.event || typeof body.event !== 'string') {
      return new NextResponse(null, { status: 204 })
    }
    const supabase = await createClient()
    const { error } = await supabase.from('events').insert({
      client_id: body.client_id,
      session_id: body.session_id ?? null,
      event: body.event,
      properties: body.properties ? sanitize(body.properties) : null,
    })
    if (error) console.error('metrics/event POST error', error)
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
