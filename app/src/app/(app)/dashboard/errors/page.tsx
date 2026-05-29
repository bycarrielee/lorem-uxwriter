import { createServiceClient } from '@/lib/supabase/service'
import { ErrorLogTable } from './ErrorLogTable'

export interface ErrorRow {
  id: string
  session_id: string | null
  message: string
  http_status: number | null
  created_at: string
}

export default async function ErrorLogPage() {
  const db = createServiceClient()

  const { data } = await db
    .from('events')
    .select('id, session_id, properties, created_at')
    .eq('event', 'user_error')
    .order('created_at', { ascending: false })
    .limit(200)

  const rows: ErrorRow[] = (data ?? []).map((r) => {
    const props = r.properties as Record<string, unknown> | null
    return {
      id: r.id,
      session_id: r.session_id,
      message:
        props && typeof props.message === 'string' ? props.message : 'Unknown error',
      http_status:
        props && typeof props.http_status === 'number' ? props.http_status : null,
      created_at: r.created_at,
    }
  })

  return (
    <div className="elog-page">
      <div className="elog-header">
        <h1 className="elog-title">Error log</h1>
        <p className="elog-sub">Errors shown to users — last 200</p>
      </div>
      <ErrorLogTable rows={rows} />
    </div>
  )
}
