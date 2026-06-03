# API Key Swap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **⚠️ Amendment (2026-05-26): No authentication.** The app is open — no auth checks anywhere.
> - **Task 4 (GET /api/budget):** Remove the `supabase.auth.getUser()` check and the 401 response.
> - **Task 5 (POST /api/agent):** Remove the `supabase.auth.getUser()` check and the 401 response. Keep all budget and user key logic unchanged.

**Goal:** Track shared Anthropic API spend against a configurable budget limit, warn all users at 80%, lock the editor at 100%, and let any user unblock themselves by entering their own Claude API key.

**Architecture:** A `budget_usage` Supabase table holds a single cumulative cost row, incremented atomically via a PostgreSQL RPC after each shared-key call. A `GET /api/budget` route exposes status to clients. `EditorShell` fetches budget on mount and updates from each `AgentResponse`. Two new components — `BudgetBanner` (warning/exceeded) and `ApiKeyModal` (key entry) — render conditionally. User API keys live in `localStorage` only; the agent route uses them in-flight and never persists them.

**Prerequisite:** Plans 1 and 2 must be complete. This plan assumes `src/app/api/agent/route.ts`, `src/components/editor/EditorShell.tsx`, `src/components/editor/LeftPanel.tsx`, and `src/lib/agent/types.ts` exist as defined in Plan 2.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase JS v2, Anthropic SDK, Vitest

---

## File structure

```
New files:
supabase/migrations/004_budget_usage.sql
src/lib/budget.ts
src/app/api/budget/route.ts
src/components/editor/BudgetBanner.tsx
src/components/editor/ApiKeyModal.tsx

Modified files:
src/lib/agent/types.ts
src/app/api/agent/route.ts
src/components/editor/LeftPanel.tsx
src/components/editor/EditorShell.tsx
.env.local.example

New test files:
tests/lib/budget.test.ts
```

---

## Task 1: Migration + env vars

**Files:**
- Create: `supabase/migrations/004_budget_usage.sql`
- Modify: `.env.local.example`

- [ ] **Step 1: Create the migration**

Create `supabase/migrations/004_budget_usage.sql`:

```sql
-- Single-row table tracking cumulative Anthropic API spend
create table if not exists public.budget_usage (
  id int primary key,
  cost_usd numeric(10,6) not null default 0,
  updated_at timestamptz not null default now()
);

-- Seed the single row
insert into public.budget_usage (id, cost_usd)
values (1, 0)
on conflict (id) do nothing;

-- RLS: authenticated users can read, nobody can write directly
alter table public.budget_usage enable row level security;

create policy "budget_usage_select" on public.budget_usage
  for select using (auth.role() = 'authenticated');

-- Atomic increment via SECURITY DEFINER (runs as postgres, bypasses RLS)
create or replace function public.increment_budget_cost(amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.budget_usage
  set cost_usd = cost_usd + amount,
      updated_at = now()
  where id = 1;
end;
$$;

grant execute on function public.increment_budget_cost(numeric) to authenticated;
```

- [ ] **Step 2: Apply the migration**

```bash
supabase db push
```

Expected: migration runs without error. Verify in Supabase Studio: `budget_usage` table exists with one row `{ id: 1, cost_usd: 0 }`.

- [ ] **Step 3: Add env vars to `.env.local.example`**

Append to `.env.local.example`:

```
# Budget tracking
# S$50 ≈ $37 USD at time of writing — update when exchange rate shifts
ANTHROPIC_BUDGET_LIMIT_USD=37
# Warn all users when this % of the limit is consumed
ANTHROPIC_BUDGET_WARNING_PCT=80
```

- [ ] **Step 4: Add env vars to `.env.local`**

```bash
echo "ANTHROPIC_BUDGET_LIMIT_USD=37" >> .env.local
echo "ANTHROPIC_BUDGET_WARNING_PCT=80" >> .env.local
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/004_budget_usage.sql .env.local.example
git commit -m "feat: add budget_usage migration and env vars"
```

---

## Task 2: Budget helpers

**Files:**
- Create: `src/lib/budget.ts`

Pure functions for cost calculation and status computation. No Supabase dependency — keeps this fully testable.

- [ ] **Step 1: Write the failing tests first**

Create `tests/lib/budget.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateCostUsd, computeBudgetStatus, getBudgetConfig } from '@/lib/budget'

describe('calculateCostUsd', () => {
  it('returns 0 for zero tokens', () => {
    expect(calculateCostUsd(0, 0)).toBe(0)
  })

  it('calculates input token cost at $15 per million', () => {
    // 1 million input tokens = $15
    expect(calculateCostUsd(1_000_000, 0)).toBeCloseTo(15)
  })

  it('calculates output token cost at $75 per million', () => {
    // 1 million output tokens = $75
    expect(calculateCostUsd(0, 1_000_000)).toBeCloseTo(75)
  })

  it('calculates combined cost', () => {
    const expected = 100 * (15 / 1_000_000) + 50 * (75 / 1_000_000)
    expect(calculateCostUsd(100, 50)).toBeCloseTo(expected)
  })
})

describe('computeBudgetStatus', () => {
  it('returns ok when well under warning threshold', () => {
    // 10/37 ≈ 27% — under 80%
    expect(computeBudgetStatus(10, 37, 80)).toBe('ok')
  })

  it('returns warning when at or above the warning threshold', () => {
    // 30/37 ≈ 81% — at or above 80%
    expect(computeBudgetStatus(30, 37, 80)).toBe('warning')
  })

  it('returns warning not exceeded when just below limit', () => {
    expect(computeBudgetStatus(36.99, 37, 80)).toBe('warning')
  })

  it('returns exceeded when cost equals limit', () => {
    expect(computeBudgetStatus(37, 37, 80)).toBe('exceeded')
  })

  it('returns exceeded when cost is above limit', () => {
    expect(computeBudgetStatus(40, 37, 80)).toBe('exceeded')
  })
})

describe('getBudgetConfig', () => {
  beforeEach(() => {
    vi.stubEnv('ANTHROPIC_BUDGET_LIMIT_USD', '50')
    vi.stubEnv('ANTHROPIC_BUDGET_WARNING_PCT', '75')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads limit from env', () => {
    expect(getBudgetConfig().limitUsd).toBe(50)
  })

  it('reads warning pct from env', () => {
    expect(getBudgetConfig().warningPct).toBe(75)
  })

  it('uses defaults when env vars are absent', () => {
    vi.unstubAllEnvs()
    const config = getBudgetConfig()
    expect(config.limitUsd).toBe(37)
    expect(config.warningPct).toBe(80)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest tests/lib/budget.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/budget'`

- [ ] **Step 3: Implement `src/lib/budget.ts`**

Create `src/lib/budget.ts`:

```typescript
import type { BudgetStatusValue } from '@/lib/agent/types'

// Pricing for claude-opus-4-5-20251101 (USD per token)
// Source: Anthropic pricing page. Update here if rates change.
const COST_PER_INPUT_TOKEN = 15 / 1_000_000  // $15 per million input tokens
const COST_PER_OUTPUT_TOKEN = 75 / 1_000_000 // $75 per million output tokens

/** Calculate USD cost for a single API call from token counts. */
export function calculateCostUsd(inputTokens: number, outputTokens: number): number {
  return inputTokens * COST_PER_INPUT_TOKEN + outputTokens * COST_PER_OUTPUT_TOKEN
}

/**
 * Compute budget status from cost and thresholds.
 * Pure function — no env var reads, easy to test.
 */
export function computeBudgetStatus(
  costUsd: number,
  limitUsd: number,
  warningPct: number,
): BudgetStatusValue {
  if (costUsd >= limitUsd) return 'exceeded'
  if (costUsd >= limitUsd * (warningPct / 100)) return 'warning'
  return 'ok'
}

/** Read budget config from env vars with defaults. Server-side only. */
export function getBudgetConfig(): { limitUsd: number; warningPct: number } {
  return {
    limitUsd: parseFloat(process.env.ANTHROPIC_BUDGET_LIMIT_USD ?? '37'),
    warningPct: parseFloat(process.env.ANTHROPIC_BUDGET_WARNING_PCT ?? '80'),
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest tests/lib/budget.test.ts
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/budget.ts tests/lib/budget.test.ts
git commit -m "feat: add budget calculation helpers with tests"
```

---

## Task 3: Update agent types

**Files:**
- Modify: `src/lib/agent/types.ts`

- [ ] **Step 1: Add `BudgetStatus`, `user_api_key` to `AgentRequest`, and `budget` to `AgentResponse`**

In `src/lib/agent/types.ts`, make the following additions:

Add after the imports:

```typescript
export type BudgetStatusValue = 'ok' | 'warning' | 'exceeded'

export interface BudgetStatus {
  status: BudgetStatusValue
  used_usd: number
  limit_usd: number
}
```

Update `AgentRequest` to add the optional `user_api_key` field:

```typescript
export interface AgentRequest {
  input: string
  product_id?: string
  element_type?: ElementType
  session_id?: string
  user_api_key?: string  // user's own Anthropic key; used in-flight only, never persisted
}
```

Update `AgentResponse` to add the `budget` field:

```typescript
export interface AgentResponse {
  source_type: SourceType
  inferred: {
    element_type: ElementType | null
    intent: 'review' | 'generate'
  }
  suggestion: string
  character_count: number
  rationale: string[]
  guidelines_met: string[]
  confidence: Confidence
  confidence_reason: string
  session_id: string
  message_id: string
  budget: BudgetStatus  // current shared budget status after this call
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/agent/types.ts
git commit -m "feat: add BudgetStatus type and budget fields to agent types"
```

---

## Task 4: GET /api/budget route

**Files:**
- Create: `src/app/api/budget/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/budget/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeBudgetStatus, getBudgetConfig } from '@/lib/budget'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data } = await supabase
    .from('budget_usage')
    .select('cost_usd')
    .eq('id', 1)
    .single()

  const { limitUsd, warningPct } = getBudgetConfig()
  const usedUsd = parseFloat((data?.cost_usd as string | null) ?? '0')

  return NextResponse.json({
    used_usd: usedUsd,
    limit_usd: limitUsd,
    status: computeBudgetStatus(usedUsd, limitUsd, warningPct),
  })
}
```

- [ ] **Step 2: Verify the route is reachable**

Start dev server (`npm run dev`). In a browser signed in to the app, open the DevTools console and run:

```javascript
fetch('/api/budget').then(r => r.json()).then(console.log)
```

Expected output:
```json
{ "used_usd": 0, "limit_usd": 37, "status": "ok" }
```

- [ ] **Step 3: Verify 401 for unauthenticated requests**

In an incognito window (not logged in):

```javascript
fetch('/api/budget').then(r => r.json()).then(console.log)
```

Expected: `{ "error": "Unauthorised" }` with status 401

- [ ] **Step 4: Commit**

```bash
git add src/app/api/budget/route.ts
git commit -m "feat: add GET /api/budget route"
```

---

## Task 5: Update POST /api/agent route

**Files:**
- Modify: `src/app/api/agent/route.ts`

Key changes: (1) remove module-level Anthropic client, (2) create a per-request client using `user_api_key` if provided, (3) capture token usage, (4) handle user-key-specific errors with distinct codes, (5) increment shared budget only when using shared key, (6) include budget status in response.

- [ ] **Step 1: Replace `src/app/api/agent/route.ts` with the updated version**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { lookupContext } from '@/lib/agent/lookup'
import { buildSystemPrompt, buildUserMessage } from '@/lib/agent/prompt'
import { calculateCostUsd, computeBudgetStatus, getBudgetConfig } from '@/lib/budget'
import type { AgentRequest } from '@/lib/agent/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Parse body
  let body: AgentRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.input || typeof body.input !== 'string' || body.input.trim().length === 0) {
    return NextResponse.json({ error: 'input is required' }, { status: 400 })
  }

  const usingUserKey = !!body.user_api_key

  // Library lookup
  const context = await lookupContext(
    body.element_type ?? null,
    body.product_id ?? null,
  )

  // Build prompt
  const systemPrompt = buildSystemPrompt(context)
  const userMessage = buildUserMessage(body)

  // Create per-request Anthropic client — user key takes precedence
  const anthropic = new Anthropic({
    apiKey: body.user_api_key ?? process.env.ANTHROPIC_API_KEY,
  })

  // Call Claude
  let rawContent: string
  let inputTokens = 0
  let outputTokens = 0

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    rawContent = message.content[0].type === 'text' ? message.content[0].text : ''
    inputTokens = message.usage.input_tokens
    outputTokens = message.usage.output_tokens
  } catch (err) {
    // Surface user-key-specific errors with distinct codes
    if (usingUserKey) {
      if (err instanceof Anthropic.AuthenticationError) {
        return NextResponse.json({ error: 'invalid_user_key' }, { status: 401 })
      }
      if (err instanceof Anthropic.RateLimitError) {
        return NextResponse.json({ error: 'user_key_rate_limited' }, { status: 429 })
      }
      if (err instanceof Anthropic.APIError && err.status === 400) {
        const body = err.error as { error?: { type?: string } }
        if (body?.error?.type === 'credit_balance_too_low') {
          return NextResponse.json({ error: 'user_key_out_of_credits' }, { status: 400 })
        }
      }
    }
    console.error('Claude API error', err)
    return NextResponse.json({ error: 'Agent service unavailable' }, { status: 502 })
  }

  // Parse response — strip markdown fences if present
  const stripped = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(stripped)
  } catch {
    console.error('Failed to parse agent response', rawContent)
    return NextResponse.json({ error: 'Agent returned invalid response' }, { status: 502 })
  }

  // Add character count if missing
  if (!parsed.character_count && typeof parsed.suggestion === 'string') {
    parsed.character_count = (parsed.suggestion as string).length
  }

  // Increment shared budget only when the shared key was used
  if (!usingUserKey && inputTokens > 0) {
    const costUsd = calculateCostUsd(inputTokens, outputTokens)
    try {
      await supabase.rpc('increment_budget_cost', { amount: costUsd })
    } catch (err) {
      // Log but do not fail the response — budget write is best-effort
      console.error('Budget increment failed', err)
    }
  }

  // Read current budget state to include in response
  const { data: budgetRow } = await supabase
    .from('budget_usage')
    .select('cost_usd')
    .eq('id', 1)
    .single()

  const { limitUsd, warningPct } = getBudgetConfig()
  const usedUsd = parseFloat((budgetRow?.cost_usd as string | null) ?? '0')
  const budget = {
    status: computeBudgetStatus(usedUsd, limitUsd, warningPct),
    used_usd: usedUsd,
    limit_usd: limitUsd,
  }

  // Session management — create session if not provided
  let sessionId = body.session_id ?? null

  if (!sessionId) {
    const sessionName = body.input.trim().slice(0, 60)
    const { data: session } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        product_id: body.product_id ?? null,
        name: sessionName,
      })
      .select('id')
      .single()

    sessionId = session?.id ?? null
  }

  // Save user message
  if (sessionId) {
    await supabase.from('session_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: {
        text: body.input,
        context: { product_id: body.product_id, element_type: body.element_type },
      },
      source_type: 'ai_generated',
    })
  }

  // Save assistant message and get its id
  let messageId: string | null = null
  if (sessionId) {
    const { data: msg } = await supabase
      .from('session_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: parsed,
        source_type: parsed.source_type as string,
        copy_entry_ids: context.copyMatches.map((m) => m.id),
      })
      .select('id')
      .single()

    messageId = msg?.id ?? null
  }

  return NextResponse.json({
    ...parsed,
    session_id: sessionId,
    message_id: messageId,
    budget,
  })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Test a successful submission increments budget**

Make a POST to `/api/agent` via the editor UI. Then check the database:

```sql
select cost_usd from budget_usage where id = 1;
```

Expected: `cost_usd` is now greater than 0.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/agent/route.ts
git commit -m "feat: add per-request api key, budget tracking, and budget in agent response"
```

---

## Task 6: BudgetBanner component

**Files:**
- Create: `src/components/editor/BudgetBanner.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/editor/BudgetBanner.tsx`:

```typescript
'use client'

interface Props {
  status: 'warning' | 'exceeded'
  onAddKey: () => void
  onDismiss?: () => void
}

export function BudgetBanner({ status, onAddKey, onDismiss }: Props) {
  if (status === 'warning') {
    return (
      <div
        className="flex items-start gap-2 px-4 py-2.5 text-xs border-b flex-shrink-0"
        style={{
          background: 'oklch(99% 0.05 80)',
          borderColor: 'oklch(80% 0.12 72)',
          color: 'oklch(40% 0.12 60)',
        }}
      >
        <svg
          viewBox="0 0 14 14"
          fill="none"
          stroke="oklch(65% 0.17 72)"
          strokeWidth="1.5"
          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
        >
          <path d="M7 1L13 12H1L7 1z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 5.5v3M7 10h.01" strokeLinecap="round" />
        </svg>
        <span className="flex-1">
          Lorem is approaching its shared capacity.{' '}
          <button
            onClick={onAddKey}
            className="font-medium underline underline-offset-2 hover:no-underline"
          >
            Add your API key
          </button>{' '}
          to keep working.
        </span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="opacity-40 hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="Dismiss warning"
          >
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-2.5 h-2.5">
              <path d="M1 1l8 8M9 1l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className="flex items-start gap-2 px-4 py-2.5 text-xs border-b flex-shrink-0"
      style={{
        background: 'oklch(98% 0.04 27)',
        borderColor: 'oklch(85% 0.08 27)',
        color: 'oklch(38% 0.14 27)',
      }}
    >
      <svg
        viewBox="0 0 14 14"
        fill="none"
        stroke="oklch(53% 0.22 27)"
        strokeWidth="1.5"
        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
      >
        <circle cx="7" cy="7" r="6" />
        <path d="M7 4.5v3.5M7 10h.01" strokeLinecap="round" />
      </svg>
      <span>
        Lorem&rsquo;s shared capacity has been reached. Add your API key to continue.
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Verify it renders (spot check)**

Temporarily import `BudgetBanner` in `EditorShell.tsx` and render `<BudgetBanner status="warning" onAddKey={() => {}} onDismiss={() => {}} />` above the panels. Confirm the amber banner appears. Then remove the temporary import — the full integration happens in Task 10.

- [ ] **Step 3: Commit**

```bash
git add src/components/editor/BudgetBanner.tsx
git commit -m "feat: add BudgetBanner component for warning and exceeded states"
```

---

## Task 7: ApiKeyModal component

**Files:**
- Create: `src/components/editor/ApiKeyModal.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/editor/ApiKeyModal.tsx`:

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (key: string) => void
  error?: string | null
}

export function ApiKeyModal({ open, onClose, onSave, error }: Props) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens; clear field on re-open
  useEffect(() => {
    if (open) {
      setKey('')
      setShowKey(false)
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  function handleSave() {
    const trimmed = key.trim()
    if (!trimmed) return
    onSave(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'oklch(17% 0.015 254 / 0.45)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-modal-title"
        className="relative w-full max-w-md rounded-xl flex flex-col gap-4 p-5"
        style={{
          background: 'oklch(99.5% 0.003 248)',
          border: '1px solid oklch(86% 0.014 252)',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
              style={{
                background: 'oklch(98% 0.04 27)',
                border: '1px solid oklch(90% 0.06 27)',
              }}
            >
              <svg
                viewBox="0 0 15 15"
                fill="none"
                stroke="oklch(53% 0.22 27)"
                strokeWidth="1.5"
                className="w-4 h-4"
              >
                <circle cx="7.5" cy="7.5" r="6.5" />
                <path d="M7.5 5v4M7.5 10.5h.01" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2
                id="api-key-modal-title"
                className="text-sm font-semibold"
                style={{ color: 'oklch(17% 0.015 254)' }}
              >
                Lorem&rsquo;s shared capacity has been reached
              </h2>
              <p className="text-xs mt-1" style={{ color: 'oklch(51% 0.025 253)' }}>
                Add your own Claude API key to keep working. It&rsquo;s stored in your browser only.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded"
            style={{ color: 'oklch(65% 0.02 253)' }}
          >
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
              <path d="M1 1l10 10M11 1L1 11" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'oklch(91% 0.01 252)', margin: '0 -20px' }} />

        {/* Key field */}
        <div>
          <label
            htmlFor="api-key-input"
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'oklch(51% 0.025 253)' }}
          >
            Claude API key
          </label>
          <div className="relative">
            <input
              id="api-key-input"
              ref={inputRef}
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
              placeholder="sk-ant-api03-..."
              style={{
                display: 'block',
                width: '100%',
                height: 34,
                paddingLeft: 10,
                paddingRight: 34,
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 12,
                letterSpacing: '0.02em',
                background: 'oklch(99.5% 0.003 248)',
                border: `1px solid ${error ? 'oklch(53% 0.22 27)' : 'oklch(86% 0.014 252)'}`,
                borderRadius: 6,
                color: 'oklch(17% 0.015 254)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? 'Hide key' : 'Show key'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'oklch(65% 0.02 253)' }}
            >
              <svg
                viewBox="0 0 13 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-3.5 h-3.5"
              >
                <ellipse cx="6.5" cy="6.5" rx="5.5" ry="3.5" />
                <circle cx="6.5" cy="6.5" r="1.5" />
                {!showKey && (
                  <line x1="1" y1="12" x2="12" y2="1" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
          {error ? (
            <p className="text-xs mt-1.5" style={{ color: 'oklch(53% 0.22 27)' }}>
              {error}
            </p>
          ) : (
            <p className="text-xs mt-1.5" style={{ color: 'oklch(65% 0.02 253)' }}>
              Get your key from{' '}
              <a
                href="https://equip.tech.gov.sg"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-2"
                style={{ color: 'oklch(51% 0.24 264)' }}
              >
                equip.tech.gov.sg
              </a>
              . Never shared with the Lorem server.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-[30px] px-3.5 text-xs font-medium rounded-md transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid oklch(86% 0.014 252)',
              color: 'oklch(51% 0.025 253)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="h-[30px] px-3.5 text-xs font-medium rounded-md text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            style={{ background: 'oklch(51% 0.24 264)' }}
          >
            Save and continue
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/editor/ApiKeyModal.tsx
git commit -m "feat: add ApiKeyModal component"
```

---

## Task 8: Update LeftPanel

**Files:**
- Modify: `src/components/editor/LeftPanel.tsx`

Add three props: `budgetExceeded`, `hasUserKey`, and `onOpenKeyModal`. When exceeded with no user key, the submit button is visually disabled but clickable, and opens the modal (with a callback to auto-submit after the key is saved).

- [ ] **Step 1: Update `src/components/editor/LeftPanel.tsx`**

Replace the `Props` interface and the submit button section. The full updated file:

```typescript
'use client'

import { useState } from 'react'
import type { AgentRequest, ElementType } from '@/lib/agent/types'
import { ELEMENT_TYPE_OPTIONS } from '@/lib/agent/types'

interface Product {
  id: string
  name: string
}

interface Props {
  products: Product[]
  onSubmit: (req: AgentRequest) => void
  loading: boolean
  budgetExceeded: boolean
  hasUserKey: boolean
  onOpenKeyModal: (onAfterSave?: () => void) => void
}

export function LeftPanel({
  products,
  onSubmit,
  loading,
  budgetExceeded,
  hasUserKey,
  onOpenKeyModal,
}: Props) {
  const [productId, setProductId] = useState<string>('')
  const [elementType, setElementType] = useState<ElementType | ''>('')
  const [input, setInput] = useState('')

  function buildRequest(): AgentRequest {
    return {
      input: input.trim(),
      product_id: productId || undefined,
      element_type: (elementType as ElementType) || undefined,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    onSubmit(buildRequest())
  }

  const selectClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400'

  // When budget is exceeded and user has no key, show a locked button
  const showLockedButton = budgetExceeded && !hasUserKey

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 h-full p-5 w-96 border-r border-gray-200 bg-gray-50 shrink-0"
    >
      {/* Product */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">Product</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className={selectClass}
        >
          <option value="">Global</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Element type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">Element type</label>
        <select
          value={elementType}
          onChange={(e) => setElementType(e.target.value as ElementType | '')}
          className={selectClass}
        >
          <option value="">Not specified</option>
          {ELEMENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-xs font-medium text-gray-600">Copy</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste copy to review, or describe what you need"
          className="flex-1 resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      {/* Submit — locked variant when budget exceeded and no user key */}
      {showLockedButton ? (
        <button
          type="button"
          onClick={() => {
            // Pass a callback so the request auto-fires after the key is saved
            onOpenKeyModal(() => {
              if (input.trim()) onSubmit(buildRequest())
            })
          }}
          className="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium shadow-sm opacity-50 cursor-not-allowed"
          style={{ background: 'oklch(17% 0.015 254)', color: 'white' }}
        >
          Review / Generate
        </button>
      ) : (
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Thinking...
            </>
          ) : (
            'Review / Generate'
          )}
        </button>
      )}
    </form>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: error on `EditorShell.tsx` — it is now missing the three new props. This is expected; fix in Task 9.

- [ ] **Step 3: Commit**

```bash
git add src/components/editor/LeftPanel.tsx
git commit -m "feat: add budget-aware locked button to LeftPanel"
```

---

## Task 9: Update EditorShell

**Files:**
- Modify: `src/components/editor/EditorShell.tsx`

Wire up budget state, user key from localStorage, modal, and banners.

- [ ] **Step 1: Replace `src/components/editor/EditorShell.tsx` with the updated version**

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { BudgetBanner } from './BudgetBanner'
import { ApiKeyModal } from './ApiKeyModal'
import type { AgentRequest, AgentResponse, BudgetStatusValue } from '@/lib/agent/types'

interface Product {
  id: string
  name: string
}

interface Props {
  products: Product[]
}

export function EditorShell({ products }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<AgentResponse | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const [budgetStatus, setBudgetStatus] = useState<BudgetStatusValue>('ok')
  const [warningDismissed, setWarningDismissed] = useState(false)
  const [userApiKey, setUserApiKey] = useState<string | null>(null)

  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [apiKeyModalError, setApiKeyModalError] = useState<string | null>(null)
  const pendingSubmitRef = useRef<(() => void) | null>(null)

  // On mount: read saved key + fetch budget
  useEffect(() => {
    setUserApiKey(localStorage.getItem('lorem_api_key'))

    fetch('/api/budget')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { status: BudgetStatusValue } | null) => {
        if (data?.status) setBudgetStatus(data.status)
      })
      .catch(() => {
        // Fail silently — do not block the editor
      })
  }, [])

  function openKeyModal(onAfterSave?: () => void) {
    pendingSubmitRef.current = onAfterSave ?? null
    setApiKeyModalError(null)
    setApiKeyModalOpen(true)
  }

  function handleApiKeySave(key: string) {
    localStorage.setItem('lorem_api_key', key)
    setUserApiKey(key)
    setApiKeyModalOpen(false)
    setApiKeyModalError(null)
    const cb = pendingSubmitRef.current
    pendingSubmitRef.current = null
    if (cb) cb()
  }

  async function handleSubmit(req: AgentRequest) {
    // Read key fresh from localStorage (may have just been saved)
    const storedKey = localStorage.getItem('lorem_api_key')

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...req,
          session_id: sessionId ?? undefined,
          ...(storedKey ? { user_api_key: storedKey } : {}),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`)
      }

      const data = (await res.json()) as AgentResponse
      setResponse(data)
      if (data.session_id) setSessionId(data.session_id)
      if (data.budget?.status) setBudgetStatus(data.budget.status)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'invalid_user_key') {
          setApiKeyModalError('That key didn\'t work. Check it and try again.')
          setApiKeyModalOpen(true)
          return
        }
        if (err.message === 'user_key_rate_limited') {
          setError('Your key has hit its own rate limit. Try again shortly.')
          return
        }
        if (err.message === 'user_key_out_of_credits') {
          setError(
            'Your API key has run out of credits. Check equip.tech.gov.sg to find out when your quota resets.',
          )
          return
        }
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  const budgetExceeded = budgetStatus === 'exceeded'

  return (
    <div className="flex flex-col h-full">
      {/* Budget banners — full width above the panels */}
      {budgetStatus === 'warning' && !warningDismissed && (
        <BudgetBanner
          status="warning"
          onAddKey={() => openKeyModal()}
          onDismiss={() => setWarningDismissed(true)}
        />
      )}
      {budgetStatus === 'exceeded' && (
        <BudgetBanner status="exceeded" onAddKey={() => openKeyModal()} />
      )}

      {/* Editor panels */}
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          products={products}
          onSubmit={handleSubmit}
          loading={loading}
          budgetExceeded={budgetExceeded}
          hasUserKey={!!userApiKey}
          onOpenKeyModal={openKeyModal}
        />
        <RightPanel loading={loading} error={error} response={response} />
      </div>

      {/* API key modal */}
      <ApiKeyModal
        open={apiKeyModalOpen}
        onClose={() => {
          setApiKeyModalOpen(false)
          setApiKeyModalError(null)
          pendingSubmitRef.current = null
        }}
        onSave={handleApiKeySave}
        error={apiKeyModalError}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Run all tests**

```bash
npx vitest
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/editor/EditorShell.tsx
git commit -m "feat: wire budget state, user api key, banners, and modal into EditorShell"
```

---

## Task 10: Smoke test checklist

Manual verification against the spec.

- [ ] **Budget tracking**
  - Submit a request in the editor
  - Query `select cost_usd from budget_usage where id = 1` in Supabase
  - Confirm `cost_usd` increased

- [ ] **GET /api/budget reflects updated spend**
  - After the submission above, call `fetch('/api/budget').then(r => r.json()).then(console.log)` in the browser console
  - Confirm `used_usd` matches the database value

- [ ] **Warning banner at 80%**
  - Temporarily set `ANTHROPIC_BUDGET_LIMIT_USD=0.001` in `.env.local` and restart dev server
  - Make one submission — budget will immediately exceed the warning threshold
  - Confirm amber banner appears: "Lorem is approaching its shared capacity."
  - Confirm dismiss button works and banner disappears
  - Confirm banner re-appears after page reload (budget still in warning)
  - Reset `ANTHROPIC_BUDGET_LIMIT_USD=37` after the test

- [ ] **Exceeded state**
  - Temporarily set `ANTHROPIC_BUDGET_LIMIT_USD=0.0001` and restart
  - Make one submission
  - Confirm red banner appears: "Lorem's shared capacity has been reached."
  - Confirm submit button is visually disabled (opaque, cursor-not-allowed)
  - Reset `ANTHROPIC_BUDGET_LIMIT_USD=37` after the test

- [ ] **Modal opens from locked submit button**
  - In the exceeded state, click the locked submit button
  - Confirm the modal appears with title "Lorem's shared capacity has been reached"
  - Confirm the key input uses monospace font
  - Confirm hint text reads "Get your key from equip.tech.gov.sg"
  - Confirm Escape key closes the modal

- [ ] **Modal opens from warning banner link**
  - In the warning state, click "Add your API key" in the banner
  - Confirm the modal opens

- [ ] **Saving a valid key unlocks the editor**
  - Enter a valid Anthropic API key in the modal
  - Click "Save and continue"
  - Confirm the modal closes and the submit button is now active (even with budget exceeded)
  - Confirm `localStorage.getItem('lorem_api_key')` returns the key in the browser console

- [ ] **Auto-submit after saving from locked button**
  - In the exceeded state, type text in the textarea
  - Click the locked submit button — modal opens
  - Enter a valid key and save
  - Confirm the request fires automatically and a suggestion appears

- [ ] **Invalid user key error appears in modal**
  - Enter an invalid key (e.g. `sk-fake`) and save
  - Confirm the modal stays open and shows: "That key didn't work. Check it and try again."

- [ ] **Budget not incremented when user key is used**
  - Note the current `cost_usd` value in the database
  - Make a submission using the saved user key
  - Query `budget_usage` again — `cost_usd` must be unchanged

---

## Self-review

| Spec requirement | Task |
|---|---|
| `budget_usage` table with single row, atomic increment | Task 1 |
| `ANTHROPIC_BUDGET_LIMIT_USD` and `ANTHROPIC_BUDGET_WARNING_PCT` env vars | Task 1 |
| Pure cost calculation and status helpers, fully tested | Task 2 |
| `BudgetStatus` type, `user_api_key` on request, `budget` on response | Task 3 |
| `GET /api/budget` — authenticated, returns status | Task 4 |
| Per-request Anthropic client, user key error codes, budget increment, budget in response | Task 5 |
| Warning banner — amber, dismissible, link to modal | Task 6 |
| Exceeded banner — red, not dismissible | Task 6 |
| Modal — JetBrains Mono input, equip.tech.gov.sg hint, save + cancel | Task 7 |
| Modal — close on Escape, focus on open | Task 7 |
| Locked submit — visually disabled, clickable, opens modal | Task 8 |
| Auto-submit after key saved from locked button | Tasks 8 + 9 |
| Budget fetch on mount, silent fail | Task 9 |
| Budget status updated from agent response | Task 9 |
| User key read from localStorage before every submission | Task 9 |
| `invalid_user_key` → inline modal error | Task 9 |
| `user_key_rate_limited` → inline editor error | Task 9 |
| `user_key_out_of_credits` → inline editor error with equip.tech.gov.sg | Task 9 |
| Budget DB write failure does not fail the response | Task 5 |
| Budget fetch failure defaults to `ok` | Task 9 |
| User key not incremented to shared budget | Task 5 |

---

*Plan written: 2026-05-26*
