import { createClient } from '@/lib/supabase/server'
import type { ElementType } from './types'

export interface LookupResult {
  copyMatches: Array<{
    id: string
    copy: unknown
    context: string | null
    rationale: string | null
    scope: string
    product_id: string | null
    tone: string | null
    usage_examples: string[] | null
  }>
  patterns: Array<{
    id: string
    element_type: string
    scope: string
    content: string
  }>
  foundations: Array<{
    id: string
    type: string
    scope: string
    content: string
  }>
}

// Extract meaningful content words from a query, stripping element-type words
// and common filler words so only identifiers like "NRIC", "postal", "email" remain.
function extractKeyTerms(query: string): string[] {
  const skip = new Set([
    'form', 'label', 'field', 'error', 'button', 'modal', 'alert', 'link',
    'hint', 'message', 'text', 'copy', 'what', 'should', 'give', 'write',
    'generate', 'need', 'want', 'create', 'suggest', 'the', 'for', 'with',
    'this', 'that', 'have', 'from', 'make', 'get', 'please', 'help', 'can',
    'you', 'use', 'and', 'but', 'not', 'are', 'was', 'will', 'would', 'its',
  ])
  return [...new Set((query.toLowerCase().match(/[a-z]+/g) ?? []))]
    .filter((w) => w.length > 2 && !skip.has(w))
}

export async function lookupContext(
  elementType: ElementType | null,
  productId: string | null,
  userQuery?: string,
): Promise<LookupResult> {
  const supabase = await createClient()

  // Copy entries: product-scoped first, then global. Deduplicate. Limit 5.
  const copyMatches: LookupResult['copyMatches'] = []

  if (productId && elementType) {
    const { data: productMatches } = await supabase
      .from('copy_entries')
      .select('id, copy, context, rationale, scope, product_id, tone, usage_examples')
      .eq('product_id', productId)
      .eq('element_type', elementType)
      .eq('status', 'active')
      .limit(3)
    if (productMatches) copyMatches.push(...productMatches)
  }

  if (elementType) {
    const existingIds = new Set(copyMatches.map((m) => m.id))
    const remaining = 5 - copyMatches.length

    let globalMatches: LookupResult['copyMatches'] | null = null

    if (userQuery) {
      const terms = extractKeyTerms(userQuery)
      const queryLimit = remaining + existingIds.size

      // Run both searches in parallel:
      // 1. Websearch on context — strict AND match, highest quality
      // 2. ilike on context for each key term — catches queries where
      //    element-type words ("field", "label") don't appear in context
      const [{ data: strictMatches }, { data: termMatches }] = await Promise.all([
        supabase
          .from('copy_entries')
          .select('id, copy, context, rationale, scope, product_id, tone, usage_examples')
          .eq('scope', 'global')
          .eq('element_type', elementType)
          .eq('status', 'active')
          .textSearch('context', userQuery, { type: 'websearch', config: 'english' })
          .limit(queryLimit),
        terms.length > 0
          ? supabase
              .from('copy_entries')
              .select('id, copy, context, rationale, scope, product_id, tone, usage_examples')
              .eq('scope', 'global')
              .eq('element_type', elementType)
              .eq('status', 'active')
              .or(terms.map((t) => `context.ilike.%${t}%`).join(','))
              .limit(queryLimit)
          : Promise.resolve({ data: null }),
      ])

      // Merge: strict matches first (higher relevance), then term matches
      const seen = new Set<string>()
      const merged: LookupResult['copyMatches'] = []
      for (const row of [...(strictMatches ?? []), ...(termMatches ?? [])]) {
        if (!seen.has(row.id)) {
          seen.add(row.id)
          merged.push(row)
        }
      }
      if (merged.length > 0) globalMatches = merged
    }

    if (globalMatches) {
      for (const m of globalMatches) {
        if (!existingIds.has(m.id) && copyMatches.length < 5) copyMatches.push(m)
      }
    }
  }

  // Patterns: global + product-specific for this element type
  const patternConditions = ['scope.eq.global']
  if (productId) patternConditions.push(`product_id.eq.${productId}`)

  const patternQuery = supabase
    .from('patterns')
    .select('id, element_type, scope, content')

  if (elementType) patternQuery.eq('element_type', elementType)

  const { data: patterns } = await patternQuery.or(patternConditions.join(','))

  // Foundations: global + product-specific (all types)
  const foundationConditions = ['scope.eq.global']
  if (productId) foundationConditions.push(`product_id.eq.${productId}`)

  const { data: foundations } = await supabase
    .from('foundations')
    .select('id, type, scope, content')
    .or(foundationConditions.join(','))

  return {
    copyMatches,
    patterns: patterns ?? [],
    foundations: foundations ?? [],
  }
}
