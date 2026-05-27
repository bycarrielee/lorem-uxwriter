'use client'

import { useState, useRef, useEffect } from 'react'
import { LandingCard } from './LandingCard'
import { UserBubble } from './UserBubble'
import { BotCard } from './BotCard'
import { BotTextBubble } from './BotTextBubble'
import { SkeletonLoader } from './SkeletonLoader'
import { FollowUpBar } from './FollowUpBar'
import { VersionHistoryPanel } from './VersionHistoryPanel'
import type { AgentRequest, AgentResponse } from '@/lib/agent/types'

export type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; response: AgentResponse }

interface Props {
  products: Array<{ id: string; name: string }>
  initialSessionId?: string
  initialMessages?: Message[]
  initialTitle?: string
}

export function AssistantShell({ products: _products, initialSessionId, initialMessages, initialTitle }: Props) {
  const [state, setState] = useState<'landing' | 'response'>(initialMessages?.length ? 'response' : 'landing')
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scopeError, setScopeError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null)
  const [sessionTitle, setSessionTitle] = useState<string>(initialTitle ?? '')

  const [versionPanelOpen, setVersionPanelOpen] = useState(false)
  const [versionPanelIndex, setVersionPanelIndex] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!loading) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Scroll-to-bottom button visibility
  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 120)
  }

  const assistantResponses = messages
    .filter((m): m is { role: 'assistant'; response: AgentResponse } =>
      m.role === 'assistant' && m.response.is_copy_response === true
    )
    .map((m) => m.response)

  async function submit(req: AgentRequest) {
    setScopeError(null)
    setLoading(true)
    setError(null)

    // Add user message immediately
    const userText = req.input
    const wasLanding = state === 'landing'
    setMessages((prev) => [...prev, { role: 'user', text: userText }])
    if (wasLanding) {
      setState('response')
      setSessionTitle(userText.slice(0, 60))
    }

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, session_id: sessionId ?? undefined }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 422 && (body as { error?: string }).error === 'out_of_scope') {
          setMessages((prev) => prev.slice(0, -1))
          if (wasLanding) setState('landing')
          setScopeError('Lorem is a UX writing assistant. Try a UX copy question.')
          return
        }
        throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`)
      }

      const data = (await res.json()) as AgentResponse
      if (data.session_id) setSessionId(data.session_id)
      setMessages((prev) => [...prev, { role: 'assistant', response: data }])

      // Auto-open version panel to latest if already open
      if (versionPanelOpen) {
        setVersionPanelIndex(assistantResponses.length) // will be length after the new message appends
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1))
      if (messages.length === 0) setState('landing')
    } finally {
      setLoading(false)
    }
  }

  function openVersionPanel(index: number) {
    setVersionPanelIndex(index)
    setVersionPanelOpen(true)
  }

  function handleQuickAction(action: 'shorter' | 'alternatives', currentResponse: AgentResponse) {
    const prompt =
      action === 'shorter'
        ? `Make this shorter: "${currentResponse.suggestion}"`
        : `Give me 3 alternatives for: "${currentResponse.suggestion}"`
    submit({ input: prompt, session_id: sessionId ?? undefined })
  }

  if (state === 'landing') {
    return <LandingCard onSubmit={submit} loading={loading} scopeError={scopeError} onClearScopeError={() => setScopeError(null)} />
  }

  return (
    <div className="response-root">
      {/* Thread */}
      <div className="thread">
        {/* Conversation header */}
        <div className="convo-header">
          <div className="convo-title-group">
            <div className="convo-title">
              {sessionTitle || 'New session'}
            </div>
            <div className="convo-date">
              {new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <button
            onClick={() => {
              const lastIdx = assistantResponses.length - 1
              if (lastIdx >= 0) openVersionPanel(lastIdx)
            }}
            disabled={assistantResponses.length === 0}
            className={`version-btn${versionPanelOpen ? ' is-active' : ''}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
            Version history
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="messages-list"
        >
          {messages.map((msg, i) => {
            if (msg.role === 'user') return <UserBubble key={i} text={msg.text} />

            if (!msg.response.is_copy_response) {
              return <BotTextBubble key={i} text={msg.response.message} />
            }

            const copyResponseIndex = messages
              .slice(0, i + 1)
              .filter((m) => m.role === 'assistant' && m.response.is_copy_response)
              .length - 1
            const isLatest = i === messages.length - 1 && !loading
            return (
              <div key={i} className="message-row-bot">
                <BotCard
                  response={msg.response}
                  isLatest={isLatest}
                  onViewRationale={() => openVersionPanel(copyResponseIndex)}
                  onQuickAction={(action) => handleQuickAction(action, msg.response)}
                />
              </div>
            )
          })}

          {/* Skeleton while loading */}
          {loading && (
            <div className="message-row-bot">
              <div className="skeleton-wrap">
                <SkeletonLoader />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-banner">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--crit)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="error-icon">
                <circle cx="8" cy="8" r="6" /><path d="M8 5v3.5" /><circle cx="8" cy="10.5" r="0.5" fill="currentColor" />
              </svg>
              <div>
                <div className="error-title">Something went wrong</div>
                <div className="error-body">{error}</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom button */}
        <button
          className={`scroll-to-bottom${showScrollBtn ? ' is-visible' : ''}`}
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Jump to latest message"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          Latest
        </button>

        <FollowUpBar onSubmit={submit} loading={loading} sessionId={sessionId} scopeError={scopeError} onClearScopeError={() => setScopeError(null)} />
      </div>

      {/* Version history panel */}
      <VersionHistoryPanel
        open={versionPanelOpen}
        responses={assistantResponses}
        activeIndex={versionPanelIndex}
        onClose={() => setVersionPanelOpen(false)}
        onSelectVersion={setVersionPanelIndex}
      />
    </div>
  )
}
