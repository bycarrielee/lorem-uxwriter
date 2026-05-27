import type { Database } from '@/lib/supabase/types'

export type ElementType = Database['public']['Enums']['element_type']
export type SourceType  = Database['public']['Enums']['source_type']

export type Confidence = 'High' | 'Medium-High' | 'Medium' | 'Low'

export interface AgentRequest {
  input: string
  product_id?: string
  element_type?: ElementType
  session_id?: string
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
}

export const ELEMENT_TYPE_OPTIONS: Array<{ value: ElementType; label: string }> = [
  { value: 'buttons',    label: 'Buttons' },
  { value: 'errors',     label: 'Error messages' },
  { value: 'forms',      label: 'Form labels' },
  { value: 'alerts',     label: 'Alerts' },
  { value: 'modals',     label: 'Modals' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'content',    label: 'Content' },
  { value: 'states',     label: 'States' },
]
