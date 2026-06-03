import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_INTERACTIONS = new Set([
  'copied','rationale_opened','follow_up_sent',
  'quick_action_shorter','quick_action_alternatives',
])
const VALID_TIERS = new Set(['library','adapted','ai','ai_low'])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      client_id?: string
      session_id?: string | null
      interaction?: string
      source_tier?: string | null
      char_count?: number | null
    }
    if (!body.client_id || !body.interaction || !VALID_INTERACTIONS.has(body.interaction)) {
      return new NextResponse(null, { status: 204 })
    }
    const supabase = await createClient()
    const { error } = await supabase.from('suggestion_interactions').insert({
      client_id: body.client_id,
      session_id: body.session_id ?? null,
      interaction: body.interaction as 'copied' | 'rationale_opened' | 'follow_up_sent' | 'quick_action_shorter' | 'quick_action_alternatives',
      source_tier: body.source_tier && VALID_TIERS.has(body.source_tier)
        ? body.source_tier as 'library' | 'adapted' | 'ai' | 'ai_low'
        : null,
      char_count: typeof body.char_count === 'number' ? body.char_count : null,
    })
    if (error) console.error('metrics/interaction POST error', error)
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
