import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { lookupContext } from '@/lib/agent/lookup'

function makeMockSupabase(data: Record<string, unknown[]>) {
  const from = vi.fn((table: string) => {
    const result = data[table] ?? []
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      or:     vi.fn().mockReturnThis(),
      limit:  vi.fn().mockReturnThis(),
      then:   vi.fn(),
    }
    // Resolve on any terminal call
    chain.limit.mockImplementation(() => Promise.resolve({ data: result, error: null }))
    chain.or.mockImplementation  (() => Promise.resolve({ data: result, error: null }))
    return chain
  })
  return { from }
}

describe('lookupContext', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty arrays when no element type or product', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeMockSupabase({ copy_entries: [], patterns: [], foundations: [] })
    )
    const result = await lookupContext(null, null)
    expect(result.copyMatches).toEqual([])
    expect(result.patterns).toEqual([])
    expect(result.foundations).toEqual([])
  })

  it('returns patterns when element type provided', async () => {
    const pattern = { id: '1', element_type: 'buttons', scope: 'global', content: 'btn rules' }
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeMockSupabase({ copy_entries: [], patterns: [pattern], foundations: [] })
    )
    const result = await lookupContext('buttons', null)
    expect(result.patterns).toHaveLength(1)
    expect(result.patterns[0].content).toBe('btn rules')
  })
})
