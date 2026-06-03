'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  open: boolean
  onSave: (key: string) => void
  onClose: () => void
}

export function ApiKeyModal({ open, onSave, onClose }: Props) {
  const [key, setKey]     = useState('')
  const [show, setShow]   = useState(false)
  const inputRef          = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setKey('')
      setShow(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

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
    const trimmed = key.trim()
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
      aria-labelledby="api-modal-title"
    >
      <form className="token-modal-dialog" onSubmit={handleSave}>
        {/* Header */}
        <div className="token-modal-header">
          <div className="token-modal-title-row">
            <h2 id="api-modal-title" className="token-modal-title">
              Lorem&apos;s shared capacity has been reached
            </h2>
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
            Add your own Claude API key to keep working. It&apos;s stored in your browser only.
          </p>

          <div className="token-field">
            <label htmlFor="api-key-input" className="token-field-label">
              Claude API key
            </label>
            <div className="token-input-wrap">
              <input
                ref={inputRef}
                id="api-key-input"
                type={show ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-ant-…"
                className="token-input"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="token-reveal-btn"
                aria-label={show ? 'Hide key' : 'Show key'}
              >
                {show ? (
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

          <p className="token-privacy-note">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="7" width="10" height="8" rx="1.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            Get your key from equip.tech.gov.sg. Never shared with the Lorem server.
          </p>
        </div>

        {/* Footer */}
        <div className="token-modal-footer">
          <button type="button" onClick={onClose} className="token-cancel-btn">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!key.trim()}
            className="token-save-btn"
          >
            Save and continue
          </button>
        </div>
      </form>
    </div>
  )
}
