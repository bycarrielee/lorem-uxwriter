'use client'

import { useState, useEffect, useRef } from 'react'
import { SourceTag } from './SourceTag'
import type { AgentResponse } from '@/lib/agent/types'

interface Props {
  open: boolean
  responses: AgentResponse[]    // all assistant responses in the session, oldest first
  activeIndex: number           // which version tab is selected (index into responses)
  onClose: () => void
  onSelectVersion: (index: number) => void
}

export function VersionHistoryPanel({ open, responses, activeIndex, onClose, onSelectVersion }: Props) {
  const [rationaleOpen, setRationaleOpen] = useState(true)
  const [guidelinesOpen, setGuidelinesOpen] = useState(true)
  const tabsScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Reset collapse state when version changes
  useEffect(() => {
    setRationaleOpen(true)
    setGuidelinesOpen(true)
  }, [activeIndex])

  function checkTabArrows() {
    const el = tabsScrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }

  useEffect(() => {
    checkTabArrows()
  }, [responses])

  function scrollTabs(dir: 'left' | 'right') {
    const el = tabsScrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? 120 : -120, behavior: 'smooth' })
  }

  const active = responses[activeIndex]

  // Tabs are shown newest-first (reverse order)
  const reversedIndices = [...responses.map((_, i) => i)].reverse()

  function CollapsibleSection({ title, open: isOpen, onToggle, children }: {
    title: string
    open: boolean
    onToggle: () => void
    children: React.ReactNode
  }) {
    return (
      <div>
        <button onClick={onToggle} className="collapser-btn">
          <span className="panel-section-label">{title}</span>
          <svg
            width="14" height="14" viewBox="0 0 16 16" fill="none"
            stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className={`collapser-icon${!isOpen ? ' is-closed' : ''}`}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
        {isOpen && children}
      </div>
    )
  }

  return (
    <div className={`version-panel${open ? ' is-open' : ''}`}>
      <div className="version-panel-inner">
        {/* Header */}
        <div className="version-panel-hd">
          <div className="version-panel-title-row">
            <span className="version-panel-title">
              Version history
            </span>
            <button
              onClick={onClose}
              aria-label="Close version history"
              className="panel-close-btn"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            </button>
          </div>

          {/* Version tabs — newest first, scrollable with arrows */}
          <div className="version-tabs-row">
            {/* Left arrow */}
            <button
              onClick={() => scrollTabs('left')}
              aria-label="Scroll tabs left"
              className={`tab-arrow${canScrollLeft ? ' is-visible' : ''}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div
              ref={tabsScrollRef}
              onScroll={checkTabArrows}
              className="version-tab-scroll"
            >
              {reversedIndices.map((idx) => {
                const versionNumber = idx + 1
                const isActive = idx === activeIndex
                const isLatest = idx === responses.length - 1
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectVersion(idx)}
                    className={`version-tab${isActive ? ' is-active' : ''}`}
                  >
                    V{versionNumber}
                    {isLatest && (
                      <span className="latest-badge">Latest</span>
                    )}
                  </button>
                )
              })}
            </div>
            {/* Right arrow */}
            <button
              onClick={() => scrollTabs('right')}
              aria-label="Scroll tabs right"
              className={`tab-arrow${canScrollRight ? ' is-visible' : ''}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        {active && (
          <div className="version-body">
            {/* Source tag */}
            <SourceTag sourceType={active.source_type} />

            {/* Copy preview — DM Mono, color-primary border */}
            <div className="version-copy-section">
              <span className="panel-section-label">Suggested copy</span>
              <div className="version-copy-box">
                {active.suggestion}
              </div>
              <span className="version-char-count">
                {active.character_count} characters
              </span>
            </div>

            <div className="version-rule" />

            {/* Rationale — collapsible */}
            {active.rationale.length > 0 && (
              <CollapsibleSection title="Rationale" open={rationaleOpen} onToggle={() => setRationaleOpen(!rationaleOpen)}>
                <ul className="panel-list">
                  {active.rationale.map((item, i) => (
                    <li key={i} className="panel-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}

            {/* Guidelines met — collapsible */}
            {active.guidelines_met.length > 0 && (
              <CollapsibleSection title="Guidelines met" open={guidelinesOpen} onToggle={() => setGuidelinesOpen(!guidelinesOpen)}>
                <ul className="panel-list">
                  {active.guidelines_met.map((item, i) => (
                    <li key={i} className="panel-guideline-item">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--lib-txt)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="panel-guideline-icon">
                        <path d="M2 8l4 4 8-8" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
