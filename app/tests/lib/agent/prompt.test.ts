import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, buildUserMessage } from '@/lib/agent/prompt'
import type { LookupResult } from '@/lib/agent/lookup'

const emptyContext: LookupResult = { copyMatches: [], patterns: [], foundations: [] }

describe('buildSystemPrompt', () => {
  it('includes the JSON schema instruction', () => {
    const prompt = buildSystemPrompt(emptyContext)
    expect(prompt).toContain('source_type')
    expect(prompt).toContain('suggestion')
    expect(prompt).toContain('rationale')
  })

  it('includes foundation content when present', () => {
    const ctx: LookupResult = {
      ...emptyContext,
      foundations: [{ id: '1', type: 'voice', scope: 'global', content: 'Be direct.' }],
    }
    const prompt = buildSystemPrompt(ctx)
    expect(prompt).toContain('Be direct.')
    expect(prompt).toContain('VOICE')
  })

  it('includes pattern content when present', () => {
    const ctx: LookupResult = {
      ...emptyContext,
      patterns: [{ id: '1', element_type: 'buttons', scope: 'global', content: 'Start with a verb.' }],
    }
    const prompt = buildSystemPrompt(ctx)
    expect(prompt).toContain('Start with a verb.')
    expect(prompt).toContain('ELEMENT PATTERNS')
  })

  it('includes library matches when present', () => {
    const ctx: LookupResult = {
      ...emptyContext,
      copyMatches: [
        {
          id: '1', copy: 'Save and continue', context: 'Form progress', rationale: 'Clear action',
          scope: 'global', product_id: null, tone: 'neutral', usage_examples: [],
        },
      ],
    }
    const prompt = buildSystemPrompt(ctx)
    expect(prompt).toContain('Save and continue')
    expect(prompt).toContain('LIBRARY MATCHES')
  })
})

describe('buildUserMessage', () => {
  it('includes the input text', () => {
    const msg = buildUserMessage({ input: 'Review this error message' })
    expect(msg).toContain('Review this error message')
  })

  it('includes element type context when provided', () => {
    const msg = buildUserMessage({ input: 'Review this', element_type: 'errors' })
    expect(msg).toContain('errors')
  })

  it('notes no context when not provided', () => {
    const msg = buildUserMessage({ input: 'Review this' })
    expect(msg).toContain('No context provided')
  })
})
