'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PromptRow } from './page'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-SG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PromptLogTable({ rows }: { rows: PromptRow[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? rows.filter((r) => r.prompt.toLowerCase().includes(query.toLowerCase()))
    : rows

  return (
    <div className="plog-wrap">
      <div className="plog-toolbar">
        <input
          className="plog-search"
          type="search"
          placeholder="Search prompts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="plog-count">{filtered.length} prompts</span>
      </div>

      {filtered.length === 0 ? (
        <div className="plog-empty">No prompts found.</div>
      ) : (
        <table className="plog-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Prompt</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td className="plog-time">{formatDate(row.created_at)}</td>
                <td className="plog-prompt">{row.prompt}</td>
                <td className="plog-action">
                  <Link href={`/assistant/${row.session_id}`} className="plog-open">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
