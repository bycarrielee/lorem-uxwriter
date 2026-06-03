# Metrics Tracking Design

**Date:** 2026-05-26
**Status:** Approved

---

## Goal

Track product usage, suggestion value, and API health for lorem-webapp — with no dependency on user login — to support product decisions, operational monitoring, and stakeholder reporting.

## Priority questions

1. **Are people actually using it?** — active users, session frequency, retention
2. **Is the AI output useful?** — copy suggestions copied, rationale viewed, follow-ups sent, quick actions used
3. **Are things breaking?** — API errors, timeouts, cost per call

## Architecture

**Stack:** Next.js API routes + Supabase (Postgres)

**Data access:** Full Postgres access via Supabase Table Editor, SQL Editor, `psql`, or REST API. Export to CSV at any time with no restrictions.

---

## Identity model

Every browser client gets a `client_id` — a UUID v4 generated on first app load and persisted in `localStorage` under the key `lorem_client_id`. This is the primary identity for all events.

```
localStorage: lorem_client_id = "<uuid-v4>"
```

When login is added, `user_id` (from Supabase Auth) is stored separately. Both IDs are attached to every event row:

- `client_id` — always present
- `user_id` — nullable; populated once auth exists

This means all metrics work before login ships. Pre-login and post-login behaviour can be correlated by matching `client_id` across both periods. No identity merging or stitching required.

---

## Schema

### `app_sessions`

Tracks app-level sessions for retention and frequency analysis (priority A).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `client_id` | UUID | NOT NULL | from localStorage |
| `user_id` | UUID | NULL | FK to `auth.users` when login exists |
| `started_at` | TIMESTAMPTZ | NOT NULL, default `now()` | on app load |
| `ended_at` | TIMESTAMPTZ | NULL | on page unload |
| `duration_seconds` | INT | NULL | computed client-side on close (`Math.round((Date.now() - startedAt) / 1000)`), sent in the PATCH body |

Index on `client_id` and `started_at` for retention queries.

---

### `suggestion_interactions`

One row per user action on an AI suggestion (priority B). Never stores prompt text or suggestion text.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `client_id` | UUID | NOT NULL | |
| `user_id` | UUID | NULL | |
| `session_id` | UUID | NULL, FK → `app_sessions.id` | |
| `interaction` | TEXT | NOT NULL | see values below |
| `source_tier` | TEXT | NULL | `library`, `adapted`, `ai`, `ai_low` |
| `char_count` | INT | NULL | suggestion character length only — no copy text |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | |

**`interaction` values:**

| Value | Trigger |
|---|---|
| `copied` | "Copy text" clicked and clipboard write succeeds |
| `rationale_opened` | "View rationale" clicked and panel opens |
| `follow_up_sent` | Follow-up message submitted |
| `quick_action_shorter` | "Shorter" pill clicked |
| `quick_action_alternatives` | "Alternatives" pill clicked |

Index on `client_id`, `interaction`, and `created_at`.

---

### `api_calls`

One row per Anthropic API call, populated server-side automatically (priority E). Never stores prompt text or response text.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `client_id` | UUID | NOT NULL | passed from client in request body |
| `user_id` | UUID | NULL | |
| `session_id` | UUID | NULL, FK → `app_sessions.id` | |
| `model` | TEXT | NULL | e.g. `claude-sonnet-4-5` |
| `status` | TEXT | NOT NULL | `success`, `error`, `timeout` |
| `error_code` | TEXT | NULL | HTTP status or Anthropic error type |
| `duration_ms` | INT | NULL | wall time of the API call |
| `input_tokens` | INT | NULL | from Anthropic API response |
| `output_tokens` | INT | NULL | from Anthropic API response |
| `cost_usd` | NUMERIC(10,6) | NULL | calculated from token counts at current rates |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | |

Index on `status`, `client_id`, and `created_at`.

---

### `events`

Generic overflow for any interaction outside the three priority domains. Used for future expansion (library usage, feature adoption, navigation patterns) without requiring a schema migration.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `client_id` | UUID | NOT NULL | |
| `user_id` | UUID | NULL | |
| `session_id` | UUID | NULL, FK → `app_sessions.id` | |
| `event` | TEXT | NOT NULL | e.g. `library_tab_changed`, `vote_cast` |
| `properties` | JSONB | NULL | arbitrary typed data |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | |

Initial candidate events (non-priority, logged opportunistically):
- `library_tab_changed` — `{ tab: 'forms' | 'modals' | 'buttons' | 'errors' }`
- `vote_cast` — `{ request_id: string, voted: boolean }`
- `screen_navigated` — `{ screen: 'assistant' | 'library' | 'changelog' }`

---

## Instrumentation

### Utility module

All tracking calls go through `lib/analytics.ts`. This keeps the API surface small and isolates any future backend swap to one file.

```
lib/analytics.ts
  — getClientId()        reads/generates client_id from localStorage
  — startSession()       POST /api/metrics/session → returns session_id
  — endSession()         PATCH /api/metrics/session/:id with ended_at
  — trackInteraction()   POST /api/metrics/interaction
  — trackEvent()         POST /api/metrics/event
```

`session_id` is stored in React context (set by the root layout on mount) so components can attach it without prop-drilling.

All calls are fire-and-forget (`void fetch(...)`). Tracking never blocks user-facing actions.

---

### Session lifecycle

Fires from `app/layout.tsx`.

| Trigger | Action |
|---|---|
| App mounts (`useEffect`) | Call `getClientId()`, then `startSession()`. Store `session_id` in context. |
| `window.beforeunload` | Call `endSession()` with current timestamp. |

Note: `beforeunload` is unreliable on iOS Safari. `duration_seconds` may be null for mobile sessions. This is acceptable for a desktop-primary government tool.

---

### Suggestion interactions

Fires from assistant screen components after the action succeeds.

| User action | Call |
|---|---|
| "Copy text" clicked, clipboard write succeeds | `trackInteraction('copied', { source_tier, char_count })` |
| "View rationale" clicked, panel opens | `trackInteraction('rationale_opened', { source_tier })` |
| Follow-up message submitted | `trackInteraction('follow_up_sent')` |
| "Shorter" pill clicked | `trackInteraction('quick_action_shorter')` |
| "Alternatives" pill clicked | `trackInteraction('quick_action_alternatives')` |

---

### API call logging

Fires entirely server-side inside `POST /api/agent` (the Next.js route that calls Anthropic). No client involvement.

```
POST /api/agent
  → call Anthropic
  → in finally block: INSERT INTO api_calls (status, duration_ms, tokens, cost_usd, ...)
  → return response to client
```

`client_id` and `session_id` are passed from the client in the request body and written to the `api_calls` row. Errors and successes are both logged. No prompt or response text is written.

---

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/metrics/session` | POST | Create session row, return `session_id` |
| `/api/metrics/session/[id]` | PATCH | Set `ended_at` on close |
| `/api/metrics/interaction` | POST | Log suggestion interaction |
| `/api/metrics/event` | POST | Log generic event |

`api_calls` rows are inserted directly from `/api/agent` — no separate metrics route.

All metrics routes return `204 No Content` on success. Client ignores failures silently.

---

## Privacy rules

These are hard constraints, not guidelines.

1. **No copy text stored.** `suggestion_interactions` captures `char_count` (length only). `api_calls` captures token counts only. No prompt, draft, or suggestion text is ever written to any metrics table.
2. **No PII in `events.properties`.** The `properties` JSONB column must never contain names, email addresses, NRIC, or any identifying information.
3. **`client_id` is not PII.** It is a random UUID with no connection to a real identity until the user voluntarily logs in.
4. **Supabase Row Level Security (RLS).** Metrics tables are write-only from the client (via service role key on API routes). Direct client-side writes to Supabase are not permitted.

---

## Example queries

**Weekly active clients (last 8 weeks):**
```sql
SELECT
  date_trunc('week', started_at) AS week,
  count(distinct client_id) AS active_clients
FROM app_sessions
WHERE started_at > now() - interval '8 weeks'
GROUP BY 1
ORDER BY 1;
```

**Copy rate — suggestions copied vs generated:**
```sql
SELECT
  count(*) FILTER (WHERE interaction = 'copied') AS copied,
  count(*) FILTER (WHERE interaction = 'rationale_opened') AS rationale_opened,
  count(*) FILTER (WHERE interaction = 'follow_up_sent') AS follow_up_sent
FROM suggestion_interactions
WHERE created_at > now() - interval '30 days';
```

**Error rate and cost (last 7 days):**
```sql
SELECT
  status,
  count(*) AS calls,
  round(avg(duration_ms)) AS avg_ms,
  sum(cost_usd) AS total_cost_usd
FROM api_calls
WHERE created_at > now() - interval '7 days'
GROUP BY status;
```
