'use client'

import { useState } from 'react'
import type { AgentRequest } from '@/lib/agent/types'
import { isFigmaUrl } from '@/lib/figma/parse'

const TRY_CHIPS = [
  'Review this button copy',
  'Write an error message',
  'Fix this modal text',
  'Shorten this label',
]

interface Props {
  onSubmit: (req: AgentRequest) => void
  loading: boolean
  scopeError?: string | null
  onClearScopeError?: () => void
}

export function LandingCard({ onSubmit, loading, scopeError, onClearScopeError }: Props) {
  const [input, setInput] = useState('')
  const isFigma = isFigmaUrl(input)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    onSubmit({ input: input.trim() })
  }

  function handleChip(chip: string) {
    setInput(chip)
  }

  return (
    <div className="landing-main">
      <form onSubmit={handleSubmit} className="landing-card">
        {/* Header */}
        <div className="landing-card-header">
          {/* Brand icon */}
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="17" height="13" rx="3" fill="white" fillOpacity="0.9" />
              <path d="M5 15 L3 20 L8 18.5Z" fill="white" fillOpacity="0.9" />
              <circle cx="6.5" cy="8.5" r="1.25" fill="#1A8C6F" />
              <circle cx="10.5" cy="8.5" r="1.25" fill="#1A8C6F" />
              <circle cx="14.5" cy="8.5" r="1.25" fill="#1A8C6F" />
            </svg>
          </div>

          {/* "Ask Lorem" — DM Serif Display, italic Lorem */}
          <h1 className="card-title">
            Ask <em>Lorem</em>
          </h1>
          <p className="card-subtitle">
            Paste a draft, describe what you need, or paste a Figma frame URL to review all copy at once.
          </p>
        </div>

        {/* Textarea */}
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); onClearScopeError?.() }}
          placeholder={'e.g. "Your session will expire in 5 minutes", "write a timeout error", or paste a Figma frame URL'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent)
          }}
          className={`landing-textarea${scopeError ? ' is-error' : ''}`}
          aria-describedby={scopeError ? 'landing-scope-error' : isFigma ? 'landing-figma-hint' : undefined}
        />
        {isFigma && !scopeError && (
          <p id="landing-figma-hint" className="input-figma-hint" aria-live="polite">
            Figma frame detected — Lorem will extract and review all text strings.
          </p>
        )}
        {scopeError && (
          <p id="landing-scope-error" className="input-scope-error" aria-live="polite">
            {scopeError}
          </p>
        )}

        {/* Try chips */}
        <div className="suggestions-row">
          <span className="try-label">Try</span>
          {TRY_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChip(chip)}
              className="chip"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="submit-btn"
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Thinking…
            </>
          ) : (
            'Get suggestions'
          )}
        </button>
      </form>
    </div>
  )
}
