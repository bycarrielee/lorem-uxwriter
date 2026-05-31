'use client'

interface Props {
  message: string | null
  actionLabel?: string
  onAction?: () => void
}

export function ReviewToast({ message, actionLabel, onAction }: Props) {
  return (
    <div className={`fr-toast${message ? ' show' : ''}`} role="status" aria-live="polite">
      {message}
      {message && actionLabel && onAction && (
        <button className="fr-toast-undo" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  )
}
