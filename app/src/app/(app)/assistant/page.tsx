import { createClient } from '@/lib/supabase/server'
import { AssistantShell } from '@/components/assistant/AssistantShell'

export default async function EditorPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return <AssistantShell products={products ?? []} />
}
