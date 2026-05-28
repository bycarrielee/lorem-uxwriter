'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Session {
  id: string
  name: string | null
  created_at: string
}

const INITIAL_LIMIT = 12

export function SessionList() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [showAll, setShowAll] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('sessions')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setSessions(data)
      })
  }, [])

  // Close context menu on outside click
  useEffect(() => {
    if (!openMenuId) return
    function close() { setOpenMenuId(null); setMenuPos(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openMenuId])

  function toggleSearch() {
    const next = !searchOpen
    setSearchOpen(next)
    if (next) {
      setTimeout(() => searchRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }

  function openMenu(e: React.MouseEvent<HTMLButtonElement>, id: string) {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({ x: rect.right - 128, y: rect.bottom + 4 })
    setOpenMenuId(id)
  }

  function startRename(id: string) {
    const session = sessions.find((s) => s.id === id)
    setRenamingId(id)
    setRenameValue(session?.name ?? '')
    setOpenMenuId(null)
    setMenuPos(null)
  }

  async function commitRename() {
    if (!renamingId) return
    const id = renamingId
    const original = sessions.find((s) => s.id === id)?.name ?? ''
    const newName = renameValue.trim() || original
    setRenamingId(null)
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, name: newName } : s))
    const supabase = createClient()
    await supabase.from('sessions').update({ name: newName }).eq('id', id)
  }

  function cancelRename() {
    setRenamingId(null)
  }

  function startDelete(id: string) {
    setDeletingId(id)
    setOpenMenuId(null)
    setMenuPos(null)
  }

  async function confirmDelete(id: string) {
    setDeletingId(null)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    const supabase = createClient()
    await supabase.from('sessions').delete().eq('id', id)
  }

  const filtered = query
    ? sessions.filter((s) => (s.name ?? '').toLowerCase().includes(query.toLowerCase()))
    : sessions

  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_LIMIT)
  const hasMore = filtered.length > INITIAL_LIMIT && !showAll

  return (
    <>
      {/* Section header with search toggle */}
      <div className="section-hd">
        <span className="section-label">Assistant history</span>
        <button
          onClick={toggleSearch}
          aria-label="Search conversations"
          aria-expanded={searchOpen}
          className={`search-toggle${searchOpen ? ' is-open' : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5"/><line x1="13.5" y1="13.5" x2="17" y2="17"/>
          </svg>
        </button>
      </div>

      {/* Search input */}
      {searchOpen && (
        <input
          ref={searchRef}
          type="search"
          placeholder="Search"
          aria-label="Search conversations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="session-search-input"
        />
      )}

      {/* Session list */}
      {displayed.length > 0 && (
        <div role="list" className="session-list-wrap">
          {displayed.map((s) => (
            <div
              key={s.id}
              role="listitem"
              className="session-wrap"
            >
              {renamingId === s.id ? (
                <input
                  autoFocus
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); commitRename() }
                    if (e.key === 'Escape') { e.preventDefault(); cancelRename() }
                  }}
                  onBlur={commitRename}
                  className="session-rename-input"
                />
              ) : deletingId === s.id ? (
                <div className="session-delete-confirm">
                  <span className="session-delete-label">
                    {s.name ?? 'Untitled session'}
                  </span>
                  <div className="session-delete-actions">
                    <button
                      type="button"
                      className="session-delete-cancel"
                      onClick={() => setDeletingId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="session-delete-ok"
                      onClick={() => confirmDelete(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="session-btn"
                    onClick={() => router.push(`/assistant/${s.id}`)}
                  >
                    <span className="session-btn-text">
                      {s.name ?? 'Untitled session'}
                    </span>
                  </button>

                  {/* Context menu button */}
                  <button
                    type="button"
                    aria-label="Session options"
                    tabIndex={-1}
                    onClick={(e) => openMenu(e, s.id)}
                    className={`session-ctx-btn${openMenuId === s.id ? ' is-menu-open' : ''}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <circle cx="4" cy="10" r="1.75"/><circle cx="10" cy="10" r="1.75"/><circle cx="16" cy="10" r="1.75"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View all button */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="view-all-btn"
        >
          View all
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}

      {/* Context menu — fixed position, rendered outside sidebar overflow */}
      {openMenuId && menuPos && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className="ctx-menu"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => startRename(openMenuId)}
            className="ctx-menu-item"
          >
            Rename
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => startDelete(openMenuId)}
            className="ctx-menu-item ctx-menu-item--danger"
          >
            Delete
          </button>
        </div>
      )}
    </>
  )
}
