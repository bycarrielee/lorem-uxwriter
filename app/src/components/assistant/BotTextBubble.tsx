'use client'

interface Props { text: string }

export function BotTextBubble({ text }: Props) {
  return (
    <div className="message-row-bot">
      <div className="bot-text-bubble">{text}</div>
    </div>
  )
}
