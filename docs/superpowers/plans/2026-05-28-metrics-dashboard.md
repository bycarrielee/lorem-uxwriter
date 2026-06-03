# Metrics Dashboard — Full Stack Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to execute task by task.

**Goal:** Implement the metrics tracking system from `docs/superpowers/specs/2026-05-26-metrics-design.md` and build a real `/dashboard` page that reads from the metrics tables.

**Architecture:** New Supabase tables → server-side API routes ← client analytics module → React context → instrumented components → dashboard page (server component + client charts).

**Tech Stack:** Next.js 16, React 19, Supabase (Postgres + anon key + service role key), TypeScript, no new dependencies.

---

## File map

| Action | Path |
|---|---|
| Create | `app/supabase/migrations/005_metrics.sql` |
| Modify | `app/src/lib/supabase/types.ts` |
| Create | `app/src/lib/metrics/analytics.ts` |
| Create | `app/src/lib/metrics/context.tsx` |
| Create | `app/src/lib/supabase/service.ts` |
| Create | `app/src/app/api/metrics/session/route.ts` |
| Create | `app/src/app/api/metrics/session/[id]/route.ts` |
| Create | `app/src/app/api/metrics/interaction/route.ts` |
| Create | `app/src/app/api/metrics/event/route.ts` |
| Modify | `app/src/lib/agent/types.ts` |
| Modify | `app/src/app/api/agent/route.ts` |
| Modify | `app/src/app/(app)/layout.tsx` |
| Modify | `app/src/components/assistant/AssistantShell.tsx` |
| Modify | `app/src/components/assistant/BotCard.tsx` |
| Modify | `app/src/components/assistant/FollowUpBar.tsx` |
| Create | `app/src/app/(app)/dashboard/page.tsx` |
| Create | `app/src/app/(app)/dashboard/DashboardCharts.tsx` |
| Modify | `app/src/app/globals.css` |

**Before starting Task 7:** Add `SUPABASE_SERVICE_KEY=<service_role_key>` to `app/.env.local`. Found in Supabase Dashboard → Project Settings → API → service_role (secret).

---

## Task 1: Schema migration

**Files:**
- Create: `app/supabase/migrations/005_metrics.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 005_metrics.sql

create table public.app_sessions (
  id               uuid        primary key default gen_random_uuid(),
  client_id        uuid        not null,
  user_id          uuid        null,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz null,
  duration_seconds int         null
);
create index app_sessions_client_id_idx  on public.app_sessions (client_id);
create index app_sessions_started_at_idx on public.app_sessions (started_at);

create table public.suggestion_interactions (
  id           uuid        primary key default gen_random_uuid(),
  client_id    uuid        not null,
  user_id      uuid        null,
  session_id   uuid        null references public.app_sessions(id) on delete set null,
  interaction  text        not null check (interaction in (
    'copied','rationale_opened','follow_up_sent',
    'quick_action_shorter','quick_action_alternatives')),
  source_tier  text        null check (source_tier in ('library','adapted','ai','ai_low')),
  char_count   int         null,
  created_at   timestamptz not null default now()
);
create index suggestion_interactions_client_id_idx  on public.suggestion_interactions (client_id);
create index suggestion_interactions_interaction_idx on public.suggestion_interactions (interaction);
create index suggestion_interactions_created_at_idx  on public.suggestion_interactions (created_at);

create table public.api_calls (
  id            uuid          primary key default gen_random_uuid(),
  client_id     uuid          not null,
  user_id       uuid          null,
  session_id    uuid          null references public.app_sessions(id) on delete set null,
  model         text          null,
  status        text          not null check (status in ('success','error','timeout')),
  error_code    text          null,
  duration_ms   int           null,
  input_tokens  int           null,
  output_tokens int           null,
  cost_usd      numeric(10,6) null,
  created_at    timestamptz   not null default now()
);
create index api_calls_status_idx     on public.api_calls (status);
create index api_calls_client_id_idx  on public.api_calls (client_id);
create index api_calls_created_at_idx on public.api_calls (created_at);

create table public.events (
  id         uuid        primary key default gen_random_uuid(),
  client_id  uuid        not null,
  user_id    uuid        null,
  session_id uuid        null references public.app_sessions(id) on delete set null,
  event      text        not null,
  properties jsonb       null,
  created_at timestamptz not null default now()
);
create index events_client_id_idx  on public.events (client_id);
create index events_event_idx      on public.events (event);
create index events_created_at_idx on public.events (created_at);

-- RLS
alter table public.app_sessions           enable row level security;
alter table public.suggestion_interactions enable row level security;
alter table public.api_calls              enable row level security;
alter table public.events                 enable row level security;

-- app_sessions: anon can insert (client creates its own session) and update (endSession patches it)
create policy "app_sessions_insert" on public.app_sessions for insert with check (true);
create policy "app_sessions_update" on public.app_sessions for update using (true);
create policy "app_sessions_select" on public.app_sessions for select using (true);

-- suggestion_interactions: anon can insert
create policy "suggestion_interactions_insert" on public.suggestion_interactions for insert with check (true);

-- api_calls: NO anon insert — server uses service role key which bypasses RLS entirely
-- No select policy for anon — dashboard reads via service role

-- events: anon can insert
create policy "events_insert" on public.events for insert with check (true);
```

- [ ] **Step 2: Run migration in Supabase SQL Editor**

Paste and run the SQL. Confirm four new tables appear in the Table Editor.

- [ ] **Step 3: Verify RLS blocks anon insert on api_calls**

Run this in SQL Editor (simulates anon role):
```sql
set role anon;
insert into public.api_calls (client_id, status) values (gen_random_uuid(), 'success');
-- Expected: ERROR: new row violates row-level security policy
reset role;
```

---

## Task 2: Update Supabase types

**Files:**
- Modify: `app/src/lib/supabase/types.ts`

- [ ] **Step 1: Add four table definitions to the Tables object**

Find the closing `}` of the `sessions` table entry inside `Tables`. Add the following four blocks immediately after it, before the next table or the closing of `Tables`:

```typescript
      app_sessions: {
        Row: {
          id: string
          client_id: string
          user_id: string | null
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
        }
        Insert: {
          id?: string
          client_id: string
          user_id?: string | null
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string | null
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
        }
      }
      suggestion_interactions: {
        Row: {
          id: string
          client_id: string
          user_id: string | null
          session_id: string | null
          interaction: 'copied' | 'rationale_opened' | 'follow_up_sent' | 'quick_action_shorter' | 'quick_action_alternatives'
          source_tier: 'library' | 'adapted' | 'ai' | 'ai_low' | null
          char_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id?: string | null
          session_id?: string | null
          interaction: 'copied' | 'rationale_opened' | 'follow_up_sent' | 'quick_action_shorter' | 'quick_action_alternatives'
          source_tier?: 'library' | 'adapted' | 'ai' | 'ai_low' | null
          char_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string | null
          session_id?: string | null
          interaction?: 'copied' | 'rationale_opened' | 'follow_up_sent' | 'quick_action_shorter' | 'quick_action_alternatives'
          source_tier?: 'library' | 'adapted' | 'ai' | 'ai_low' | null
          char_count?: number | null
          created_at?: string
        }
      }
      api_calls: {
        Row: {
          id: string
          client_id: string
          user_id: string | null
          session_id: string | null
          model: string | null
          status: 'success' | 'error' | 'timeout'
          error_code: string | null
          duration_ms: number | null
          input_tokens: number | null
          output_tokens: number | null
          cost_usd: number | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id?: string | null
          session_id?: string | null
          model?: string | null
          status: 'success' | 'error' | 'timeout'
          error_code?: string | null
          duration_ms?: number | null
          input_tokens?: number | null
          output_tokens?: number | null
          cost_usd?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string | null
          session_id?: string | null
          model?: string | null
          status?: 'success' | 'error' | 'timeout'
          error_code?: string | null
          duration_ms?: number | null
          input_tokens?: number | null
          output_tokens?: number | null
          cost_usd?: number | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          client_id: string
          user_id: string | null
          session_id: string | null
          event: string
          properties: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id?: string | null
          session_id?: string | null
          event: string
          properties?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string | null
          session_id?: string | null
          event?: string
          properties?: Json | null
          created_at?: string
        }
      }
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/carrielee/Documents/claude-sandbox/lorem-webapp/app && npx tsc --noEmit
```

Expected: no errors (or same pre-existing errors as before — zero new ones).

---

## Task 3: Analytics module

**Files:**
- Create: `app/src/lib/metrics/analytics.ts`

- [ ] **Step 1: Write the module**

```typescript
// app/src/lib/metrics/analytics.ts

const CLIENT_ID_KEY = 'lorem_client_id'

export type InteractionType =
  | 'copied'
  | 'rationale_opened'
  | 'follow_up_sent'
  | 'quick_action_shorter'
  | 'quick_action_alternatives'

export type SourceTier = 'library' | 'adapted' | 'ai' | 'ai_low'

export interface TrackInteractionOptions {
  source_tier?: SourceTier
  char_count?: number
}

export function getClientId(): string {
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(CLIENT_ID_KEY, id)
    return id
  } catch {
    return crypto.randomUUID() // SSR or storage blocked — transient ID
  }
}

export async function startSession(): Promise<string | null> {
  try {
    const clientId = getClientId()
    const res = await fetch('/api/metrics/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId }),
    })
    if (!res.ok) return null
    const data = await res.json() as { session_id: string }
    return data.session_id ?? null
  } catch {
    return null
  }
}

export function endSession(sessionId: string, startedAt: number): void {
  try {
    const duration = Math.round((Date.now() - startedAt) / 1000)
    const payload = JSON.stringify({
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
    })
    // sendBeacon fires reliably on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `/api/metrics/session/${sessionId}`,
        new Blob([payload], { type: 'application/json' }),
      )
    } else {
      void fetch(`/api/metrics/session/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      })
    }
  } catch {
    // Never block the user
  }
}

export function trackInteraction(
  sessionId: string | null,
  interaction: InteractionType,
  options?: TrackInteractionOptions,
): void {
  try {
    const clientId = getClientId()
    void fetch('/api/metrics/interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        session_id: sessionId,
        interaction,
        source_tier: options?.source_tier ?? null,
        char_count: options?.char_count ?? null,
      }),
    })
  } catch {
    // Fire-and-forget
  }
}

export function trackEvent(
  sessionId: string | null,
  event: string,
  properties?: Record<string, unknown>,
): void {
  try {
    const clientId = getClientId()
    void fetch('/api/metrics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        session_id: sessionId,
        event,
        properties: properties ?? null,
      }),
    })
  } catch {
    // Fire-and-forget
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/carrielee/Documents/claude-sandbox/lorem-webapp/app && npx tsc --noEmit
```

Expected: no new errors.

---

## Task 4: Metrics context

**Files:**
- Create: `app/src/lib/metrics/context.tsx`

- [ ] **Step 1: Write the context and provider**

```typescript
// app/src/lib/metrics/context.tsx
'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  startSession,
  endSession,
  trackInteraction as _trackInteraction,
  trackEvent as _trackEvent,
  type InteractionType,
  type SourceTier,
} from './analytics'

interface MetricsContextValue {
  sessionId: string | null
  trackInteraction: (
    interaction: InteractionType,
    options?: { source_tier?: SourceTier; char_count?: number }
  ) => void
  trackEvent: (event: string, properties?: Record<string, unknown>) => void
}

const MetricsContext = createContext<MetricsContextValue>({
  sessionId: null,
  trackInteraction: () => {},
  trackEvent: () => {},
})

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const startedAtRef = useRef<number>(0)
  // Closure variable so event listener always has the current session ID
  const sidRef = useRef<string | null>(null)

  useEffect(() => {
    startedAtRef.current = Date.now()

    void startSession().then((sid) => {
      sidRef.current = sid
      setSessionId(sid)
    })

    function handleUnload() {
      if (sidRef.current) {
        endSession(sidRef.current, startedAtRef.current)
      }
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      if (sidRef.current) {
        endSession(sidRef.current, startedAtRef.current)
      }
    }
  }, [])

  function trackInteraction(
    interaction: InteractionType,
    options?: { source_tier?: SourceTier; char_count?: number },
  ) {
    _trackInteraction(sessionId, interaction, options)
  }

  function trackEvent(event: string, properties?: Record<string, unknown>) {
    _trackEvent(sessionId, event, properties)
  }

  return (
    <MetricsContext.Provider value={{ sessionId, trackInteraction, trackEvent }}>
      {children}
    </MetricsContext.Provider>
  )
}

export function useMetrics(): MetricsContextValue {
  return useContext(MetricsContext)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/carrielee/Documents/claude-sandbox/lorem-webapp/app && npx tsc --noEmit
```

---

## Task 5: Metrics API routes

**Files:**
- Create: `app/src/app/api/metrics/session/route.ts`
- Create: `app/src/app/api/metrics/session/[id]/route.ts`
- Create: `app/src/app/api/metrics/interaction/route.ts`
- Create: `app/src/app/api/metrics/event/route.ts`

- [ ] **Step 1: Create POST /api/metrics/session**

```typescript
// app/src/app/api/metrics/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { client_id?: string }
    if (!body.client_id || typeof body.client_id !== 'string') {
      return NextResponse.json({ error: 'client_id required' }, { status: 400 })
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('app_sessions')
      .insert({ client_id: body.client_id })
      .select('id')
      .single()
    if (error || !data) {
      console.error('metrics/session POST error', error)
      return NextResponse.json({ error: 'internal' }, { status: 500 })
    }
    return NextResponse.json({ session_id: data.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }
}
```

- [ ] **Step 2: Create PATCH /api/metrics/session/[id]**

```typescript
// app/src/app/api/metrics/session/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!id) return new NextResponse(null, { status: 400 })
    const body = await request.json() as { ended_at?: string; duration_seconds?: number }
    const supabase = await createClient()
    await supabase
      .from('app_sessions')
      .update({
        ended_at: body.ended_at ?? new Date().toISOString(),
        duration_seconds: body.duration_seconds ?? null,
      })
      .eq('id', id)
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 }) // Always succeed — fire-and-forget
  }
}
```

- [ ] **Step 3: Create POST /api/metrics/interaction**

```typescript
// app/src/app/api/metrics/interaction/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_INTERACTIONS = new Set([
  'copied','rationale_opened','follow_up_sent',
  'quick_action_shorter','quick_action_alternatives',
])
const VALID_TIERS = new Set(['library','adapted','ai','ai_low'])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      client_id?: string
      session_id?: string | null
      interaction?: string
      source_tier?: string | null
      char_count?: number | null
    }
    if (!body.client_id || !body.interaction || !VALID_INTERACTIONS.has(body.interaction)) {
      return new NextResponse(null, { status: 204 })
    }
    const supabase = await createClient()
    const { error } = await supabase.from('suggestion_interactions').insert({
      client_id: body.client_id,
      session_id: body.session_id ?? null,
      interaction: body.interaction as 'copied' | 'rationale_opened' | 'follow_up_sent' | 'quick_action_shorter' | 'quick_action_alternatives',
      source_tier: body.source_tier && VALID_TIERS.has(body.source_tier)
        ? body.source_tier as 'library' | 'adapted' | 'ai' | 'ai_low'
        : null,
      char_count: typeof body.char_count === 'number' ? body.char_count : null,
    })
    if (error) console.error('metrics/interaction POST error', error)
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
```

- [ ] **Step 4: Create POST /api/metrics/event**

```typescript
// app/src/app/api/metrics/event/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PII_KEYS = new Set(['name','email','nric','phone','address','username'])

function sanitize(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).filter(([k]) => !PII_KEYS.has(k.toLowerCase()))
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      client_id?: string
      session_id?: string | null
      event?: string
      properties?: Record<string, unknown> | null
    }
    if (!body.client_id || !body.event || typeof body.event !== 'string') {
      return new NextResponse(null, { status: 204 })
    }
    const supabase = await createClient()
    const { error } = await supabase.from('events').insert({
      client_id: body.client_id,
      session_id: body.session_id ?? null,
      event: body.event,
      properties: body.properties ? sanitize(body.properties) : null,
    })
    if (error) console.error('metrics/event POST error', error)
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
```

- [ ] **Step 5: Smoke test all routes**

```bash
# In a running dev server:
curl -X POST http://localhost:3000/api/metrics/session \
  -H "Content-Type: application/json" \
  -d '{"client_id":"00000000-0000-0000-0000-000000000001"}'
# Expected: 201 with { "session_id": "<uuid>" }

curl -X POST http://localhost:3000/api/metrics/interaction \
  -H "Content-Type: application/json" \
  -d '{"client_id":"00000000-0000-0000-0000-000000000001","interaction":"copied"}'
# Expected: 204
```

Check Supabase Table Editor — rows should appear in `app_sessions` and `suggestion_interactions`.

---

## Task 6: Service role client + agent route patches

**Files:**
- Create: `app/src/lib/supabase/service.ts`
- Modify: `app/src/lib/agent/types.ts`
- Modify: `app/src/app/api/agent/route.ts`

⚠️ **Prerequisite:** `SUPABASE_SERVICE_KEY` must be in `app/.env.local` before this task runs.

- [ ] **Step 1: Create service client**

```typescript
// app/src/lib/supabase/service.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )
}
```

- [ ] **Step 2: Add client_id and metrics_session_id to AgentRequest**

In `app/src/lib/agent/types.ts`, add two optional fields to `AgentRequest`:

```typescript
export interface AgentRequest {
  input: string
  product_id?: string
  element_type?: ElementType
  session_id?: string
  // Metrics — optional, never required for core functionality
  client_id?: string
  metrics_session_id?: string
}
```

- [ ] **Step 3: Patch route.ts — add token capture and api_calls logging**

The three additions to the existing route:

**A. Import service client and add cost constants at the top:**
```typescript
import { createServiceClient } from '@/lib/supabase/service'

const COST_PER_INPUT_TOKEN  = 0.000003  // $3/1M tokens (Claude Sonnet)
const COST_PER_OUTPUT_TOKEN = 0.000015  // $15/1M tokens
```

**B. Inside the POST handler, extract metrics identifiers after `body` is parsed:**
```typescript
const clientId         = typeof body.client_id === 'string' ? body.client_id : 'unknown'
const metricsSessionId = typeof body.metrics_session_id === 'string' ? body.metrics_session_id : null

let apiStatus: 'success' | 'error' | 'timeout' = 'error'
let apiErrorCode: string | null = null
let inputTokens: number | null = null
let outputTokens: number | null = null
const callStart = Date.now()
const serviceClient = createServiceClient()
```

**C. After the Anthropic `messages.create` call succeeds, capture usage:**
```typescript
// Add immediately after: const message = await anthropic.messages.create(...)
inputTokens  = message.usage?.input_tokens  ?? null
outputTokens = message.usage?.output_tokens ?? null
apiStatus    = 'success'
```

**D. In the catch block around the Anthropic call, set error state:**
```typescript
apiStatus    = 'error'
apiErrorCode = err instanceof Error ? err.message.slice(0, 100) : 'unknown'
```

**E. Add a `finally` block at the end of the POST handler (wrapping the whole try/catch):**
```typescript
} finally {
  const durationMs = Date.now() - callStart
  const costUsd =
    inputTokens !== null && outputTokens !== null
      ? inputTokens * COST_PER_INPUT_TOKEN + outputTokens * COST_PER_OUTPUT_TOKEN
      : null
  try {
    await serviceClient.from('api_calls').insert({
      client_id: clientId,
      session_id: metricsSessionId,
      model: 'bedrock.claude-sonnet-4-5',
      status: apiStatus,
      error_code: apiErrorCode,
      duration_ms: durationMs,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: costUsd,
    })
  } catch (loggingErr) {
    console.error('api_calls logging failed (non-critical)', loggingErr)
  }
}
```

- [ ] **Step 4: Verify**

Make a request in the assistant. Check `api_calls` table in Supabase — a row should appear with `status: 'success'`, non-null `input_tokens`, `output_tokens`, and `cost_usd`.

---

## Task 7: Wrap layout with MetricsProvider + add Dashboard link

**Files:**
- Modify: `app/src/app/(app)/layout.tsx`

- [ ] **Step 1: Add import**

```typescript
import { MetricsProvider } from '@/lib/metrics/context'
```

- [ ] **Step 2: Wrap the return with MetricsProvider**

```tsx
return (
  <MetricsProvider>
    {/* existing layout JSX */}
  </MetricsProvider>
)
```

- [ ] **Step 3: Add Dashboard link to the topbar**

Find the topbar nav links (currently: Changelog, and the feedback link). Add Dashboard:

```tsx
<TopbarLink href="/dashboard">Dashboard</TopbarLink>
```

- [ ] **Step 4: Verify**

Open the app. DevTools → Network tab → filter by `metrics` → confirm a POST to `/api/metrics/session` fires on load and returns 201.

---

## Task 8: Instrument AssistantShell + BotCard + FollowUpBar

**Files:**
- Modify: `app/src/components/assistant/AssistantShell.tsx`
- Modify: `app/src/components/assistant/BotCard.tsx`
- Modify: `app/src/components/assistant/FollowUpBar.tsx`

- [ ] **Step 1: Patch AssistantShell — pass client_id and metrics_session_id to /api/agent**

Add imports:
```typescript
import { useMetrics } from '@/lib/metrics/context'
import { getClientId } from '@/lib/metrics/analytics'
```

Inside the component, add after existing state declarations:
```typescript
const { sessionId: metricsSessionId } = useMetrics()
```

In the `submit` function fetch body, add the two new fields:
```typescript
body: JSON.stringify({
  ...req,
  session_id: sessionId ?? undefined,
  client_id: getClientId(),
  metrics_session_id: metricsSessionId ?? undefined,
}),
```

- [ ] **Step 2: Patch BotCard — instrument all four interaction types**

Add imports:
```typescript
import { useMetrics } from '@/lib/metrics/context'
import type { SourceTier } from '@/lib/metrics/analytics'
```

Add helper outside the component:
```typescript
function mapSourceTier(sourceType: string | null | undefined): SourceTier | undefined {
  switch (sourceType) {
    case 'library_match':               return 'library'
    case 'adapted':                     return 'adapted'
    case 'ai_generated':                return 'ai'
    case 'ai_generated_low_confidence': return 'ai_low'
    default:                            return undefined
  }
}
```

Inside the component:
```typescript
const { trackInteraction } = useMetrics()
```

Update `handleCopy` — add tracking after clipboard write succeeds:
```typescript
navigator.clipboard.writeText(response.suggestion).then(() => {
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
  trackInteraction('copied', {
    source_tier: mapSourceTier(response.source_type),
    char_count: response.character_count,
  })
})
```

Update the rationale button onClick — add tracking alongside the existing handler:
```typescript
onClick={() => {
  onViewRationale()
  trackInteraction('rationale_opened', { source_tier: mapSourceTier(response.source_type) })
}}
```

Update quick action chip onClick — add tracking alongside the existing handler:
```typescript
onClick={() => {
  onQuickAction(action)
  trackInteraction(
    action === 'shorter' ? 'quick_action_shorter' : 'quick_action_alternatives',
    { source_tier: mapSourceTier(response.source_type) }
  )
}}
```

- [ ] **Step 3: Patch FollowUpBar — track follow_up_sent**

Add import:
```typescript
import { useMetrics } from '@/lib/metrics/context'
```

Inside the component:
```typescript
const { trackInteraction } = useMetrics()
```

In `handleSubmit`, add before `setInput('')`:
```typescript
trackInteraction('follow_up_sent')
```

- [ ] **Step 4: Verify**

Open the assistant. Copy a suggestion, click view rationale, click Shorter, send a follow-up.
Check `suggestion_interactions` in Supabase — should have four rows with the correct `interaction` values.

---

## Task 9: Dashboard page

**Files:**
- Create: `app/src/app/(app)/dashboard/page.tsx`
- Create: `app/src/app/(app)/dashboard/DashboardCharts.tsx`
- Modify: `app/src/app/globals.css`

- [ ] **Step 1: Write page.tsx (server component)**

```typescript
// app/src/app/(app)/dashboard/page.tsx
import { createServiceClient } from '@/lib/supabase/service'
import { DashboardCharts } from './DashboardCharts'

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

function bucketByDay(rows: Array<{ ts: string }>, days: number): { labels: string[]; values: number[] } {
  const buckets: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    buckets[key] = 0
  }
  for (const r of rows) {
    const key = r.ts.slice(0, 10)
    if (key in buckets) buckets[key]++
  }
  return {
    labels: Object.keys(buckets).map((k) =>
      new Date(k).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
    ),
    values: Object.values(buckets),
  }
}

export default async function DashboardPage() {
  const db = createServiceClient()
  const since30 = daysAgo(30)
  const since7  = daysAgo(7)
  const since14 = daysAgo(14)

  const [sessionsRes, interactionsRes, apiCallsRes7, apiCallsRes30] = await Promise.all([
    db.from('app_sessions').select('client_id, started_at').gte('started_at', since30),
    db.from('suggestion_interactions').select('interaction, source_tier, created_at').gte('created_at', since30),
    db.from('api_calls').select('status, cost_usd, duration_ms, created_at').gte('created_at', since7),
    db.from('api_calls').select('cost_usd, status').gte('created_at', since30),
  ])

  const sessions      = sessionsRes.data ?? []
  const interactions  = interactionsRes.data ?? []
  const apiCalls7     = apiCallsRes7.data ?? []
  const apiCalls30    = apiCallsRes30.data ?? []

  // Overview stats
  const activeClients = new Set(sessions.map((s) => s.client_id)).size
  const totalSessions = sessions.length
  const copied        = interactions.filter((i) => i.interaction === 'copied').length
  const copyRate      = interactions.length > 0 ? Math.round((copied / interactions.length) * 100) : 0
  const errors30      = apiCalls30.filter((c) => c.status !== 'success').length
  const errorRate     = apiCalls30.length > 0 ? ((errors30 / apiCalls30.length) * 100).toFixed(1) : '0.0'
  const totalCost30   = apiCalls30.reduce((s, c) => s + (c.cost_usd ?? 0), 0).toFixed(2)

  // Daily sessions (14d)
  const dailySessions = bucketByDay(
    sessions.filter((s) => s.started_at >= since14).map((s) => ({ ts: s.started_at })),
    14,
  )

  // Interaction counts
  const interactionCounts = {
    copied: 0, rationale_opened: 0, follow_up_sent: 0,
    quick_action_shorter: 0, quick_action_alternatives: 0,
  } as Record<string, number>
  for (const r of interactions) {
    if (r.interaction in interactionCounts) interactionCounts[r.interaction]++
  }

  // Tier copy rates
  const tierTotals = {
    library: { total: 0, copied: 0 },
    adapted: { total: 0, copied: 0 },
    ai:      { total: 0, copied: 0 },
    ai_low:  { total: 0, copied: 0 },
  } as Record<string, { total: number; copied: number }>
  for (const r of interactions) {
    if (r.source_tier && r.source_tier in tierTotals) {
      tierTotals[r.source_tier].total++
      if (r.interaction === 'copied') tierTotals[r.source_tier].copied++
    }
  }

  // API health (7d)
  const successCalls = apiCalls7.filter((c) => c.status === 'success').length
  const successRate  = apiCalls7.length > 0 ? ((successCalls / apiCalls7.length) * 100).toFixed(1) : '100.0'
  const durations    = apiCalls7.map((c) => c.duration_ms ?? 0).sort((a, b) => a - b)
  const p50          = durations.length > 0 ? durations[Math.floor(durations.length / 2)] : 0
  const totalCost7   = apiCalls7.reduce((s, c) => s + (c.cost_usd ?? 0), 0).toFixed(2)

  const callsPerDay = bucketByDay(apiCalls7.map((c) => ({ ts: c.created_at })), 7)
  const costBuckets: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    costBuckets[new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)] = 0
  }
  for (const c of apiCalls7) {
    const key = c.created_at.slice(0, 10)
    if (key in costBuckets) costBuckets[key] += c.cost_usd ?? 0
  }
  const costPerDay = {
    labels: callsPerDay.labels,
    values: Object.values(costBuckets).map((v) => Math.round(v * 10000) / 10000),
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-sub">Last 30 days</p>
      </div>

      <div className="dash-cards">
        {[
          { label: 'Active clients', value: activeClients, trend: 'unique browser IDs' },
          { label: 'Sessions',       value: totalSessions, trend: 'page visits' },
          { label: 'Copy rate',      value: `${copyRate}%`, trend: 'suggestions copied' },
          { label: 'Error rate',     value: `${errorRate}%`, trend: 'API calls failed' },
          { label: 'Total cost',     value: `$${totalCost30}`, trend: 'Anthropic API' },
        ].map((c) => (
          <div key={c.label} className="dash-card">
            <div className="dash-card-label">{c.label}</div>
            <div className="dash-card-value">{c.value}</div>
            <div className="dash-card-trend">{c.trend}</div>
          </div>
        ))}
      </div>

      <DashboardCharts
        dailySessions={dailySessions}
        interactionCounts={interactionCounts}
        tierTotals={tierTotals}
        apiHealth={{ successRate, totalCalls: apiCalls7.length, p50, totalCost: totalCost7, callsPerDay, costPerDay }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Write DashboardCharts.tsx (client component)**

```typescript
// app/src/app/(app)/dashboard/DashboardCharts.tsx
'use client'

const W = 440, H = 130, PT = { t: 12, r: 10, b: 28, l: 38 }

function YGrid({ max }: { max: number }) {
  const iw = W - PT.l - PT.r, ih = H - PT.t - PT.b
  return <>{Array.from({ length: 4 }, (_, i) => {
    const v = Math.round(max * (1 - i / 4)), y = PT.t + (i / 4) * ih
    return <g key={i}>
      <line x1={PT.l} y1={y} x2={PT.l + iw} y2={y} stroke="#E0E5EA" strokeWidth={1}/>
      <text x={PT.l - 5} y={y + 4} textAnchor="end" fill="#94A3B8" fontSize={9.5} fontFamily="'DM Sans',sans-serif">{v}</text>
    </g>
  })}</>
}

function BarChart({ data, labels, color = '#3B5BA5' }: { data: number[]; labels: string[]; color?: string }) {
  if (!data.length) return <EmptyChart/>
  const iw = W - PT.l - PT.r, ih = H - PT.t - PT.b
  const max = Math.max(...data) * 1.2 || 1
  const bw = iw / data.length * 0.6, gap = iw / data.length
  const step = Math.ceil(labels.length / 7)
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
    <YGrid max={max}/>
    {data.map((v, i) => {
      const bh = (v / max) * ih, x = PT.l + i * gap + (gap - bw) / 2, y = PT.t + ih - bh
      return <rect key={i} x={x} y={y} width={bw} height={Math.max(bh, 0)} fill={color} rx={2}/>
    })}
    {labels.map((l, i) => {
      if (i % step !== 0 && i !== labels.length - 1) return null
      return <text key={i} x={PT.l + i * gap + gap / 2} y={H - 4} textAnchor="middle" fill="#94A3B8" fontSize={9.5} fontFamily="'DM Sans',sans-serif">{l}</text>
    })}
  </svg>
}

function LineChart({ data, labels, color = '#3B5BA5' }: { data: number[]; labels: string[]; color?: string }) {
  if (data.length < 2) return <EmptyChart/>
  const iw = W - PT.l - PT.r, ih = H - PT.t - PT.b
  const max = Math.max(...data) * 1.2 || 1
  const pts = data.map((v, i) => [PT.l + (i / (data.length - 1)) * iw, PT.t + ih - (v / max) * ih] as [number, number])
  const poly = pts.map(p => p.join(',')).join(' ')
  const area = `M${pts[0]}` + pts.slice(1).map(p => `L${p}`).join('') + ` L${pts.at(-1)![0]},${PT.t + ih} L${pts[0][0]},${PT.t + ih}Z`
  const last = pts.at(-1)!
  const step = Math.ceil(labels.length / 6)
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
    <YGrid max={max}/>
    <path d={area} fill={color} fillOpacity={0.12} stroke="none"/>
    <polyline points={poly} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx={last[0]} cy={last[1]} r={3} fill={color} stroke="white" strokeWidth={1.5}/>
    {labels.map((l, i) => {
      if (i % step !== 0 && i !== labels.length - 1) return null
      return <text key={i} x={PT.l + (i / (labels.length - 1)) * iw} y={H - 4} textAnchor="middle" fill="#94A3B8" fontSize={9.5} fontFamily="'DM Sans',sans-serif">{l}</text>
    })}
  </svg>
}

function EmptyChart() {
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
    <text x={W / 2} y={H / 2} textAnchor="middle" fill="#94A3B8" fontSize={12} fontFamily="'DM Sans',sans-serif">No data yet</text>
  </svg>
}

const TIER_COLORS: Record<string, string> = {
  library: 'oklch(44% 0.15 162)', adapted: '#4A5D6B',
  ai: 'oklch(51% 0.16 72)', ai_low: 'oklch(54% 0.18 45)',
}
const TIER_LABELS: Record<string, string> = {
  library: 'Library', adapted: 'Adapted', ai: 'AI', ai_low: 'AI low',
}

interface Props {
  dailySessions: { labels: string[]; values: number[] }
  interactionCounts: Record<string, number>
  tierTotals: Record<string, { total: number; copied: number }>
  apiHealth: {
    successRate: string; totalCalls: number; p50: number; totalCost: string
    callsPerDay: { labels: string[]; values: number[] }
    costPerDay: { labels: string[]; values: number[] }
  }
}

export function DashboardCharts({ dailySessions, interactionCounts, tierTotals, apiHealth }: Props) {
  const interactions = [
    { label: 'Copied',           value: interactionCounts.copied ?? 0 },
    { label: 'Rationale opened', value: interactionCounts.rationale_opened ?? 0 },
    { label: 'Follow-up sent',   value: interactionCounts.follow_up_sent ?? 0 },
    { label: 'Shorter',          value: interactionCounts.quick_action_shorter ?? 0 },
    { label: 'Alternatives',     value: interactionCounts.quick_action_alternatives ?? 0 },
  ]
  const maxInteraction = Math.max(...interactions.map(i => i.value), 1)

  return (
    <div className="dashboard-charts">
      <div className="dash-chart-row">
        <div className="dash-chart-card">
          <div className="dash-chart-label">Daily sessions</div>
          <div className="dash-chart-sub">Sessions started per day, last 14 days</div>
          <BarChart data={dailySessions.values} labels={dailySessions.labels}/>
        </div>
        <div className="dash-chart-card">
          <div className="dash-chart-label">Interaction breakdown</div>
          <div className="dash-chart-sub">User actions on suggestions, last 30 days</div>
          <div className="hbar-list">
            {interactions.map(({ label, value }) => (
              <div key={label} className="hbar-row">
                <div className="hbar-label">{label}</div>
                <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(value / maxInteraction) * 100}%` }}/></div>
                <div className="hbar-val">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-chart-row">
        <div className="dash-chart-card">
          <div className="dash-chart-label">Copy rate by source tier</div>
          <div className="dash-chart-sub">% of suggestions copied, last 30 days</div>
          <div className="tier-list">
            {Object.entries(tierTotals).map(([tier, { total, copied }]) => {
              const pct = total > 0 ? Math.round((copied / total) * 100) : 0
              return (
                <div key={tier} className="tier-row">
                  <div className="tier-label">{TIER_LABELS[tier] ?? tier}</div>
                  <div className="tier-track"><div className="tier-fill" style={{ width: `${pct}%`, background: TIER_COLORS[tier] }}/></div>
                  <div className="tier-pct">{pct}%</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="dash-chart-card">
          <div className="dash-chart-label">Daily API calls</div>
          <div className="dash-chart-sub">Anthropic API calls per day, last 7 days</div>
          <BarChart data={apiHealth.callsPerDay.values} labels={apiHealth.callsPerDay.labels}/>
        </div>
      </div>

      <div className="dash-chart-row dash-chart-row--full">
        <div className="dash-chart-card">
          <div className="dash-chart-label">Daily API cost</div>
          <div className="dash-chart-sub">Anthropic API spend USD, last 7 days</div>
          <LineChart data={apiHealth.costPerDay.values} labels={apiHealth.costPerDay.labels} color="oklch(44% 0.15 162)"/>
        </div>
      </div>

      <div className="dash-api-summary">
        {[
          { label: 'Success rate (7d)', value: `${apiHealth.successRate}%` },
          { label: 'Total calls (7d)',  value: String(apiHealth.totalCalls) },
          { label: 'p50 latency (7d)',  value: `${apiHealth.p50.toLocaleString()} ms` },
          { label: 'API cost (7d)',     value: `$${apiHealth.totalCost}` },
        ].map(c => (
          <div key={c.label} className="dash-card">
            <div className="dash-card-label">{c.label}</div>
            <div className="dash-card-value">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add dashboard CSS to globals.css**

Append at the end of `app/src/app/globals.css`:

```css
/* ─── Dashboard ──────────────────────────────────────── */
.dashboard-page { padding: 28px 32px; overflow-y: auto; background: var(--surface-white); }
.dashboard-header { margin-bottom: 24px; }
.dashboard-title { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; color: var(--text-primary); }
.dashboard-sub { font-size: 13px; color: var(--text-tertiary); margin-top: 3px; }

.dash-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px; }
.dash-card { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--r-lg, 8px); padding: 16px 18px; }
.dash-card-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-tertiary); margin-bottom: 8px; }
.dash-card-value { font-size: 26px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1; margin-bottom: 6px; }
.dash-card-trend { font-size: 12px; color: var(--text-tertiary); }

.dashboard-charts { display: flex; flex-direction: column; gap: 16px; }
.dash-chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.dash-chart-row--full { grid-template-columns: 1fr; }
.dash-chart-card { background: var(--surface-white); border: 1px solid var(--border-default); border-radius: var(--r-lg, 8px); padding: 20px 20px 16px; }
.dash-chart-label { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.dash-chart-sub { font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px; }

.hbar-list { display: flex; flex-direction: column; gap: 9px; }
.hbar-row { display: flex; align-items: center; gap: 10px; }
.hbar-label { width: 150px; flex-shrink: 0; font-size: 12px; color: var(--text-secondary); text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hbar-track { flex: 1; height: 18px; background: var(--surface-base); border-radius: 3px; overflow: hidden; }
.hbar-fill { height: 100%; border-radius: 3px; background: var(--color-primary); }
.hbar-val { width: 36px; flex-shrink: 0; font-size: 12px; font-weight: 600; color: var(--text-primary); }

.tier-list { display: flex; flex-direction: column; gap: 9px; }
.tier-row { display: flex; align-items: center; gap: 10px; }
.tier-label { width: 72px; flex-shrink: 0; font-size: 12px; color: var(--text-secondary); text-align: right; }
.tier-track { flex: 1; height: 18px; background: var(--surface-base); border-radius: 3px; overflow: hidden; }
.tier-fill { height: 100%; border-radius: 3px; }
.tier-pct { width: 36px; flex-shrink: 0; font-size: 12px; font-weight: 600; color: var(--text-primary); }

.dash-api-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
```

- [ ] **Step 4: Verify**

```bash
cd /Users/carrielee/Documents/claude-sandbox/lorem-webapp/app && npm run build
```

Navigate to `/dashboard` — should render with real data (zeros until interactions are tracked, but no errors).

---

## Execution order

| Task | What | Blocks |
|---|---|---|
| 1 | Schema migration | Everything |
| 2 | types.ts update | Tasks 3–9 |
| 3 | analytics.ts | Tasks 4, 8 |
| 4 | context.tsx | Tasks 7, 8 |
| 5 | Metrics API routes | Task 8 (smoke test) |
| 6 | service.ts + agent/route.ts patches | Task 9 (api_calls data) |
| 7 | Wrap layout + topbar link | Task 8 (MetricsProvider in tree) |
| 8 | Instrument components | — |
| 9 | Dashboard page + charts + CSS | — |
