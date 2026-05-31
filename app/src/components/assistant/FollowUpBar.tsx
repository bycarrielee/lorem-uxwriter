'use client'

import { useState, useRef, useEffect } from 'react'
import type { AgentRequest } from '@/lib/agent/types'
import { useMetrics } from '@/lib/metrics/context'

interface Props {
  onSubmit: (req: AgentRequest) => void
  loading: boolean
  sessionId: string | null
  scopeError?: string | null
  onClearScopeError?: () => void
  budgetExceeded?: boolean
  prefillValue?: string
  focusTrigger?: number
  onPrefillConsumed?: () => void
}

export function FollowUpBar({ onSubmit, loading, sessionId, scopeError, onClearScopeError, budgetExceeded, prefillValue, focusTrigger, onPrefillConsumed }: Props) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { trackInteraction } = useMetrics()

  // Sync prefill value into input
  useEffect(() => {
    if (prefillValue !== undefined) {
      setInput(prefillValue)
      if (textareaRef.current) {
        textareaRef.current.style.height = '36px'
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
      }
      onPrefillConsumed?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillValue])

  // Focus when trigger changes
  useEffect(() => {
    if (!focusTrigger) return
    textareaRef.current?.focus()
    const len = textareaRef.current?.value.length ?? 0
    textareaRef.current?.setSelectionRange(len, len)
  }, [focusTrigger])

  function handleSubmit() {
    if (loading) return
    // When budget exceeded: allow empty input through so submit() can open the API key modal
    if (!input.trim() && !budgetExceeded) return
    if (input.trim()) trackInteraction('follow_up_sent')
    onSubmit({ input: input.trim(), session_id: sessionId ?? undefined })
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    onClearScopeError?.()
    // Auto-grow
    const el = e.target
    el.style.height = '36px'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="follow-up-bar">
      <div className="follow-up-bar-row">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask for more tweaks…"
          rows={1}
          className={`follow-up-input${scopeError ? ' is-error' : ''}`}
          aria-describedby={scopeError ? 'followup-scope-error' : undefined}
        />
        <button
          onClick={handleSubmit}
          disabled={budgetExceeded ? false : (!input.trim() || loading)}
          className={`send-btn${budgetExceeded ? ' is-budget-exceeded' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2L2 8l4 2 2 4 6-12z" />
          </svg>
          Send
        </button>
      </div>
      {scopeError && (
        <p id="followup-scope-error" className="input-scope-error" aria-live="polite">
          {scopeError}
        </p>
      )}
    </div>
  )
}
