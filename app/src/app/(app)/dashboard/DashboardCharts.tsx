'use client'

const W = 440, H = 130, PT = { t: 12, r: 10, b: 28, l: 38 }

function YGrid({ max }: { max: number }) {
  const iw = W - PT.l - PT.r, ih = H - PT.t - PT.b
  return <>{Array.from({ length: 4 }, (_, i) => {
    const v = Math.round(max * (1 - i / 4)), y = PT.t + (i / 4) * ih
    return <g key={i}>
      <line x1={PT.l} y1={y} x2={PT.l + iw} y2={y} stroke="#E0E5EA" strokeWidth={1}/>
      <text x={PT.l - 5} y={y + 4} textAnchor="end" fill="#94A3B8" fontSize={9.5} fontFamily="'DM Sans',sans-serif">{v}</text>
    </g>
  })}</>
}

function BarChart({ data, labels, color = '#3B5BA5' }: { data: number[]; labels: string[]; color?: string }) {
  if (!data.length) return <EmptyChart/>
  const iw = W - PT.l - PT.r, ih = H - PT.t - PT.b
  const max = Math.max(...data) * 1.2 || 1
  const bw = iw / data.length * 0.6, gap = iw / data.length
  const step = Math.ceil(labels.length / 7)
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
    <YGrid max={max}/>
    {data.map((v, i) => {
      const bh = (v / max) * ih, x = PT.l + i * gap + (gap - bw) / 2, y = PT.t + ih - bh
      return <rect key={i} x={x} y={y} width={bw} height={Math.max(bh, 0)} fill={color} rx={2}/>
    })}
    {labels.map((l, i) => {
      if (i % step !== 0 && i !== labels.length - 1) return null
      return <text key={i} x={PT.l + i * gap + gap / 2} y={H - 4} textAnchor="middle" fill="#94A3B8" fontSize={9.5} fontFamily="'DM Sans',sans-serif">{l}</text>
    })}
  </svg>
}

function LineChart({ data, labels, color = '#3B5BA5' }: { data: number[]; labels: string[]; color?: string }) {
  if (data.length < 2) return <EmptyChart/>
  const iw = W - PT.l - PT.r, ih = H - PT.t - PT.b
  const max = Math.max(...data) * 1.2 || 1
  const pts = data.map((v, i) => [PT.l + (i / (data.length - 1)) * iw, PT.t + ih - (v / max) * ih] as [number, number])
  const poly = pts.map(p => p.join(',')).join(' ')
  const area = `M${pts[0]}` + pts.slice(1).map(p => `L${p}`).join('') + ` L${pts.at(-1)![0]},${PT.t + ih} L${pts[0][0]},${PT.t + ih}Z`
  const last = pts.at(-1)!
  const step = Math.ceil(labels.length / 6)
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
    <YGrid max={max}/>
    <path d={area} fill={color} fillOpacity={0.12} stroke="none"/>
    <polyline points={poly} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx={last[0]} cy={last[1]} r={3} fill={color} stroke="white" strokeWidth={1.5}/>
    {labels.map((l, i) => {
      if (i % step !== 0 && i !== labels.length - 1) return null
      return <text key={i} x={PT.l + (i / (labels.length - 1)) * iw} y={H - 4} textAnchor="middle" fill="#94A3B8" fontSize={9.5} fontFamily="'DM Sans',sans-serif">{l}</text>
    })}
  </svg>
}

function EmptyChart() {
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
    <text x={W / 2} y={H / 2} textAnchor="middle" fill="#94A3B8" fontSize={12} fontFamily="'DM Sans',sans-serif">No data yet</text>
  </svg>
}

const TIER_COLORS: Record<string, string> = {
  library: 'oklch(44% 0.15 162)', adapted: '#4A5D6B',
  ai: 'oklch(51% 0.16 72)', ai_low: 'oklch(54% 0.18 45)',
}
const TIER_LABELS: Record<string, string> = {
  library: 'Library', adapted: 'Adapted', ai: 'AI', ai_low: 'AI low',
}

interface Props {
  dailySessions: { labels: string[]; values: number[] }
  interactionCounts: Record<string, number>
  tierTotals: Record<string, { total: number; copied: number }>
  apiHealth: {
    successRate: string; totalCalls: number; p50: number; totalCost: string
    callsPerDay: { labels: string[]; values: number[] }
    costPerDay: { labels: string[]; values: number[] }
  }
}

export function DashboardCharts({ dailySessions, interactionCounts, tierTotals, apiHealth }: Props) {
  const interactions = [
    { label: 'Copied',           value: interactionCounts.copied ?? 0 },
    { label: 'Rationale opened', value: interactionCounts.rationale_opened ?? 0 },
    { label: 'Follow-up sent',   value: interactionCounts.follow_up_sent ?? 0 },
    { label: 'Shorter',          value: interactionCounts.quick_action_shorter ?? 0 },
    { label: 'Alternatives',     value: interactionCounts.quick_action_alternatives ?? 0 },
  ]
  const maxInteraction = Math.max(...interactions.map(i => i.value), 1)

  return (
    <div className="dashboard-charts">
      <div id="usage" className="dash-chart-row">
        <div className="dash-chart-card">
          <div className="dash-chart-label">Daily sessions</div>
          <div className="dash-chart-sub">Sessions started per day, last 14 days</div>
          <BarChart data={dailySessions.values} labels={dailySessions.labels}/>
        </div>
        <div className="dash-chart-card">
          <div className="dash-chart-label">Interaction breakdown</div>
          <div className="dash-chart-sub">User actions on suggestions, last 30 days</div>
          <div className="hbar-list">
            {interactions.map(({ label, value }) => (
              <div key={label} className="hbar-row">
                <div className="hbar-label">{label}</div>
                <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(value / maxInteraction) * 100}%` }}/></div>
                <div className="hbar-val">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-chart-row">
        <div className="dash-chart-card">
          <div className="dash-chart-label">Copy rate by source tier</div>
          <div className="dash-chart-sub">% of suggestions copied, last 30 days</div>
          <div className="tier-list">
            {Object.entries(tierTotals).map(([tier, { total, copied }]) => {
              const pct = total > 0 ? Math.round((copied / total) * 100) : 0
              return (
                <div key={tier} className="tier-row">
                  <div className="tier-label">{TIER_LABELS[tier] ?? tier}</div>
                  <div className="tier-track"><div className="tier-fill" style={{ width: `${pct}%`, background: TIER_COLORS[tier] }}/></div>
                  <div className="tier-pct">{pct}%</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="dash-chart-card">
          <div className="dash-chart-label">Daily API calls</div>
          <div className="dash-chart-sub">Anthropic API calls per day, last 7 days</div>
          <BarChart data={apiHealth.callsPerDay.values} labels={apiHealth.callsPerDay.labels}/>
        </div>
      </div>

      <div className="dash-chart-row dash-chart-row--full">
        <div className="dash-chart-card">
          <div className="dash-chart-label">Daily API cost</div>
          <div className="dash-chart-sub">Anthropic API spend USD, last 7 days</div>
          <LineChart data={apiHealth.costPerDay.values} labels={apiHealth.costPerDay.labels} color="oklch(44% 0.15 162)"/>
        </div>
      </div>

      <div id="api-health" className="dash-api-summary">
        {[
          { label: 'Success rate (7d)', value: `${apiHealth.successRate}%` },
          { label: 'Total calls (7d)',  value: String(apiHealth.totalCalls) },
          { label: 'p50 latency (7d)',  value: `${apiHealth.p50.toLocaleString()} ms` },
          { label: 'API cost (7d)',     value: `$${apiHealth.totalCost}` },
        ].map(c => (
          <div key={c.label} className="dash-card">
            <div className="dash-card-label">{c.label}</div>
            <div className="dash-card-value">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
