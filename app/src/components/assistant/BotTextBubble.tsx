'use client'

import type { ReactNode } from 'react'

interface Props { text: string }

function renderInline(line: string): ReactNode[] {
  const parts = line.split('**')
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

function renderText(text: string): ReactNode[] {
  // Split into lines, then group into paragraphs and bullet lists
  const lines = text.split('\n')
  const blocks: ReactNode[] = []
  let bulletItems: string[] = []
  let paraLines: string[] = []
  let key = 0

  function flushBullets() {
    if (bulletItems.length === 0) return
    blocks.push(
      <ul key={key++} className="bot-text-list">
        {bulletItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
      </ul>
    )
    bulletItems = []
  }

  function flushPara() {
    if (paraLines.length === 0) return
    blocks.push(
      <p key={key++} className="bot-text-para">
        {paraLines.map((line, i) => (
          <span key={i}>{renderInline(line)}{i < paraLines.length - 1 && <br />}</span>
        ))}
      </p>
    )
    paraLines = []
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (/^[-*•]\s+/.test(trimmed)) {
      // Bullet line — flush any pending paragraph first
      flushPara()
      bulletItems.push(trimmed.replace(/^[-*•]\s+/, ''))
    } else if (trimmed === '') {
      // Blank line — flush both
      flushPara()
      flushBullets()
    } else {
      // Regular text line — flush any pending bullets first
      flushBullets()
      paraLines.push(trimmed)
    }
  }

  flushPara()
  flushBullets()

  return blocks
}

export function BotTextBubble({ text }: Props) {
  return (
    <div className="message-row-bot">
      <div className="bot-text-bubble">{renderText(text)}</div>
    </div>
  )
}
