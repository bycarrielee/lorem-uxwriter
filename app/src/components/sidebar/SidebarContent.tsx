'use client'

import { usePathname } from 'next/navigation'
import { NavItem } from './NavItem'
import { SessionList } from './SessionList'

const WORKSPACE_NAV = (
  <nav className="sidebar-nav">
    <div className="sidebar-section-label">Workspace</div>
    <NavItem
      href="/assistant"
      label="Assistant"
      icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
    />
    <NavItem
      href="/library"
      label="Library"
      icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
    />
  </nav>
)

function DashboardNav() {
  return (
    <nav className="sidebar-nav">
      <div className="sidebar-section-label">Dashboard</div>
      <NavItem
        href="/dashboard"
        label="Overview"
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
      />
      <NavItem
        href="/dashboard/prompts"
        label="Prompt log"
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
      />
      <NavItem
        href="/dashboard/errors"
        label="Error log"
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
      />
    </nav>
  )
}

export function SidebarContent() {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard) {
    return <DashboardNav />
  }

  return (
    <>
      {WORKSPACE_NAV}
      <div className="sidebar-divider" />
      <SessionList />
    </>
  )
}
