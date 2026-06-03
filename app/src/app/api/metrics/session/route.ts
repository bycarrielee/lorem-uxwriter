import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { client_id?: string }
    if (!body.client_id || typeof body.client_id !== 'string') {
      return NextResponse.json({ error: 'client_id required' }, { status: 400 })
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('app_sessions')
      .insert({ client_id: body.client_id })
      .select('id')
      .single()
    if (error || !data) {
      console.error('metrics/session POST error', error)
      return NextResponse.json({ error: 'internal' }, { status: 500 })
    }
    return NextResponse.json({ session_id: data.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }
}
