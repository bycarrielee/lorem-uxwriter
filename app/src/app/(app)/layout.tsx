import { SidebarContent } from '@/components/sidebar/SidebarContent'
import { TopbarLink } from '@/components/TopbarLink'
import { MetricsProvider } from '@/lib/metrics/context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MetricsProvider>
    <div className="app-root">
      {/* Topbar */}
      <header className="topbar">
        <a href="/assistant" className="topbar-logo">
          <div className="topbar-brand-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="17" height="13" rx="3" fill="white" fillOpacity="0.9" />
              <path d="M5 15 L3 20 L8 18.5Z" fill="white" fillOpacity="0.9" />
              <circle cx="6.5" cy="8.5" r="1.25" fill="#1A8C6F" />
              <circle cx="10.5" cy="8.5" r="1.25" fill="#1A8C6F" />
              <circle cx="14.5" cy="8.5" r="1.25" fill="#1A8C6F" />
            </svg>
          </div>
          <div className="topbar-brand-text">
            <span className="topbar-logo-name">Lorem</span>
            <span className="topbar-logo-sub">UX Writing Assistant</span>
          </div>
        </a>
        <div className="topbar-actions">
          <TopbarLink href="/changelog">Changelog</TopbarLink>
          <a
            href="https://form.gov.sg/6a1537f8b7792d70c10a0d30"
            target="_blank"
            rel="noopener noreferrer"
            className="topbar-link"
          >
            Feedback
          </a>
        </div>
      </header>

      {/* Body */}
      <div className="app-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
    </MetricsProvider>
  )
}
