'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  startSession,
  endSession,
  trackInteraction as _trackInteraction,
  trackEvent as _trackEvent,
  type InteractionType,
  type SourceTier,
} from './analytics'

interface MetricsContextValue {
  sessionId: string | null
  trackInteraction: (
    interaction: InteractionType,
    options?: { source_tier?: SourceTier; char_count?: number }
  ) => void
  trackEvent: (event: string, properties?: Record<string, unknown>) => void
}

const MetricsContext = createContext<MetricsContextValue>({
  sessionId: null,
  trackInteraction: () => {},
  trackEvent: () => {},
})

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const startedAtRef = useRef<number>(0)
  const sidRef = useRef<string | null>(null)

  useEffect(() => {
    startedAtRef.current = Date.now()

    void startSession().then((sid) => {
      sidRef.current = sid
      setSessionId(sid)
    })

    function handleUnload() {
      if (sidRef.current) {
        endSession(sidRef.current, startedAtRef.current)
      }
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      if (sidRef.current) {
        endSession(sidRef.current, startedAtRef.current)
      }
    }
  }, [])

  function trackInteraction(
    interaction: InteractionType,
    options?: { source_tier?: SourceTier; char_count?: number },
  ) {
    _trackInteraction(sessionId, interaction, options)
  }

  function trackEvent(event: string, properties?: Record<string, unknown>) {
    _trackEvent(sessionId, event, properties)
  }

  return (
    <MetricsContext.Provider value={{ sessionId, trackInteraction, trackEvent }}>
      {children}
    </MetricsContext.Provider>
  )
}

export function useMetrics(): MetricsContextValue {
  return useContext(MetricsContext)
}
