'use client'

import { useState } from 'react'
import type { FigmaReviewRow } from '@/lib/agent/types'

interface Props {
  frameName: string
  rows: FigmaReviewRow[]
}

export function FigmaReviewCard({ frameName, rows }: Props) {
  const [copied, setCopied] = useState(false)
  const changedCount = rows.filter((r) => r.changed).length

  function handleCopyAll() {
    const text = rows.map((r) => r.proposed).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="figma-review-card">
      {/* Header */}
      <div className="figma-review-header">
        <div className="figma-review-frame-name">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
            <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
            <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
            <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
            <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
          </svg>
          {frameName}
        </div>
        <div className="figma-review-summary">
          {changedCount === 0
            ? `All ${rows.length} strings look good`
            : `${changedCount} of ${rows.length} strings need changes`}
        </div>
      </div>

      {/* Table */}
      <div className="figma-review-table-wrap">
        <table className="figma-review-table">
          <thead>
            <tr>
              <th>Element</th>
              <th>Original copy</th>
              <th>Proposed copy</th>
              <th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={row.changed ? 'figma-row-changed' : 'figma-row-ok'}>
                <td className="figma-cell-element">{row.elementName}</td>
                <td className="figma-cell-original">{row.original}</td>
                <td className={`figma-cell-proposed${row.changed ? ' is-changed' : ''}`}>
                  {row.proposed}
                </td>
                <td className="figma-cell-rationale">{row.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer actions */}
      <div className="figma-review-footer">
        <button
          onClick={handleCopyAll}
          className={`icon-btn icon-btn-primary${copied ? ' is-copied' : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {copied
              ? <path d="M2 8l4 4 8-8" />
              : <><rect x="4" y="4" width="9" height="11" rx="1.5" /><path d="M3 3a1 1 0 0 1 1-1h6l3 3v1" /></>
            }
          </svg>
          {copied ? 'Copied' : 'Copy all proposed'}
        </button>
      </div>
    </div>
  )
}
