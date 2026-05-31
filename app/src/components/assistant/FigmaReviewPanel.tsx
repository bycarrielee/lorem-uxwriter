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

function spill(status: ReviewString['status']) {
  const map: Record<ReviewStatus, [string, string]> = {
    library:    ['Library match',    'fp-spill fp-spill-library'],
    adapted:    ['Adapted',          'fp-spill fp-spill-adapted'],
    suggestion: ['Guidelines-based', 'fp-spill fp-spill-suggestion'],
    'no-change':['No issues',        'fp-spill fp-spill-no-change'],
  }
  const [label, cls] = map[status] ?? ['—', 'fp-spill fp-spill-no-change']
  return <span className={cls}><span className="fp-spill-dot" />{label}</span>
}

function srcLabel(via: Suggestion['via']) {
  if (via === 'chat') return <span className="fp-sugg-source chat-src">From chat</span>
  if (via === 'quick-reply') return <span className="fp-sugg-source">Quick reply</span>
  return <span className="fp-sugg-source">Initial suggestion</span>
}

export function FigmaReviewPanel({
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
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  // Reset state when panel closes; apply initialTab when it opens
  useEffect(() => {
    if (!open) {
      setTab('all')
      setQuery('')
      setExpandedIdx(null)
    } else if (initialTab) {
      setTab(initialTab)
    }
  }, [open, initialTab])

  const visible = getVisibleStrings(strings, tab, query)

  function countByStatus(s: TabKey): number {
    if (s === 'all') return strings.filter((str) => !str.removed).length
    return strings.filter((str) => !str.removed && str.status === s).length
  }

  function handleRowClick(idx: number) {
    setExpandedIdx((prev) => (prev === idx ? null : idx))
  }

  function handleRemoveString(strIdx: number) {
    const prev = strings.map((s) => ({ ...s }))
    const next = strings.map((s) =>
      s.i === strIdx ? { ...s, removed: true } : s
    )
    if (expandedIdx === strIdx) setExpandedIdx(null)
    onStringsChange(next)
    showToast('String removed', 'Undo', () => onStringsChange(prev))
  }

  function handleRemoveSuggestion(strIdx: number, suggId: number) {
    const str = strings.find((s) => s.i === strIdx)
    if (!str || str.suggestions.length <= 1) return
    const next = strings.map((s) =>
      s.i === strIdx
        ? { ...s, suggestions: s.suggestions.filter((sg) => sg.id !== suggId) }
        : s
    )
    onStringsChange(next)
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    showToast('Copied ✓')
  }

  function handleQuickReply(strIdx: number, kind: string) {
    const str = strings.find((s) => s.i === strIdx)
    if (!str) return
    const copy = str.suggestions[str.suggestions.length - 1]?.copy ?? ''
    onQuickReply(`${kind} version of: "${copy}" — element: "${str.el}" in Figma frame "${frameName}"`)
  }

  function handleDiscuss(strIdx: number) {
    const str = strings.find((s) => s.i === strIdx)
    if (!str) return
    onDiscussInChat(str.el, strIdx)
    onClose()
  }

  function exportPDF() {
    const saved = expandedIdx
    setExpandedIdx(-99)
    setTimeout(() => {
      window.print()
      setExpandedIdx(saved)
    }, 50)
  }

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'library', label: 'Library match' },
    { key: 'adapted', label: 'Adapted' },
    { key: 'suggestion', label: 'Guidelines-based' },
    { key: 'no-change', label: 'No issues' },
  ]

  return (
    <div className={`fp-panel${open ? ' fp-panel-open' : ''}`}>
      {/* Print header */}
      <div className="fr-print-header">
        <span className="fr-print-title">Figma review — {frameName}</span>
        <span className="fr-print-meta">
          {new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Top bar */}
      <div className="fp-topbar">
        <div className="fp-title-row">
          <span className="fp-title">Figma review</span>
          <button
            className="fp-export-btn"
            onClick={exportPDF}
            aria-label="Export PDF"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export PDF
          </button>
        </div>
        <button
          className="fp-close"
          onClick={onClose}
          aria-label="Close review panel"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="fp-tabs" role="tablist">
        {tabs.map(({ key, label }) => {
          const count = countByStatus(key)
          return (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              className={`fp-tab${tab === key ? ' active' : ''}`}
              onClick={() => { setTab(key); setQuery('') }}
            >
              {label}
              <span className="fp-tab-count">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Search bar */}
      <div className="fp-search-bar">
        <span className="fp-search-icon" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6.5" cy="6.5" r="4.5" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
        </span>
        <input
          className="fp-search-input"
          type="text"
          placeholder="Search strings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search strings"
        />
        {query && (
          <button
            className="fp-search-clear"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="fp-table-wrap">
        <p className={`fp-no-results${visible.length === 0 ? ' visible' : ''}`}>
          No strings match your search.
        </p>
        <table className="fp-table">
          <thead>
            <tr>
              <th />
              <th className="fp-th-element">Element</th>
              <th>Copy</th>
              <th className="fp-th-status">Confidence</th>
              <th className="fp-th-actions" />
            </tr>
          </thead>
          <tbody>
            {visible.map((str) => {
              const isExpanded = expandedIdx === str.i || expandedIdx === -99
              const topSugg = str.suggestions[str.suggestions.length - 1]

              return (
                <React.Fragment key={str.i}>
                  <tr
                    className={`fp-row fp-row-${str.status}${isExpanded ? ' fp-row-selected' : ''}`}
                    onClick={() => handleRowClick(str.i)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{str.i + 1}</td>
                    <td className="fp-td-element">{str.el}</td>
                    <td className={str.chatAnchor ? 'fp-from-chat-dot' : undefined}>
                      {topSugg?.copy ?? '—'}
                      {str.suggestions.length > 1 && (
                        <span className="fp-multi-indicator">+{str.suggestions.length - 1}</span>
                      )}
                    </td>
                    <td>{spill(str.status)}</td>
                    <td>
                      <button
                        className="fp-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveString(str.i)
                        }}
                        aria-label={`Remove string ${str.el}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2 4h10M5 4V2.5A.5.5 0 0 1 5.5 2h3a.5.5 0 0 1 .5.5V4M3 4l.7 7.5A.5.5 0 0 0 4.2 12h5.6a.5.5 0 0 0 .5-.5L11 4" />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="fp-detail-row">
                      <td colSpan={5} className="fp-detail-cell">
                        <div className="fp-detail-inner">
                          {/* Original copy */}
                          {str.original !== undefined && (
                            <div>
                              <span className="fp-detail-label">Original</span>
                              <div className="fp-detail-original">{str.original}</div>
                            </div>
                          )}

                          {/* Suggestions list */}
                          <div>
                            <span className="fp-detail-label">Suggestions</span>
                            <div className="fp-sugg-list">
                              {str.suggestions.map((sg) => {
                                const isLastSugg = str.suggestions.length === 1
                                return (
                                  <div
                                    key={sg.id}
                                    className={`fp-sugg-item${sg.via === 'chat' ? ' from-chat' : ''}`}
                                  >
                                    <div className="fp-sugg-header">
                                      {srcLabel(sg.via)}
                                      {sg.source !== 'library' && (
                                        <button
                                          className="fp-sugg-remove-btn"
                                          disabled={isLastSugg}
                                          onClick={() => handleRemoveSuggestion(str.i, sg.id)}
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
                                        <span className="fp-sugg-copy-text">{sg.copy}</span>
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
                                      {sg.rationale && (
                                        <div className="fp-sugg-rationale">{sg.rationale}</div>
                                      )}
                                      {sg.libId && (
                                        <a
                                          href={`#lib-${sg.libId}`}
                                          className="fp-lib-link"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          View in library
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* From-chat bar */}
                          {str.chatAnchor && (
                            <div className="fp-from-chat-bar visible">
                              <span className="fp-from-chat-label">Discussed in chat</span>
                              <a
                                href={`#${str.chatAnchor}`}
                                className="fp-show-chat-btn"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Show in chat
                              </a>
                            </div>
                          )}

                          {/* Footer: quick replies + discuss */}
                          <div className="fp-detail-footer">
                            <div className="fp-detail-quick">
                              <span className="fp-detail-quick-label">Quick reply</span>
                              {(['Alternative', 'Shorter', 'Clearer'] as const).map((kind) => (
                                <button
                                  key={kind}
                                  className="fp-dchip"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleQuickReply(str.i, kind)
                                  }}
                                >
                                  {kind}
                                </button>
                              ))}
                            </div>
                            <button
                              className="fp-discuss-link"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDiscuss(str.i)
                              }}
                            >
                              Discuss in chat
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
