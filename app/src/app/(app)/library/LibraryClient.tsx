'use client'

import { useState, useMemo } from 'react'

type CopyEntry = {
  id: string
  element_type: string
  copy: unknown
  context: string | null
  rationale: string | null
  tags: string[] | null
  tone: string | null
  status: string
  scope: string
  product_id: string | null
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  'forms':               { label: 'Form',          bg: 'oklch(97% 0.04 246)',    color: 'oklch(42% 0.16 246)',   border: 'oklch(84% 0.08 246)' },
  'errors':              { label: 'Error',          bg: 'var(--ai-bg)',           color: 'var(--ai-txt)',         border: 'var(--ai-bd)' },
  'modals':              { label: 'Modal',          bg: 'var(--surface-base)',    color: 'var(--text-secondary)', border: 'var(--border-input)' },
  'buttons':             { label: 'Button',         bg: 'oklch(97% 0.05 310)',    color: 'oklch(42% 0.17 310)',   border: 'oklch(84% 0.09 310)' },
  'alerts':              { label: 'Alert',          bg: 'oklch(97% 0.04 80)',     color: 'oklch(42% 0.16 80)',    border: 'oklch(84% 0.08 80)' },
  'content':             { label: 'Content',        bg: 'oklch(97% 0.03 160)',    color: 'oklch(42% 0.12 160)',   border: 'oklch(84% 0.06 160)' },
  'states':              { label: 'State',          bg: 'oklch(97% 0.04 200)',    color: 'oklch(42% 0.14 200)',   border: 'oklch(84% 0.07 200)' },
  'links':               { label: 'Link',           bg: 'oklch(97% 0.04 260)',    color: 'oklch(42% 0.16 260)',   border: 'oklch(84% 0.08 260)' },
  'push-notifications':  { label: 'Push notif.',   bg: 'oklch(97% 0.04 290)',    color: 'oklch(42% 0.15 290)',   border: 'oklch(84% 0.08 290)' },
  'release-notes':       { label: 'Release note',  bg: 'oklch(97% 0.03 140)',    color: 'oklch(42% 0.12 140)',   border: 'oklch(84% 0.06 140)' },
}

const FALLBACK_CONFIG = { label: 'Entry', bg: 'var(--surface-base)', color: 'var(--text-secondary)', border: 'var(--border-input)' }

function getTypeConfig(elementType: string) {
  return TYPE_CONFIG[elementType] ?? FALLBACK_CONFIG
}

function extractCopyText(copy: unknown): string {
  if (typeof copy === 'string') return copy
  if (copy && typeof copy === 'object') {
    const obj = copy as Record<string, unknown>
    if (typeof obj.header === 'string') return obj.header
  }
  return JSON.stringify(copy)
}

const TABS = ['all', 'forms', 'errors', 'modals', 'buttons'] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  all: 'All', forms: 'Forms', errors: 'Errors', modals: 'Modals', buttons: 'Buttons',
}

const TAB_FILTERS: Record<Tab, ((e: CopyEntry) => boolean) | null> = {
  all:     null,
  forms:   (e) => e.element_type === 'forms',
  errors:  (e) => e.element_type === 'errors',
  modals:  (e) => e.element_type === 'modals',
  buttons: (e) => e.element_type === 'buttons',
}

export default function LibraryClient({ entries }: { entries: CopyEntry[] }) {
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(() => {
    let list = entries
    const filterFn = TAB_FILTERS[tab]
    if (filterFn) list = list.filter(filterFn)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        extractCopyText(e.copy).toLowerCase().includes(q) ||
        (e.context ?? '').toLowerCase().includes(q) ||
        (e.tags ?? []).some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [entries, tab, search])

  const selected = selectedId ? entries.find(e => e.id === selectedId) ?? null : null

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="lib-root">

      {/* Page header */}
      <div className="lib-header">
        <div>
          <div className="lib-title">Library</div>
          <div className="lib-subtitle">Approved copy patterns for Singapore government digital services.</div>
        </div>
        <div className="lib-search-wrap">
          <svg className="lib-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="lib-search"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="lib-tabs">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`lib-tab${tab === t ? ' is-active' : ''}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Main area: list + detail */}
      <div className="lib-body">

        {/* List column */}
        <div className="list-pane">
          <div className="list-meta-bar">
            <span className="list-meta-count">
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} · Global
            </span>
          </div>
          <div className="list-scroll">
            {filtered.length === 0 ? (
              <div className="list-empty">No entries found</div>
            ) : (
              filtered.map(entry => {
                const cfg = getTypeConfig(entry.element_type)
                const isSel = selectedId === entry.id
                return (
                  <div
                    key={entry.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(entry.id)}
                    onKeyDown={e => e.key === 'Enter' && setSelectedId(entry.id)}
                    className={`list-item${isSel ? ' is-selected' : ''}`}
                  >
                    <span
                      className="lib-badge"
                      style={{ border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <div className="list-item-body">
                      <span className="list-item-text">{extractCopyText(entry.copy)}</span>
                    </div>
                    <span className={`list-item-dot${entry.status !== 'active' ? ' is-amber' : ''}`} />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Detail pane */}
        <div className={`detail-pane${selected ? ' has-selection' : ''}`}>
          {!selected ? (
            <div className="detail-empty-state">
              <div className="detail-empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <p className="detail-empty-title">Copy library</p>
              <p className="detail-empty-desc">
                Approved and draft copy strings from across the product. Select an entry to inspect its content, status, and metadata.
              </p>
              <p className="detail-empty-hint">
                Use the search bar or tabs to filter by element type. Copy strings directly from the detail panel.
              </p>
            </div>
          ) : (
            <div className="detail-content">

              {/* Top row: badges left, Copy button right */}
              <div className="detail-top-row">
                <div className="detail-badges">
                  <span
                    className="lib-badge"
                    style={{
                      border: `1px solid ${getTypeConfig(selected.element_type).border}`,
                      background: getTypeConfig(selected.element_type).bg,
                      color: getTypeConfig(selected.element_type).color,
                    }}
                  >
                    {getTypeConfig(selected.element_type).label}
                  </span>
                  <span
                    className="lib-badge"
                    style={{
                      border: selected.status === 'active' ? '1px solid var(--lib-bd)' : '1px solid var(--ai-bd)',
                      background: selected.status === 'active' ? 'var(--lib-bg)' : 'var(--ai-bg)',
                      color: selected.status === 'active' ? 'var(--lib-txt)' : 'var(--ai-txt)',
                    }}
                  >
                    {selected.status === 'active' ? 'Active' : selected.status === 'draft' ? 'Draft' : 'Review'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(extractCopyText(selected.copy))}
                  className={`detail-copy-btn${copied ? ' is-copied' : ''}`}
                >
                  {copied ? 'Copied' : 'Copy text'}
                </button>
              </div>

              {/* Copy */}
              <div className="detail-section-label">Copy</div>
              {selected.copy && typeof selected.copy === 'object' ? (
                Object.entries(selected.copy as Record<string, unknown>).map(([key, val]) => (
                  <div key={key}>
                    <div className="detail-section-label" style={{ marginTop: '0.5rem', fontSize: '0.65rem', textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)' }}>{key}</div>
                    <div className="detail-copy-box">{String(val)}</div>
                  </div>
                ))
              ) : (
                <div className="detail-copy-box">{extractCopyText(selected.copy)}</div>
              )}

              {/* Metadata */}
              <div className="detail-section-label">Metadata</div>
              <div className="metadata-table-wrap">
                <table className="metadata-table">
                  <tbody>
                    <MetaRow label="ID" value={selected.id} />
                    <MetaRow label="Element type" value={selected.element_type} />
                    {selected.context && <MetaRow label="Context" value={selected.context} />}
                    {selected.tags && selected.tags.length > 0 && <MetaRow label="Tags" value={selected.tags.join(', ')} />}
                    {selected.tone && <MetaRow label="Tone" value={selected.tone} />}
                    <MetaRow label="Status" value={selected.status === 'active' ? 'Active' : selected.status === 'draft' ? 'Draft' : 'Review'} />
                  </tbody>
                </table>
              </div>

              {/* Screenshot */}
              <div className="detail-section-label">Screenshot</div>
              <div className="screenshot-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <circle cx="7.5" cy="6" r="0.75" fill="currentColor" />
                  <circle cx="10.5" cy="6" r="0.75" fill="currentColor" />
                </svg>
                <span>No screenshot available</span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{value}</td>
    </tr>
  )
}
