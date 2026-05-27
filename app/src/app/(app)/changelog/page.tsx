'use client'

import { useState, useEffect } from 'react'

type Tab = 'releases' | 'requests' | 'roadmap'

const RELEASES = [
  {
    version: 'v1.0.0',
    badge: 'major',
    date: '26 May 2026',
    title: 'First release',
    changes: [
      { tag: 'feat', text: 'UX writing assistant with global foundation and pattern guidelines' },
      { tag: 'feat', text: 'Copy library with form labels suitable for global usage' },
    ],
  },
]

const REQUESTS = [
  {
    id: 'content-api',
    title: 'Content API',
    description: 'Makes it easier to add and maintain production copy for specific products.',
    status: 'considering',
    statusLabel: 'Considering',
    votes: 0,
  },
  {
    id: 'login',
    title: 'Login',
    description: 'To save past conversations.',
    status: 'considering',
    statusLabel: 'Considering',
    votes: 0,
  },
]

const ROADMAP = [
  {
    quarter: 'Q2 2026 — shipped',
    items: [
      { name: 'v1 assistant and library', status: 'done', label: 'Done' },
      { name: 'Global foundation guidelines — voice, style, accessibility, localisation', status: 'done', label: 'Done' },
      { name: 'Glossary for Singapore government agencies, scheme and service names', status: 'done', label: 'Done' },
      { name: 'Global copy pattern guidelines — alerts, buttons, errors, forms, links, long-form, modals, push notifications, release notes, states', status: 'done', label: 'Done' },
      { name: 'Library entries: form field labels and errors suitable for global usage', status: 'done', label: 'Done' },
    ],
  },
  {
    quarter: 'Later',
    items: [
      { name: 'Product-specific guidelines and library entries', status: 'planned', label: 'Considering' },
    ],
  },
]

export default function ChangelogPage() {
  const [activeTab, setActiveTab] = useState<Tab>('releases')
  const [votes, setVotes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cl-votes')
      if (saved) setVotes(JSON.parse(saved))
    } catch {}
  }, [])

  function toggleVote(id: string) {
    const next = { ...votes, [id]: !votes[id] }
    setVotes(next)
    try { localStorage.setItem('cl-votes', JSON.stringify(next)) } catch {}
  }

  return (
    <div className="cl-content">
      <div className="cl-inner">

        <div className="cl-page-hd">
          <h1 className="cl-page-title">Changelog &amp; Roadmap</h1>
          <p className="cl-page-sub">What&rsquo;s shipped, what&rsquo;s coming, and what you&rsquo;ve asked for.</p>
        </div>

        <div className="cl-tabs" role="tablist" aria-label="Changelog sections">
          {(['releases', 'requests', 'roadmap'] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`cl-tab${activeTab === tab ? ' is-active' : ''}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab === 'releases' ? 'Releases' : tab === 'requests' ? 'Feature requests' : 'Roadmap'}
            </button>
          ))}
        </div>

        {/* Releases panel */}
        <div className={`cl-panel${activeTab === 'releases' ? ' is-active' : ''}`} role="tabpanel">
          {RELEASES.map((r) => (
            <div key={r.version} className="cl-release">
              <div className="cl-release-meta">
                <span className="cl-version">{r.version}</span>
                <span className={`cl-badge cl-badge--${r.badge}`}>{r.badge}</span>
                <span className="cl-date">{r.date}</span>
              </div>
              <div className="cl-release-title">{r.title}</div>
              <ul className="cl-changes">
                {r.changes.map((c, i) => (
                  <li key={i} className="cl-change">
                    <span className={`cl-tag cl-tag--${c.tag}`}>{c.tag}</span>
                    {c.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Feature requests panel */}
        <div className={`cl-panel${activeTab === 'requests' ? ' is-active' : ''}`} role="tabpanel">
          <div className="cl-requests">
            {REQUESTS.map((req) => {
              const isVoted = !!votes[req.id]
              return (
                <div key={req.id} className="cl-request">
                  <button
                    className={`cl-vote-btn${isVoted ? ' is-voted' : ''}`}
                    onClick={() => toggleVote(req.id)}
                    type="button"
                    aria-label={isVoted ? 'Remove vote' : 'Vote for this feature'}
                    aria-pressed={isVoted}
                  >
                    <span className="cl-vote-arrow">▲</span>
                    <span className="cl-vote-count">{req.votes + (isVoted ? 1 : 0)}</span>
                  </button>
                  <div className="cl-req-body">
                    <div className="cl-req-title">{req.title}</div>
                    <div className="cl-req-desc">{req.description}</div>
                    <span className={`cl-req-status cl-req-status--${req.status}`}>{req.statusLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="cl-new-req">
            <p>Have a feature request?</p>
            <a
              href="https://form.gov.sg/6a1537f8b7792d70c10a0d30"
              target="_blank"
              rel="noopener noreferrer"
              className="cl-link-btn"
            >
              Submit a request
            </a>
          </div>
        </div>

        {/* Roadmap panel */}
        <div className={`cl-panel${activeTab === 'roadmap' ? ' is-active' : ''}`} role="tabpanel">
          {ROADMAP.map((quarter) => (
            <div key={quarter.quarter} className="cl-quarter">
              <div className="cl-quarter-label">{quarter.quarter}</div>
              <div className="cl-road-items">
                {quarter.items.map((item, i) => (
                  <div key={i} className="cl-road-item">
                    <span className={`cl-road-dot cl-road-dot--${item.status}`} />
                    <span className="cl-road-name">{item.name}</span>
                    <span className={`cl-road-tag cl-road-tag--${item.status}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
