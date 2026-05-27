import type { SourceType } from '@/lib/agent/types'

interface Config {
  label: string
  bg: string
  text: string
  border: string
  icon: React.ReactNode
}

const icon = (path: React.ReactNode) => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
)

const CONFIG: Record<SourceType, Config> = {
  library_match: {
    label: 'Library match',
    bg: 'var(--lib-bg)', text: 'var(--lib-txt)', border: 'var(--lib-bd)',
    icon: icon(<path d="M2 8l4 4 8-8" />),
  },
  adapted: {
    label: 'Adapted from library',
    bg: 'var(--ada-bg)', text: 'var(--ada-txt)', border: 'var(--ada-bd)',
    icon: icon(<path d="M4 12L12 4M8 4h4v4" />),
  },
  ai_generated: {
    label: 'AI-generated',
    bg: 'var(--ai-bg)', text: 'var(--ai-txt)', border: 'var(--ai-bd)',
    icon: icon(<><path d="M8 2l1.5 4H14l-3.5 2.5 1.5 4L8 10l-4 2.5 1.5-4L2 6h4.5L8 2z" /></>),
  },
  ai_generated_low_confidence: {
    label: 'AI-generated · lower confidence',
    bg: 'var(--ail-bg)', text: 'var(--ail-txt)', border: 'var(--ail-bd)',
    icon: icon(<><circle cx="8" cy="8" r="6" /><path d="M8 5v3.5" /><circle cx="8" cy="11" r="0.5" fill="currentColor" /></>),
  },
}

interface Props {
  sourceType: SourceType | null
}

export function SourceTag({ sourceType }: Props) {
  const { label, bg, text, border, icon } = (sourceType ? CONFIG[sourceType] : null) ?? CONFIG.ai_generated_low_confidence
  return (
    <span
      className="source-tag"
      style={{ background: bg, color: text, border: `1px solid ${border}` }}
    >
      {icon}
      {label}
    </span>
  )
}
