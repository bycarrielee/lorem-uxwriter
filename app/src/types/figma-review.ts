import type { FigmaReviewRow } from '@/lib/agent/types'

export type ReviewStatus = 'library' | 'adapted' | 'suggestion' | 'no-change'
export type SuggestionVia = 'initial' | 'quick-reply' | 'chat'

export type Suggestion = {
  id: number
  copy: string
  rationale: string
  source: ReviewStatus
  via: SuggestionVia
  libId: string | null
}

export type ReviewString = {
  i: number
  el: string
  status: ReviewStatus
  removed: boolean
  original?: string
  chatAnchor: string | null
  suggestions: Suggestion[]
}

let _nextId = 1
export function nextSuggestionId(): number { return _nextId++ }

export function convertFigmaRows(rows: FigmaReviewRow[]): ReviewString[] {
  return rows.map((row, i) => {
    const status: ReviewStatus = row.changed ? 'suggestion' : 'no-change'
    return {
      i,
      el: row.elementName,
      status,
      removed: false,
      original: row.changed ? row.original : undefined,
      chatAnchor: null,
      suggestions: [{
        id: nextSuggestionId(),
        copy: row.proposed,
        rationale: row.rationale,
        source: status,
        via: 'initial',
        libId: null,
      }],
    }
  })
}

export function getVisibleStrings(
  strings: ReviewString[],
  filter: ReviewStatus | 'all',
  query: string
): ReviewString[] {
  const q = query.trim().toLowerCase()
  return strings.filter((s) => {
    if (s.removed) return false
    if (filter !== 'all' && s.status !== filter) return false
    if (!q) return true
    return (
      s.el.toLowerCase().includes(q) ||
      s.suggestions.some((sg) => sg.copy.toLowerCase().includes(q)) ||
      (s.original?.toLowerCase().includes(q) ?? false)
    )
  })
}

export function calcProgress(strings: ReviewString[]): {
  needsReview: number
  total: number
  pct: number
} {
  const active = strings.filter((s) => !s.removed)
  const needsReview = active.filter((s) => s.status !== 'no-change').length
  const total = active.length
  const pct = total > 0 ? Math.round(((total - needsReview) / total) * 100) : 100
  return { needsReview, total, pct }
}
