# UX Writing Agent — Design Spec

**Date:** 2026-05-12
**Status:** Approved for implementation planning

---

## What it is

A web-based AI writing assistant for UX practitioners working on Singapore government digital products. Practitioners paste copy to review or describe what they need, and the agent responds with suggestions, rationale, and a confidence score.

The core value proposition is **consistency through library-first lookup**: the agent always checks a managed library of approved copy strings before generating anything new. Every suggestion is labelled with its source so practitioners know exactly how much weight to give it.

---

## Users

**Primary:** UX writers, content designers, product designers working on Singapore government digital services

**Secondary:** Product owners, developers who occasionally need copy guidance

**Access model:**
- `.gov.sg` email: self-serve signup via Supabase Auth (no admin approval needed)
- Non-`.gov.sg` users (contractors, vendors, agency partners): admin-invited via email invite link
- Default: all users can access all products
- Admins can restrict specific users to specific products

**Roles:**
- `practitioner` — default on signup. Can submit copy, browse library, manage own sessions
- `admin` — promoted by another admin. Full library management, user management, usage analytics

---

## System architecture

```
Users (.gov.sg self-serve or admin invite)
        ↕
Next.js frontend
  ├── Copy editor (two-panel layout)
  ├── Library browser
  ├── Session history
  ├── Auth pages
  └── Admin panel
        ↕
Next.js API routes
  ├── Agent service         ← orchestrates library lookup + Claude call
  └── (Content API)         ← Supabase REST, auto-generated from DB schema
        ↕
  ┌─────────────────┐    ┌──────────────┐
  │ Supabase        │    │ Claude API   │
  │ (PostgreSQL)    │    │              │
  │ · copy_entries  │    │ Receives:    │
  │ · patterns      │    │ copy/desc +  │
  │ · foundations   │    │ context +    │
  │ · products      │    │ library hits │
  │ · profiles      │    │ + patterns + │
  │ · sessions      │    │ foundations  │
  │ · Supabase Auth │    │              │
  └─────────────────┘    └──────────────┘
```

**Key design decision:** The library search is a deterministic database query, not an AI retrieval step. Claude never decides what's in the library — it only receives the query results. This guarantees source labels are always accurate.

---

## Database schema

### `products`
```
id            uuid PK
name          text
slug          text UNIQUE
description   text
is_active     boolean DEFAULT true
created_at    timestamptz
```

### `foundations`
Writing guidelines the agent loads during validation.
```
id            uuid PK
type          enum (voice, style, accessibility, localisation, terminology)
scope         enum (global, product)
product_id    uuid FK → products (nullable, null = global)
content       text  ← markdown
updated_at    timestamptz
```

### `patterns`
Element-type-specific copy rules. Fallback when no library match exists.
```
id            uuid PK
element_type  enum (buttons, errors, forms, alerts, modals, navigation, content, states)
scope         enum (global, product)
product_id    uuid FK → products (nullable)
content       text  ← markdown
updated_at    timestamptz
```

### `copy_entries`
The main library. Queried first on every agent request.
```
id                    uuid PK
element_type          enum (buttons, errors, forms, alerts, modals, navigation, content, states)
scope                 enum (global, product)
product_id            uuid FK → products (nullable)
copy                  text or JSONB  ← JSONB for multi-part copy (modals: header + body + button)
context               text
rationale             text
tags                  text[]
tone                  enum (neutral, friendly, serious, empathetic, urgent, positive, cautionary)
journey_stage         enum (onboarding, task-completion, error-recovery, success, decision-point, information)
status                enum (active, deprecated, draft, review) DEFAULT active
usage_examples        text[]
alternatives          JSONB
character_count       integer
accessibility_notes   text
validated_by_research boolean DEFAULT false
added_at              timestamptz
updated_at            timestamptz
```

### `profiles`
Extends Supabase Auth users.
```
id                    uuid FK → auth.users PK
display_name          text
agency                text
role                  enum (practitioner, admin) DEFAULT practitioner
access_all_products   boolean DEFAULT true
created_at            timestamptz
```

### `user_product_access`
Populated only when `access_all_products = false`. Rows here define what the user can see.
```
user_id       uuid FK → profiles
product_id    uuid FK → products
PRIMARY KEY (user_id, product_id)
```

### `sessions`
```
id            uuid PK
user_id       uuid FK → profiles
product_id    uuid FK → products (nullable)
is_shared     boolean DEFAULT false
share_token   uuid (nullable, generated on share)
created_at    timestamptz
```

### `session_messages`
Individual exchanges within a session.
```
id                uuid PK
session_id        uuid FK → sessions
role              enum (user, assistant)
content           JSONB  ← full structured response
source_type       enum (library_match, adapted, ai_generated, ai_generated_low_confidence)
copy_entry_ids    uuid[]  ← library entries referenced in this response
created_at        timestamptz
```

**Row-level security** is enforced throughout. Supabase RLS policies handle product access restrictions (`access_all_products` + `user_product_access`) at the database level — no custom filtering in application code.

---

## Agent logic

### Workflow (every request)

```
1. RECEIVE
   · Input text (copy to review OR description of what's needed)
   · Context (product_id, element_type, journey_stage) — all optional

2. INFER (if context fields are empty)
   · Claude infers element_type and intent (review vs generate) from input text
   · Inferred values are flagged in the response: "Element type: Modal (inferred)"

3. QUERY LIBRARY
   · If product known: query copy_entries WHERE product_id = ? AND element_type = ? AND status = 'active'
   · Then: query copy_entries WHERE scope = 'global' AND element_type = ? AND status = 'active'
   · Pass matching entries to Claude as reference

4. LOAD GUIDELINES
   · Load patterns WHERE element_type = inferred/selected AND (scope = 'global' OR product_id = ?)
   · Load foundations WHERE (scope = 'global' OR product_id = ?) — voice, accessibility, style, localisation, terminology

5. CALL CLAUDE
   · Input: user text + context + library matches + patterns + foundations
   · Claude determines: review or generate based on input text
   · Claude returns: structured JSON response

6. RETURN STRUCTURED RESPONSE
   · Suggested copy
   · Rationale (bullet points)
   · Guidelines met
   · Source label (see below)
   · Confidence (High / Medium-High / Medium / Low)
   · Inferred context flags (if applicable)
```

### Source labels

| Label | Meaning |
|---|---|
| `Library match` | Copy is used as-is from the library |
| `Adapted from library` | Library entry found, copy adjusted for context |
| `AI-generated` | No library match; generated from patterns + foundations |
| `AI-generated · lower confidence` | No library match and no pattern for this element type; foundations only |

### Review vs generate detection

The agent infers intent from the input text. No explicit mode toggle in the UI.

- **Review:** Input reads as finished or draft copy ("Your session has timed out due to inactivity")
- **Generate:** Input reads as a description or request ("write a timeout modal for a grant application")

Response format adapts accordingly:
- **Review** → before/after comparison + issues flagged + suggestion
- **Generate** → suggestion(s) only, no before/after

Both modes produce the same result panel structure: suggested copy, rationale, source label, confidence, shortlist/edit controls.

### Fallback chain

```
Product library match → Global library match → Element patterns + foundations → Foundations only
     (highest confidence)                                               (lowest confidence)
```

---

## Editor UI

### Layout

Two-panel, side by side:
- **Left panel:** context selectors + text input
- **Right panel:** agent response

### Left panel

- **Product** dropdown (optional) — list from `products` table, filtered by user's access
- **Element type** dropdown (optional) — buttons, errors, forms, alerts, modals, navigation, content, states
- **Journey stage** dropdown (optional) — onboarding, task-completion, error-recovery, success, decision-point, information
- **Text area** — placeholder: *"Paste copy to review, or describe what you need"*
- **Submit button** — single action, label: "Review / Generate"

All context fields are optional. Leaving them blank triggers inference.

### Right panel

Appears after submission. Contains:

- **Source label** — Library match / Adapted / AI-generated / AI-generated · lower confidence
- **Inferred context** — shown if element type or product was inferred, not selected: *"Element type: Modal (inferred)"*
- **Suggested copy** — the main recommendation, editable inline
- **Character count** — shown next to copy
- **Action bar:**
  - ⭐ Shortlist — saves this option to a shortlist within the session
  - ✏️ Edit — makes the suggested copy inline-editable
  - More options — triggers agent to generate 2–3 alternatives, displayed inline below the main suggestion as collapsible cards. Each alternative has its own shortlist and edit controls.
- **Rationale** — collapsible, shown by default. Bullet-point list referencing specific guidelines
- **Guidelines met** — compact list of standards satisfied (accessibility, voice, style, etc.)
- **Confidence** — High / Medium-High / Medium / Low with brief explanation

### Session features

- Session history in a left sidebar (accessible from all pages)
- A new session starts when the user clicks "New session" or first arrives at the editor. One session = one conversation thread, typically scoped to one product and task.
- Sessions are private by default
- Share button generates a read-only link via `share_token` — accessible without login

### Library browser

A separate page (linked from the sidebar) where practitioners can browse the copy library without submitting copy for review. Useful for discovering what already exists before writing.

- Filter by product, element type, status, scope
- Search by copy text or tags
- Read-only — practitioners cannot edit entries from here (admin panel only)
- Each entry shows: copy, context, rationale, source (global or product), status

---

## Admin panel

Four sections, accessible only to `admin` role users.

### Copy library
- Browse all entries across products and element types
- Filter by: product, element type, status, scope
- Search by copy text, tags, context
- Add new entries (form)
- Edit existing entries
- Change status (active → deprecated, draft → active, etc.)
- Import JSON (bulk load — same format as future content API)

### Foundations & patterns
- Edit global and product-specific foundations (voice, style, accessibility, localisation, terminology)
- Edit global and product-specific patterns per element type
- Markdown editor with preview

### Products
- Register new products (name, slug, description)
- View coverage per product: how many foundations, patterns, and library entries each product has
- Deactivate products

### Users & usage
- View all registered users
- Invite user by email (bypasses `.gov.sg` domain restriction)
- Promote practitioner → admin
- Restrict product access: toggle `access_all_products`, multi-select allowed products
- Deactivate accounts
- Usage stats:
  - Total users, active users
  - Sessions this month
  - Library hit rate (library_match + adapted / total requests)
  - Most requested element types
  - Most used products

---

## Content API

Supabase's auto-generated REST API is available on the `copy_entries`, `products`, `foundations`, and `patterns` tables from day one. Write access is restricted to `admin` role via row-level security.

This is the stub for future programmatic content updates — external systems can push library entries via the same API that the admin panel uses internally. No additional work required to expose it.

---

## Out of scope (v1)

| Feature | Reason |
|---|---|
| Multi-product comparison in one session | Reduces focus; one product per session maintains clear context |
| Auto-applying copy without human review | Government content requires practitioner judgment |
| Marketing copy (campaigns, social, email) | Different standards and patterns; out of scope until v1 is validated |
| Long-form content (guides, articles) | Different structure and tone rules; future phase |
| Figma / design tool integration | Requires proven value first; v2+ feature |
| Real-time collaboration | Sharing via read-only link covers the immediate need |
| SEO / meta copy | Not UX copy; different purpose and standards |
| Non-Singapore government standards | V1 is Singapore-specific; future versions may support other governments |
| Feedback collection / adaptive learning | Requires user base and data infrastructure; post-launch feature |

---

## Open questions

None at time of writing. All design decisions resolved during brainstorming.

---

*Spec written: 2026-05-12*
*Brainstormed with: Carrie Lee*
