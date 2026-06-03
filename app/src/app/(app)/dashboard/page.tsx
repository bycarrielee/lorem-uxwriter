import { createServiceClient } from '@/lib/supabase/service'
import { DashboardCharts } from './DashboardCharts'

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

function bucketByDay(rows: Array<{ ts: string }>, days: number): { labels: string[]; values: number[] } {
  const buckets: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    buckets[key] = 0
  }
  for (const r of rows) {
    const key = r.ts.slice(0, 10)
    if (key in buckets) buckets[key]++
  }
  return {
    labels: Object.keys(buckets).map((k) =>
      new Date(k).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
    ),
    values: Object.values(buckets),
  }
}

export default async function DashboardPage() {
  const db = createServiceClient()
  const since30 = daysAgo(30)
  const since7  = daysAgo(7)
  const since14 = daysAgo(14)

  const [sessionsRes, interactionsRes, apiCallsRes7, apiCallsRes30] = await Promise.all([
    db.from('app_sessions').select('client_id, started_at').gte('started_at', since30),
    db.from('suggestion_interactions').select('interaction, source_tier, created_at').gte('created_at', since30),
    db.from('api_calls').select('status, cost_usd, duration_ms, created_at').gte('created_at', since7),
    db.from('api_calls').select('cost_usd, status').gte('created_at', since30),
  ])

  const sessions      = sessionsRes.data ?? []
  const interactions  = interactionsRes.data ?? []
  const apiCalls7     = apiCallsRes7.data ?? []
  const apiCalls30    = apiCallsRes30.data ?? []

  // Overview stats
  const activeClients = new Set(sessions.map((s) => s.client_id)).size
  const totalSessions = sessions.length
  const copied        = interactions.filter((i) => i.interaction === 'copied').length
  const copyRate      = interactions.length > 0 ? Math.round((copied / interactions.length) * 100) : 0
  const errors30      = apiCalls30.filter((c) => c.status !== 'success').length
  const errorRate     = apiCalls30.length > 0 ? ((errors30 / apiCalls30.length) * 100).toFixed(1) : '0.0'
  const totalCost30   = apiCalls30.reduce((s, c) => s + (c.cost_usd ?? 0), 0).toFixed(2)

  // Daily sessions (14d)
  const dailySessions = bucketByDay(
    sessions.filter((s) => s.started_at >= since14).map((s) => ({ ts: s.started_at })),
    14,
  )

  // Interaction counts
  const interactionCounts = {
    copied: 0, rationale_opened: 0, follow_up_sent: 0,
    quick_action_shorter: 0, quick_action_alternatives: 0,
  } as Record<string, number>
  for (const r of interactions) {
    if (r.interaction in interactionCounts) interactionCounts[r.interaction]++
  }

  // Tier copy rates
  const tierTotals = {
    library: { total: 0, copied: 0 },
    adapted: { total: 0, copied: 0 },
    ai:      { total: 0, copied: 0 },
    ai_low:  { total: 0, copied: 0 },
  } as Record<string, { total: number; copied: number }>
  for (const r of interactions) {
    if (r.source_tier && r.source_tier in tierTotals) {
      tierTotals[r.source_tier].total++
      if (r.interaction === 'copied') tierTotals[r.source_tier].copied++
    }
  }

  // API health (7d)
  const successCalls = apiCalls7.filter((c) => c.status === 'success').length
  const successRate  = apiCalls7.length > 0 ? ((successCalls / apiCalls7.length) * 100).toFixed(1) : '100.0'
  const durations    = apiCalls7.map((c) => c.duration_ms ?? 0).sort((a, b) => a - b)
  const p50          = durations.length > 0 ? durations[Math.floor(durations.length / 2)] : 0
  const totalCost7   = apiCalls7.reduce((s, c) => s + (c.cost_usd ?? 0), 0).toFixed(2)

  const callsPerDay = bucketByDay(apiCalls7.map((c) => ({ ts: c.created_at })), 7)
  const costBuckets: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    costBuckets[new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)] = 0
  }
  for (const c of apiCalls7) {
    const key = c.created_at.slice(0, 10)
    if (key in costBuckets) costBuckets[key] += c.cost_usd ?? 0
  }
  const costPerDay = {
    labels: callsPerDay.labels,
    values: Object.values(costBuckets).map((v) => Math.round(v * 10000) / 10000),
  }

  return (
    <div className="dashboard-page">
      <div id="overview" className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-sub">Last 30 days</p>
      </div>

      <div className="dash-cards">
        {[
          { label: 'Active clients', value: activeClients, trend: 'unique browser IDs' },
          { label: 'Sessions',       value: totalSessions, trend: 'page visits' },
          { label: 'Copy rate',      value: `${copyRate}%`, trend: 'suggestions copied' },
          { label: 'Error rate',     value: `${errorRate}%`, trend: 'API calls failed' },
          { label: 'Total cost',     value: `$${totalCost30}`, trend: 'Anthropic API' },
        ].map((c) => (
          <div key={c.label} className="dash-card">
            <div className="dash-card-label">{c.label}</div>
            <div className="dash-card-value">{c.value}</div>
            <div className="dash-card-trend">{c.trend}</div>
          </div>
        ))}
      </div>

      <DashboardCharts
        dailySessions={dailySessions}
        interactionCounts={interactionCounts}
        tierTotals={tierTotals}
        apiHealth={{ successRate, totalCalls: apiCalls7.length, p50, totalCost: totalCost7, callsPerDay, costPerDay }}
      />
    </div>
  )
}
