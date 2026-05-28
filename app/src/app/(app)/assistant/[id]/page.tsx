import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AssistantShell } from '@/components/assistant/AssistantShell'
import type { Message } from '@/components/assistant/AssistantShell'
import type { AgentResponse } from '@/lib/agent/types'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: session }, { data: products }, { data: dbMessages }] = await Promise.all([
    supabase.from('sessions').select('id, name').eq('id', id).single(),
    supabase.from('products').select('id, name').eq('is_active', true).order('name'),
    supabase
      .from('session_messages')
      .select('role, content, source_type')
      .eq('session_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!session) notFound()

  const messages: Message[] = (dbMessages ?? []).map((m) => {
    if (m.role === 'user') {
      const c = m.content as { text?: string }
      return { role: 'user', text: c.text ?? '' }
    }
    return {
      role: 'assistant',
      response: {
        ...(m.content as object),
        source_type: m.source_type,
        session_id: id,
        message_id: '',
      } as AgentResponse,
    }
  })

  return (
    <AssistantShell
      products={products ?? []}
      initialSessionId={id}
      initialMessages={messages}
      initialTitle={session.name ?? ''}
    />
  )
}
