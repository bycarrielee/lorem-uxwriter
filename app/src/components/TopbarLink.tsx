'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  href: string
  children: React.ReactNode
}

export function TopbarLink({ href, children }: Props) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link href={href} className={`topbar-link${isActive ? ' is-active' : ''}`}>
      {children}
    </Link>
  )
}
