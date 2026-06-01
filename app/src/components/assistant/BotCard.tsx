'use client'

import { useState } from 'react'
import { SourceTag } from './SourceTag'
import type { AgentResponse } from '@/lib/agent/types'
import { useMetrics } from '@/lib/metrics/context'
import type { SourceTier } from '@/lib/metrics/analytics'

function mapSourceTier(sourceType: string | null | undefined): SourceTier | undefined {
  switch (sourceType) {
    case 'library_match':               return 'library'
    case 'adapted':                     return 'adapted'
    case 'ai_generated':                return 'ai'
    case 'ai_generated_low_confidence': return 'ai_low'
    default:                            return undefined
  }
}

interface Props {
  response: AgentResponse
  versionLabel?: string           // e.g. "V2" — shown when in version context
  isLatest: boolean               // kept for compatibility; quick chips now always shown
  onViewRationale?: () => void
  onQuickAction?: (action: 'shorter' | 'alternatives') => void
}

export function BotCard({ response, versionLabel, isLatest: _isLatest, onViewRationale, onQuickAction }: Props) {
  const [copied, setCopied] = useState(false)
  const { trackInteraction } = useMetrics()

  function handleCopy() {
    navigator.clipboard.writeText(response.suggestion).then(() => {
      setCopied(true)
      trackInteraction('copied', {
        source_tier: mapSourceTier(response.source_type),
        char_count: response.character_count,
      })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bot-card">
      {/* Top row: source tag + version label */}
      <div className="bot-card-top">
        <SourceTag sourceType={response.source_type} />
        {versionLabel && (
          <span className="bot-version-label">{versionLabel}</span>
        )}
      </div>

      {/* Copy preview — DM Mono */}
      <div className="suggested-copy-box">
        {response.suggestion}
      </div>

      {/* Meta row: char count + actions */}
      <div className="card-meta-row">
        <span className="char-count">{response.character_count} characters</span>
        <div className="card-inline-actions">
          {/* View rationale */}
          {onViewRationale && (
            <button
              onClick={() => {
                onViewRationale()
                trackInteraction('rationale_opened', { source_tier: mapSourceTier(response.source_type) })
              }}
              className="icon-btn icon-btn-secondary"
            >
              Rationale ›
            </button>
          )}
          {/* Copy text */}
          <button
            onClick={handleCopy}
            className={`icon-btn icon-btn-primary${copied ? ' is-copied' : ''}`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {copied
                ? <path d="M2 8l4 4 8-8" />
                : <><rect x="4" y="4" width="9" height="11" rx="1.5" /><path d="M3 3a1 1 0 0 1 1-1h6l3 3v1" /></>
              }
            </svg>
            {copied ? 'Copied' : 'Copy text'}
          </button>
        </div>
      </div>

      {/* Quick action chips */}
      {onQuickAction && (
        <div className="card-divider" />
      )}
      {onQuickAction && (
        <div className="quick-actions">
          <span className="quick-label">Quick replies</span>
          {(['shorter', 'alternatives'] as const).map((action) => (
            <button
              key={action}
              onClick={() => {
                onQuickAction(action)
                trackInteraction(
                  action === 'shorter' ? 'quick_action_shorter' : 'quick_action_alternatives',
                  { source_tier: mapSourceTier(response.source_type) }
                )
              }}
              className="chip"
            >
              {action === 'shorter' ? 'Shorter' : 'Alternatives'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
