'use client'

import type { ReviewString, ReviewStatus } from '@/types/figma-review'
import { calcProgress } from '@/types/figma-review'

interface Props {
  frameName: string
  strings: ReviewString[]
  onOpen: (filter: ReviewStatus | 'all') => void
}

type StatPillDef = { status: ReviewStatus; label: string; cssClass: string }
const STAT_PILLS: StatPillDef[] = [
  { status: 'library',    label: 'library match',   cssClass: 'fr-stat-lib' },
  { status: 'adapted',    label: 'adapted',          cssClass: 'fr-stat-adapted' },
  { status: 'suggestion', label: 'guidelines-based', cssClass: 'fr-stat-suggestion' },
  { status: 'no-change',  label: 'no issues',        cssClass: 'fr-stat-ok' },
]

export function FigmaReviewCard({ frameName, strings, onOpen }: Props) {
  const { needsReview, total, pct } = calcProgress(strings)
  const active = strings.filter((s) => !s.removed)

  return (
    <div className="fr-card">
      <div className="fr-card-head">
        <div className="fr-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
            <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
            <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
            <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
            <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
          </svg>
          {frameName}
        </div>
        <div className="fr-card-subtitle">Figma frame</div>
      </div>

      <div className="fr-stats">
        {STAT_PILLS.map(({ status, label, cssClass }) => {
          const count = active.filter((s) => s.status === status).length
          if (count === 0) return null
          return (
            <div key={status} className={`fr-stat-pill ${cssClass}`}>
              <span className="fr-dot" />
              {count} {label}
            </div>
          )
        })}
      </div>

      <div>
        <div className="fr-progress-bg">
          <div className="fr-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="fr-progress-label">
          {needsReview === 0
            ? `All ${total} strings approved`
            : `${needsReview} of ${total} copy string${needsReview === 1 ? '' : 's'} need${needsReview === 1 ? 's' : ''} review`}
        </div>
      </div>

      <div className="fr-divider" />

      <div className="fr-card-actions">
        <button className="btn-review-all" onClick={() => onOpen('all')}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="14" height="12" rx="2" stroke="white" strokeWidth="1.4" />
            <path d="M10 2v12" stroke="white" strokeWidth="1.4" />
          </svg>
          Review all
        </button>
        <button className="btn-review-library" onClick={() => onOpen('library')}>
          Library match first
        </button>
      </div>
    </div>
  )
}
