'use client'

import { useState, useMemo } from 'react'

type LibEntry = {
  id: string
  elementType: 'form-field-label' | 'form-field-hint' | 'form-field-error' | 'modal'
  status: 'approved' | 'draft'
  value: string
  field?: string
  fieldRef?: { id: string; label: string }
  isError?: boolean
}

const LIB_ENTRIES: LibEntry[] = [
  { id: 'global.forms.email.label', elementType: 'form-field-label', status: 'approved', value: 'Email address', field: 'email' },
  { id: 'global.forms.email.hint', elementType: 'form-field-hint', status: 'draft', value: "We'll use this to send you important updates.", field: 'email' },
  { id: 'global.forms.email.errors.required', elementType: 'form-field-error', status: 'approved', value: 'Enter your email address.', field: 'email', fieldRef: { id: 'global.forms.email', label: 'Email address' } },
  { id: 'global.forms.email.errors.invalid', elementType: 'form-field-error', status: 'approved', value: 'Enter a valid email address, like name@example.com.', field: 'email', fieldRef: { id: 'global.forms.email', label: 'Email address' } },
  { id: 'global.forms.email.errors.duplicate', elementType: 'form-field-error', status: 'draft', value: 'An account with this email already exists.', field: 'email', fieldRef: { id: 'global.forms.email', label: 'Email address' } },
  { id: 'global.forms.password.label', elementType: 'form-field-label', status: 'approved', value: 'Password', field: 'password' },
  { id: 'global.forms.password.hint', elementType: 'form-field-hint', status: 'draft', value: 'Use 8 or more characters with a mix of letters, numbers, and symbols.', field: 'password' },
  { id: 'global.forms.password.errors.required', elementType: 'form-field-error', status: 'approved', value: 'Enter a password.', field: 'password', fieldRef: { id: 'global.forms.password', label: 'Password' } },
  { id: 'global.forms.password.errors.tooShort', elementType: 'form-field-error', status: 'approved', value: 'Password must be at least 8 characters.', field: 'password', fieldRef: { id: 'global.forms.password', label: 'Password' } },
  { id: 'global.forms.password.errors.tooWeak', elementType: 'form-field-error', status: 'draft', value: 'Include numbers and symbols to strengthen your password.', field: 'password', fieldRef: { id: 'global.forms.password', label: 'Password' } },
  { id: 'global.forms.confirmPassword.label', elementType: 'form-field-label', status: 'approved', value: 'Confirm password', field: 'confirmPassword' },
  { id: 'global.forms.confirmPassword.errors.mismatch', elementType: 'form-field-error', status: 'approved', value: 'Passwords do not match.', field: 'confirmPassword', fieldRef: { id: 'global.forms.confirmPassword', label: 'Confirm password' } },
  { id: 'global.forms.firstName.label', elementType: 'form-field-label', status: 'approved', value: 'First name', field: 'firstName' },
  { id: 'global.forms.firstName.errors.required', elementType: 'form-field-error', status: 'approved', value: 'Enter your first name.', field: 'firstName', fieldRef: { id: 'global.forms.firstName', label: 'First name' } },
  { id: 'global.forms.lastName.label', elementType: 'form-field-label', status: 'approved', value: 'Last name', field: 'lastName' },
  { id: 'global.forms.lastName.errors.required', elementType: 'form-field-error', status: 'approved', value: 'Enter your last name.', field: 'lastName', fieldRef: { id: 'global.forms.lastName', label: 'Last name' } },
  { id: 'global.forms.phone.label', elementType: 'form-field-label', status: 'approved', value: 'Phone number', field: 'phone' },
  { id: 'global.forms.phone.hint', elementType: 'form-field-hint', status: 'draft', value: 'Include your country code, e.g. +65 9123 4567.', field: 'phone' },
  { id: 'global.forms.phone.errors.required', elementType: 'form-field-error', status: 'approved', value: 'Enter your phone number.', field: 'phone', fieldRef: { id: 'global.forms.phone', label: 'Phone number' } },
  { id: 'global.forms.phone.errors.invalid', elementType: 'form-field-error', status: 'draft', value: 'Enter a valid phone number, including your country code.', field: 'phone', fieldRef: { id: 'global.forms.phone', label: 'Phone number' } },
  { id: 'global.forms.dateOfBirth.label', elementType: 'form-field-label', status: 'approved', value: 'Date of birth', field: 'dateOfBirth' },
  { id: 'global.forms.dateOfBirth.hint', elementType: 'form-field-hint', status: 'draft', value: 'For example, 15 Jan 1990.', field: 'dateOfBirth' },
  { id: 'global.forms.dateOfBirth.errors.required', elementType: 'form-field-error', status: 'approved', value: 'Enter your date of birth.', field: 'dateOfBirth', fieldRef: { id: 'global.forms.dateOfBirth', label: 'Date of birth' } },
  { id: 'global.forms.dateOfBirth.errors.invalid', elementType: 'form-field-error', status: 'approved', value: 'Enter a valid date.', field: 'dateOfBirth', fieldRef: { id: 'global.forms.dateOfBirth', label: 'Date of birth' } },
  { id: 'global.forms.dateOfBirth.errors.underage', elementType: 'form-field-error', status: 'draft', value: 'You must be 18 or older to continue.', field: 'dateOfBirth', fieldRef: { id: 'global.forms.dateOfBirth', label: 'Date of birth' } },
  { id: 'global.forms.postalCode.label', elementType: 'form-field-label', status: 'approved', value: 'Postal code', field: 'postalCode' },
  { id: 'global.forms.postalCode.errors.required', elementType: 'form-field-error', status: 'approved', value: 'Enter your postal code.', field: 'postalCode', fieldRef: { id: 'global.forms.postalCode', label: 'Postal code' } },
  { id: 'global.forms.postalCode.errors.invalid', elementType: 'form-field-error', status: 'draft', value: 'Enter a valid 6-digit postal code.', field: 'postalCode', fieldRef: { id: 'global.forms.postalCode', label: 'Postal code' } },
  { id: 'global.forms.country.label', elementType: 'form-field-label', status: 'approved', value: 'Country', field: 'country' },
  { id: 'global.forms.country.errors.required', elementType: 'form-field-error', status: 'approved', value: 'Select a country.', field: 'country', fieldRef: { id: 'global.forms.country', label: 'Country' } },
  { id: 'global.modals.sessionExpired.title', elementType: 'modal', status: 'approved', value: 'Your session has expired', isError: true },
  { id: 'global.modals.sessionExpired.body', elementType: 'modal', status: 'approved', value: "You've been signed out due to inactivity. Sign in again to continue.", isError: true },
  { id: 'global.modals.sessionExpired.primaryCta', elementType: 'modal', status: 'approved', value: 'Sign in again', isError: true },
  { id: 'global.modals.uploadFailed.title', elementType: 'modal', status: 'approved', value: 'Upload failed', isError: true },
  { id: 'global.modals.uploadFailed.body', elementType: 'modal', status: 'draft', value: 'Your file could not be uploaded. Check your connection and try again.', isError: true },
  { id: 'global.modals.confirmDelete.title', elementType: 'modal', status: 'approved', value: 'Delete this item?' },
  { id: 'global.modals.confirmDelete.body', elementType: 'modal', status: 'approved', value: 'This action cannot be undone.' },
  { id: 'global.modals.confirmDelete.primaryCta', elementType: 'modal', status: 'approved', value: 'Yes, delete' },
  { id: 'global.modals.confirmDelete.secondaryCta', elementType: 'modal', status: 'approved', value: 'Cancel' },
]

const TYPE_CONFIG: Record<LibEntry['elementType'], { label: string; bg: string; color: string; border: string }> = {
  'form-field-label': { label: 'Label', bg: 'oklch(97% 0.04 246)', color: 'oklch(42% 0.16 246)', border: 'oklch(84% 0.08 246)' },
  'form-field-hint':  { label: 'Hint',  bg: 'oklch(97% 0.05 310)', color: 'oklch(42% 0.17 310)', border: 'oklch(84% 0.09 310)' },
  'form-field-error': { label: 'Error', bg: 'var(--ai-bg)',         color: 'var(--ai-txt)',        border: 'var(--ai-bd)' },
  'modal':            { label: 'Modal', bg: 'var(--surface-base)',  color: 'var(--text-secondary)', border: 'var(--border-input)' },
}

const TABS = ['all', 'forms', 'modals', 'buttons', 'errors'] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  all: 'All', forms: 'Forms', modals: 'Modals', buttons: 'Buttons', errors: 'Errors',
}

const TAB_FILTERS: Record<Tab, ((e: LibEntry) => boolean) | null> = {
  all:     null,
  forms:   (e) => e.elementType.startsWith('form-'),
  modals:  (e) => e.elementType === 'modal',
  buttons: (e) => e.id.includes('button') || e.id.includes('btn'),
  errors:  (e) => e.elementType === 'form-field-error' || (e.elementType === 'modal' && !!e.isError),
}

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(() => {
    let entries = LIB_ENTRIES
    const filterFn = TAB_FILTERS[tab]
    if (filterFn) entries = entries.filter(filterFn)
    if (search.trim()) {
      const q = search.toLowerCase()
      entries = entries.filter(e =>
        e.value.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
      )
    }
    return entries
  }, [tab, search])

  const selected = selectedId ? LIB_ENTRIES.find(e => e.id === selectedId) ?? null : null

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
                const cfg = TYPE_CONFIG[entry.elementType]
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
                      <span className="list-item-text">{entry.value}</span>
                    </div>
                    <span className={`list-item-dot${entry.status === 'draft' ? ' is-amber' : ''}`} />
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
                      border: `1px solid ${TYPE_CONFIG[selected.elementType].border}`,
                      background: TYPE_CONFIG[selected.elementType].bg,
                      color: TYPE_CONFIG[selected.elementType].color,
                    }}
                  >
                    {TYPE_CONFIG[selected.elementType].label}
                  </span>
                  <span
                    className="lib-badge"
                    style={{
                      border: selected.status === 'approved' ? '1px solid var(--lib-bd)' : '1px solid var(--ai-bd)',
                      background: selected.status === 'approved' ? 'var(--lib-bg)' : 'var(--ai-bg)',
                      color: selected.status === 'approved' ? 'var(--lib-txt)' : 'var(--ai-txt)',
                    }}
                  >
                    {selected.status === 'approved' ? 'Approved' : 'Draft'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(selected.value)}
                  className={`detail-copy-btn${copied ? ' is-copied' : ''}`}
                >
                  {copied ? 'Copied' : 'Copy text'}
                </button>
              </div>

              {/* Copy */}
              <div className="detail-section-label">Copy</div>
              <div className="detail-copy-box">{selected.value}</div>

              {/* Metadata */}
              <div className="detail-section-label">Metadata</div>
              <div className="metadata-table-wrap">
                <table className="metadata-table">
                  <tbody>
                    <MetaRow label="ID" value={selected.id} />
                    <MetaRow label="Element type" value={TYPE_CONFIG[selected.elementType].label} />
                    {selected.field && <MetaRow label="Field" value={selected.field} />}
                    {selected.fieldRef && <MetaRow label="Field ref" value={selected.fieldRef.id} />}
                    <MetaRow label="Status" value={selected.status === 'approved' ? 'Approved' : 'Draft'} />
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
