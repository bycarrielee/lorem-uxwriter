# Metrics Prototype Redo — Design Spec

**Date:** 2026-05-26
**Status:** Approved
**Scope:** Token swap only — no structural changes

---

## Goal

Update `lorem-webapp/dashboard-prototype.html` to use current DESIGN.md tokens throughout. The existing file predates the design system and uses system fonts, a mismatched colour palette, and incorrect source tier colours. The output is a replacement file (`dashboard-prototype-v2.html`) that is visually aligned with `editor.html` and the rest of the product.

---

## What changes

### Fonts

| Element | Before | After |
|---|---|---|
| Body / UI text | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | `'DM Sans', -apple-system, sans-serif` |
| Wordmark | `'JetBrains Mono'` | `'DM Mono'` |

Google Fonts link (matching `editor.html`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
```

---

### Brand mark

Replace the green square mark with the exact SVG from `editor.html`:

```html
<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
  <rect x="2" y="2" width="17" height="13" rx="3" fill="oklch(56% 0.17 185)"/>
  <path d="M5 15 L3 20 L8 18.5Z" fill="oklch(56% 0.17 185)"/>
  <circle cx="6.5"  cy="8.5" r="1.25" fill="white"/>
  <circle cx="10.5" cy="8.5" r="1.25" fill="white"/>
  <circle cx="14.5" cy="8.5" r="1.25" fill="white"/>
</svg>
```

The same mark is used in three places in the current prototype: login screen, dashboard header, and the sign-out header.

---

### CSS custom properties

Replace the existing `:root` block with the full DESIGN.md token set:

**Surfaces**
| Old | New |
|---|---|
| `--paper: #F8FAFC` | `--surface-base: #F7F8FA` |
| `--canvas: #FFFFFF` | `--surface-white: #FFFFFF` |
| _(none)_ | `--surface-card: #F0EDE8` |
| _(none)_ | `--surface-input: #EDE8E0` |

**Borders**
| Old | New |
|---|---|
| `--divider: #E2E8F0` | `--border-default: #E0E5EA` |
| `--divider-strong: #CBD5E1` | `--border-input: #D9D2C8` |

**Text**
| Old | New |
|---|---|
| `--txt-1: #1E2D3A` | `--text-primary: #1E2D3A` _(same)_ |
| `--txt-2: #64748B` | `--text-secondary: #6B8499` |
| `--txt-3: #94A3B8` | `--text-tertiary: #94A3B8` _(same)_ |

**Interactive**
| Old | New |
|---|---|
| `--primary: #3B5BA5` | `--color-primary: #3B5BA5` _(same)_ |
| `--primary-hover: #314C8A` | `--color-primary-hover: #334F94` |
| `--signal: #4F46E5` | `--signal: oklch(51% 0.24 264)` |
| `--signal-subtle: #EEF2FF` | `--signal-subtle: oklch(97% 0.04 264)` |

**Semantic status colours**
| Old | New |
|---|---|
| `--success: #047857` | `--confirmed: oklch(58% 0.17 162)` |
| `--success-bg: #ECFDF5` | `--confirmed-subtle: oklch(97% 0.05 162)` |
| `--warning: #D97706` | `--provisional: oklch(65% 0.17 72)` |
| `--warning-bg: #FFFBEB` | `--provisional-subtle: oklch(99% 0.05 80)` |
| `--danger: #EA580C` | `--critical: oklch(53% 0.22 27)` |
| `--danger-bg: #FFF7ED` | `--critical-subtle: oklch(98% 0.04 27)` |

**Source label tokens** (add — not present in current prototype)
```css
--lib-bg:  oklch(97% 0.05 162);  --lib-txt: oklch(44% 0.15 162); --lib-bd: oklch(85% 0.07 162);
--ada-bg:  #E8E2D9;              --ada-txt: #4A5D6B;             --ada-bd: #B8AA9E;
--ai-bg:   oklch(99% 0.05 80);   --ai-txt:  oklch(51% 0.16 72);  --ai-bd:  oklch(83% 0.10 72);
--ail-bg:  oklch(99% 0.04 55);   --ail-txt: oklch(54% 0.18 45);  --ail-bd: oklch(85% 0.09 55);
```

Add legacy aliases so old `var(--paper)` / `var(--canvas)` references still resolve:
```css
--paper:   var(--surface-base);
--canvas:  var(--surface-white);
--divider: var(--border-default);
--txt-1:   var(--text-primary);
--txt-2:   var(--text-secondary);
--txt-3:   var(--text-tertiary);
```

---

### Component-level token references

**Summary cards** — change from `background: var(--canvas)` to `background: var(--surface-card)`.

**Sidebar** — already uses `var(--paper)` which resolves correctly via alias.

**Source tier bar colours** (Suggestions section):
| Tier | Old colour | New colour |
|---|---|---|
| Library | `#047857` | `var(--lib-txt)` = `oklch(44% 0.15 162)` |
| Adapted | `#4F46E5` | `var(--ada-txt)` = `#4A5D6B` |
| AI | `#D97706` | `var(--ai-txt)` = `oklch(51% 0.16 72)` |
| AI low | `#EA580C` | `var(--ail-txt)` = `oklch(54% 0.18 45)` |

**Chart colours** — only where semantic meaning applies:
- Latency chart: `#D97706` → `var(--provisional)`
- Cost chart: `#047857` → `var(--confirmed)` (or keep primary — either is fine, cost is not a status)

**Trend arrows** (up/down in cards):
- `.card-trend.up` → `color: var(--confirmed)`
- `.card-trend.down` → `color: var(--critical)`

---

## What stays the same

- All 5 sections: Overview, Usage, Suggestions, API health, Queries
- All chart types and chart rendering logic (line, bar, horizontal bar, tier bar)
- All demo data constants
- All preset queries and CSV export
- Login screen with password gate (`lorem`)
- Date range switcher (Overview date range is functional; others are visual-only)
- Single standalone HTML file — no build step, no dependencies

---

## Output

New file: `lorem-webapp/dashboard-prototype-v2.html`

The original `dashboard-prototype.html` is left untouched as a reference.
