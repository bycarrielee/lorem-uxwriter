import { createClient } from '@/lib/supabase/server'
import LibraryClient from './LibraryClient'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: entries } = await supabase
    .from('copy_entries')
    .select('id, element_type, copy, context, rationale, tags, tone, status, scope, product_id')
    .order('element_type')
    .order('added_at')

  return <LibraryClient entries={entries ?? []} />
}
