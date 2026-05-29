'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ErrorRow } from './page'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-SG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status: number | null): string {
  if (status === null) return 'network'
  return String(status)
}

function statusVariant(status: number | null): string {
  if (status === null) return 'network'
  if (status >= 500) return 'server'
  if (status === 404) return 'notfound'
  return 'client'
}

export function ErrorLogTable({ rows }: { rows: ErrorRow[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? rows.filter((r) =>
        r.message.toLowerCase().includes(query.toLowerCase()),
      )
    : rows

  return (
    <div className="elog-wrap">
      <div className="elog-toolbar">
        <input
          className="elog-search"
          type="search"
          placeholder="Search errors…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="elog-count">{filtered.length} errors</span>
      </div>

      {filtered.length === 0 ? (
        <div className="elog-empty">No errors found.</div>
      ) : (
        <table className="elog-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Status</th>
              <th>Error</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td className="elog-time">{formatDate(row.created_at)}</td>
                <td className="elog-status">
                  <span className={`elog-badge elog-badge--${statusVariant(row.http_status)}`}>
                    {statusLabel(row.http_status)}
                  </span>
                </td>
                <td className="elog-message">{row.message}</td>
                <td className="elog-action">
                  {row.session_id ? (
                    <Link href={`/assistant/${row.session_id}`} className="elog-open">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </Link>
                  ) : (
                    <span className="elog-no-link" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
