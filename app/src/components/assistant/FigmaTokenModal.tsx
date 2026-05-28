'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  open: boolean
  onSave: (token: string) => void
  onClose: () => void
}

export function FigmaTokenModal({ open, onSave, onClose }: Props) {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setToken('')
      setShowToken(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = token.trim()
    if (!trimmed) return
    onSave(trimmed)
  }

  if (!open) return null

  return (
    <div
      className="token-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-modal-title"
    >
      <form className="token-modal-dialog" onSubmit={handleSave}>
        {/* Header */}
        <div className="token-modal-header">
          <div className="token-modal-title-row">
            <div className="token-modal-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
                <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
                <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
                <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
                <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
              </svg>
            </div>
            <h2 id="token-modal-title" className="token-modal-title">Connect Figma</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="token-modal-close"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="token-modal-body">
          <p className="token-modal-desc">
            Lorem needs a Figma personal access token to read text from your frame.
          </p>

          {/* Input */}
          <div className="token-field">
            <label htmlFor="figma-token-input" className="token-field-label">
              Personal access token
            </label>
            <div className="token-input-wrap">
              <input
                ref={inputRef}
                id="figma-token-input"
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="figd_…"
                className="token-input"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="token-reveal-btn"
                aria-label={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
                    <circle cx="8" cy="8" r="2" />
                    <path d="M2 2l12 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
                    <circle cx="8" cy="8" r="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* How-to link */}
          <a
            href="https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="token-help-link"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 7v4" />
              <circle cx="8" cy="5.5" r="0.5" fill="currentColor" />
            </svg>
            How to create a Figma access token
          </a>

          {/* Privacy note */}
          <p className="token-privacy-note">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="7" width="10" height="8" rx="1.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            Stored in your browser only. Never sent anywhere except Figma's API.
          </p>
        </div>

        {/* Footer */}
        <div className="token-modal-footer">
          <button type="button" onClick={onClose} className="token-cancel-btn">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!token.trim()}
            className="token-save-btn"
          >
            Save and continue
          </button>
        </div>
      </form>
    </div>
  )
}
