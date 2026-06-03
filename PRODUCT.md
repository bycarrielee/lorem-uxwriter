# Lorem — Product Overview

**Version:** 1.0.0
**Last updated:** 2026-05-27

---

## What it is

Lorem is an AI-assisted UX copy tool for Singapore government digital services. It helps UX writers, content designers, and product designers write copy that meets approved patterns and guidelines — by checking an approved library first, then generating suggestions grounded in voice, style, and accessibility rules.

**Users:** Practitioners at `.gov.sg` agencies and invited contractors. Open access (no login) in the current release.

---

## Core features

### Assistant
The main screen. Users paste a draft or describe what they need; Lorem returns copy suggestions with provenance labels showing where each suggestion came from.

- **Source tiers:** Library match → Adapted from library → AI-generated → AI-generated (lower confidence)
- **Response cards** show the suggested copy, character count, and quick actions (Shorter, Alternatives)
- **View rationale** opens the version history panel — a right side panel on desktop, bottom sheet on mobile
- **Version history** tracks all versions in a session with descending tab order (newest first)
- **Input scope validation** rejects off-topic prompts before calling the agent
- **Session history** in the sidebar; "View all" navigates to the full history screen
- **Follow-up input** for conversational iteration within a session

### Library
Approved copy strings from the Singapore government UX writing corpus. Two-pane browser: list filtered by element type (Forms, Modals, Buttons, Errors) on the left; detail with copy, metadata, and screenshot on the right. Status badges: Approved / Draft.

### Changelog
In-product release notes, feature request voting, and roadmap. Driven by `changelog-data.js` — edit that file to publish new releases or update roadmap items. Three tabs: Releases, Feature requests, Roadmap.

---

## Content model

### Foundations (global guidelines fed to the agent)
| Type | Coverage |
|---|---|
| Voice | Tone by context, writing principles |
| Style | Capitalisation, dates, numbers, punctuation, active voice, contractions |
| Accessibility | Plain language, button/link text, form labels, WCAG 2.1 AA |
| Localisation | Text expansion, frontloading, icons, translation resources |
| Terminology | Official agency names, scheme names (legally correct usage) |

### Patterns (element-type-specific copy rules)
Alerts, buttons, errors, forms, links, long-form, modals, push notifications, release notes, states.

### Copy library
Structured copy entries with: copy text (JSON), context, rationale, tags, tone, journey stage, character count, status (`active` / `draft`). Scoped to `global` or a specific product.

### Products (currently seeded)
MyLegacy, SupportGoWhere. Product-specific guidelines and library entries are planned but not yet shipped.

---

## Technical architecture

| Layer | Technology |
|---|---|
| Frontend (production) | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Frontend (prototype) | `editor.html`, `changelog.html`, `dashboard-prototype-v2.html` |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth — deferred; app is currently open access |
| AI | Claude via Anthropic API (uses the `lorem-uxwriter` agent skill) |
| Testing | Vitest |

**Identity (pre-auth):** `client_id` UUID generated on first load, stored in `localStorage` as `lorem_client_id`. Persists until login ships; pre-login and post-login data can be correlated by matching `client_id`.

**API key management:** The app runs on a shared Anthropic API key with a configurable USD budget limit. When the shared budget approaches or hits the limit, users are prompted to supply their own Claude API key, stored in `localStorage` only.

---

## Database schema

| Table | Purpose |
|---|---|
| `products` | Product registry (MyLegacy, SupportGoWhere, …) |
| `foundations` | Global and product-scoped writing guidelines by type |
| `patterns` | Element-type copy rules (buttons, errors, modals, …) |
| `copy_entries` | Approved copy strings with context, rationale, status |
| `sessions` | Editor sessions (when auth ships) |
| `session_messages` | Per-message history within sessions |
| `app_sessions` | Analytics — session start/end for retention tracking |
| `suggestion_interactions` | Analytics — copy actions (copied, rationale viewed, follow-up sent, …) |
| `api_calls` | Analytics — Anthropic call log (status, duration, tokens, cost) |
| `events` | Analytics — generic overflow (library nav, votes, …) |
| `budget_usage` | Cumulative Anthropic API spend in USD |

**Privacy rules (hard constraints):**
- No copy text or prompt text written to any analytics table
- No PII in `events.properties`
- `client_id` is a random UUID with no connection to a real identity until voluntary login

---

## Current release status

**v1.0.0 — shipped Q2 2026**
- Assistant + Library + Changelog
- Global foundation guidelines (all five types)
- Global copy pattern guidelines (all element types above)
- Form field label library entries suitable for global usage
- Glossary: Singapore government agencies, scheme and service names

**Designed, not yet built**
- API key swap + budget tracking (`docs/superpowers/specs/2026-05-26-api-key-swap-design.md`)
- Metrics / usage analytics (`docs/superpowers/specs/2026-05-26-metrics-design.md`)

**Roadmap (later)**
- Product-specific guidelines and library entries
- Content API
- Login (to save conversations across sessions)

---

## Key files

| File | Purpose |
|---|---|
| `editor.html` | Prototype — source of truth for UI implementation |
| `changelog-data.js` | Edit to publish new releases, feature requests, roadmap items |
| `design-system/MASTER.md` | Authoritative design spec — layouts, components, behaviour |
| `design-system/DESIGN.md` | Token reference for Claude Code — CSS variables, type scale, components |
| `app/` | Next.js production app |
| `content/` | Source content files (drop-in zone for guidelines and patterns) |
| `docs/superpowers/specs/` | Feature design specs |
| `docs/superpowers/plans/` | Implementation plans |

---

## How to introduce a new feature

1. Write a spec in `docs/superpowers/specs/YYYY-MM-DD-feature-name.md`
2. Write an implementation plan in `docs/superpowers/plans/YYYY-MM-DD-feature-name.md`
3. Implement against the spec
4. Update `design-system/MASTER.md` and `design-system/DESIGN.md` if new components or tokens are introduced
5. Update `editor.html` prototype if the feature touches existing screens
6. Add a release entry to `changelog-data.js` — this is the in-product announcement surface (Changelog tab in the app)
7. Commit
