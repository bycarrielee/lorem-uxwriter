'use client'

import { BudgetBanner } from '@/components/assistant/BudgetBanner'
import { ApiKeyModal } from '@/components/assistant/ApiKeyModal'
import { useState } from 'react'

export default function TestBudgetPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-default)', background: 'var(--surface-white)' }}>
        <h1 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Budget banner — both states</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Delete this page when done testing.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '32px 28px', overflowY: 'auto' }}>

        {/* Warning state */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Warning — 80–99% consumed
          </p>
          <div style={{ border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
            <BudgetBanner
              status="warning"
              onAddKey={() => setModalOpen(true)}
              onDismiss={() => alert('Dismissed!')}
            />
            <div style={{ padding: '24px', background: 'var(--surface-base)', fontSize: '13px', color: 'var(--text-tertiary)' }}>
              ↑ Appears above the editor. Dismissible.
            </div>
          </div>
        </div>

        {/* Exceeded state */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Exceeded — 100%+ consumed
          </p>
          <div style={{ border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
            <BudgetBanner
              status="exceeded"
              onAddKey={() => setModalOpen(true)}
            />
            <div style={{ padding: '24px', background: 'var(--surface-base)', fontSize: '13px', color: 'var(--text-tertiary)' }}>
              ↑ Not dismissible. Submit buttons become visually disabled — clicking opens the API key modal below.
            </div>
          </div>
        </div>

        {/* API key modal trigger */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            API key modal
          </p>
          <button
            onClick={() => setModalOpen(true)}
            style={{ height: '36px', padding: '0 16px', borderRadius: '6px', background: 'var(--color-primary)', color: '#fff', border: 'none', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer' }}
          >
            Open modal
          </button>
        </div>

      </div>

      <ApiKeyModal
        open={modalOpen}
        onSave={(key) => { alert(`Key saved: ${key.slice(0, 8)}…`); setModalOpen(false) }}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
