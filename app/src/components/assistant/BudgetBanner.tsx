'use client'

interface Props {
  status: 'warning' | 'exceeded'
  onAddKey: () => void
  onDismiss?: () => void
}

export function BudgetBanner({ status, onAddKey, onDismiss }: Props) {
  if (status === 'warning') {
    return (
      <div className="budget-banner budget-banner-warning" role="alert">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span className="budget-banner-text">
          Lorem is approaching its shared capacity.{' '}
          <button type="button" className="budget-banner-link" onClick={onAddKey}>
            Add your API key
          </button>{' '}
          to keep working.
        </span>
        {onDismiss && (
          <button
            type="button"
            className="budget-banner-dismiss"
            onClick={onDismiss}
            aria-label="Dismiss warning"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="budget-banner budget-banner-exceeded" role="alert">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span className="budget-banner-text">
        Lorem&apos;s shared capacity has been reached.{' '}
        <button type="button" className="budget-banner-link" onClick={onAddKey}>
          Add your API key
        </button>{' '}
        to continue.
      </span>
    </div>
  )
}
