'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  href: string
  label: string
  icon: React.ReactNode
}

export function NavItem({ href, label, icon }: Props) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link href={href} className={`nav-item${isActive ? ' is-active' : ''}`}>
      <span className="nav-item-icon">{icon}</span>
      {label}
    </Link>
  )
}
