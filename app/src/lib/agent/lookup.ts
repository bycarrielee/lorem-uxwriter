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

export async function lookupContext(
  elementType: ElementType | null,
  productId: string | null,
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

    const { data: globalMatches } = await supabase
      .from('copy_entries')
      .select('id, copy, context, rationale, scope, product_id, tone, usage_examples')
      .eq('scope', 'global')
      .eq('element_type', elementType)
      .eq('status', 'active')
      .limit(remaining + existingIds.size)

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
