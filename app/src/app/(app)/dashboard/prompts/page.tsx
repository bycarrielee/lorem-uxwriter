import { createServiceClient } from '@/lib/supabase/service'
import { PromptLogTable } from './PromptLogTable'

export interface PromptRow {
  id: string
  session_id: string
  session_name: string
  prompt: string
  created_at: string
}

export default async function PromptLogPage() {
  const db = createServiceClient()

  const { data: messages } = await db
    .from('session_messages')
    .select('id, session_id, content, created_at')
    .eq('role', 'user')
    .order('created_at', { ascending: false })
    .limit(200)

  const sessionIds = [...new Set((messages ?? []).map((m) => m.session_id))]

  const { data: sessions } = sessionIds.length
    ? await db.from('sessions').select('id, name').in('id', sessionIds)
    : { data: [] }

  const sessionMap = Object.fromEntries((sessions ?? []).map((s) => [s.id, s.name]))

  const rows: PromptRow[] = (messages ?? []).map((m) => {
    const content = m.content as Record<string, unknown> | null
    const prompt =
      content && typeof content.text === 'string'
        ? content.text
        : JSON.stringify(content ?? '')
    return {
      id: m.id,
      session_id: m.session_id,
      session_name: sessionMap[m.session_id] ?? 'Unnamed',
      prompt,
      created_at: m.created_at,
    }
  })

  return (
    <div className="plog-page">
      <div className="plog-header">
        <h1 className="plog-title">Prompt log</h1>
        <p className="plog-sub">Recent user prompts — last 200</p>
      </div>
      <PromptLogTable rows={rows} />
    </div>
  )
}
