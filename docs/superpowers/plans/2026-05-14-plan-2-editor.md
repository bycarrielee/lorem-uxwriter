# Editor + Agent Service Implementation Plan (v2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **⚠️ Amendment (2026-05-26): No authentication.** The app is open — no auth checks anywhere.
> - **Task 6 (agent route):** No `supabase.auth.getUser()` check. No user_id on session insert.
> - **Task 16 (session list):** No user filter. Fetch all recent sessions by `created_at` descending.

**Goal:** Chat-based assistant UI + agent service API. After this plan, users land on an "Ask Lorem" card, submit copy, and receive a structured suggestion in a chat thread. Follow-up messages continue the conversation. A version history side panel shows rationale and guidelines for any response.

**Architecture:** `POST /api/agent` orchestrates library lookup (deterministic Supabase query) then a Claude API call. The editor page renders `AssistantShell`, which manages two states: `landing` (centred Ask Lorem card) and `response` (chat thread + follow-up bar + optional version history panel). Sessions are created on first submit and persisted to `session_messages`.

**New dependency:** `@anthropic-ai/sdk`

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS (layout only), CSS custom properties (design tokens), Supabase JS v2, Anthropic SDK, Vitest

**Design authority:** `design-system/MASTER.md` and `design-system/DESIGN.md`. Use CSS custom properties from DESIGN.md for all colours, typography, and spacing. Never hardcode hex values or use Tailwind colour classes — use `var(--token-name)` inline styles. Tailwind is used for layout utilities only (flex, overflow, gap, width, height, position).

---

## File structure

```
src/
├── app/
│   ├── globals.css                          ← updated: design tokens + font variables
│   ├── layout.tsx                           ← updated: Google Fonts link
│   ├── (app)/
│   │   └── editor/
│   │       └── page.tsx                     ← updated: loads products, renders AssistantShell
│   └── api/
│       └── agent/
│           └── route.ts                     ← POST /api/agent
├── components/
│   ├── assistant/
│   │   ├── AssistantShell.tsx               ← state machine: landing | response
│   │   ├── LandingCard.tsx                  ← "Ask Lorem" centred card
│   │   ├── UserBubble.tsx                   ← right-aligned user message bubble
│   │   ├── BotCard.tsx                      ← AI response card (source tag, copy, actions, chips)
│   │   ├── FollowUpBar.tsx                  ← pinned bottom input + send button
│   │   ├── VersionHistoryPanel.tsx          ← 381px side panel, version tabs, rationale
│   │   ├── SkeletonLoader.tsx               ← shimmer loading state
│   │   └── SourceTag.tsx                    ← pill-shaped provenance label
│   └── sidebar/
│       └── SessionList.tsx                  ← recent sessions in sidebar
└── lib/
    └── agent/
        ├── types.ts
        ├── lookup.ts
        └── prompt.ts
tests/
└── lib/
    └── agent/
        ├── lookup.test.ts
        └── prompt.test.ts
```

---

## Task 1: Design tokens + fonts

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace `src/app/globals.css` with design token setup**

```css
@import "tailwindcss";

/* ─── Google Fonts ──────────────────────────────────────────────────── */
/* Loaded via <link> in layout.tsx */

/* ─── Design tokens ─────────────────────────────────────────────────── */
:root {
  /* Surfaces */
  --surface-base:  #F7F8FA;
  --surface-card:  #F0EDE8;
  --surface-input: #EDE8E0;
  --surface-white: #FFFFFF;

  /* Borders */
  --border-default:    #E0E5EA;
  --border-input:      #D9D2C8;
  --border-tag:        #C4B9AE;
  --border-tag-accent: #B8AA9E;

  /* Text */
  --text-primary:   #1E2D3A;
  --text-secondary: #6B8499;
  --text-tertiary:  #94A3B8;
  --text-chip:      #4A5D6B;
  --text-inverse:   #FFFFFF;

  /* Interactive */
  --color-primary:       #3B5BA5;
  --color-primary-hover: #334F94;
  --color-primary-ghost: rgba(59, 91, 165, 0.06);

  /* Tabs */
  --tab-inactive-text:    #6B8499;
  --tab-hover-text:       #1E2D3A;
  --tab-active-text:      #1E2D3A;
  --tab-active-indicator: #3B5BA5;
  --tab-rail:             #E0E5EA;

  /* Navigation */
  --nav-text-resting: #6B8499;
  --nav-text-active:  #1E2D3A;
  --nav-bg-hover:     #EAECEE;
  --nav-bg-selected:  #FFFFFF;

  /* Chat bubbles */
  --bubble-user-bg:   #3A5068;
  --bubble-user-text: #EDF2F6;
  --bubble-bot-bg:    #F0EDE8;
  --bubble-bot-text:  #1E2D3A;

  /* Tags / chips */
  --tag-default-bg:     transparent;
  --tag-default-border: #C4B9AE;
  --tag-default-text:   #1E2D3A;
  --tag-accent-bg:      #E8E2D9;
  --tag-accent-border:  #B8AA9E;
  --tag-accent-text:    #4A5D6B;

  /* Source labels — semantic provenance, never repurpose */
  --lib-bg:  oklch(97% 0.05 162);  --lib-txt: oklch(44% 0.15 162); --lib-bd:  oklch(85% 0.07 162);
  --ada-bg:  #E8E2D9;              --ada-txt: #4A5D6B;             --ada-bd:  #B8AA9E;
  --ai-bg:   oklch(99% 0.05 80);   --ai-txt:  oklch(51% 0.16 72);  --ai-bd:   oklch(83% 0.10 72);
  --ail-bg:  oklch(99% 0.04 55);   --ail-txt: oklch(54% 0.18 45);  --ail-bd:  oklch(85% 0.09 55);

  /* Critical (errors, destructive) */
  --crit:     oklch(53% 0.22 27);
  --crit-bg:  oklch(98% 0.04 27);
  --crit-bd:  oklch(86% 0.08 27);
  --crit-txt: oklch(44% 0.19 27);

  /* Provisional (alternatives) */
  --provisional: oklch(65% 0.17 72);

  /* Focus ring */
  --signal:        oklch(51% 0.24 264);
  --signal-subtle: oklch(97% 0.04 264);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);

  /* Border radius */
  --r-sm:   4px;
  --r-md:   6px;
  --r-lg:   8px;
  --r-xl:   12px;
  --r-full: 9999px;

  /* Typography */
  --font-ui:      'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:    'DM Mono', 'JetBrains Mono', ui-monospace, monospace;
  --font-display: 'DM Serif Display', Georgia, serif;
}

/* ─── Base reset ─────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  font-family: var(--font-ui);
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--surface-base);
  -webkit-font-smoothing: antialiased;
}
button { font-family: inherit; cursor: pointer; }
:focus:not(:focus-visible) { outline: none; box-shadow: none; }

/* ─── Shimmer animation ──────────────────────────────────────────────── */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Card enter animation ───────────────────────────────────────────── */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Fade-up for bot cards ──────────────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Update `src/app/layout.tsx` to load Google Fonts**

Read the current file first, then replace the `<head>` / metadata block so it includes the fonts:

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lorem — UX Writing Assistant',
  description: 'AI-assisted UX copy for Singapore government digital services',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verify fonts load**

Run `npm run dev` and open `http://localhost:3000`. Open DevTools → Network → filter "fonts.gstatic.com". Confirm DM Sans, DM Mono, DM Serif Display requests appear.

---

## Task 2: Install Anthropic SDK

- [ ] Run: `npm install @anthropic-ai/sdk`
- [ ] Confirm `ANTHROPIC_API_KEY` is set in `.env.local`

---

## Task 3: Agent types

**File:** Create `src/lib/agent/types.ts`

```typescript
import type { Database } from '@/lib/supabase/types'

export type ElementType = Database['public']['Enums']['element_type']
export type SourceType  = Database['public']['Enums']['source_type']

export type Confidence = 'High' | 'Medium-High' | 'Medium' | 'Low'

export interface AgentRequest {
  input: string
  product_id?: string
  element_type?: ElementType
  session_id?: string
}

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
}

export const ELEMENT_TYPE_OPTIONS: Array<{ value: ElementType; label: string }> = [
  { value: 'buttons',    label: 'Buttons' },
  { value: 'errors',     label: 'Error messages' },
  { value: 'forms',      label: 'Form labels' },
  { value: 'alerts',     label: 'Alerts' },
  { value: 'modals',     label: 'Modals' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'content',    label: 'Content' },
  { value: 'states',     label: 'States' },
]
```

- [ ] **Verify:** `npx tsc --noEmit` — no errors

---

## Task 4: Library lookup

**Files:**
- Create: `src/lib/agent/lookup.ts`
- Create: `tests/lib/agent/lookup.test.ts`

- [ ] **Step 1: Write failing tests first**

Create `tests/lib/agent/lookup.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { lookupContext } from '@/lib/agent/lookup'

function makeMockSupabase(data: Record<string, unknown[]>) {
  const from = vi.fn((table: string) => {
    let result = data[table] ?? []
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      or:     vi.fn().mockReturnThis(),
      limit:  vi.fn().mockReturnThis(),
      then:   vi.fn(),
    }
    // Resolve on any terminal call
    chain.or.mockResolvedValue   = undefined
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
```

- [ ] **Step 2: Run tests — expect FAIL** (`Cannot find module '@/lib/agent/lookup'`)

```bash
npx vitest tests/lib/agent/lookup.test.ts
```

- [ ] **Step 3: Implement `src/lib/agent/lookup.ts`**

```typescript
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
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest tests/lib/agent/lookup.test.ts
```

---

## Task 5: Prompt builder

**Files:**
- Create: `src/lib/agent/prompt.ts`
- Create: `tests/lib/agent/prompt.test.ts`

- [ ] **Step 1: Write failing tests first**

Create `tests/lib/agent/prompt.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, buildUserMessage } from '@/lib/agent/prompt'
import type { LookupResult } from '@/lib/agent/lookup'

const emptyContext: LookupResult = { copyMatches: [], patterns: [], foundations: [] }

describe('buildSystemPrompt', () => {
  it('includes the JSON schema instruction', () => {
    const prompt = buildSystemPrompt(emptyContext)
    expect(prompt).toContain('source_type')
    expect(prompt).toContain('suggestion')
    expect(prompt).toContain('rationale')
  })

  it('includes foundation content when present', () => {
    const ctx: LookupResult = {
      ...emptyContext,
      foundations: [{ id: '1', type: 'voice', scope: 'global', content: 'Be direct.' }],
    }
    const prompt = buildSystemPrompt(ctx)
    expect(prompt).toContain('Be direct.')
    expect(prompt).toContain('VOICE')
  })

  it('includes pattern content when present', () => {
    const ctx: LookupResult = {
      ...emptyContext,
      patterns: [{ id: '1', element_type: 'buttons', scope: 'global', content: 'Start with a verb.' }],
    }
    const prompt = buildSystemPrompt(ctx)
    expect(prompt).toContain('Start with a verb.')
    expect(prompt).toContain('ELEMENT PATTERNS')
  })

  it('includes library matches when present', () => {
    const ctx: LookupResult = {
      ...emptyContext,
      copyMatches: [
        {
          id: '1', copy: 'Save and continue', context: 'Form progress', rationale: 'Clear action',
          scope: 'global', product_id: null, tone: 'neutral', usage_examples: [],
        },
      ],
    }
    const prompt = buildSystemPrompt(ctx)
    expect(prompt).toContain('Save and continue')
    expect(prompt).toContain('LIBRARY MATCHES')
  })
})

describe('buildUserMessage', () => {
  it('includes the input text', () => {
    const msg = buildUserMessage({ input: 'Review this error message' })
    expect(msg).toContain('Review this error message')
  })

  it('includes element type context when provided', () => {
    const msg = buildUserMessage({ input: 'Review this', element_type: 'errors' })
    expect(msg).toContain('errors')
  })

  it('notes no context when not provided', () => {
    const msg = buildUserMessage({ input: 'Review this' })
    expect(msg).toContain('No context provided')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest tests/lib/agent/prompt.test.ts
```

- [ ] **Step 3: Implement `src/lib/agent/prompt.ts`**

```typescript
import type { AgentRequest } from './types'
import type { LookupResult } from './lookup'

function serializeCopy(copy: unknown): string {
  if (typeof copy === 'string') return copy
  if (typeof copy === 'object' && copy !== null) {
    return Object.entries(copy as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ')
  }
  return String(copy)
}

export function buildSystemPrompt(context: LookupResult): string {
  const sections: string[] = []

  sections.push(`You are a UX writing assistant for Singapore government digital services.
Your job is to review or generate copy — field labels, error messages, button labels, modal text, alerts, navigation, and other interface copy.

IMPORTANT: You must respond with valid JSON only. No markdown, no explanation outside the JSON object.

JSON schema:
{
  "source_type": "library_match" | "adapted" | "ai_generated" | "ai_generated_low_confidence",
  "inferred": {
    "element_type": string | null,
    "intent": "review" | "generate"
  },
  "suggestion": string,
  "character_count": number,
  "rationale": string[],
  "guidelines_met": string[],
  "confidence": "High" | "Medium-High" | "Medium" | "Low",
  "confidence_reason": string
}

SOURCE TYPE RULES:
- library_match: Suggestion taken directly from a library entry with no changes.
- adapted: A library entry was found and adjusted for the user's context.
- ai_generated: No library entry matched; generated from patterns and foundations.
- ai_generated_low_confidence: No library entry and no pattern; foundations only.

INTENT DETECTION:
- "review": Input reads as draft or finished copy (e.g. "Your session has expired")
- "generate": Input reads as a description or request (e.g. "write a timeout error for a grant form")

MULTI-PART COPY: When the element type requires multiple parts (e.g. modal: heading + body + button), use " | " to separate them in suggestion: "Heading: ... | Body: ... | Button: ..."`)

  const foundationOrder = ['voice', 'style', 'accessibility', 'localisation', 'terminology'] as const
  for (const type of foundationOrder) {
    const found = context.foundations.filter((f) => f.type === type)
    if (found.length > 0) {
      sections.push(`--- ${type.toUpperCase()} GUIDELINES ---\n${found.map((f) => f.content).join('\n\n')}`)
    }
  }

  if (context.patterns.length > 0) {
    sections.push(
      `--- ELEMENT PATTERNS ---\n${context.patterns
        .map((p) => `[${p.element_type} · ${p.scope}]\n${p.content}`)
        .join('\n\n')}`,
    )
  }

  if (context.copyMatches.length > 0) {
    const matchLines = context.copyMatches.map((m, i) => {
      const parts = [`[${i + 1}] ${serializeCopy(m.copy)}`]
      if (m.context)  parts.push(`Context: ${m.context}`)
      if (m.rationale) parts.push(`Rationale: ${m.rationale}`)
      if (m.tone)     parts.push(`Tone: ${m.tone}`)
      if (m.scope === 'global') parts.push('Scope: global')
      return parts.join('\n')
    })
    sections.push(
      `--- LIBRARY MATCHES ---\nThese are approved copy strings. Prefer using them directly (library_match) or adapting them (adapted) over generating new copy.\n\n${matchLines.join('\n\n')}`,
    )
  }

  return sections.join('\n\n')
}

export function buildUserMessage(request: AgentRequest): string {
  const context: string[] = []
  if (request.product_id)  context.push(`Product: ${request.product_id}`)
  if (request.element_type) context.push(`Element type: ${request.element_type}`)

  const contextBlock =
    context.length > 0
      ? `Context:\n${context.join('\n')}\n\n`
      : 'No context provided — infer from the input.\n\n'

  return `${contextBlock}Input:\n${request.input}`
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest tests/lib/agent/prompt.test.ts
```

---

## Task 6: Agent API route

**File:** Create `src/app/api/agent/route.ts`

No auth check. No `user_id` on session insert.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { lookupContext } from '@/lib/agent/lookup'
import { buildSystemPrompt, buildUserMessage } from '@/lib/agent/prompt'
import type { AgentRequest } from '@/lib/agent/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  let body: AgentRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.input || typeof body.input !== 'string' || body.input.trim().length === 0) {
    return NextResponse.json({ error: 'input is required' }, { status: 400 })
  }

  const context = await lookupContext(body.element_type ?? null, body.product_id ?? null)
  const systemPrompt = buildSystemPrompt(context)
  const userMessage  = buildUserMessage(body)

  let rawContent: string
  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    rawContent = message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (err) {
    console.error('Claude API error', err)
    return NextResponse.json({ error: 'Agent service unavailable' }, { status: 502 })
  }

  // Strip markdown fences if present
  const stripped = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(stripped)
  } catch {
    console.error('Failed to parse agent response', rawContent)
    return NextResponse.json({ error: 'Agent returned invalid response' }, { status: 502 })
  }

  if (!parsed.character_count && typeof parsed.suggestion === 'string') {
    parsed.character_count = (parsed.suggestion as string).length
  }

  // Session management
  let sessionId = body.session_id ?? null

  if (!sessionId) {
    const sessionName = body.input.trim().slice(0, 60)
    const { data: session } = await supabase
      .from('sessions')
      .insert({ product_id: body.product_id ?? null, name: sessionName })
      .select('id')
      .single()
    sessionId = session?.id ?? null
  }

  if (sessionId) {
    await supabase.from('session_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: { text: body.input, context: { product_id: body.product_id, element_type: body.element_type } },
      source_type: null,
    })
  }

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

  return NextResponse.json({ ...parsed, session_id: sessionId, message_id: messageId })
}
```

- [ ] **Verify:** `npx tsc --noEmit` — no errors

---

## Task 7: SourceTag component

**File:** Create `src/components/assistant/SourceTag.tsx`

Pill-shaped. Uses CSS custom properties. Icon is mandatory.

```typescript
import type { SourceType } from '@/lib/agent/types'

interface Config {
  label: string
  bg: string
  text: string
  border: string
  icon: React.ReactNode
}

const icon = (path: React.ReactNode) => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {path}
  </svg>
)

const CONFIG: Record<SourceType, Config> = {
  library_match: {
    label: 'Library match',
    bg: 'var(--lib-bg)', text: 'var(--lib-txt)', border: 'var(--lib-bd)',
    icon: icon(<path d="M2 8l4 4 8-8" />),
  },
  adapted: {
    label: 'Adapted from library',
    bg: 'var(--ada-bg)', text: 'var(--ada-txt)', border: 'var(--ada-bd)',
    icon: icon(<path d="M4 12L12 4M8 4h4v4" />),
  },
  ai_generated: {
    label: 'AI-generated',
    bg: 'var(--ai-bg)', text: 'var(--ai-txt)', border: 'var(--ai-bd)',
    icon: icon(<><path d="M8 2l1.5 4H14l-3.5 2.5 1.5 4L8 10l-4 2.5 1.5-4L2 6h4.5L8 2z" /></>),
  },
  ai_generated_low_confidence: {
    label: 'AI-generated · lower confidence',
    bg: 'var(--ail-bg)', text: 'var(--ail-txt)', border: 'var(--ail-bd)',
    icon: icon(<><circle cx="8" cy="8" r="6" /><path d="M8 5v3.5" /><circle cx="8" cy="11" r="0.5" fill="currentColor" /></>),
  },
}

interface Props {
  sourceType: SourceType
}

export function SourceTag({ sourceType }: Props) {
  const { label, bg, text, border, icon } = CONFIG[sourceType] ?? CONFIG.ai_generated_low_confidence
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 'var(--r-full)',
        border: `1px solid ${border}`,
        background: bg,
        color: text,
        fontSize: '11.5px',
        fontWeight: 500,
        lineHeight: 1.4,
        width: 'fit-content',
      }}
    >
      {icon}
      {label}
    </span>
  )
}
```

---

## Task 8: SkeletonLoader component

**File:** Create `src/components/assistant/SkeletonLoader.tsx`

Shimmer skeleton matching the prototype's loading state.

```typescript
export function SkeletonLoader() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, var(--surface-base) 25%, var(--border-default) 50%, var(--surface-base) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 'var(--r-sm)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 0 8px' }}>
      {/* Source tag skeleton */}
      <div style={{ ...shimmer, height: 24, width: 148, borderRadius: 'var(--r-full)' }} />
      {/* Copy box skeleton */}
      <div style={{
        height: 88,
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border-default)',
        background: 'var(--surface-base)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }} />
      {/* Char count skeleton */}
      <div style={{ ...shimmer, height: 13, width: 110 }} />
      {/* Action buttons skeleton */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ ...shimmer, height: 30, width: 96, borderRadius: 'var(--r-md)' }} />
        <div style={{ ...shimmer, height: 30, width: 120, borderRadius: 'var(--r-md)' }} />
      </div>
    </div>
  )
}
```

---

## Task 9: UserBubble component

**File:** Create `src/components/assistant/UserBubble.tsx`

```typescript
interface Props {
  text: string
}

export function UserBubble({ text }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div
        style={{
          maxWidth: 480,
          background: 'var(--bubble-user-bg)',
          color: 'var(--bubble-user-text)',
          borderRadius: '16px 16px 4px 16px',
          padding: '10px 16px',
          fontSize: '0.875rem',
          lineHeight: 1.55,
        }}
      >
        {text}
      </div>
    </div>
  )
}
```

---

## Task 10: BotCard component

**File:** Create `src/components/assistant/BotCard.tsx`

Shows: source tag, copy box (DM Mono), char count, "Copy text" + "View rationale" buttons, quick action chips.

```typescript
'use client'

import { useState } from 'react'
import { SourceTag } from './SourceTag'
import type { AgentResponse } from '@/lib/agent/types'

interface Props {
  response: AgentResponse
  versionLabel?: string           // e.g. "V2" — shown when in version context
  isLatest: boolean               // show quick chips only on the latest card
  onViewRationale: () => void
  onQuickAction?: (action: 'shorter' | 'alternatives') => void
}

export function BotCard({ response, versionLabel, isLatest, onViewRationale, onQuickAction }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(response.suggestion).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const iconBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    height: 26,
    padding: '0 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'var(--font-ui)',
    cursor: 'pointer',
    border: 'none',
    transition: 'background 100ms ease',
    whiteSpace: 'nowrap',
  }

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 10,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        maxWidth: '75%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        animation: 'fadeUp 200ms ease-out both',
      }}
    >
      {/* Top row: source tag + version label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <SourceTag sourceType={response.source_type} />
        {versionLabel && (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            {versionLabel}
          </span>
        )}
      </div>

      {/* Copy preview — DM Mono */}
      <div
        style={{
          background: 'var(--surface-input)',
          border: '1px solid var(--border-input)',
          borderRadius: 7,
          padding: '9px 11px',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 1.55,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {response.suggestion}
      </div>

      {/* Meta row: char count + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
          {response.character_count} characters
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Copy text */}
          <button
            onClick={handleCopy}
            style={{
              ...iconBtn,
              background: copied ? 'var(--lib-txt)' : 'var(--color-primary)',
              color: '#fff',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {copied
                ? <path d="M2 8l4 4 8-8" />
                : <><rect x="4" y="4" width="9" height="11" rx="1.5" /><path d="M3 3a1 1 0 0 1 1-1h6l3 3v1" /></>
              }
            </svg>
            {copied ? 'Copied' : 'Copy text'}
          </button>
          {/* View rationale */}
          <button
            onClick={onViewRationale}
            style={{
              ...iconBtn,
              background: 'transparent',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--nav-bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
              <path d="M5 5h6M5 8h6M5 11h4" />
            </svg>
            View rationale
          </button>
        </div>
      </div>

      {/* Quick action chips — latest card only */}
      {isLatest && onQuickAction && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', flexWrap: 'nowrap' }}>
          {(['shorter', 'alternatives'] as const).map((action) => (
            <button
              key={action}
              onClick={() => onQuickAction(action)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 26,
                padding: '0 12px',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--border-tag)',
                background: 'transparent',
                color: 'var(--text-chip)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 100ms ease, border-color 100ms ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--tag-accent-bg)'
                e.currentTarget.style.borderColor = 'var(--border-tag-accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'var(--border-tag)'
              }}
            >
              {action === 'shorter' ? 'Shorter' : 'Alternatives'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Task 11: VersionHistoryPanel component

**File:** Create `src/components/assistant/VersionHistoryPanel.tsx`

381px side panel (380px content + 1px border-left). Slides in from the right. Version tabs newest-first. Collapsible rationale and guidelines sections.

```typescript
'use client'

import { useState, useEffect } from 'react'
import { SourceTag } from './SourceTag'
import type { AgentResponse } from '@/lib/agent/types'

interface Props {
  open: boolean
  responses: AgentResponse[]    // all assistant responses in the session, oldest first
  activeIndex: number           // which version tab is selected (index into responses)
  onClose: () => void
  onSelectVersion: (index: number) => void
}

export function VersionHistoryPanel({ open, responses, activeIndex, onClose, onSelectVersion }: Props) {
  const [rationaleOpen, setRationaleOpen] = useState(true)
  const [guidelinesOpen, setGuidelinesOpen] = useState(true)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Reset collapse state when version changes
  useEffect(() => {
    setRationaleOpen(true)
    setGuidelinesOpen(true)
  }, [activeIndex])

  const active = responses[activeIndex]

  // Tabs are shown newest-first (reverse order)
  const reversedIndices = [...responses.map((_, i) => i)].reverse()

  const panel: React.CSSProperties = {
    width: open ? 381 : 0,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'width 250ms cubic-bezier(0.25, 1, 0.5, 1)',
  }

  const inner: React.CSSProperties = {
    width: 380,
    flexShrink: 0,
    borderLeft: '1px solid var(--border-default)',
    background: 'var(--surface-white)',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-tertiary)',
  }

  function CollapsibleSection({ title, open: isOpen, onToggle, children }: {
    title: string
    open: boolean
    onToggle: () => void
    children: React.ReactNode
  }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button
          onClick={onToggle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span style={labelStyle}>{title}</span>
          <svg
            width="14" height="14" viewBox="0 0 16 16" fill="none"
            stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 200ms ease-out' }}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
        {isOpen && <div style={{ marginTop: 10 }}>{children}</div>}
      </div>
    )
  }

  return (
    <div style={panel}>
      <div style={inner}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 48, padding: '0 10px 0 20px' }}>
            <span style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Version history
            </span>
            <button
              onClick={onClose}
              aria-label="Close version history"
              style={{
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--r-lg)',
                background: 'none', border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                transition: 'background 100ms ease, color 100ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--nav-bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-tertiary)' }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            </button>
          </div>

          {/* Version tabs — newest first, scrollable */}
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingTop: 8, borderBottom: '1px solid var(--tab-rail)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 0 }}>
              {reversedIndices.map((idx) => {
                const versionNumber = idx + 1
                const isActive = idx === activeIndex
                const isLatest = idx === responses.length - 1
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectVersion(idx)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      height: 36,
                      padding: '0 8px',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--tab-active-text)' : 'var(--tab-inactive-text)',
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? '2px solid var(--tab-active-indicator)' : '2px solid transparent',
                      marginBottom: -1,
                      cursor: 'pointer',
                      transition: 'color 100ms ease, border-color 100ms ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    V{versionNumber}
                    {isLatest && (
                      <span style={{
                        padding: '2px 8px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: 'var(--r-full)',
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}>
                        Latest
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        {active && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Source tag */}
            <SourceTag sourceType={active.source_type} />

            {/* Copy preview — DM Mono, color-primary border */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={labelStyle}>Suggested copy</span>
              <div style={{
                background: 'var(--surface-base)',
                border: '1.5px solid var(--color-primary)',
                borderRadius: 'var(--r-lg)',
                padding: '10px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
              }}>
                {active.suggestion}
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {active.character_count} characters
              </span>
            </div>

            <div style={{ height: 1, background: 'var(--border-default)' }} />

            {/* Rationale — collapsible */}
            {active.rationale.length > 0 && (
              <CollapsibleSection title="Rationale" open={rationaleOpen} onToggle={() => setRationaleOpen(!rationaleOpen)}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {active.rationale.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '60ch' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}

            {/* Guidelines met — collapsible */}
            {active.guidelines_met.length > 0 && (
              <CollapsibleSection title="Guidelines met" open={guidelinesOpen} onToggle={() => setGuidelinesOpen(!guidelinesOpen)}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {active.guidelines_met.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--lib-txt)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M2 8l4 4 8-8" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Task 12: LandingCard component

**File:** Create `src/components/assistant/LandingCard.tsx`

Centred on a `surface-base` background with radial gradient atmosphere. "Ask Lorem" heading with italic serif Lorem. Textarea + chips + submit.

```typescript
'use client'

import { useState } from 'react'
import type { AgentRequest } from '@/lib/agent/types'

const TRY_CHIPS = [
  'Review this button copy',
  'Write an error message',
  'Fix this modal text',
  'Shorten this label',
]

interface Props {
  onSubmit: (req: AgentRequest) => void
  loading: boolean
}

export function LandingCard({ onSubmit, loading }: Props) {
  const [input, setInput] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    onSubmit({ input: input.trim() })
  }

  function handleChip(chip: string) {
    setInput(chip)
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `
        radial-gradient(ellipse 60% 50% at 50% 60%, rgba(59,91,165,0.05) 0%, transparent 70%),
        radial-gradient(ellipse 40% 30% at 20% 20%, rgba(26,140,111,0.04) 0%, transparent 60%),
        var(--surface-base)
      `,
      padding: 32,
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'var(--surface-white)',
          border: '1px solid var(--border-default)',
          borderRadius: 16,
          padding: 40,
          boxShadow: 'var(--shadow-sm)',
          animation: 'cardIn 300ms cubic-bezier(0.25, 1, 0.5, 1) both',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {/* Brand icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44, height: 44,
            background: '#1A8C6F',
            borderRadius: 12,
            margin: '0 auto 18px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="17" height="13" rx="3" fill="white" fillOpacity="0.9" />
              <path d="M5 15 L3 20 L8 18.5Z" fill="white" fillOpacity="0.9" />
              <circle cx="6.5" cy="8.5" r="1.25" fill="#1A8C6F" />
              <circle cx="10.5" cy="8.5" r="1.25" fill="#1A8C6F" />
              <circle cx="14.5" cy="8.5" r="1.25" fill="#1A8C6F" />
            </svg>
          </div>

          {/* "Ask Lorem" — DM Serif Display, italic Lorem */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.625rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: 8,
            lineHeight: 1.2,
          }}>
            Ask <em style={{ fontStyle: 'italic', color: 'var(--color-primary)' }}>Lorem</em>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
            Paste a draft or describe what you need — Lorem checks approved patterns first.
          </p>
        </div>

        {/* Textarea */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. "Your session will expire in 5 minutes" or "write a timeout error for a grant form""
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent)
          }}
          style={{
            width: '100%',
            height: 140,
            resize: 'none',
            padding: '12px 14px',
            background: 'var(--surface-base)',
            border: '1.5px solid var(--border-default)',
            borderRadius: 10,
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            lineHeight: 1.55,
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 100ms ease, background 100ms ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)'
            e.currentTarget.style.background = 'var(--surface-white)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.background = 'var(--surface-base)'
          }}
        />

        {/* Try chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginRight: 2 }}>Try</span>
          {TRY_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChip(chip)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 26,
                padding: '0 12px',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--border-tag)',
                background: 'transparent',
                color: 'var(--text-chip)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 100ms ease, border-color 100ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--tag-accent-bg)'
                e.currentTarget.style.borderColor = 'var(--border-tag-accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'var(--border-tag)'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            marginTop: 14,
            width: '100%',
            height: 44,
            background: loading || !input.trim() ? 'var(--color-primary)' : 'var(--color-primary)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: 'var(--r-md)',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'var(--font-ui)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
            opacity: !input.trim() || loading ? 0.5 : 1,
            transition: 'background 100ms ease, opacity 100ms ease',
          }}
          onMouseEnter={(e) => { if (input.trim() && !loading) e.currentTarget.style.background = 'var(--color-primary-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-primary)' }}
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Thinking…
            </>
          ) : (
            'Get suggestions'
          )}
        </button>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
```

---

## Task 13: FollowUpBar component

**File:** Create `src/components/assistant/FollowUpBar.tsx`

Pinned at the bottom of the response thread. Auto-submits on Enter (without Shift). Cmd/Ctrl+Enter also submits.

```typescript
'use client'

import { useState, useRef } from 'react'
import type { AgentRequest } from '@/lib/agent/types'

interface Props {
  onSubmit: (req: AgentRequest) => void
  loading: boolean
  sessionId: string | null
}

export function FollowUpBar({ onSubmit, loading, sessionId }: Props) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    if (!input.trim() || loading) return
    onSubmit({ input: input.trim(), session_id: sessionId ?? undefined })
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    // Auto-grow
    const el = e.target
    el.style.height = '36px'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div style={{
      flexShrink: 0,
      borderTop: '1px solid var(--border-default)',
      background: 'var(--surface-white)',
      padding: '14px 24px',
      display: 'flex',
      gap: 10,
      alignItems: 'flex-end',
    }}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask for more tweaks…"
        rows={1}
        style={{
          flex: 1,
          resize: 'none',
          overflow: 'hidden',
          height: 36,
          padding: '7px 12px',
          background: 'var(--surface-base)',
          border: '1.5px solid var(--border-default)',
          borderRadius: 'var(--r-lg)',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          lineHeight: 1.4,
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color 100ms ease, background 100ms ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary)'
          e.currentTarget.style.background = 'var(--surface-white)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)'
          e.currentTarget.style.background = 'var(--surface-base)'
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || loading}
        style={{
          flexShrink: 0,
          height: 36,
          padding: '0 16px',
          background: 'var(--color-primary)',
          color: 'var(--text-inverse)',
          border: 'none',
          borderRadius: 'var(--r-md)',
          fontSize: '0.875rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
          opacity: !input.trim() || loading ? 0.5 : 1,
          transition: 'background 100ms ease, opacity 100ms ease',
        }}
        onMouseEnter={(e) => { if (input.trim() && !loading) e.currentTarget.style.background = 'var(--color-primary-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-primary)' }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2L2 8l4 2 2 4 6-12z" />
        </svg>
        Send
      </button>
    </div>
  )
}
```

---

## Task 14: AssistantShell component

**File:** Create `src/components/assistant/AssistantShell.tsx`

State machine: `landing` → on first submit → `response`. Manages message thread, session ID, version history panel.

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { LandingCard } from './LandingCard'
import { UserBubble } from './UserBubble'
import { BotCard } from './BotCard'
import { SkeletonLoader } from './SkeletonLoader'
import { FollowUpBar } from './FollowUpBar'
import { VersionHistoryPanel } from './VersionHistoryPanel'
import type { AgentRequest, AgentResponse } from '@/lib/agent/types'

type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; response: AgentResponse }

interface Props {
  products: Array<{ id: string; name: string }>
}

export function AssistantShell({ products: _products }: Props) {
  const [state, setState] = useState<'landing' | 'response'>('landing')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionTitle, setSessionTitle] = useState<string>('')

  const [versionPanelOpen, setVersionPanelOpen] = useState(false)
  const [versionPanelIndex, setVersionPanelIndex] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!loading) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Scroll-to-bottom button visibility
  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 120)
  }

  const assistantResponses = messages
    .filter((m): m is { role: 'assistant'; response: AgentResponse } => m.role === 'assistant')
    .map((m) => m.response)

  async function submit(req: AgentRequest) {
    setLoading(true)
    setError(null)

    // Add user message immediately
    const userText = req.input
    setMessages((prev) => [...prev, { role: 'user', text: userText }])
    if (state === 'landing') {
      setState('response')
      setSessionTitle(userText.slice(0, 60))
    }

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, session_id: sessionId ?? undefined }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`)
      }

      const data = (await res.json()) as AgentResponse
      if (data.session_id) setSessionId(data.session_id)
      setMessages((prev) => [...prev, { role: 'assistant', response: data }])

      // Auto-open version panel to latest if already open
      if (versionPanelOpen) {
        setVersionPanelIndex(assistantResponses.length) // will be length after the new message appends
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1))
      if (messages.length === 0) setState('landing')
    } finally {
      setLoading(false)
    }
  }

  function openVersionPanel(index: number) {
    setVersionPanelIndex(index)
    setVersionPanelOpen(true)
  }

  function handleQuickAction(action: 'shorter' | 'alternatives', currentResponse: AgentResponse) {
    const prompt =
      action === 'shorter'
        ? `Make this shorter: "${currentResponse.suggestion}"`
        : `Give me 3 alternatives for: "${currentResponse.suggestion}"`
    submit({ input: prompt, session_id: sessionId ?? undefined })
  }

  if (state === 'landing') {
    return <LandingCard onSubmit={submit} loading={loading} />
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', background: 'var(--surface-base)' }}>
      {/* Thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative' }}>
        {/* Conversation header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 24px',
          height: 64,
          flexShrink: 0,
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--surface-white)',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {sessionTitle || 'New session'}
            </div>
          </div>
          <button
            onClick={() => {
              const lastIdx = assistantResponses.length - 1
              if (lastIdx >= 0) openVersionPanel(lastIdx)
            }}
            disabled={assistantResponses.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 30,
              padding: '0 10px',
              borderRadius: 'var(--r-md)',
              border: `1px solid ${versionPanelOpen ? 'var(--color-primary)' : 'var(--border-default)'}`,
              background: versionPanelOpen ? 'var(--color-primary-ghost)' : 'transparent',
              color: versionPanelOpen ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: assistantResponses.length === 0 ? 'not-allowed' : 'pointer',
              opacity: assistantResponses.length === 0 ? 0.4 : 1,
              transition: 'background 100ms ease, border-color 100ms ease, color 100ms ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="1" width="14" height="14" rx="2" />
              <path d="M10 1v14" />
            </svg>
            Version history
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border-default) transparent',
          }}
        >
          {messages.map((msg, i) => {
            if (msg.role === 'user') {
              return <UserBubble key={i} text={msg.text} />
            }
            const assistantIndex = messages
              .slice(0, i + 1)
              .filter((m) => m.role === 'assistant').length - 1
            const isLatest = i === messages.length - 1 && !loading
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <BotCard
                  response={msg.response}
                  isLatest={isLatest}
                  onViewRationale={() => openVersionPanel(assistantIndex)}
                  onQuickAction={(action) => handleQuickAction(action, msg.response)}
                />
              </div>
            )
          })}

          {/* Skeleton while loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ maxWidth: '75%', width: '100%' }}>
                <SkeletonLoader />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              padding: '14px 16px',
              background: 'var(--crit-bg)',
              border: '1px solid var(--crit-bd)',
              borderRadius: 'var(--r-lg)',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--crit)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="8" cy="8" r="6" /><path d="M8 5v3.5" /><circle cx="8" cy="10.5" r="0.5" fill="currentColor" />
              </svg>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--crit)', marginBottom: 2 }}>Something went wrong</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--crit-txt)', lineHeight: 1.55 }}>{error}</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              position: 'absolute',
              bottom: 78,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              height: 30,
              padding: '0 12px',
              background: 'var(--surface-white)',
              border: '1px solid var(--border-default)',
              borderRadius: 99,
              boxShadow: 'var(--shadow-md)',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ↓ Scroll to latest
          </button>
        )}

        <FollowUpBar onSubmit={submit} loading={loading} sessionId={sessionId} />
      </div>

      {/* Version history panel */}
      <VersionHistoryPanel
        open={versionPanelOpen}
        responses={assistantResponses}
        activeIndex={versionPanelIndex}
        onClose={() => setVersionPanelOpen(false)}
        onSelectVersion={setVersionPanelIndex}
      />
    </div>
  )
}
```

---

## Task 15: Update editor page

**File:** Update `src/app/(app)/editor/page.tsx`

Server component: fetches products, renders AssistantShell.

```typescript
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
```

- [ ] **Verify:** `npx tsc --noEmit` — no errors
- [ ] **Verify:** `npm run dev` → navigate to `http://localhost:3000/editor` → landing card renders with "Ask Lorem" heading, DM Serif Display font, green brand icon, textarea, chips, submit button

---

## Task 16: SessionList component

**File:** Create `src/components/sidebar/SessionList.tsx`

Rendered inside the app shell sidebar. Shows recent sessions by `created_at` descending. No user filter (open access).

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Session {
  id: string
  name: string | null
  created_at: string
}

export function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('sessions')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setSessions(data)
      })
  }, [])

  if (sessions.length === 0) return null

  return (
    <div style={{ padding: '0 8px 4px' }}>
      {sessions.map((s) => (
        <button
          key={s.id}
          style={{
            width: '100%',
            height: 30,
            padding: '0 10px',
            borderRadius: 'var(--r-md)',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.8125rem',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            textAlign: 'left',
            background: 'none',
            border: 'none',
            overflow: 'hidden',
            transition: 'background 100ms ease, color 100ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--nav-bg-hover)'
            e.currentTarget.style.color = 'var(--nav-text-active)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color = 'var(--text-tertiary)'
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
            {s.name ?? 'Untitled session'}
          </span>
        </button>
      ))}
    </div>
  )
}
```

Update `src/app/(app)/layout.tsx` to:
1. Replace ad-hoc sidebar HTML with design-token styles
2. Add `SessionList` under an "ASSISTANT HISTORY" section label

```tsx
import Link from 'next/link'
import { SessionList } from '@/components/sidebar/SessionList'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Topbar */}
      <header style={{
        height: 48,
        flexShrink: 0,
        background: 'var(--surface-base)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 24, height: 24,
            background: '#1A8C6F',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="17" height="13" rx="3" fill="white" fillOpacity="0.9" />
              <path d="M5 15 L3 20 L8 18.5Z" fill="white" fillOpacity="0.9" />
              <circle cx="6.5" cy="8.5" r="1.25" fill="#1A8C6F" />
              <circle cx="10.5" cy="8.5" r="1.25" fill="#1A8C6F" />
              <circle cx="14.5" cy="8.5" r="1.25" fill="#1A8C6F" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Lorem</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>UX Writing Assistant</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <a
            href="#"
            style={{
              height: 30, padding: '0 10px',
              display: 'flex', alignItems: 'center',
              borderRadius: 'var(--r-md)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'background 100ms ease, color 100ms ease',
            }}
          >
            Changelog
          </a>
          <a
            href="https://form.gov.sg/6a1537f8b7792d70c10a0d30"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              height: 30, padding: '0 10px',
              display: 'flex', alignItems: 'center',
              borderRadius: 'var(--r-md)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'background 100ms ease, color 100ms ease',
            }}
          >
            Feedback
          </a>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: 228,
          flexShrink: 0,
          background: 'var(--surface-base)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Workspace nav */}
          <nav style={{ padding: '12px 12px 4px', flexShrink: 0 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', padding: '2px 10px 6px' }}>
              Workspace
            </div>
            {[
              { href: '/editor',  label: 'Assistant',
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
              { href: '/library', label: 'Library',
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 36,
                  padding: '0 10px',
                  borderRadius: 'var(--r-md)',
                  color: 'var(--nav-text-resting)',
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  textDecoration: 'none',
                  transition: 'background 100ms ease, color 100ms ease',
                }}
              >
                {icon}
                {label}
              </Link>
            ))}
          </nav>

          <div style={{ height: 1, background: 'var(--border-default)', margin: '6px 12px', flexShrink: 0 }} />

          {/* Assistant history */}
          <div style={{ padding: '2px 10px 6px 22px', flexShrink: 0, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)' }}>
            Assistant history
          </div>
          <SessionList />
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--surface-white)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Verify:** `npx tsc --noEmit` — no errors

---

## Task 17: Run all tests + smoke check

- [ ] **Run all tests**

```bash
npx vitest
```

Expected: all tests in `tests/lib/agent/lookup.test.ts` and `tests/lib/agent/prompt.test.ts` pass.

- [ ] **Type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Smoke check — end-to-end submission**

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000` → redirects to `/editor` → Ask Lorem card renders
3. Type "Review this button copy: Submit form" → click "Get suggestions"
4. Loading skeleton appears briefly
5. User bubble appears right-aligned with the submitted text
6. Bot card appears with source tag (pill shape), copy box (monospace font), char count, "Copy text" + "View rationale" buttons, "Shorter" / "Alternatives" chips
7. Click "Copy text" → button briefly shows "Copied" → clipboard contains suggestion text
8. Click "View rationale" → version history panel slides in from right at 381px
9. Panel shows: source tag, copy box (color-primary border), rationale list, guidelines list
10. Click X on panel → it slides closed
11. Type a follow-up in the bottom bar → Send → new user bubble + bot card appends
12. "Version history" button in header now shows V1 and V2 tabs (newest first)
13. Check Supabase dashboard: `sessions` table has one row (no user_id), `session_messages` has user + assistant messages

---

## Self-review

| Requirement | Task |
|---|---|
| DM Sans UI font, DM Mono copy strings, DM Serif Display wordmark | Task 1 |
| CSS custom property design tokens | Task 1 |
| Agent types with ElementType, SourceType, Confidence | Task 3 |
| Library lookup: product-first, global fallback, max 5, deduped | Task 4 |
| Prompt builder: foundations ordered, patterns, library matches | Task 5 |
| Agent route: no auth, no user_id on session | Task 6 |
| SourceTag: pill shape, design token colours, mandatory icon | Task 7 |
| Skeleton: shimmer gradient, matching prototype structure | Task 8 |
| UserBubble: bubble-user-bg, right-aligned, 16px/16px/4px/16px radius | Task 9 |
| BotCard: surface-card bg, source tag, DM Mono copy box, char count, copy + rationale buttons, quick chips | Task 10 |
| VersionHistoryPanel: 381px slide-in, version tabs newest-first, Latest badge, collapsible rationale + guidelines | Task 11 |
| LandingCard: surface-white card, radial gradient bg, DM Serif Display heading, chips, submit | Task 12 |
| FollowUpBar: auto-grow textarea, Enter to submit, surface-white bg | Task 13 |
| AssistantShell: landing → response state transition, thread management, session ID tracking | Task 14 |
| Editor page: server component, products from Supabase | Task 15 |
| SessionList: no user filter, recent sessions by created_at | Task 16 |
| App shell: topbar 48px, sidebar 228px, Changelog + Feedback links, design tokens throughout | Task 16 |

---

*Plan written: 2026-05-26 (v2 — complete rewrite from two-panel to chat interface)*
