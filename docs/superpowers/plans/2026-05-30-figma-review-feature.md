# Figma Review Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing flat-table FigmaReviewCard with a compact summary card in chat + a 580px slide-in panel (desktop) and bottom sheet (mobile), each supporting per-string suggestions, quick replies, discuss-in-chat, remove/undo, and PDF export.

**Architecture:** Client-side `ReviewString[]` state lives in `AssistantShell`, derived from `FigmaReviewRow[]` when a Figma review API response arrives. The `FigmaReviewPanel` slides in on the right inside `.response-root`, the same layout pattern as `VersionHistoryPanel`. The `FigmaReviewSheet` is a fixed-position bottom sheet on mobile (<=768px). Discuss-in-chat tracks a `pendingDiscussIndex`; when the subsequent agent response returns `is_copy_response: true`, the suggestion is appended to the matching string in the panel.

**Tech Stack:** Next.js 16, React 19, TypeScript, globals.css (CSS custom properties), Vitest + React Testing Library

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/src/types/figma-review.ts` | **Create** | ReviewString + Suggestion types, convertFigmaRows, getVisibleStrings, calcProgress |
| `app/tests/types/figma-review.test.ts` | **Create** | Unit tests for pure functions |
| `app/src/app/globals.css` | **Modify** | Add `/* -- Figma review -- */` section at end |
| `app/src/components/assistant/FigmaReviewCard.tsx` | **Replace** | Compact summary card (frame name, stat pills, progress bar, action buttons) |
| `app/src/components/assistant/FigmaReviewPanel.tsx` | **Create** | 580px desktop slide-in panel with tabs, search, table, detail rows, PDF export |
| `app/src/components/assistant/FigmaReviewSheet.tsx` | **Create** | Mobile bottom sheet (<=768px) with card-per-string nav |
| `app/src/components/assistant/ReviewToast.tsx` | **Create** | Fixed-position toast with optional undo action |
| `app/src/components/assistant/FollowUpBar.tsx` | **Modify** | Add prefillValue, focusTrigger, onPrefillConsumed props |
| `app/src/components/assistant/AssistantShell.tsx` | **Modify** | Wire review state, open/close logic, discuss-in-chat |

---

## Task 1: Types and pure utility functions

**Files:**
- Create: `app/src/types/figma-review.ts`
- Create: `app/tests/types/figma-review.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// app/tests/types/figma-review.test.ts
import { describe, it, expect } from 'vitest'
import { convertFigmaRows, getVisibleStrings, calcProgress } from '@/types/figma-review'
import type { FigmaReviewRow } from '@/lib/agent/types'

const sampleRows: FigmaReviewRow[] = [
  { elementName: '[1] Page title', original: 'Create Admin Group', proposed: 'Create admin group', changed: true, rationale: 'Sentence case applied.' },
  { elementName: '[2] Form label', original: 'Group Name', proposed: 'Group name', changed: true, rationale: 'Sentence case.' },
  { elementName: '[3] Button', original: 'Cancel', proposed: 'Cancel', changed: false, rationale: 'No change needed.' },
]

describe('convertFigmaRows', () => {
  it('produces one ReviewString per row', () => {
    expect(convertFigmaRows(sampleRows)).toHaveLength(3)
  })

  it('sets status=no-change when row.changed is false', () => {
    expect(convertFigmaRows(sampleRows)[2].status).toBe('no-change')
  })

  it('sets status=suggestion when row.changed is true', () => {
    expect(convertFigmaRows(sampleRows)[0].status).toBe('suggestion')
  })

  it('omits original for unchanged rows', () => {
    expect(convertFigmaRows(sampleRows)[2].original).toBeUndefined()
  })

  it('sets original for changed rows', () => {
    expect(convertFigmaRows(sampleRows)[0].original).toBe('Create Admin Group')
  })

  it('creates one initial suggestion per string', () => {
    const r = convertFigmaRows(sampleRows)[0]
    expect(r.suggestions).toHaveLength(1)
    expect(r.suggestions[0].via).toBe('initial')
    expect(r.suggestions[0].copy).toBe('Create admin group')
  })

  it('sets removed=false and chatAnchor=null', () => {
    const r = convertFigmaRows(sampleRows)[0]
    expect(r.removed).toBe(false)
    expect(r.chatAnchor).toBeNull()
  })
})

describe('getVisibleStrings', () => {
  const strings = convertFigmaRows(sampleRows)

  it('excludes removed strings', () => {
    const copy = strings.map((s, i) => i === 0 ? { ...s, removed: true } : s)
    expect(getVisibleStrings(copy, 'all', '')).toHaveLength(2)
  })

  it('filters by status', () => {
    const r = getVisibleStrings(strings, 'no-change', '')
    expect(r).toHaveLength(1)
    expect(r[0].status).toBe('no-change')
  })

  it('filters by search query on element name', () => {
    expect(getVisibleStrings(strings, 'all', 'Page title')).toHaveLength(1)
  })

  it('filters by search query on suggestion copy', () => {
    expect(getVisibleStrings(strings, 'all', 'admin group')).toHaveLength(1)
  })
})

describe('calcProgress', () => {
  it('returns needsReview count and total', () => {
    const { needsReview, total } = calcProgress(convertFigmaRows(sampleRows))
    expect(total).toBe(3)
    expect(needsReview).toBe(2)
  })

  it('excludes removed strings from total', () => {
    const strings = convertFigmaRows(sampleRows)
    strings[0].removed = true
    expect(calcProgress(strings).total).toBe(2)
  })

  it('pct is 100 when no strings need review', () => {
    const rows = [{ elementName: '[1] x', original: 'x', proposed: 'x', changed: false, rationale: 'ok' }]
    expect(calcProgress(convertFigmaRows(rows)).pct).toBe(100)
  })
})
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
cd app && npx vitest run tests/types/figma-review.test.ts
```

Expected: FAIL — `Cannot find module '@/types/figma-review'`

- [ ] **Step 3: Create `app/src/types/figma-review.ts`**

```ts
import type { FigmaReviewRow } from '@/lib/agent/types'

export type ReviewStatus = 'library' | 'adapted' | 'suggestion' | 'no-change'
export type SuggestionVia = 'initial' | 'quick-reply' | 'chat'

export type Suggestion = {
  id: number
  copy: string
  rationale: string
  source: ReviewStatus
  via: SuggestionVia
  libId: string | null
}

export type ReviewString = {
  i: number
  el: string
  status: ReviewStatus
  removed: boolean
  original?: string
  chatAnchor: string | null
  suggestions: Suggestion[]
}

let _nextId = 1
export function nextSuggestionId(): number { return _nextId++ }

export function convertFigmaRows(rows: FigmaReviewRow[]): ReviewString[] {
  return rows.map((row, i) => {
    const status: ReviewStatus = row.changed ? 'suggestion' : 'no-change'
    return {
      i,
      el: row.elementName,
      status,
      removed: false,
      original: row.changed ? row.original : undefined,
      chatAnchor: null,
      suggestions: [{
        id: nextSuggestionId(),
        copy: row.proposed,
        rationale: row.rationale,
        source: status,
        via: 'initial',
        libId: null,
      }],
    }
  })
}

export function getVisibleStrings(
  strings: ReviewString[],
  filter: ReviewStatus | 'all',
  query: string
): ReviewString[] {
  const q = query.trim().toLowerCase()
  return strings.filter((s) => {
    if (s.removed) return false
    if (filter \!== 'all' && s.status \!== filter) return false
    if (\!q) return true
    return (
      s.el.toLowerCase().includes(q) ||
      s.suggestions.some((sg) => sg.copy.toLowerCase().includes(q)) ||
      (s.original?.toLowerCase().includes(q) ?? false)
    )
  })
}

export function calcProgress(strings: ReviewString[]): {
  needsReview: number
  total: number
  pct: number
} {
  const active = strings.filter((s) => \!s.removed)
  const needsReview = active.filter((s) => s.status \!== 'no-change').length
  const total = active.length
  const pct = total > 0 ? Math.round(((total - needsReview) / total) * 100) : 100
  return { needsReview, total, pct }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd app && npx vitest run tests/types/figma-review.test.ts
```

Expected: All 11 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/types/figma-review.ts app/tests/types/figma-review.test.ts
git commit -m "feat: add ReviewString types and pure utility functions with tests"
```

---

## Task 2: CSS additions to globals.css

**Files:**
- Modify: `app/src/app/globals.css` (append after line 2522, the last line)

All class names use `fr-` (frame review) and `fp-` (figma panel) prefixes to avoid collisions.

- [ ] **Step 1: Append the Figma review CSS section**

Open `app/src/app/globals.css` and add the following **at the very end** of the file:

```css
/* ── Figma review ─────────────────────────────────────────────────── */

/* Stat pills in the summary card */
.fr-card {
  align-self: flex-start;
  background: var(--surface-card);
  border-radius: 14px 14px 14px 4px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: fit-content;
  min-width: 260px;
  max-width: min(400px, 85%);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  animation: fadeUp 200ms ease-out both;
}
.fr-card-head { display: flex; flex-direction: column; gap: 3px; }
.fr-card-title {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-primary);
}
.fr-card-title svg { width: 13px; height: 13px; color: var(--text-secondary); flex-shrink: 0; }
.fr-card-subtitle { font-size: 12px; color: var(--text-secondary); }
.fr-stats { display: flex; gap: 6px; flex-wrap: wrap; }
.fr-stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 500;
}
.fr-stat-pill .fr-dot { width: 5px; height: 5px; border-radius: 50%; }
.fr-stat-lib    { background: var(--lib-bg);  color: var(--lib-txt);        border: 1px solid var(--lib-bd); }
.fr-stat-lib    .fr-dot { background: var(--lib-txt); }
.fr-stat-adapted { background: var(--tag-accent-bg); color: var(--tag-accent-text); border: 1px solid var(--tag-accent-border); }
.fr-stat-adapted .fr-dot { background: var(--tag-accent-text); }
.fr-stat-suggestion { background: var(--ai-bg); color: var(--ai-txt); border: 1px solid var(--ai-bd); }
.fr-stat-suggestion .fr-dot { background: var(--ai-txt); }
.fr-stat-ok { background: var(--surface-base); color: var(--text-secondary); border: 1px solid var(--border-default); }
.fr-stat-ok .fr-dot { background: var(--text-secondary); }
.fr-progress-bg {
  height: 4px;
  background: var(--border-default);
  border-radius: 9999px;
  overflow: hidden;
}
.fr-progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 9999px;
  transition: width 300ms ease;
}
.fr-progress-label { font-size: 11px; color: var(--text-secondary); margin-top: 5px; }
.fr-divider { height: 1px; background: var(--border-input); margin: 0 -14px; }
.fr-card-actions { display: flex; gap: 8px; }
.btn-review-all {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 12px;
  border-radius: 6px;
  border: none;
  background: var(--color-primary);
  color: #fff;
  font-size: 12.5px;
  font-weight: 500;
  font-family: var(--font-ui);
  cursor: pointer;
  transition: background 100ms ease;
}
.btn-review-all:hover { background: var(--color-primary-hover); }
.btn-review-library {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1.5px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-size: 12.5px;
  font-weight: 500;
  font-family: var(--font-ui);
  cursor: pointer;
  transition: background 100ms ease;
}
.btn-review-library:hover { background: var(--color-primary-ghost); }

/* Figma panel — desktop slide-in */
.figma-panel {
  width: 0;
  flex-shrink: 0;
  background: var(--surface-white);
  border-left: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 250ms cubic-bezier(0.25,1,0.5,1);
}
.figma-panel.is-open { width: 580px; }
.fp-topbar {
  height: 48px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}
.fp-title-row { display: flex; align-items: center; gap: 10px; }
.fp-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.fp-export-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid var(--border-default);
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-ui);
  transition: all 100ms ease;
}
.fp-export-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-ghost); }
.fp-close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 100ms ease;
}
.fp-close:hover { background: var(--surface-base); }
.fp-tabs {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.fp-tabs::-webkit-scrollbar { display: none; }
.fp-tab {
  padding: 10px 4px;
  margin-right: 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  margin-bottom: -1px;
  transition: color 100ms ease, border-color 100ms ease;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: var(--font-ui);
}
.fp-tab:hover { color: var(--text-primary); }
.fp-tab.active { color: var(--text-primary); border-bottom-color: var(--color-primary); font-weight: 600; }
.fp-tab-count {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 9999px;
  background: var(--surface-base);
  color: var(--text-secondary);
}
.fp-tab.active .fp-tab-count { background: var(--color-primary); color: #fff; }
.fp-search {
  padding: 10px 20px;
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
  position: relative;
}
.fp-search-icon { position: absolute; left: 32px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-secondary); }
.fp-search-input {
  width: 100%;
  background: var(--surface-base);
  border: 1px solid var(--border-default);
  border-radius: 7px;
  padding: 7px 30px 7px 32px;
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 150ms ease;
}
.fp-search-input:focus { border-color: var(--color-primary); }
.fp-search-input::placeholder { color: var(--text-secondary); }
.fp-search-clear {
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: var(--text-secondary);
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
}
.fp-search-clear.visible { display: flex; }
.fp-table-wrap { flex: 1; overflow-y: auto; min-height: 0; }
.fp-table { width: 100%; border-collapse: collapse; }
.fp-table thead {
  position: sticky;
  top: 0;
  background: var(--surface-base);
  z-index: 2;
}
.fp-table thead th {
  padding: 9px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;
}
.fp-table thead th:first-child { width: 28px; padding-left: 16px; }
.fp-th-element { width: 130px; }
.fp-th-status { width: 130px; }
.fp-th-del { width: 48px; text-align: right; padding-right: 16px \!important; }
.fp-row {
  border-bottom: 1px solid var(--border-default);
  cursor: pointer;
  transition: background 100ms ease;
}
.fp-row:hover { background: var(--surface-base); }
.fp-row.is-selected { background: var(--color-primary-ghost); }
.fp-row.is-library    { border-left: 2px solid var(--lib-txt); }
.fp-row.is-adapted    { border-left: 2px solid var(--tag-accent-text); }
.fp-row.is-suggestion { border-left: 2px solid var(--ai-txt); }
.fp-row.is-no-change  { border-left: 2px solid transparent; }
.fp-table td {
  padding: 10px 12px;
  font-size: 12.5px;
  vertical-align: middle;
  line-height: 1.45;
}
.fp-table td:first-child { padding-left: 16px; color: var(--text-secondary); font-size: 11px; }
.fp-td-el { font-family: var(--font-mono); font-size: 11.5px; color: var(--text-secondary); }
.fp-multi-badge {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-ghost);
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 5px;
}
.fp-from-chat-indicator::after {
  content: ' · from chat';
  font-size: 10px;
  color: var(--color-primary);
  font-weight: 500;
}
.fp-spill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.fp-spill .fp-d { width: 5px; height: 5px; border-radius: 50%; }
.fp-spill-library    { background: var(--lib-bg);  color: var(--lib-txt);  border: 1px solid var(--lib-bd); }
.fp-spill-library    .fp-d { background: var(--lib-txt); }
.fp-spill-adapted    { background: var(--tag-accent-bg); color: var(--tag-accent-text); border: 1px solid var(--tag-accent-border); }
.fp-spill-adapted    .fp-d { background: var(--tag-accent-text); }
.fp-spill-suggestion { background: var(--ai-bg);  color: var(--ai-txt);   border: 1px solid var(--ai-bd); }
.fp-spill-suggestion .fp-d { background: var(--ai-txt); }
.fp-spill-no-change  { background: var(--surface-base); color: var(--text-secondary); border: 1px solid var(--border-default); }
.fp-spill-no-change  .fp-d { background: var(--text-secondary); }
.fp-remove-btn {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: 1px solid var(--crit-bd);
  background: var(--crit-bg);
  color: var(--crit-txt);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
  margin: 0 auto;
  flex-shrink: 0;
}
.fp-remove-btn:hover { background: var(--crit-txt); color: #fff; border-color: var(--crit-txt); }
.fp-detail-cell { padding: 0 12px 16px 16px; background: var(--surface-base); }
.fp-detail-inner { display: flex; flex-direction: column; gap: 12px; padding-top: 12px; }
.fp-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.fp-original-box {
  background: var(--surface-white);
  border: 1px solid var(--border-input);
  border-radius: 6px;
  padding: 8px 10px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text-secondary);
}
.fp-suggestions-list { display: flex; flex-direction: column; gap: 8px; }
.fp-suggestion-item {
  background: var(--surface-white);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  overflow: hidden;
}
.fp-suggestion-item.from-chat { border-color: var(--color-primary); }
.fp-sugg-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-bottom: 1px solid var(--border-input);
  background: var(--surface-base);
}
.fp-sugg-source {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
  flex: 1;
}
.fp-sugg-source.chat-src { color: var(--color-primary); }
.fp-sugg-remove-btn {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
  flex-shrink: 0;
}
.fp-sugg-remove-btn:hover { background: var(--crit-bg); color: var(--crit-txt); }
.fp-sugg-remove-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.fp-sugg-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.fp-sugg-copy-row { display: flex; align-items: flex-start; gap: 7px; }
.fp-sugg-copy-text {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
  background: var(--surface-input);
  border: 1px solid var(--border-input);
  border-radius: 6px;
  padding: 8px 10px;
  color: var(--text-primary);
}
.fp-copy-btn {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: none;
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 100ms ease;
  margin-top: 2px;
}
.fp-copy-btn:hover { background: var(--color-primary-hover); }
.fp-sugg-rationale { font-size: 12px; line-height: 1.55; color: var(--text-secondary); }
.fp-lib-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--lib-txt);
  background: var(--lib-bg);
  border: 1px solid var(--lib-bd);
  padding: 2px 8px;
  border-radius: 9999px;
  text-decoration: none;
}
.fp-lib-link:hover { opacity: 0.8; }
.fp-from-chat-bar {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  padding: 5px 9px;
  background: var(--color-primary-ghost);
  border: 1px solid rgba(59,91,165,0.18);
  border-radius: 6px;
}
.fp-from-chat-bar.visible { display: flex; }
.fp-from-chat-label {
  font-size: 11.5px;
  color: var(--color-primary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
.fp-show-chat-btn {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-ui);
  padding: 0;
  display: flex;
  align-items: center;
  gap: 3px;
}
.fp-show-chat-btn:hover { text-decoration: underline; }
.fp-detail-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 4px;
  flex-wrap: wrap;
}
.fp-detail-quick { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.fp-detail-quick-label { font-size: 11px; font-weight: 500; color: var(--text-secondary); }
.fp-dchip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 9999px;
  border: 1px solid var(--border-tag);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-chip);
  background: transparent;
  cursor: pointer;
  font-family: var(--font-ui);
  transition: background 100ms ease;
}
.fp-dchip:hover { background: var(--tag-accent-bg); border-color: var(--tag-accent-border); }
.fp-dchip.loading { opacity: 0.5; pointer-events: none; }
.fp-discuss-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-ui);
  padding: 0;
  transition: color 100ms ease;
}
.fp-discuss-link:hover { color: var(--color-primary); }
.fp-no-results {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  display: none;
}
.fp-no-results.visible { display: block; }

/* Discuss reply card in chat thread */
.discuss-reply-card {
  align-self: flex-start;
  background: var(--surface-card);
  border-radius: 14px 14px 14px 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  width: fit-content;
  max-width: min(480px, 75%);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  animation: cardIn 250ms cubic-bezier(0.25,1,0.5,1) both;
}
.discuss-context-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}
.discuss-context-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10.5px;
  font-weight: 600;
  background: var(--surface-base);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}
.panel-updated-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  background: var(--lib-bg);
  color: var(--lib-txt);
  border: 1px solid var(--lib-bd);
  width: fit-content;
}
.rejected-box {
  background: var(--crit-bg);
  border: 1px solid var(--crit-bd);
  border-radius: 7px;
  padding: 9px 11px;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--crit-txt);
}

/* Toast */
.fr-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(16px);
  background: var(--text-primary);
  color: #fff;
  padding: 9px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  z-index: 300;
  opacity: 0;
  transition: opacity 200ms ease, transform 200ms ease;
  pointer-events: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 10px;
}
.fr-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
.fr-toast-undo {
  color: #7CB9FF;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 13px;
  padding: 0;
}

/* Mobile bottom sheet */
.fr-sheet-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(30,45,58,0.4);
  backdrop-filter: blur(2px);
  z-index: 50;
}
.fr-sheet-backdrop.is-open { display: block; }
.fr-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: var(--surface-white);
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  transform: translateY(100%);
  transition: transform 280ms cubic-bezier(0.25,1,0.5,1);
  box-shadow: 0 -8px 40px rgba(0,0,0,0.14);
}
.fr-sheet.is-open { transform: translateY(0); }
.fr-sheet-handle { display: flex; justify-content: center; padding: 12px 0 8px; flex-shrink: 0; }
.fr-sheet-handle-bar { width: 36px; height: 4px; border-radius: 9999px; background: var(--border-default); }
.fr-sheet-header { padding: 0 20px 12px; border-bottom: 1px solid var(--border-default); flex-shrink: 0; }
.fr-sheet-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.fr-sheet-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.fr-sheet-title-actions { display: flex; align-items: center; gap: 8px; }
.fr-sheet-close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fr-sheet-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
.fr-sheet-tabs::-webkit-scrollbar { display: none; }
.fr-stab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid var(--border-default);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-ui);
  white-space: nowrap;
  transition: all 100ms ease;
  flex-shrink: 0;
  background: transparent;
}
.fr-stab.active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
.fr-stab-count { font-size: 11px; font-weight: 600; padding: 0 5px; border-radius: 9999px; background: rgba(0,0,0,0.1); }
.fr-stab.active .fr-stab-count { background: rgba(255,255,255,0.25); }
.fr-sheet-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
.fr-sheet-search { padding: 10px 20px; border-bottom: 1px solid var(--border-default); flex-shrink: 0; position: relative; }
.fr-sheet-search-input {
  width: 100%;
  background: var(--surface-base);
  border: 1px solid var(--border-default);
  border-radius: 7px;
  padding: 8px 12px 8px 32px;
  font-family: var(--font-ui);
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
}
.fr-sheet-search-icon { position: absolute; left: 32px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-secondary); }
.fr-sheet-search-input::placeholder { color: var(--text-secondary); }
.fr-sheet-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
}
.fr-nav-arrow {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 100ms ease;
}
.fr-nav-arrow:hover { background: var(--surface-base); }
.fr-nav-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
.fr-nav-info { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.fr-nav-pos { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.fr-nav-el { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); }
.fr-sheet-card { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
.fr-sheet-card.anim      { animation: frCardRight 180ms ease both; }
.fr-sheet-card.anim-left { animation: frCardLeft  180ms ease both; }
@keyframes frCardRight { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes frCardLeft  { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
.fr-sc-label { font-size: 10px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 5px; }
.fr-sheet-actions {
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border-default);
  flex-shrink: 0;
  background: var(--surface-white);
}
.fr-sheet-btn {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-ui);
  cursor: pointer;
  transition: background 100ms ease;
}
.fr-sheet-btn-primary { background: var(--color-primary); color: #fff; border: none; }
.fr-sheet-btn-primary:hover { background: var(--color-primary-hover); }
.fr-sheet-btn-secondary { background: var(--surface-base); color: var(--text-secondary); border: 1px solid var(--border-default); }

/* Print stylesheet for PDF export */
@media print {
  .figma-panel { width: 100% \!important; display: block \!important; border: none; overflow: visible; }
  .fp-table-wrap { overflow: visible; }
  .fp-th-del,
  .fp-remove-btn,
  .fp-sugg-remove-btn,
  .fp-copy-btn,
  .fp-detail-footer,
  .fp-topbar,
  .fp-tabs,
  .fp-search,
  .fp-no-results { display: none \!important; }
  .fp-detail-cell { background: white; }
  .fp-suggestion-item { break-inside: avoid; page-break-inside: avoid; }
  .fr-print-header { display: block \!important; }
}
.fr-print-header {
  display: none;
  padding: 20px 0 16px;
  border-bottom: 2px solid var(--text-primary);
  margin-bottom: 16px;
}
.fr-print-title { font-size: 20px; font-weight: 700; }
.fr-print-meta { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
```

- [ ] **Step 2: Verify no token names were mis-typed**

Search globals.css to confirm these tokens exist (all should return results):
```bash
cd app && grep -c "--lib-bg\|--lib-txt\|--lib-bd\|--ai-bg\|--ai-txt\|--ai-bd\|--crit-bg\|--crit-bd\|--crit-txt\|--tag-accent-bg\|--tag-accent-text\|--tag-accent-border" src/app/globals.css
```

Expected: non-zero count

- [ ] **Step 3: Commit**

```bash
git add app/src/app/globals.css
git commit -m "style: add Figma review CSS section to globals"
```

---

## Task 3: ReviewToast component

**Files:**
- Create: `app/src/components/assistant/ReviewToast.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/src/components/assistant/ReviewToast.tsx
'use client'

interface Props {
  message: string | null
  actionLabel?: string
  onAction?: () => void
}

export function ReviewToast({ message, actionLabel, onAction }: Props) {
  return (
    <div className={`fr-toast${message ? ' show' : ''}`} role="status" aria-live="polite">
      {message}
      {message && actionLabel && onAction && (
        <button className="fr-toast-undo" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/assistant/ReviewToast.tsx
git commit -m "feat: add ReviewToast component"
```

---

## Task 4: Replace FigmaReviewCard with compact summary card

**Files:**
- Modify: `app/src/components/assistant/FigmaReviewCard.tsx` (replace entire file)

The new card shows frame name, stat pills, progress bar, and action buttons. It receives live `ReviewString[]` state so the progress bar updates as strings are removed.

- [ ] **Step 1: Replace `app/src/components/assistant/FigmaReviewCard.tsx`**

```tsx
'use client'

import type { ReviewString, ReviewStatus } from '@/types/figma-review'
import { calcProgress } from '@/types/figma-review'

interface Props {
  frameName: string
  strings: ReviewString[]
  onOpen: (filter: ReviewStatus | 'all') => void
}

type StatPillDef = { status: ReviewStatus; label: string; cssClass: string }
const STAT_PILLS: StatPillDef[] = [
  { status: 'library',   label: 'library match',  cssClass: 'fr-stat-lib' },
  { status: 'adapted',   label: 'adapted',         cssClass: 'fr-stat-adapted' },
  { status: 'suggestion',label: 'guidelines-based',cssClass: 'fr-stat-suggestion' },
  { status: 'no-change', label: 'no issues',        cssClass: 'fr-stat-ok' },
]

export function FigmaReviewCard({ frameName, strings, onOpen }: Props) {
  const { needsReview, total, pct } = calcProgress(strings)
  const active = strings.filter((s) => \!s.removed)

  return (
    <div className="fr-card">
      <div className="fr-card-head">
        <div className="fr-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
            <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
            <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
            <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
            <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
          </svg>
          {frameName}
        </div>
        <div className="fr-card-subtitle">Figma frame</div>
      </div>

      <div className="fr-stats">
        {STAT_PILLS.map(({ status, label, cssClass }) => {
          const count = active.filter((s) => s.status === status).length
          if (count === 0) return null
          return (
            <div key={status} className={`fr-stat-pill ${cssClass}`}>
              <span className="fr-dot" />
              {count} {label}
            </div>
          )
        })}
      </div>

      <div>
        <div className="fr-progress-bg">
          <div className="fr-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="fr-progress-label">
          {needsReview === 0
            ? `All ${total} strings approved`
            : `${needsReview} of ${total} copy string${needsReview === 1 ? '' : 's'} need${needsReview === 1 ? 's' : ''} review`}
        </div>
      </div>

      <div className="fr-divider" />

      <div className="fr-card-actions">
        <button className="btn-review-all" onClick={() => onOpen('all')}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="14" height="12" rx="2" stroke="white" strokeWidth="1.4" />
            <path d="M10 2v12" stroke="white" strokeWidth="1.4" />
          </svg>
          Review all
        </button>
        <button className="btn-review-library" onClick={() => onOpen('library')}>
          Library match first
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the app compiles**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors related to FigmaReviewCard

- [ ] **Step 3: Commit**

```bash
git add app/src/components/assistant/FigmaReviewCard.tsx
git commit -m "feat: replace FigmaReviewCard flat table with compact summary card"
```

---

## Task 5: FigmaReviewPanel (desktop slide-in panel)

**Files:**
- Create: `app/src/components/assistant/FigmaReviewPanel.tsx`

This is the 580px slide-in desktop panel. It has tabs, a search bar, a table with expandable detail rows, per-string suggestions, quick reply chips, discuss-in-chat, remove/undo, and PDF export. It uses the sentinel `expandedIdx === -99` to force all rows open for print.

- [ ] **Step 1: Create `app/src/components/assistant/FigmaReviewPanel.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { ReviewString, Suggestion, nextSuggestionId, getVisibleStrings } from '@/types/figma-review'

type TabKey = 'all' | 'library' | 'adapted' | 'suggestion' | 'no-change'

interface Props {
  open: boolean
  frameName: string
  strings: ReviewString[]
  onStringsChange: (strings: ReviewString[]) => void
  onClose: () => void
  onDiscussInChat: (el: string, stringIndex: number) => void
  showToast: (msg: string, actionLabel?: string, onAction?: () => void) => void
}

function spill(status: ReviewString['status']) {
  const map: Record<string, [string, string]> = {
    library:    ['Library match',     'fp-spill fp-spill-library'],
    adapted:    ['Adapted',           'fp-spill fp-spill-adapted'],
    suggestion: ['Guidelines-based',  'fp-spill fp-spill-suggestion'],
    'no-change':['No issues',         'fp-spill fp-spill-no-change'],
  }
  const [label, cls] = map[status] ?? ['—', 'fp-spill fp-spill-no-change']
  return <span className={cls}><span className="fp-spill-dot" />{label}</span>
}

function srcLabel(via: Suggestion['via']) {
  if (via === 'chat') return <span className="fp-sugg-source chat-src">From chat</span>
  if (via === 'quick-reply') return <span className="fp-sugg-source">Quick reply</span>
  return <span className="fp-sugg-source">Initial suggestion</span>
}

export function FigmaReviewPanel({ open, frameName, strings, onStringsChange, onClose, onDiscussInChat, showToast }: Props) {
  const [tab, setTab] = useState<TabKey>('all')
  const [query, setQuery] = useState('')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [loadingQR, setLoadingQR] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setExpandedIdx(null)
      setQuery('')
      setTab('all')
    }
  }, [open])

  const visible = getVisibleStrings(strings, tab, query)

  function countByStatus(s: ReviewString['status'] | 'all') {
    const active = strings.filter(x => !x.removed)
    if (s === 'all') return active.length
    return active.filter(x => x.status === s).length
  }

  function handleRowClick(idx: number) {
    setExpandedIdx(prev => (prev === idx ? null : idx))
  }

  function handleRemoveString(strIdx: number) {
    const prev = strings[strIdx]
    const updated = strings.map((s, i) => i === strIdx ? { ...s, removed: true } : s)
    onStringsChange(updated)
    if (expandedIdx === strIdx) setExpandedIdx(null)
    showToast('String removed', 'Undo', () => {
      onStringsChange(strings.map((s, i) => i === strIdx ? { ...s, removed: prev.removed } : s))
    })
  }

  function handleRemoveSuggestion(strIdx: number, suggId: number) {
    const str = strings[strIdx]
    if (str.suggestions.length <= 1) return
    const updated = strings.map((s, i) =>
      i === strIdx ? { ...s, suggestions: s.suggestions.filter(sg => sg.id !== suggId) } : s
    )
    onStringsChange(updated)
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    showToast('Copied')
  }

  function handleQuickReply(strIdx: number, kind: 'alternative' | 'shorter' | 'clearer') {
    const key = `${strIdx}-${kind}`
    setLoadingQR(key)
    setTimeout(() => {
      const label = kind === 'alternative' ? 'Alt.' : kind === 'shorter' ? 'Shorter' : 'Clearer'
      const str = strings[strIdx]
      const baseCopy = str.suggestions[str.suggestions.length - 1]?.copy ?? ''
      const newSugg: Suggestion = {
        id: nextSuggestionId(),
        copy: `${baseCopy} (${label})`,
        rationale: `${kind.charAt(0).toUpperCase() + kind.slice(1)} version generated via quick reply.`,
        source: 'suggestion',
        via: 'quick-reply',
        libId: null,
      }
      const updated = strings.map((s, i) =>
        i === strIdx ? { ...s, suggestions: [...s.suggestions, newSugg] } : s
      )
      onStringsChange(updated)
      setLoadingQR(null)
      showToast('Suggestion added')
    }, 700)
  }

  function handleDiscuss(strIdx: number) {
    const str = strings[strIdx]
    onDiscussInChat(str.el, strIdx)
    onClose()
  }

  function exportPDF() {
    const prev = expandedIdx
    setExpandedIdx(-99)
    setTimeout(() => {
      window.print()
      setExpandedIdx(prev)
    }, 50)
  }

  return (
    <div className={`fp-panel${open ? ' fp-panel-open' : ''}`} aria-label="Figma review panel">
      <div className="fp-print-header">
        <div className="fp-print-title">Figma Review — {frameName}</div>
        <div className="fp-print-meta">Exported from Lorem &middot; {new Date().toLocaleDateString()}</div>
      </div>

      <div className="fp-topbar">
        <div className="fp-title-row">
          <span className="fp-title">Figma review</span>
          <button className="fp-export-btn" onClick={exportPDF}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Export PDF
          </button>
        </div>
        <button className="fp-close" onClick={onClose} aria-label="Close panel">&#10005;</button>
      </div>

      <div className="fp-tabs" role="tablist">
        {(['all', 'library', 'adapted', 'suggestion', 'no-change'] as const).map(t => {
          const labels: Record<TabKey, string> = {
            all: 'All', library: 'Library match', adapted: 'Adapted',
            suggestion: 'Guidelines-based', 'no-change': 'No issues',
          }
          return (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`fp-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {labels[t]} <span className="fp-tab-count">{countByStatus(t)}</span>
            </button>
          )
        })}
      </div>

      <div className="fp-search-bar">
        <svg className="fp-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input
          className="fp-search-input"
          placeholder="Search element or copy..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className="fp-search-clear" onClick={() => setQuery('')} aria-label="Clear search">&#10005;</button>
        )}
      </div>

      <div className="fp-table-wrap">
        {visible.length === 0 && (
          <div className="fp-no-results visible">No strings match your search</div>
        )}
        <table className="fp-table">
          <thead>
            <tr>
              <th></th>
              <th className="fp-th-element">Element</th>
              <th>Copy</th>
              <th className="fp-th-status">Status</th>
              <th className="fp-th-actions"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map(str => {
              const isExpanded = expandedIdx === str.i || expandedIdx === -99
              const topSugg = str.suggestions[str.suggestions.length - 1]
              return (
                <>
                  <tr
                    key={`row-${str.i}`}
                    className={`fp-row fp-row-${str.status}${isExpanded ? ' fp-row-selected' : ''}`}
                    onClick={() => handleRowClick(str.i)}
                  >
                    <td>{str.i + 1}</td>
                    <td className="fp-td-element">
                      {str.el}
                      {str.suggestions.length > 1 && <span className="fp-multi-indicator">+{str.suggestions.length - 1}</span>}
                      {str.chatAnchor && <span className="fp-from-chat-dot" />}
                    </td>
                    <td>{topSugg?.copy ?? '—'}</td>
                    <td>{spill(str.status)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className="fp-remove-btn"
                        aria-label={`Remove string ${str.el}`}
                        onClick={() => handleRemoveString(str.i)}
                      >
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`detail-${str.i}`} className="fp-detail-row">
                      <td colSpan={5} className="fp-detail-cell">
                        <div className="fp-detail-inner">
                          {str.original !== undefined && (
                            <div>
                              <div className="fp-detail-label">Original</div>
                              <div className="fp-detail-original">{str.original}</div>
                            </div>
                          )}

                          <div>
                            <div className="fp-detail-label">Suggestions</div>
                            <div className="fp-sugg-list">
                              {str.suggestions.map((sg) => {
                                const isLib = sg.source === 'library'
                                const isLastSugg = str.suggestions.length === 1
                                return (
                                  <div key={sg.id} className={`fp-sugg-item${sg.via === 'chat' ? ' from-chat' : ''}`}>
                                    <div className="fp-sugg-header">
                                      {srcLabel(sg.via)}
                                      <button
                                        className="fp-sugg-remove-btn"
                                        disabled={isLib || isLastSugg}
                                        aria-label="Remove suggestion"
                                        onClick={() => handleRemoveSuggestion(str.i, sg.id)}
                                      >
                                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                                          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                        </svg>
                                      </button>
                                    </div>
                                    <div className="fp-sugg-body">
                                      <div className="fp-sugg-copy-row">
                                        <div className="fp-sugg-copy-text">{sg.copy}</div>
                                        <button
                                          className="fp-copy-btn"
                                          aria-label="Copy to clipboard"
                                          onClick={() => handleCopy(sg.copy)}
                                        >
                                          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                                            <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="white" strokeWidth="1.4"/>
                                            <path d="M10 4V2.5A1.5 1.5 0 0 0 8.5 1H2.5A1.5 1.5 0 0 0 1 2.5V8.5A1.5 1.5 0 0 0 2.5 10H4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                                          </svg>
                                        </button>
                                      </div>
                                      <div className="fp-sugg-rationale">{sg.rationale}</div>
                                      {sg.libId && (
                                        <span className="fp-lib-link">{sg.libId}</span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {str.chatAnchor && (
                            <div className="fp-from-chat-bar">
                              <span className="fp-from-chat-label">
                                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                                  <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9.5L8 13l-1.5-2H4a2 2 0 0 1-2-2V4z" stroke="currentColor" strokeWidth="1.4"/>
                                </svg>
                                Discussed in chat
                              </span>
                              <button className="fp-show-chat-btn" onClick={() => {
                                const anchor = document.getElementById(str.chatAnchor!)
                                anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }}>
                                Show in chat &rsaquo;
                              </button>
                            </div>
                          )}

                          <div className="fp-detail-footer">
                            <div className="fp-detail-quick">
                              <span className="fp-detail-quick-label">Quick replies</span>
                              {(['alternative', 'shorter', 'clearer'] as const).map(kind => (
                                <button
                                  key={kind}
                                  className={`fp-dchip${loadingQR === `${str.i}-${kind}` ? ' loading' : ''}`}
                                  onClick={() => handleQuickReply(str.i, kind)}
                                >
                                  {kind.charAt(0).toUpperCase() + kind.slice(1)}
                                </button>
                              ))}
                            </div>
                            <button className="fp-discuss-link" onClick={() => handleDiscuss(str.i)}>
                              Discuss in chat &rsaquo;
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors in FigmaReviewPanel.tsx

- [ ] **Step 3: Commit**

```bash
git add app/src/components/assistant/FigmaReviewPanel.tsx
git commit -m "feat: add FigmaReviewPanel desktop slide-in review panel"
```

---

## Task 6: FigmaReviewSheet (mobile bottom sheet)

**Files:**
- Create: `app/src/components/assistant/FigmaReviewSheet.tsx`

Same props as FigmaReviewPanel. On mobile, each string is shown one at a time with prev/next navigation. The component is displayed only on screens ≤768px (panel hidden on mobile via CSS).

- [ ] **Step 1: Create `app/src/components/assistant/FigmaReviewSheet.tsx`**

Write the component with these props interface:
```tsx
interface Props {
  open: boolean
  frameName: string
  strings: ReviewString[]
  onStringsChange: (strings: ReviewString[]) => void
  onClose: () => void
  onDiscussInChat: (el: string, stringIndex: number) => void
  showToast: (msg: string, actionLabel?: string, onAction?: () => void) => void
}
```

The implementation should:
1. Maintain local state: `tab: TabKey`, `query: string`, `cardIdx: number`, `animDir: 'right'|'left'`, `loadingQR: string|null`
2. Reset state on close (via useEffect watching `open`)
3. Compute `items = getFilteredItems()` — same filter logic as panel (exclude removed, filter by tab, filter by query)
4. Navigate prev/next by adjusting `cardIdx`
5. Render structure: backdrop → sheet → handle → header (title + export + close + tabs) → body (search + nav bar + card area) → actions (Done + Next)
6. Card area shows current string: status badge + delete button, original (if different), suggestions (each with source label + copy mono + copy button + rationale + libId link), quick replies row (Alternative, Shorter, Discuss)
7. Quick reply chips: 'alternative' and 'shorter' only (700ms delay, append suggestion, show toast). 'Discuss' chip has dashed border, closes sheet and calls onDiscussInChat
8. Tab labels: 'All', 'Library match', 'Adapted', 'Guidelines' (shortened from 'Guidelines-based'), 'No issues'
9. Export calls window.print()
10. Remove string: marks removed, shows undo toast, adjusts cardIdx
11. CSS classes: fr-sheet-backdrop, fr-sheet, fr-sheet-handle, fr-sheet-handle-bar, fr-sheet-header, fr-sheet-title-row, fr-sheet-title, fr-sheet-title-actions, fp-export-btn, fr-sheet-close, fr-sheet-tabs, fr-stab, fr-stab-count, fr-sheet-body, fr-sheet-search, fr-sheet-search-icon, fr-sheet-search-input, fr-sheet-nav, fr-nav-arrow, fr-nav-info, fr-nav-pos, fr-nav-el, fr-sheet-card, fr-sheet-card.anim / .anim-left, fr-sc-label, fp-sugg-source, fp-sugg-source.chat-src, fp-sugg-remove-btn, fp-copy-btn, fp-lib-link, fp-remove-btn, fr-sheet-actions, fr-sheet-btn, fr-sheet-btn-primary, fr-sheet-btn-secondary, chip

- [ ] **Step 2: TypeScript check**
```
cd app && npx tsc --noEmit
```
Expected: no errors in FigmaReviewSheet.tsx

- [ ] **Step 3: Commit**
```
git add app/src/components/assistant/FigmaReviewSheet.tsx
git commit -m "feat: add FigmaReviewSheet mobile bottom sheet"
```

## Task 7: Update FollowUpBar for discuss-in-chat prefill

**Files:**
- Modify: `app/src/components/assistant/FollowUpBar.tsx`

Add three new optional props: `prefillValue`, `focusTrigger`, `onPrefillConsumed`.

- [ ] **Step 1: Update the Props interface and component**

Add to Props:
```tsx
prefillValue?: string       // value to pre-fill (e.g. "[el] ")
focusTrigger?: number       // increment this number to trigger focus
onPrefillConsumed?: () => void  // called after prefill is consumed
```

Add to the component body (after existing state/refs):
```tsx
// Sync prefill value into input
useEffect(() => {
  if (prefillValue !== undefined) {
    setInput(prefillValue)
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
    onPrefillConsumed?.()
  }
}, [prefillValue]) // intentionally omit onPrefillConsumed to avoid stale closure issues

// Focus when trigger changes
useEffect(() => {
  if (!focusTrigger) return
  textareaRef.current?.focus()
  const len = textareaRef.current?.value.length ?? 0
  textareaRef.current?.setSelectionRange(len, len)
}, [focusTrigger])
```

- [ ] **Step 2: TypeScript check**
```
cd app && npx tsc --noEmit
```
Expected: no errors in FollowUpBar.tsx

- [ ] **Step 3: Commit**
```
git add app/src/components/assistant/FollowUpBar.tsx
git commit -m "feat: add prefillValue and focusTrigger props to FollowUpBar"
```

## Task 8: Wire up AssistantShell

**Files:**
- Modify: `app/src/components/assistant/AssistantShell.tsx`

This is the integration task. Add review state, replace the old FigmaReviewCard render, wire in the panel/sheet, and implement discuss-in-chat.

- [ ] **Step 1: Add new imports**

Add to existing imports at top of AssistantShell.tsx:
```tsx
import type { ReviewString, ReviewStatus } from '@/types/figma-review'
import { convertFigmaRows, nextSuggestionId } from '@/types/figma-review'
import { FigmaReviewPanel } from './FigmaReviewPanel'
import { FigmaReviewSheet } from './FigmaReviewSheet'
import { ReviewToast } from './ReviewToast'
```

- [ ] **Step 2: Add new state variables**

Add inside the `AssistantShell` function body, after existing state:
```tsx
// Figma review state
const [reviewStrings, setReviewStrings]     = useState<ReviewString[] | null>(null)
const [reviewFrameName, setReviewFrameName] = useState<string>('Frame')
const [reviewPanelOpen, setReviewPanelOpen] = useState(false)
const [reviewPanelFilter, setReviewPanelFilter] = useState<ReviewStatus | 'all'>('all')

// Toast
const [toastMsg, setToastMsg]         = useState<string | null>(null)
const [toastAction, setToastAction]   = useState<string | undefined>(undefined)
const [toastOnAction, setToastOnAction] = useState<(() => void) | undefined>(undefined)
const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

// Discuss-in-chat
const [pendingDiscussIdx, setPendingDiscussIdx] = useState<number | null>(null)
const [discussPrefill, setDiscussPrefill]       = useState<string | undefined>(undefined)
const [discussFocusTrigger, setDiscussFocusTrigger] = useState(0)
```

- [ ] **Step 3: Add `showToast` and `handleDiscussInChat` functions**

Add after the state declarations:
```tsx
function showToast(msg: string, actionLabel?: string, onAction?: () => void) {
  setToastMsg(msg)
  setToastAction(actionLabel)
  setToastOnAction(onAction ? () => onAction : undefined)
  if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  toastTimerRef.current = setTimeout(() => {
    setToastMsg(null)
    setToastAction(undefined)
    setToastOnAction(undefined)
  }, 5000)
}

function handleDiscussInChat(el: string, idx: number) {
  setReviewPanelOpen(false)
  setPendingDiscussIdx(idx)
  setDiscussPrefill(`[${el}] `)
  setDiscussFocusTrigger((t) => t + 1)
  showToast('Type your feedback or copy suggestion ↓')
}

function openReviewPanel(filter: ReviewStatus | 'all') {
  setReviewPanelFilter(filter)
  setReviewPanelOpen(true)
  // Close version history panel if open
  setVersionPanelOpen(false)
}
```

- [ ] **Step 4: Update `submit` to convert Figma review rows and handle discuss-in-chat response**

Inside the `try` block in `submit`, after `setMessages((prev) => [...prev, { role: 'assistant', response: data }])`, add:

```tsx
// Convert Figma review rows to ReviewString state
if (data.figma_review && data.figma_review.length > 0) {
  const frameName = (req.input.match(/figma\.com/i))
    ? (data.session_id ? userText.slice(0, 60) : 'Frame')
    : reviewFrameName
  setReviewFrameName(frameName)
  setReviewStrings(convertFigmaRows(data.figma_review))
}

// Append chat suggestion to panel if discuss-in-chat was active
if (pendingDiscussIdx !== null && data.is_copy_response && data.suggestion) {
  const anchorId = `chat-anchor-${Date.now()}`
  const newSugg = {
    id: nextSuggestionId(),
    copy: data.suggestion,
    rationale: data.rationale?.[0] ?? 'Suggestion from chat.',
    source: (data.source_type === 'library_match' ? 'library'
      : data.source_type === 'adapted' ? 'adapted'
      : 'suggestion') as ReviewStatus,
    via: 'chat' as const,
    libId: null,
  }
  setReviewStrings((prev) =>
    prev ? prev.map((s) =>
      s.i === pendingDiscussIdx
        ? { ...s, suggestions: [...s.suggestions, newSugg], chatAnchor: anchorId }
        : s
    ) : prev
  )
  // Tag the newly added chat message with the anchor id
  setMessages((prev) => {
    const last = prev[prev.length - 1]
    if (last?.role === 'assistant') {
      return [...prev.slice(0, -1), { ...last, anchorId }]
    }
    return prev
  })
  setPendingDiscussIdx(null)
  showToast('Panel updated ✓')
}
```

- [ ] **Step 5: Update the Figma review message render to use new FigmaReviewCard**

Find the existing block in the messages render:
```tsx
if (msg.response.figma_review && msg.response.figma_review.length > 0) {
```

Replace the entire block with:
```tsx
if (msg.response.figma_review && msg.response.figma_review.length > 0) {
  const frameName = sessionTitle.startsWith('Figma: ')
    ? sessionTitle.slice(7)
    : reviewFrameName
  return (
    <div key={i} className="message-row-bot">
      {msg.response.message && (
        <BotTextBubble text={msg.response.message} />
      )}
      <FigmaReviewCard
        frameName={frameName}
        strings={reviewStrings ?? []}
        onOpen={openReviewPanel}
      />
    </div>
  )
}
```

- [ ] **Step 6: Add FigmaReviewPanel and FigmaReviewSheet to the response-state JSX**

In the `return` of the response state (the big JSX block), after the `<VersionHistoryPanel .../>` element, add:

```tsx
{/* Figma review panel — desktop */}
{reviewStrings && (
  <FigmaReviewPanel
    open={reviewPanelOpen}
    frameName={reviewFrameName}
    strings={reviewStrings}
    onStringsChange={setReviewStrings}
    onClose={() => setReviewPanelOpen(false)}
    onDiscussInChat={handleDiscussInChat}
    showToast={showToast}
  />
)}

{/* Figma review sheet — mobile */}
{reviewStrings && (
  <FigmaReviewSheet
    open={reviewPanelOpen}
    frameName={reviewFrameName}
    strings={reviewStrings}
    onStringsChange={setReviewStrings}
    onClose={() => setReviewPanelOpen(false)}
    onDiscussInChat={handleDiscussInChat}
    showToast={showToast}
  />
)}

{/* Toast */}
<ReviewToast
  message={toastMsg}
  actionLabel={toastAction}
  onAction={toastOnAction}
/>
```

- [ ] **Step 7: Pass prefill props to FollowUpBar**

Update the `<FollowUpBar .../>` invocation to include:
```tsx
prefillValue={discussPrefill}
focusTrigger={discussFocusTrigger}
onPrefillConsumed={() => setDiscussPrefill(undefined)}
```

- [ ] **Step 8: TypeScript check**

```
cd app && npx tsc --noEmit
```

Expected: no TypeScript errors

- [ ] **Step 9: Commit**

```
git add app/src/components/assistant/AssistantShell.tsx
git commit -m "feat: wire FigmaReviewPanel, FigmaReviewSheet, and discuss-in-chat into AssistantShell"
```

---

## Self-Review Checklist

### Spec coverage

| Spec section | Task |
|---|---|
| Compact summary card (frame name, stats, progress, buttons) | Task 4 |
| Figma review panel (topbar, tabs, search, table, detail rows) | Task 5 |
| Mobile bottom sheet | Task 6 |
| Stat pills / confidence labels | Tasks 2, 4, 5 |
| Delete string with undo toast | Tasks 5, 6 |
| Quick reply chips (Alternative, Shorter, Clearer) | Task 5 |
| Discuss in chat — pre-fill input | Tasks 7, 8 |
| Discuss in chat — append suggestion on response | Task 8 |
| chatAnchor / Show in chat | Task 5 |
| Export PDF with print stylesheet | Tasks 2, 5 |
| Library-sourced suggestions: no delete button | Tasks 5, 6 |
| Last suggestion cannot be deleted | Tasks 5, 6 |
| Progress bar updates as strings removed | Task 4 |
| ReviewString types | Task 1 |
| CSS tokens | Task 2 |
| Toast component | Task 3 |
| FollowUpBar prefill/focus | Task 7 |

### Manual Testing Checklist

After all tasks are complete, verify these flows in the dev server (`cd app && npm run dev`):

- [ ] Paste a Figma URL in the landing input — a Figma review response appears as a compact card in the thread
- [ ] Compact card shows correct stat pills and progress label
- [ ] Clicking "Review all" opens the desktop panel (on wide screen)
- [ ] Clicking "Library match first" opens the panel on the Library match tab
- [ ] Panel tabs filter correctly; tab count badges update
- [ ] Typing in search filters rows; clearing the X clears search
- [ ] Clicking a table row expands the detail row inline
- [ ] Clicking a different row collapses the previous one
- [ ] Delete button (row-level) removes the row; undo restores it within 5 seconds
- [ ] Quick reply chips (Alternative, Shorter, Clearer) append a new suggestion after 700ms; toast shows
- [ ] Clicking "Discuss in chat" closes panel, pre-fills follow-up bar, focuses input
- [ ] Sending a message while pending discuss: if `is_copy_response`, suggestion appended to panel string; chatAnchor set
- [ ] "Show in chat" button scrolls to the chat card and briefly outlines it
- [ ] "Export PDF" opens print dialog with all detail rows expanded and chrome hidden
- [ ] On mobile (≤768px), "Review all" opens the bottom sheet instead of the panel
- [ ] Bottom sheet prev/next navigation works; tab filtering works
- [ ] Bottom sheet Discuss chip closes sheet and pre-fills follow-up bar
- [ ] Library-sourced suggestions show no delete button
- [ ] Last suggestion cannot be deleted (button disabled)
- [ ] Progress bar width in compact card updates when strings are removed
- [ ] Version history panel and Figma review panel cannot both be open (opening one closes the other)
