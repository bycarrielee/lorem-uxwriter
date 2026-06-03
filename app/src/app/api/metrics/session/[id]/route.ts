import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!id) return new NextResponse(null, { status: 400 })
    const body = await request.json() as { ended_at?: string; duration_seconds?: number }
    const supabase = await createClient()
    await supabase
      .from('app_sessions')
      .update({
        ended_at: body.ended_at ?? new Date().toISOString(),
        duration_seconds: body.duration_seconds ?? null,
      })
      .eq('id', id)
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 }) // Always succeed — fire-and-forget
  }
}
