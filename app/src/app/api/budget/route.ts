import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const limitUsd   = parseFloat(process.env.ANTHROPIC_BUDGET_LIMIT_USD   ?? '37')
  const warningPct = parseFloat(process.env.ANTHROPIC_BUDGET_WARNING_PCT ?? '80')

  try {
    const serviceClient = createServiceClient()
    const { data } = await serviceClient
      .from('budget_usage')
      .select('cost_usd')
      .eq('id', 1)
      .single()

    const usedUsd         = parseFloat(String(data?.cost_usd ?? '0'))
    const warningThreshold = limitUsd * (warningPct / 100)

    let status: 'ok' | 'warning' | 'exceeded'
    if (usedUsd >= limitUsd) {
      status = 'exceeded'
    } else if (usedUsd >= warningThreshold) {
      status = 'warning'
    } else {
      status = 'ok'
    }

    return NextResponse.json({ used_usd: usedUsd, limit_usd: limitUsd, status })
  } catch {
    // Fail silently — default to ok so the editor is never blocked
    return NextResponse.json({ used_usd: 0, limit_usd: limitUsd, status: 'ok' })
  }
}
