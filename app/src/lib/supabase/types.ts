export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      budget_usage: {
        Row: {
          cost_usd: number
          id: number
          updated_at: string
        }
        Insert: {
          cost_usd?: number
          id: number
          updated_at?: string
        }
        Update: {
          cost_usd?: number
          id?: number
          updated_at?: string
        }
      }
      copy_entries: {
        Row: {
          accessibility_notes: string | null
          added_at: string
          alternatives: Json
          character_count: number | null
          context: string
          copy: Json
          element_type: Database['public']['Enums']['element_type']
          id: string
          journey_stage: Database['public']['Enums']['journey_stage'] | null
          product_id: string | null
          rationale: string
          scope: Database['public']['Enums']['content_scope']
          status: Database['public']['Enums']['copy_status']
          tags: string[]
          tone: Database['public']['Enums']['copy_tone'] | null
          updated_at: string
          usage_examples: string[]
          validated_by_research: boolean
        }
        Insert: {
          accessibility_notes?: string | null
          added_at?: string
          alternatives?: Json
          character_count?: number | null
          context: string
          copy: Json
          element_type: Database['public']['Enums']['element_type']
          id?: string
          journey_stage?: Database['public']['Enums']['journey_stage'] | null
          product_id?: string | null
          rationale: string
          scope: Database['public']['Enums']['content_scope']
          status?: Database['public']['Enums']['copy_status']
          tags?: string[]
          tone?: Database['public']['Enums']['copy_tone'] | null
          updated_at?: string
          usage_examples?: string[]
          validated_by_research?: boolean
        }
        Update: {
          accessibility_notes?: string | null
          added_at?: string
          alternatives?: Json
          character_count?: number | null
          context?: string
          copy?: Json
          element_type?: Database['public']['Enums']['element_type']
          id?: string
          journey_stage?: Database['public']['Enums']['journey_stage'] | null
          product_id?: string | null
          rationale?: string
          scope?: Database['public']['Enums']['content_scope']
          status?: Database['public']['Enums']['copy_status']
          tags?: string[]
          tone?: Database['public']['Enums']['copy_tone'] | null
          updated_at?: string
          usage_examples?: string[]
          validated_by_research?: boolean
        }
      }
      foundations: {
        Row: {
          content: string
          id: string
          product_id: string | null
          scope: Database['public']['Enums']['content_scope']
          type: Database['public']['Enums']['foundation_type']
          updated_at: string
        }
        Insert: {
          content: string
          id?: string
          product_id?: string | null
          scope: Database['public']['Enums']['content_scope']
          type: Database['public']['Enums']['foundation_type']
          updated_at?: string
        }
        Update: {
          content?: string
          id?: string
          product_id?: string | null
          scope?: Database['public']['Enums']['content_scope']
          type?: Database['public']['Enums']['foundation_type']
          updated_at?: string
        }
      }
      patterns: {
        Row: {
          content: string
          element_type: Database['public']['Enums']['element_type']
          id: string
          product_id: string | null
          scope: Database['public']['Enums']['content_scope']
          updated_at: string
        }
        Insert: {
          content: string
          element_type: Database['public']['Enums']['element_type']
          id?: string
          product_id?: string | null
          scope: Database['public']['Enums']['content_scope']
          updated_at?: string
        }
        Update: {
          content?: string
          element_type?: Database['public']['Enums']['element_type']
          id?: string
          product_id?: string | null
          scope?: Database['public']['Enums']['content_scope']
          updated_at?: string
        }
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
      }
      session_messages: {
        Row: {
          content: Json
          copy_entry_ids: string[]
          created_at: string
          id: string
          role: string
          session_id: string
          source_type: Database['public']['Enums']['source_type'] | null
        }
        Insert: {
          content: Json
          copy_entry_ids?: string[]
          created_at?: string
          id?: string
          role: string
          session_id: string
          source_type?: Database['public']['Enums']['source_type'] | null
        }
        Update: {
          content?: Json
          copy_entry_ids?: string[]
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          source_type?: Database['public']['Enums']['source_type'] | null
        }
      }
      sessions: {
        Row: {
          created_at: string
          id: string
          name: string | null
          product_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          product_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          product_id?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_budget_cost: {
        Args: { amount: number }
        Returns: undefined
      }
    }
    Enums: {
      content_scope: 'global' | 'product'
      copy_status: 'active' | 'deprecated' | 'draft' | 'review'
      copy_tone: 'neutral' | 'friendly' | 'serious' | 'empathetic' | 'urgent' | 'positive' | 'cautionary'
      element_type: 'buttons' | 'errors' | 'forms' | 'alerts' | 'modals' | 'content' | 'states' | 'links' | 'push-notifications' | 'release-notes'
      foundation_type: 'voice' | 'style' | 'accessibility' | 'localisation' | 'terminology'
      journey_stage: 'onboarding' | 'task-completion' | 'error-recovery' | 'success' | 'decision-point' | 'information'
      source_type: 'library_match' | 'adapted' | 'ai_generated' | 'ai_generated_low_confidence'
    }
  }
}
