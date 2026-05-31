'use client'

import React, { useState, useEffect } from 'react'
import type { ReviewString, ReviewStatus, Suggestion } from '@/types/figma-review'
import { getVisibleStrings } from '@/types/figma-review'

type TabKey = 'all' | 'library' | 'adapted' | 'suggestion' | 'no-change'

interface Props {
  open: boolean
  frameName: string
  strings: ReviewString[]
  onStringsChange: (strings: ReviewString[]) => void
  onClose: () => void
  onDiscussInChat: (el: string, stringIndex: number) => void
  onQuickReply: (prompt: string) => void
  showToast: (msg: string, actionLabel?: string, onAction?: () => void) => void
  initialTab?: ReviewStatus | 'all'
}

function spillBadge(status: ReviewString['status']) {
  const map: Record<ReviewStatus, [string, string]> = {
    library:     ['Library match',    'fp-spill fp-spill-library'],
    adapted:     ['Adapted',          'fp-spill fp-spill-adapted'],
    suggestion:  ['Guidelines-based', 'fp-spill fp-spill-suggestion'],
    'no-change': ['No issues',        'fp-spill fp-spill-no-change'],
  }
  const [label, cls] = map[status] ?? ['—', 'fp-spill fp-spill-no-change']
  return <span className={cls}><span className="fp-spill-dot" />{label}</span>
}

function srcLabel(via: Suggestion['via']) {
  if (via === 'chat') return <span className="fp-sugg-source chat-src">From chat</span>
  if (via === 'quick-reply') return <span className="fp-sugg-source">Quick reply</span>
  return <span className="fp-sugg-source">Initial suggestion</span>
}

export function FigmaReviewSheet({
  open,
  frameName,
  strings,
  onStringsChange,
  onClose,
  onDiscussInChat,
  onQuickReply,
  showToast,
  initialTab,
}: Props) {
  const [tab, setTab] = useState<TabKey>('all')
  const [query, setQuery] = useState('')
  const [cardIdx, setCardIdx] = useState(0)
  const [animDir, setAnimDir] = useState<'right' | 'left'>('right')

  // Reset state when sheet closes; apply initialTab when it opens
  useEffect(() => {
    if (!open) {
      setTab('all')
      setQuery('')
      setCardIdx(0)
      setAnimDir('right')
    } else if (initialTab) {
      setTab(initialTab)
      setCardIdx(0)
    }
  }, [open, initialTab])

  const items = getVisibleStrings(strings, tab, query)

  // Clamp cardIdx when items shrink
  useEffect(() => {
    if (items.length > 0 && cardIdx >= items.length) {
      setCardIdx(items.length - 1)
    }
  }, [items.length, cardIdx])

  const clampedIdx = items.length > 0 ? Math.min(cardIdx, items.length - 1) : 0
  const currentStr = items[clampedIdx] ?? null

  function countByStatus(s: TabKey): number {
    if (s === 'all') return strings.filter((str) => !str.removed).length
    return strings.filter((str) => !str.removed && str.status === s).length
  }

  function handlePrev() {
    if (clampedIdx <= 0) return
    setAnimDir('left')
    setCardIdx(clampedIdx - 1)
  }

  function handleNext() {
    if (clampedIdx >= items.length - 1) {
      onClose()
      return
    }
    setAnimDir('right')
    setCardIdx(clampedIdx + 1)
  }

  function handleRemoveString(strI: number) {
    const prev = strings.map((s) => ({ ...s }))
    const next = strings.map((s) =>
      s.i === strI ? { ...s, removed: true } : s
    )
    const newItems = getVisibleStrings(next, tab, query)
    if (clampedIdx > 0 && clampedIdx >= newItems.length) {
      setCardIdx(newItems.length > 0 ? newItems.length - 1 : 0)
    }
    onStringsChange(next)
    showToast('String removed', 'Undo', () => onStringsChange(prev))
  }

  function handleRemoveSuggestion(strI: number, suggId: number) {
    const str = strings.find((s) => s.i === strI)
    if (!str || str.suggestions.length <= 1) return
    const next = strings.map((s) =>
      s.i === strI
        ? { ...s, suggestions: s.suggestions.filter((sg) => sg.id !== suggId) }
        : s
    )
    onStringsChange(next)
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    showToast('Copied ✓')
  }

  function handleQuickReply(strI: number, kind: string) {
    const str = strings.find((s) => s.i === strI)
    if (!str) return
    const copy = str.suggestions[str.suggestions.length - 1]?.copy ?? ''
    onQuickReply(`${kind} version of: "${copy}" — element: "${str.el}" in Figma frame "${frameName}"`)
  }

  function handleDiscuss(strI: number) {
    const str = strings.find((s) => s.i === strI)
    if (!str) return
    onClose()
    onDiscussInChat(str.el, strI)
  }

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'all',        label: 'All' },
    { key: 'library',    label: 'Library match' },
    { key: 'adapted',    label: 'Adapted' },
    { key: 'suggestion', label: 'Guidelines' },
    { key: 'no-change',  label: 'No issues' },
  ]

  const isLastCard = clampedIdx >= items.length - 1

  return (
    <>
      <div
        className={`fr-sheet-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
      />
      <div className={`fr-sheet${open ? ' is-open' : ''}`}>
        {/* Handle */}
        <div className="fr-sheet-handle">
          <div className="fr-sheet-handle-bar" />
        </div>

        {/* Header */}
        <div className="fr-sheet-header">
          <div className="fr-sheet-title-row">
            <span className="fr-sheet-title">Figma review</span>
            <div className="fr-sheet-title-actions">
              <button
                className="fp-export-btn"
                onClick={() => window.print()}
                aria-label="Export PDF"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export PDF
              </button>
              <button
                className="fr-sheet-close"
                onClick={onClose}
                aria-label="Close review sheet"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="fr-sheet-tabs" role="tablist">
            {tabs.map(({ key, label }) => {
              const count = countByStatus(key)
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  className={`fr-stab${tab === key ? ' active' : ''}`}
                  onClick={() => { setTab(key); setCardIdx(0); setQuery('') }}
                >
                  {label}
                  <span className="fr-stab-count">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <div className="fr-sheet-body">
          {/* Search */}
          <div className="fr-sheet-search">
            <span className="fr-sheet-search-icon" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <line x1="10" y1="10" x2="14" y2="14" />
              </svg>
            </span>
            <input
              className="fr-sheet-search-input"
              type="text"
              placeholder="Search strings..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCardIdx(0) }}
              aria-label="Search strings"
            />
          </div>

          {/* Navigation */}
          <div className="fr-sheet-nav">
            <button
              className="fr-nav-arrow"
              onClick={handlePrev}
              disabled={clampedIdx === 0}
              aria-label="Previous string"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="10 4 6 8 10 12" />
              </svg>
            </button>
            <div className="fr-nav-info">
              <span className="fr-nav-pos">
                {items.length > 0 ? `${clampedIdx + 1} of ${items.length}` : '0 of 0'}
              </span>
              <span className="fr-nav-el">{currentStr?.el ?? ''}</span>
            </div>
            <button
              className="fr-nav-arrow"
              onClick={() => {
                if (clampedIdx < items.length - 1) {
                  setAnimDir('right')
                  setCardIdx(clampedIdx + 1)
                }
              }}
              disabled={clampedIdx >= items.length - 1}
              aria-label="Next string"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 4 10 8 6 12" />
              </svg>
            </button>
          </div>

          {/* Card */}
          {currentStr ? (
            <div
              key={clampedIdx}
              className={`fr-sheet-card${animDir === 'right' ? ' anim' : ' anim-left'}`}
            >
              {/* Status row */}
              <div>
                <div className="fr-sc-label">Status</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {spillBadge(currentStr.status)}
                  <button
                    className="fp-remove-btn"
                    onClick={() => handleRemoveString(currentStr.i)}
                    aria-label={`Remove string ${currentStr.el}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 4h10M5 4V2.5A.5.5 0 0 1 5.5 2h3a.5.5 0 0 1 .5.5V4M3 4l.7 7.5A.5.5 0 0 0 4.2 12h5.6a.5.5 0 0 0 .5-.5L11 4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Original */}
              {currentStr.original && (
                <div>
                  <div className="fr-sc-label">Original</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>
                    {currentStr.original}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <div className="fr-sc-label">Suggestions</div>
                <div className="fp-sugg-list">
                  {currentStr.suggestions.map((sg) => {
                    const isLib = sg.source === 'library'
                    const isLastSugg = currentStr.suggestions.length === 1
                    return (
                      <div
                        key={sg.id}
                        className={`fp-sugg-item${sg.via === 'chat' ? ' from-chat' : ''}`}
                      >
                        <div className="fp-sugg-header">
                          {srcLabel(sg.via)}
                          {!isLib && (
                            <button
                              className="fp-sugg-remove-btn"
                              disabled={isLastSugg}
                              onClick={() => handleRemoveSuggestion(currentStr.i, sg.id)}
                              aria-label="Remove suggestion"
                            >
                              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M2 4h10M5 4V2.5A.5.5 0 0 1 5.5 2h3a.5.5 0 0 1 .5.5V4M3 4l.7 7.5A.5.5 0 0 0 4.2 12h5.6a.5.5 0 0 0 .5-.5L11 4" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="fp-sugg-body">
                          <div className="fp-sugg-copy-row">
                            <div className="fp-sugg-copy-text">{sg.copy}</div>
                            <button
                              className="fp-copy-btn"
                              onClick={() => handleCopy(sg.copy)}
                              aria-label="Copy text"
                            >
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="5" y="5" width="9" height="9" rx="1" />
                                <path d="M2 11V2h9" />
                              </svg>
                            </button>
                          </div>
                          <div className="fp-sugg-rationale">{sg.rationale}</div>
                          {sg.libId && (
                            <span className="fp-lib-link">{sg.libId}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick replies */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['Alternative', 'Shorter'] as const).map((kind) => (
                  <button
                    key={kind}
                    className="chip"
                    onClick={() => handleQuickReply(currentStr.i, kind)}
                  >
                    {kind}
                  </button>
                ))}
                <button
                  className="chip"
                  style={{ borderStyle: 'dashed' }}
                  onClick={() => handleDiscuss(currentStr.i)}
                >
                  Discuss
                </button>
              </div>
            </div>
          ) : (
            <div className="fr-sheet-card">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', marginTop: 24 }}>
                No strings match your search.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="fr-sheet-actions">
          <button className="fr-sheet-btn fr-sheet-btn-secondary" onClick={onClose}>
            Done
          </button>
          <button className="fr-sheet-btn fr-sheet-btn-primary" onClick={handleNext}>
            {isLastCard ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </>
  )
}
