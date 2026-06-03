const CLIENT_ID_KEY = 'lorem_client_id'

export type InteractionType =
  | 'copied'
  | 'rationale_opened'
  | 'follow_up_sent'
  | 'quick_action_shorter'
  | 'quick_action_alternatives'

export type SourceTier = 'library' | 'adapted' | 'ai' | 'ai_low'

export interface TrackInteractionOptions {
  source_tier?: SourceTier
  char_count?: number
}

export function getClientId(): string {
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(CLIENT_ID_KEY, id)
    return id
  } catch {
    return crypto.randomUUID() // SSR or storage blocked — transient ID
  }
}

export async function startSession(): Promise<string | null> {
  try {
    const clientId = getClientId()
    const res = await fetch('/api/metrics/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId }),
    })
    if (!res.ok) return null
    const data = await res.json() as { session_id: string }
    return data.session_id ?? null
  } catch {
    return null
  }
}

export function endSession(sessionId: string, startedAt: number): void {
  try {
    const duration = Math.round((Date.now() - startedAt) / 1000)
    const payload = JSON.stringify({
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
    })
    // sendBeacon fires reliably on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `/api/metrics/session/${sessionId}`,
        new Blob([payload], { type: 'application/json' }),
      )
    } else {
      void fetch(`/api/metrics/session/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      })
    }
  } catch {
    // Never block the user
  }
}

export function trackInteraction(
  sessionId: string | null,
  interaction: InteractionType,
  options?: TrackInteractionOptions,
): void {
  try {
    const clientId = getClientId()
    void fetch('/api/metrics/interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        session_id: sessionId,
        interaction,
        source_tier: options?.source_tier ?? null,
        char_count: options?.char_count ?? null,
      }),
    })
  } catch {
    // Fire-and-forget
  }
}

export function trackEvent(
  sessionId: string | null,
  event: string,
  properties?: Record<string, unknown>,
): void {
  try {
    const clientId = getClientId()
    void fetch('/api/metrics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        session_id: sessionId,
        event,
        properties: properties ?? null,
      }),
    })
  } catch {
    // Fire-and-forget
  }
}
