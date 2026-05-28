import type { Database } from '@/lib/supabase/types'

export type ElementType = Database['public']['Enums']['element_type']
export type SourceType  = Database['public']['Enums']['source_type']

export type Confidence = 'High' | 'Medium-High' | 'Medium' | 'Low'

export type FigmaReviewRow = {
  elementName: string
  original: string
  proposed: string
  changed: boolean
  rationale: string
}

export interface AgentRequest {
  input: string
  product_id?: string
  element_type?: ElementType
  session_id?: string
  // Metrics — optional, never required for core functionality
  client_id?: string
  metrics_session_id?: string
  // Figma — client-provided PAT; never stored in session messages
  figma_access_token?: string
}

export interface AgentResponse {
  is_copy_response: boolean
  message: string
  source_type: SourceType | null
  inferred: {
    element_type: ElementType | null
    intent: 'review' | 'generate'
  }
  suggestion: string
  character_count: number
  rationale: string[]
  guidelines_met: string[]
  confidence: Confidence | null
  confidence_reason: string
  session_id: string
  message_id: string
  figma_review?: FigmaReviewRow[] | null
}

export const ELEMENT_TYPE_OPTIONS: Array<{ value: ElementType; label: string }> = [
  { value: 'buttons',            label: 'Buttons' },
  { value: 'errors',             label: 'Error messages' },
  { value: 'forms',              label: 'Form labels' },
  { value: 'alerts',             label: 'Alerts' },
  { value: 'modals',             label: 'Modals' },
  { value: 'states',             label: 'States' },
  { value: 'links',              label: 'Links' },
  { value: 'content',            label: 'Content' },
  { value: 'push-notifications', label: 'Push notifications' },
  { value: 'release-notes',      label: 'Release notes' },
]
