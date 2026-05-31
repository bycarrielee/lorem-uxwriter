'use client'

import { useState, useRef, useEffect } from 'react'
import { LandingCard } from './LandingCard'
import { UserBubble } from './UserBubble'
import { BotCard } from './BotCard'
import { BotTextBubble } from './BotTextBubble'
import { FigmaReviewCard } from './FigmaReviewCard'
import { FigmaTokenModal } from './FigmaTokenModal'
import { BudgetBanner } from './BudgetBanner'
import { ApiKeyModal } from './ApiKeyModal'
import { SkeletonLoader } from './SkeletonLoader'
import { FollowUpBar } from './FollowUpBar'
import { VersionHistoryPanel } from './VersionHistoryPanel'
import type { AgentRequest, AgentResponse, BudgetStatus } from '@/lib/agent/types'
import { isFigmaUrl } from '@/lib/figma/parse'
import { useMetrics } from '@/lib/metrics/context'
import { getClientId } from '@/lib/metrics/analytics'
import type { ReviewString, ReviewStatus } from '@/types/figma-review'
import { convertFigmaRows, nextSuggestionId } from '@/types/figma-review'
import { FigmaReviewPanel } from './FigmaReviewPanel'
import { FigmaReviewSheet } from './FigmaReviewSheet'
import { ReviewToast } from './ReviewToast'

const FIGMA_TOKEN_KEY = 'lorem_figma_token'
const API_KEY         = 'lorem_api_key'

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
  const { sessionId: metricsSessionId, trackEvent } = useMetrics()

  const [versionPanelOpen, setVersionPanelOpen] = useState(false)
  const [versionPanelIndex, setVersionPanelIndex] = useState(0)

  // Figma token modal
  const [figmaModalOpen, setFigmaModalOpen] = useState(false)
  const [pendingFigmaReq, setPendingFigmaReq] = useState<AgentRequest | null>(null)

  // Budget / API key state
  const [budgetStatus, setBudgetStatus]       = useState<BudgetStatus>('ok')
  const [warningDismissed, setWarningDismissed] = useState(false)
  const [apiKeyModalOpen, setApiKeyModalOpen]  = useState(false)
  const [pendingApiKeyReq, setPendingApiKeyReq] = useState<AgentRequest | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Figma review state
  const [reviewStrings, setReviewStrings]     = useState<ReviewString[] | null>(null)
  const [reviewFrameName, setReviewFrameName] = useState<string>('Frame')
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false)
  const [reviewPanelFilter, setReviewPanelFilter] = useState<ReviewStatus | 'all'>('all')

  // Mobile breakpoint — drives panel vs sheet selection
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Toast
  const [toastMsg, setToastMsg]         = useState<string | null>(null)
  const [toastAction, setToastAction]   = useState<string | undefined>(undefined)
  const [toastOnAction, setToastOnAction] = useState<(() => void) | undefined>(undefined)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Discuss-in-chat
  const [pendingDiscussIdx, setPendingDiscussIdx] = useState<number | null>(null)
  const [discussPrefill, setDiscussPrefill]       = useState<string | undefined>(undefined)
  const [discussFocusTrigger, setDiscussFocusTrigger] = useState(0)

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

  function showToast(msg: string, actionLabel?: string, onAction?: () => void) {
    setToastMsg(msg)
    setToastAction(actionLabel)
    setToastOnAction(onAction ? () => onAction : undefined)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => {
      setToastMsg(null)
      setToastAction(undefined)
      setToastOnAction(undefined)
    }, 5000)
  }

  function handleDiscussInChat(el: string, idx: number) {
    setReviewPanelOpen(false)
    setPendingDiscussIdx(idx)
    setDiscussPrefill(`[${el}] `)
    setDiscussFocusTrigger((t) => t + 1)
    showToast('Type your feedback or copy suggestion ↓')
  }

  function openReviewPanel(filter: ReviewStatus | 'all') {
    setReviewPanelFilter(filter)
    setReviewPanelOpen(true)
    setVersionPanelOpen(false)
  }

  function getStoredFigmaToken(): string | null {
    try {
      return localStorage.getItem(FIGMA_TOKEN_KEY)
    } catch {
      return null
    }
  }

  function storeFigmaToken(token: string) {
    try {
      localStorage.setItem(FIGMA_TOKEN_KEY, token)
    } catch {
      // localStorage unavailable — token used for this session only
    }
  }
  function getStoredApiKey(): string | null {
    try { return localStorage.getItem(API_KEY) } catch { return null }
  }
  function storeApiKey(key: string) {
    try { localStorage.setItem(API_KEY, key) } catch { /* unavailable */ }
  }

  // Fetch budget status on mount
  // Debug override: ?budget=warning or ?budget=exceeded skips the real fetch
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const debugBudget = params.get('budget')
    if (debugBudget === 'warning' || debugBudget === 'exceeded') {
      setBudgetStatus(debugBudget)
      return
    }
    fetch('/api/budget')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.status) setBudgetStatus(data.status) })
      .catch(() => { /* fail silently */ })
  }, [])

  async function submit(req: AgentRequest) {
    // If Figma URL and no stored token → prompt for token first
    if (isFigmaUrl(req.input) && !req.figma_access_token) {
      const stored = getStoredFigmaToken()
      if (!stored) {
        setPendingFigmaReq(req)
        setFigmaModalOpen(true)
        return
      }
      req = { ...req, figma_access_token: stored }
    }

    // Budget exceeded: require user API key
    const storedApiKey = getStoredApiKey()
    if (budgetStatus === 'exceeded' && !storedApiKey && !req.user_api_key) {
      setPendingApiKeyReq(req)
      setApiKeyModalOpen(true)
      return
    }
    if (storedApiKey && !req.user_api_key) {
      req = { ...req, user_api_key: storedApiKey }
    }

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
        body: JSON.stringify({ ...req, session_id: sessionId ?? undefined, client_id: getClientId(), metrics_session_id: metricsSessionId ?? undefined }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const errCode = (body as { error?: string }).error
        if (res.status === 422 && errCode === 'out_of_scope') {
          setMessages((prev) => prev.slice(0, -1))
          if (wasLanding) setState('landing')
          setScopeError('Lorem is a UX writing assistant. Try a UX copy question.')
          trackEvent('user_error', { message: 'Lorem is a UX writing assistant. Try a UX copy question.', http_status: 422 })
          return
        }
        if (res.status === 401 && errCode === 'user_key_invalid') {
          throw new Error("That key didn't work. Check it and try again.")
        }
        if (res.status === 429 && errCode === 'user_key_rate_limited') {
          throw new Error('Your key has hit its own rate limit. Try again shortly.')
        }
        if (res.status === 402 && errCode === 'user_key_out_of_credits') {
          throw new Error('Your API key has run out of credits. Check equip.tech.gov.sg to find out when your quota resets.')
        }
        const httpError = new Error(errCode ?? `Request failed (${res.status})`)
        ;(httpError as Error & { httpStatus: number }).httpStatus = res.status
        throw httpError
      }

      const data = (await res.json()) as AgentResponse
      if (data.session_id) setSessionId(data.session_id)
      if (data.budget?.status) setBudgetStatus(data.budget.status)
      setMessages((prev) => [...prev, { role: 'assistant', response: data }])

      // Convert Figma review rows to ReviewString state
      if (data.figma_review && data.figma_review.length > 0) {
        setReviewFrameName(userText.slice(0, 60))
        setReviewStrings(convertFigmaRows(data.figma_review))
      }

      // Append chat suggestion to panel if discuss-in-chat was active
      if (pendingDiscussIdx !== null && data.is_copy_response && data.suggestion) {
        const newSugg = {
          id: nextSuggestionId(),
          copy: data.suggestion,
          rationale: Array.isArray(data.rationale) ? (data.rationale[0] ?? 'Suggestion from chat.') : (data.rationale ?? 'Suggestion from chat.'),
          source: (data.source_type === 'library_match' ? 'library'
            : data.source_type === 'adapted' ? 'adapted'
            : 'suggestion') as ReviewStatus,
          via: 'chat' as const,
          libId: null,
        }
        setReviewStrings((prev) =>
          prev ? prev.map((s) =>
            s.i === pendingDiscussIdx
              ? { ...s, suggestions: [...s.suggestions, newSugg] }
              : s
          ) : prev
        )
        setPendingDiscussIdx(null)
        showToast('Panel updated ✓')
      }

      // Auto-open version panel to latest if already open
      if (versionPanelOpen) {
        setVersionPanelIndex(assistantResponses.length)
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong'
      const httpStatus =
        err instanceof Error && 'httpStatus' in err
          ? (err as Error & { httpStatus: number }).httpStatus
          : null
      trackEvent('user_error', { message: errMsg, http_status: httpStatus })
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1))
      if (wasLanding) {
        // Return to landing and surface the error there — setError() only
        // renders in the response-state JSX so it would be invisible otherwise.
        setState('landing')
        setScopeError(errMsg)
      } else {
        setError(errMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleTokenSave(token: string) {
    storeFigmaToken(token)
    setFigmaModalOpen(false)
    if (pendingFigmaReq) {
      setPendingFigmaReq(null)
      submit({ ...pendingFigmaReq, figma_access_token: token })
    }
  }

  function handleTokenModalClose() {
    setFigmaModalOpen(false)
    setPendingFigmaReq(null)
  }

  function handleApiKeySave(key: string) {
    storeApiKey(key)
    setApiKeyModalOpen(false)
    if (pendingApiKeyReq) {
      const req = pendingApiKeyReq
      setPendingApiKeyReq(null)
      submit({ ...req, user_api_key: key })
    }
  }
  function handleApiKeyModalClose() {
    setApiKeyModalOpen(false)
    setPendingApiKeyReq(null)
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

  const showBudgetBanner = budgetStatus !== 'ok' && !(budgetStatus === 'warning' && warningDismissed)
  const budgetExceeded   = budgetStatus === 'exceeded'

  if (state === 'landing') {
    return (
      <>
        {showBudgetBanner && (
          <BudgetBanner
            status={budgetStatus as 'warning' | 'exceeded'}
            onAddKey={() => setApiKeyModalOpen(true)}
            onDismiss={budgetStatus === 'warning' ? () => setWarningDismissed(true) : undefined}
          />
        )}
        <LandingCard
          onSubmit={submit}
          loading={loading}
          scopeError={scopeError}
          onClearScopeError={() => setScopeError(null)}
          budgetExceeded={budgetExceeded}
        />
        <FigmaTokenModal open={figmaModalOpen} onSave={handleTokenSave} onClose={handleTokenModalClose} />
        <ApiKeyModal open={apiKeyModalOpen} onSave={handleApiKeySave} onClose={handleApiKeyModalClose} />
      </>
    )
  }

  return (
    <>
      {/* Budget banner — full width, above response area */}
      {showBudgetBanner && (
        <BudgetBanner
          status={budgetStatus as 'warning' | 'exceeded'}
          onAddKey={() => setApiKeyModalOpen(true)}
          onDismiss={budgetStatus === 'warning' ? () => setWarningDismissed(true) : undefined}
        />
      )}

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

              // Figma review response — render review card
              if (msg.response.figma_review && msg.response.figma_review.length > 0) {
                return (
                  <div key={i} className="message-row-bot">
                    {msg.response.message && (
                      <BotTextBubble text={msg.response.message} />
                    )}
                    <FigmaReviewCard
                      frameName={reviewFrameName}
                      strings={reviewStrings ?? []}
                      onOpen={openReviewPanel}
                    />
                  </div>
                )
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

          <FollowUpBar
            onSubmit={submit}
            loading={loading}
            sessionId={sessionId}
            scopeError={scopeError}
            onClearScopeError={() => setScopeError(null)}
            budgetExceeded={budgetExceeded}
            prefillValue={discussPrefill}
            focusTrigger={discussFocusTrigger}
            onPrefillConsumed={() => setDiscussPrefill(undefined)}
          />
        </div>

        {/* Version history panel */}
        <VersionHistoryPanel
          open={versionPanelOpen}
          responses={assistantResponses}
          activeIndex={versionPanelIndex}
          onClose={() => setVersionPanelOpen(false)}
          onSelectVersion={setVersionPanelIndex}
        />

        {/* Figma review — panel on desktop, sheet on mobile */}
        {reviewStrings && !isMobile && (
          <FigmaReviewPanel
            open={reviewPanelOpen}
            frameName={reviewFrameName}
            strings={reviewStrings}
            onStringsChange={(s) => setReviewStrings(s)}
            onClose={() => setReviewPanelOpen(false)}
            onDiscussInChat={handleDiscussInChat}
            onQuickReply={(prompt) => submit({ input: prompt })}
            showToast={showToast}
            initialTab={reviewPanelFilter}
          />
        )}

        {reviewStrings && isMobile && (
          <FigmaReviewSheet
            open={reviewPanelOpen}
            frameName={reviewFrameName}
            strings={reviewStrings}
            onStringsChange={(s) => setReviewStrings(s)}
            onClose={() => setReviewPanelOpen(false)}
            onDiscussInChat={handleDiscussInChat}
            onQuickReply={(prompt) => submit({ input: prompt })}
            showToast={showToast}
            initialTab={reviewPanelFilter}
          />
        )}
      </div>

      {/* Toast */}
      <ReviewToast
        message={toastMsg}
        actionLabel={toastAction}
        onAction={toastOnAction}
      />

      <FigmaTokenModal open={figmaModalOpen} onSave={handleTokenSave} onClose={handleTokenModalClose} />
      <ApiKeyModal open={apiKeyModalOpen} onSave={handleApiKeySave} onClose={handleApiKeyModalClose} />
    </>
  )
}
