# API Key Swap — Design Spec

**Date:** 2026-05-26
**Status:** Approved
**Scope:** Beta release — reactive flow only. Proactive settings page deferred to a future release.

---

## Overview

Lorem runs on a shared Anthropic API key. When that key approaches or hits its budget limit, users need a way to keep working using their own Claude API key. This spec covers the budget tracking system, the two warning states, and the key entry flow.

---

## Constraints

- **Reactive only (beta).** No settings page or pre-configuration. The flow triggers in response to budget state, not user initiative.
- **Shared budget.** The Anthropic API key is shared across all users. Budget is tracked globally, not per user.
- **Client-side key storage.** User API keys are stored in `localStorage` only — never sent to or stored on the server outside of the in-flight API request.
- **Cost tracked in USD.** Anthropic bills in USD. The budget limit env var is set in USD. No currency conversion layer.

---

## Environment Variables

```
ANTHROPIC_BUDGET_LIMIT_USD=37     # S$50 equivalent at time of writing — update as needed
ANTHROPIC_BUDGET_WARNING_PCT=80   # Warn all users when this % of budget is consumed
```

---

## Budget Tracking

### Database

New table: `budget_usage` — single row, append-only increment.

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | Always `1` |
| `cost_usd` | `numeric(10,6)` | Cumulative spend; incremented after every successful Anthropic call |
| `updated_at` | `timestamptz` | |

### Cost calculation

After each Anthropic API call, the agent route receives `usage.input_tokens` and `usage.output_tokens` in the response. Cost is calculated against current Claude pricing and added to `cost_usd` via an atomic increment.

### Budget status

Computed server-side from `cost_usd` and env vars:

| Status | Condition |
|---|---|
| `ok` | `cost_usd < limit × (warning_pct / 100)` |
| `warning` | `cost_usd >= limit × (warning_pct / 100)` and `cost_usd < limit` |
| `exceeded` | `cost_usd >= limit` |

---

## API

### `GET /api/budget`

Authenticated. Returns current budget status to the client.

**Response:**
```json
{
  "used_usd": 12.40,
  "limit_usd": 37,
  "status": "ok" | "warning" | "exceeded"
}
```

Fails silently on the client — if unreachable, default to `status: "ok"` and do not block the editor.

### `POST /api/agent` (updated)

Accepts an optional `user_api_key` field in the request body.

- If `user_api_key` is present: use it for the Anthropic call, skip budget increment.
- If absent: use `process.env.ANTHROPIC_API_KEY`, increment `budget_usage.cost_usd` after a successful call.
- Budget DB write failures are logged server-side and do not fail the response.

**Response** now includes a `budget` field:
```json
{
  "suggestion": "...",
  "source_type": "...",
  ...
  "budget": {
    "status": "ok" | "warning" | "exceeded",
    "used_usd": 12.40,
    "limit_usd": 37
  }
}
```

---

## Client-Side State

`EditorShell` manages budget state:

```
budgetStatus: "ok" | "warning" | "exceeded"
apiKeyModalOpen: boolean
```

**On mount:** `GET /api/budget` → set `budgetStatus`.

**After each agent response:** use `response.budget.status` to update `budgetStatus` in place — no extra fetch.

**localStorage key:** `lorem_api_key` — read before every agent submission, included in request body if present.

---

## UI States

### Normal — under 80%

No banner. Editor fully functional. Budget check runs silently on load.

### Warning — 80–99%

Amber banner at the top of the editor content area (above the left panel, full width). Dismissible.

> **Banner copy:** "Lorem is approaching its shared capacity. [Add your API key](#) to keep working."

- "Add your API key" opens the API key modal directly.
- Submit button remains active.
- Banner re-appears on next page load if not dismissed and budget is still in warning state.

### Exceeded — 100%

Red banner at the top of the editor content area. Not dismissible.

> **Banner copy:** "Lorem's shared capacity has been reached. Add your API key to continue."

- Submit button is visually disabled (`opacity`, `cursor: not-allowed`) but remains clickable.
- Clicking the disabled submit button opens the API key modal.
- If `lorem_api_key` exists in `localStorage`, the button is active and the banner is still shown (user is using their own key).

---

## API Key Modal

Triggered by: clicking the disabled submit button, or the "Add your API key" link in the warning banner.

**Header:** "Lorem's shared capacity has been reached"
**Subtitle:** "Add your own Claude API key to keep working. It's stored in your browser only."

**Key input:**
- Type: `password` with show/hide toggle
- Font: JetBrains Mono
- Hint: "Get your key from equip.tech.gov.sg. Never shared with the Lorem server."

**Actions:** "Cancel" (ghost) — "Save and continue" (primary)

**On save:**
1. Key written to `localStorage` as `lorem_api_key`
2. Modal closes
3. If triggered by a blocked submit: pending request fires automatically with the saved key
4. Submit button becomes active; banner remains visible

---

## Error Handling

| Scenario | Location | Message |
|---|---|---|
| User key invalid (401) | Inline — below key input in modal | "That key didn't work. Check it and try again." |
| User key rate-limited | Inline — editor right panel | "Your key has hit its own rate limit. Try again shortly." |
| User key out of credits | Inline — editor right panel | "Your API key has run out of credits. Check equip.tech.gov.sg to find out when your quota resets." |
| Shared key fails mid-call | Existing agent error handling | No budget increment |
| Budget DB write fails | Server-side log only | Response succeeds regardless |
| `GET /api/budget` fails on load | Silent | Default to `status: "ok"`, do not block editor |

---

## New Files

```
src/
├── app/
│   └── api/
│       └── budget/
│           └── route.ts          ← GET /api/budget
├── components/
│   └── editor/
│       ├── BudgetBanner.tsx      ← warning / exceeded banner
│       └── ApiKeyModal.tsx       ← key entry modal
supabase/
└── migrations/
    └── 004_budget_usage.sql      ← budget_usage table
```

**Modified files:**
- `src/app/api/agent/route.ts` — accept `user_api_key`, increment budget, return `budget` in response
- `src/components/editor/EditorShell.tsx` — budget state, modal state, fetch on mount
- `src/lib/agent/types.ts` — add `budget` to `AgentResponse`

---

## Out of Scope (Beta)

- **Proactive settings page** — users cannot pre-configure their key before hitting the limit. Planned for a future release.
- **Per-user budget allocation** — budget is global. No per-user tracking or quotas.
- **Admin budget dashboard** — cost visibility for admins deferred to Plan 3 (Admin panel).
- **Usage analytics** — logging prompts, responses, and session activity is a separate spec.
