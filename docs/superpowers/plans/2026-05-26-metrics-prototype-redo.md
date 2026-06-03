# Metrics Prototype Redo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `dashboard-prototype-v2.html` — a token-swap of the existing metrics prototype that uses current DESIGN.md fonts, colours, and source-tier semantics throughout, with the brand mark from `editor.html`.

**Architecture:** Single standalone HTML file, no build step. All changes are purely visual — CSS custom properties, font declarations, SVG text attributes, JS colour constants. The existing layout, chart logic, demo data, and interactions are untouched.

**Tech Stack:** HTML, CSS custom properties, vanilla JS, Google Fonts (DM Sans / DM Mono / DM Serif Display)

---

## File map

| Action | Path |
|---|---|
| Create | `lorem-webapp/dashboard-prototype-v2.html` |
| Reference (read-only) | `lorem-webapp/dashboard-prototype.html` |
| Reference (read-only) | `lorem-webapp/editor.html` (brand mark SVG) |

---

## Task 1: Create file and replace CSS tokens

**Files:**
- Create: `lorem-webapp/dashboard-prototype-v2.html`

- [ ] **Step 1: Copy the source file**

```bash
cp lorem-webapp/dashboard-prototype.html lorem-webapp/dashboard-prototype-v2.html
```

- [ ] **Step 2: Replace the Google Fonts link**

In `dashboard-prototype-v2.html`, find lines 7–8:
```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Replace with:
```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Replace the :root block**

Find the `:root { ... }` block (lines 12–35) and replace it entirely:

```css
    :root {
      /* Surfaces */
      --surface-base:  #F7F8FA;
      --surface-card:  #F0EDE8;
      --surface-input: #EDE8E0;
      --surface-white: #FFFFFF;

      /* Borders */
      --border-default:    #E0E5EA;
      --border-input:      #D9D2C8;

      /* Text */
      --text-primary:   #1E2D3A;
      --text-secondary: #6B8499;
      --text-tertiary:  #94A3B8;

      /* Interactive */
      --color-primary:       #3B5BA5;
      --color-primary-hover: #334F94;

      /* Source label text colours */
      --lib-txt: oklch(44% 0.15 162);
      --ada-txt: #4A5D6B;
      --ai-txt:  oklch(51% 0.16 72);
      --ail-txt: oklch(54% 0.18 45);

      /* Semantic status */
      --confirmed:        oklch(58% 0.17 162);
      --confirmed-subtle: oklch(97% 0.05 162);
      --provisional:      oklch(65% 0.17 72);
      --crit:             oklch(53% 0.22 27);
      --crit-bg:          oklch(98% 0.04 27);

      /* Focus ring */
      --signal:        oklch(51% 0.24 264);
      --signal-subtle: oklch(97% 0.04 264);

      /* Border radius */
      --r-sm: 4px;
      --r-md: 6px;
      --r-lg: 8px;
      --r-xl: 12px;

      /* Typography */
      --font-ui: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

      /* Legacy aliases — all existing var() references resolve automatically */
      --primary:        var(--color-primary);
      --primary-hover:  var(--color-primary-hover);
      --paper:          var(--surface-base);
      --canvas:         var(--surface-white);
      --divider:        var(--border-default);
      --divider-strong: var(--border-input);
      --txt-1:          var(--text-primary);
      --txt-2:          var(--text-secondary);
      --txt-3:          var(--text-tertiary);
      --success:        var(--confirmed);
      --success-bg:     var(--confirmed-subtle);
      --warning:        var(--provisional);
      --danger:         var(--crit);
      --danger-bg:      var(--crit-bg);
      --font:           var(--font-ui);
    }
```

- [ ] **Step 4: Verify in browser**

Open `lorem-webapp/dashboard-prototype-v2.html` in a browser. Log in with `lorem`.

Check: body text is DM Sans (rounder, more geometric than system font). The overall palette should look slightly warmer — greys have a warm tint vs the cool blues of the original.

- [ ] **Step 5: Commit**

```bash
git add lorem-webapp/dashboard-prototype-v2.html
git commit -m "feat: add metrics prototype v2 with DESIGN.md token swap"
```

---

## Task 2: Update font-family declarations in CSS and SVG

**Files:**
- Modify: `lorem-webapp/dashboard-prototype-v2.html`

The `:root` alias `--font: var(--font-ui)` means all `var(--font)` in the CSS already resolve to DM Sans. These three font-family overrides still reference JetBrains Mono and need updating to DM Mono.

- [ ] **Step 1: Update login wordmark font**

Find (line ~59):
```css
    .login-wordmark { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 14px; font-weight: 500; color: var(--txt-1); }
```

Replace with:
```css
    .login-wordmark { font-family: 'DM Mono', ui-monospace, monospace; font-size: 14px; font-weight: 500; color: var(--txt-1); }
```

- [ ] **Step 2: Update login hint code font**

Find (line ~82):
```css
    .login-hint code { font-family: 'JetBrains Mono', ui-monospace, monospace; color: var(--txt-2); }
```

Replace with:
```css
    .login-hint code { font-family: 'DM Mono', ui-monospace, monospace; color: var(--txt-2); }
```

- [ ] **Step 3: Update dashboard wordmark font**

Find (line ~97):
```css
    .dash-wordmark { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; font-weight: 500; color: var(--txt-1); }
```

Replace with:
```css
    .dash-wordmark { font-family: 'DM Mono', ui-monospace, monospace; font-size: 13px; font-weight: 500; color: var(--txt-1); }
```

- [ ] **Step 4: Update SVG text font-family in lineChart()**

The `lineChart()` function builds SVG strings with hardcoded font references. Find these two template literal lines inside `lineChart()` (lines ~522 and ~527):

```js
    return `<line x1="${pt.l}" y1="${y}" x2="${pt.l+iw}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>
            <text x="${pt.l-5}" y="${y+4}" text-anchor="end" fill="#94A3B8" font-size="9.5" font-family="-apple-system,sans-serif">${v}</text>`;
```
```js
    return `<text x="${pt.l+(i/(labels.length-1))*iw}" y="${H-4}" text-anchor="middle" fill="#94A3B8" font-size="9.5" font-family="-apple-system,sans-serif">${l}</text>`;
```

Replace both (update `stroke` colour and `font-family` attribute):
```js
    return `<line x1="${pt.l}" y1="${y}" x2="${pt.l+iw}" y2="${y}" stroke="#E0E5EA" stroke-width="1"/>
            <text x="${pt.l-5}" y="${y+4}" text-anchor="end" fill="#94A3B8" font-size="9.5" font-family="'DM Sans',sans-serif">${v}</text>`;
```
```js
    return `<text x="${pt.l+(i/(labels.length-1))*iw}" y="${H-4}" text-anchor="middle" fill="#94A3B8" font-size="9.5" font-family="'DM Sans',sans-serif">${l}</text>`;
```

- [ ] **Step 5: Update SVG text font-family in barChart()**

Find these two template literal lines inside `barChart()` (lines ~551 and ~556):

```js
    return `<line x1="${pt.l}" y1="${y}" x2="${pt.l+iw}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>
            <text x="${pt.l-5}" y="${y+4}" text-anchor="end" fill="#94A3B8" font-size="9.5" font-family="-apple-system,sans-serif">${v}</text>`;
```
```js
    return `<text x="${(pt.l+i*gap+gap/2).toFixed(1)}" y="${H-4}" text-anchor="middle" fill="#94A3B8" font-size="9.5" font-family="-apple-system,sans-serif">${l}</text>`;
```

Replace both:
```js
    return `<line x1="${pt.l}" y1="${y}" x2="${pt.l+iw}" y2="${y}" stroke="#E0E5EA" stroke-width="1"/>
            <text x="${pt.l-5}" y="${y+4}" text-anchor="end" fill="#94A3B8" font-size="9.5" font-family="'DM Sans',sans-serif">${v}</text>`;
```
```js
    return `<text x="${(pt.l+i*gap+gap/2).toFixed(1)}" y="${H-4}" text-anchor="middle" fill="#94A3B8" font-size="9.5" font-family="'DM Sans',sans-serif">${l}</text>`;
```

- [ ] **Step 6: Verify in browser**

Reload the file. Check:
- The "Lorem" wordmark in both the login screen and dashboard header uses DM Mono (slightly narrower than DM Sans, monospaced feel)
- Chart axis labels use DM Sans (should match body text weight)

- [ ] **Step 7: Commit**

```bash
git add lorem-webapp/dashboard-prototype-v2.html
git commit -m "fix: update font-family declarations and SVG text to DM Sans/Mono"
```

---

## Task 3: Replace brand marks

**Files:**
- Modify: `lorem-webapp/dashboard-prototype-v2.html`

Remove the old green square mark (CSS background + small inner SVG) and replace with the teal speech bubble SVG from `editor.html`. Two locations: login screen and dashboard header.

- [ ] **Step 1: Remove .login-mark CSS rule**

Find (line ~54–58):
```css
    .login-mark {
      width: 28px; height: 28px; border-radius: 6px;
      background: #047857;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
```

Delete this rule entirely.

- [ ] **Step 2: Remove .dash-mark CSS rule**

Find (line ~93–96):
```css
    .dash-mark {
      width: 24px; height: 24px; border-radius: 5px; background: #047857;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
```

Delete this rule entirely.

- [ ] **Step 3: Replace login mark HTML**

Find (lines ~252–254):
```html
      <div class="login-mark">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3h10v6a5 5 0 01-10 0V3z" fill="white" fill-opacity=".9"/></svg>
      </div>
```

Replace with:
```html
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" style="flex-shrink:0">
        <rect x="2" y="2" width="17" height="13" rx="3" fill="oklch(56% 0.17 185)"/>
        <path d="M5 15 L3 20 L8 18.5Z" fill="oklch(56% 0.17 185)"/>
        <circle cx="6.5"  cy="8.5" r="1.25" fill="white"/>
        <circle cx="10.5" cy="8.5" r="1.25" fill="white"/>
        <circle cx="14.5" cy="8.5" r="1.25" fill="white"/>
      </svg>
```

- [ ] **Step 4: Replace dashboard header mark HTML**

Find (lines ~276–278):
```html
      <div class="dash-mark">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 3h10v6a5 5 0 01-10 0V3z" fill="white" fill-opacity=".9"/></svg>
      </div>
```

Replace with:
```html
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex-shrink:0">
        <rect x="2" y="2" width="17" height="13" rx="3" fill="oklch(56% 0.17 185)"/>
        <path d="M5 15 L3 20 L8 18.5Z" fill="oklch(56% 0.17 185)"/>
        <circle cx="6.5"  cy="8.5" r="1.25" fill="white"/>
        <circle cx="10.5" cy="8.5" r="1.25" fill="white"/>
        <circle cx="14.5" cy="8.5" r="1.25" fill="white"/>
      </svg>
```

- [ ] **Step 5: Verify in browser**

Reload. Check:
- Login screen: teal speech bubble mark visible, aligned left of "Lorem" wordmark
- Dashboard header: same mark, slightly smaller (22px vs 26px), aligned with wordmark and separator

- [ ] **Step 6: Commit**

```bash
git add lorem-webapp/dashboard-prototype-v2.html
git commit -m "fix: replace brand mark with speech bubble SVG from editor.html"
```

---

## Task 4: Update card background and data colours

**Files:**
- Modify: `lorem-webapp/dashboard-prototype-v2.html`

- [ ] **Step 1: Update summary card background**

Find (line ~167):
```css
    .card { background: var(--canvas); border: 1px solid var(--divider); border-radius: var(--r-lg); padding: 16px 18px; }
```

Replace with:
```css
    .card { background: var(--surface-card); border: 1px solid var(--divider); border-radius: var(--r-lg); padding: 16px 18px; }
```

- [ ] **Step 2: Update source tier colours in TIERS data**

Find (lines ~466–471):
```js
const TIERS = [
  { label: 'Library', pct: 45, color: '#047857' },
  { label: 'Adapted', pct: 61, color: '#4F46E5' },
  { label: 'AI',      pct: 28, color: '#D97706' },
  { label: 'AI low',  pct: 12, color: '#EA580C' },
];
```

Replace with:
```js
const TIERS = [
  { label: 'Library', pct: 45, color: 'oklch(44% 0.15 162)' },
  { label: 'Adapted', pct: 61, color: '#4A5D6B'             },
  { label: 'AI',      pct: 28, color: 'oklch(51% 0.16 72)'  },
  { label: 'AI low',  pct: 12, color: 'oklch(54% 0.18 45)'  },
];
```

- [ ] **Step 3: Update API health chart colours**

Find (line ~607–608):
```js
  document.getElementById('c-latency').innerHTML = lineChart(LATENCY_DATA, API_LABELS, '#D97706', 0.1);
  document.getElementById('c-cost').innerHTML    = barChart(COST_DATA, API_LABELS, '#047857');
```

Replace with:
```js
  document.getElementById('c-latency').innerHTML = lineChart(LATENCY_DATA, API_LABELS, 'oklch(65% 0.17 72)', 0.1);
  document.getElementById('c-cost').innerHTML    = barChart(COST_DATA, API_LABELS, 'oklch(44% 0.15 162)');
```

- [ ] **Step 4: Verify in browser**

Reload. Check:
- Overview section: summary cards have warm cream background (#F0EDE8), not white
- Suggestions section → "Copy rate by source tier": Library bar is dark green, Adapted is blue-grey, AI is amber, AI low is orange-brown (all desaturated/semantic vs the old vivid colours)
- API health section → Median response time chart: amber line. Daily API cost chart: green bars.

- [ ] **Step 5: Commit**

```bash
git add lorem-webapp/dashboard-prototype-v2.html
git commit -m "fix: update card background and source tier/chart colours to DS tokens"
```

---

## Task 5: Final visual check

**Files:** none (verification only)

- [ ] **Step 1: Full walkthrough — login**

Open `dashboard-prototype-v2.html`. On the login screen verify:
- DM Sans body text
- DM Mono "Lorem" wordmark
- Teal speech bubble mark (26px)
- `lorem` password works

- [ ] **Step 2: Full walkthrough — Overview**

After login, Overview section:
- Warm cream summary cards (not white)
- DM Sans card values and labels
- "↑ 12%" trend in confirmed green (oklch, warm green vs the old `#047857`)
- Date range switcher (7d / 30d / 90d) updates card values

- [ ] **Step 3: Full walkthrough — Usage**

Click Usage:
- Weekly active clients line chart and Daily sessions bar chart render
- Chart axis labels in DM Sans
- Grid lines in `#E0E5EA` (vs old cool `#E2E8F0`)

- [ ] **Step 4: Full walkthrough — Suggestions**

Click Suggestions:
- "Interaction breakdown" horizontal bars visible
- "Copy rate by source tier" bars: Library dark green, Adapted blue-grey, AI amber, AI low orange-brown

- [ ] **Step 5: Full walkthrough — API health**

Click API health:
- Daily call volume bar chart (blue)
- Median response time line chart (amber/warm)
- Daily API cost bar chart (green)

- [ ] **Step 6: Full walkthrough — Queries**

Click Queries:
- Five preset queries listed
- Run any query → table renders
- Export CSV button works (downloads file)

- [ ] **Step 7: Confirm original is untouched**

```bash
git diff --name-only HEAD~4
```

Expected: only `lorem-webapp/dashboard-prototype-v2.html` appears. `dashboard-prototype.html` is unchanged.
