# lorem-webapp — Master Design System

**Version:** 3.0
**Date:** 2026-05-26
**Product:** lorem-webapp — AI-assisted UX copy management for Singapore government digital services
**Users:** UX writers, content designers, product designers (`.gov.sg` and invited contractors)

---

## Design direction

**"The Editor's Desk"**

lorem-webapp is built for practitioners who notice when something is off. The visual system makes the same judgments the product asks of its users: every element earns its presence, nothing is added for visual interest, and trust is communicated through precision rather than polish.

The palette is a working desk after years of use: a restrained light sidebar, off-white canvas, a single saturated accent for actions that matter. The interface runs dense at 14px default because users are working, not browsing. Long-form reading surfaces use 16px. The monospace font appears only when displaying copy strings, marking those surfaces as the product's true subject matter.

**What this is not:** a generic SaaS tool (cream backgrounds, pastel gradients, friendly onboarding bots), a government portal (grey utility scaffolding, GOV.UK flatness without intention), or a consumer app. lorem-webapp is a professional reference tool with the restraint and authority of Linear, Stripe Dashboard, and Pitch.

---

## Fonts

Three fonts. Each has a specific role. Do not swap them.

**DM Sans** — UI font for all chrome, navigation, labels, body text, and buttons. Loaded from Google Fonts at weights 400, 500, 600 (including italic). Do not substitute Inter, Roboto, or any system font stack for UI text. The system font stack is no longer used.

**DM Mono** — Monospace font for copy string display only. Loaded from Google Fonts at weights 400 and 500. Appears in: copy preview boxes, suggested copy fields, version history copy preview, library entry copy display. Never used for code examples, metadata, labels, or any other purpose.

**DM Serif Display** — Display font for the product wordmark ("Lorem") and the landing card heading only. Loaded from Google Fonts, regular and italic. Never used for UI chrome or navigation.

### Loading

Add to the `<head>` of every HTML page:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
```

### CSS variables

```css
--font-ui:      'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono:    'DM Mono', 'JetBrains Mono', ui-monospace, monospace;
--font-display: 'DM Serif Display', Georgia, serif;
```

### Type scale

| Name | Size | Line height | Weight | Font | Use |
|---|---|---|---|---|---|
| `display` | 30px / 1.875rem | 1.2 | 700 | DM Serif Display | Product wordmark, landing card heading |
| `headline` | 24px / 1.5rem | 1.25 | 600 | DM Sans | Section headings in main content only |
| `title` | 18px / 1.125rem | 1.3 | 600 | DM Sans | Page titles, panel titles, dialog headings |
| `heading-sm` | 16px / 1rem | 1.35 | 600 | DM Sans | Sub-headings within sections |
| `body-lg` | 16px / 1rem | 1.5 | 400 | DM Sans | Reading surfaces: copy previews, rationale, instructions |
| `body` | 14px / 0.875rem | 1.5 | 400 | DM Sans | Default UI text, descriptions, nav labels |
| `body-sm` | 13px / 0.8125rem | 1.45 | 400 | DM Sans | Helper text, metadata, session list items |
| `label` | 12px / 0.75rem | 1.4 | 500 | DM Sans | Section labels, table headers (uppercase, 0.07em tracking) |
| `caption` | 11px / 0.6875rem | 1.4 | 400 | DM Sans | Timestamps, fine print (0.01em tracking) |
| `code` | 13px / 0.8125rem | 1.6 | 400 | DM Mono | Copy string display only |

### Typography rules

- **The 14px Rule.** Default body text is 14px. 16px (`body-lg`) is correct only on reading surfaces (copy preview, rationale). Not for navigation or UI chrome.
- **The Mono Marker.** DM Mono appears for copy string display only. Using monospace anywhere else dilutes the signal.
- **The Display Rule.** DM Serif Display appears only in the product wordmark and the landing card "Ask *Lorem*" heading. The italic variant of "Lorem" uses `font-style: italic`.
- Line length: cap at 65ch on all reading-heavy surfaces.
- Never use font sizes below 11px.

---

## Color system

### Surfaces

| Token | Value | Role |
|---|---|---|
| `surface-base` | `#F7F8FA` | Page background, sidebar, secondary surfaces |
| `surface-card` | `#F0EDE8` | AI response card — the only warm surface |
| `surface-input` | `#EDE8E0` | Copy preview backgrounds, suggested copy areas |
| `surface-white` | `#FFFFFF` | Content panels, inputs, active working areas |

### Borders

| Token | Value | Role |
|---|---|---|
| `border-default` | `#E0E5EA` | Default borders, panel separators, dividers |
| `border-input` | `#D9D2C8` | Input fields, copy preview area borders |
| `border-tag` | `#C4B9AE` | Default chip and context chip borders |
| `border-tag-accent` | `#B8AA9E` | Adapted tag border; chip hover state |

### Text

| Token | Value | Role |
|---|---|---|
| `text-primary` | `#1E2D3A` | Headings, primary body copy |
| `text-secondary` | `#6B8499` | Labels, metadata, helper text |
| `text-chip` | `#4A5D6B` | Quick action chip labels |
| `text-inverse` | `#FFFFFF` | Text on colored or dark backgrounds |
| `text-tertiary` | `#94A3B8` | Placeholders, timestamps, fine print |

### Interactive

| Token | Value | Role |
|---|---|---|
| `color-primary` | `#3B5BA5` | Primary buttons, active tab indicator, links |
| `color-primary-hover` | `#334F94` | Primary button hover state |
| `color-primary-ghost` | `rgba(59, 91, 165, 0.06)` | Secondary button hover fill |

### Tabs

| Token | Value | Role |
|---|---|---|
| `tab-inactive-text` | `#6B8499` | Inactive tab label |
| `tab-hover-text` | `#1E2D3A` | Tab label on hover |
| `tab-active-text` | `#1E2D3A` | Active tab label |
| `tab-active-indicator` | `#3B5BA5` | Active tab underline (2px solid) |
| `tab-rail` | `#E0E5EA` | Tab bar bottom border (1px) |

### Navigation

| Token | Value | Role |
|---|---|---|
| `nav-text-resting` | `#6B8499` | Sidebar and top nav item label at rest |
| `nav-text-active` | `#1E2D3A` | Item label on hover and active |
| `nav-bg-hover` | `#EAECEE` | Nav item hover background (pill) |
| `nav-bg-selected` | `#FFFFFF` | Active nav item background (pill) |

### Chat bubbles

| Token | Value | Role |
|---|---|---|
| `bubble-user-bg` | `#3A5068` | User message bubble background |
| `bubble-user-text` | `#EDF2F6` | User message bubble text |
| `bubble-bot-bg` | `#F0EDE8` | AI response card background (= `surface-card`) |
| `bubble-bot-text` | `#1E2D3A` | AI response card text (= `text-primary`) |

### Tags

| Token | Value | Role |
|---|---|---|
| `tag-default-bg` | `transparent` | Context chip and quick pill at rest |
| `tag-default-border` | `#C4B9AE` | Context chip border at rest |
| `tag-default-text` | `#1E2D3A` | Context chip label at rest |
| `tag-accent-bg` | `#E8E2D9` | Adapted source label fill; chip hover background |
| `tag-accent-border` | `#B8AA9E` | Adapted tag border; chip hover border |
| `tag-accent-text` | `#4A5D6B` | Adapted tag text; chip hover text |

### Source label tokens

These are the product's trust mechanism. They are semantic, not decorative. Never repurpose these hues elsewhere.

| Tier | Background | Text | Border | Meaning |
|---|---|---|---|---|
| Library match | `oklch(97% 0.05 162)` | `oklch(44% 0.15 162)` | `oklch(85% 0.07 162)` | Copy used verbatim from the approved library |
| Adapted from library | `#E8E2D9` | `#4A5D6B` | `#B8AA9E` | Library copy adjusted for context |
| AI-generated | `oklch(99% 0.05 80)` | `oklch(51% 0.16 72)` | `oklch(83% 0.1 72)` | No library match; generated from patterns |
| AI-generated · lower confidence | `oklch(99% 0.04 55)` | `oklch(54% 0.18 45)` | `oklch(85% 0.09 55)` | No library match and no pattern |

### Signal (focus rings and active states)

| Token | Value | Role |
|---|---|---|
| `signal` | `oklch(51% 0.24 264)` | Focus rings, active nav states, badge fills |
| `signal-subtle` | `oklch(97% 0.04 264)` | Tinted background for active states |
| `provisional` | `oklch(65% 0.17 72)` | Alternative-group tab indicator; alternative badge text |

Signal appears on less than 10% of any surface. Its scarcity is what makes it readable as intent.

`--provisional` is a semantic alias used exclusively for the alternatives grouping indicator in the version history panel — the 2px amber line above `.detail-tab-group` and the "Alternative N of M" badge color. Do not use it for general amber decoration.

### Color rules

**The Primary Action Rule.** `color-primary` (`#3B5BA5`) is the sole interactive hue for buttons, tabs, and links. Signal (`oklch(51% 0.24 264)`) is reserved for focus rings, active nav states, and active selection states (e.g. library list selected item). The two are distinct; do not conflate them.

**The Provenance Rule.** Source label colors are semantic, not aesthetic. Never repurpose teal/green, amber, or orange for decorative elements.

**The Warm Surface Rule.** `surface-card` (`#F0EDE8`) is the only warm-toned surface in the product. No other panel, background, or container uses a warm hue. This makes the AI response card visually distinct from every other surface type.

---

## App shell

The app shell is a flex-column layout: full-width topbar (48px), then a flex-row body (sidebar + content area).

```
┌─────────────────────────────────────────────────────────────────┐
│  Topbar (48px, surface-base bg, border-bottom 1px border-default)│
│  [logo-icon] Lorem  UX Writing Assistant    [Changelog] [Feedback]│
├──────────────────┬──────────────────────────────────────────────┤
│ Sidebar          │  Main content area (flex-1)                  │
│ (228px,          │                                              │
│  surface-base)   │  Page content                                │
│                  │                                              │
│ WORKSPACE        │                                              │
│  — Assistant     │                                              │
│  — Library       │                                              │
│                  │                                              │
│  ─────────────   │                                              │
│  ASSISTANT       │                                              │
│  HISTORY         │                                              │
│  · Session 1     │                                              │
│  · Session 2     │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

**Topbar:**
- Height: 48px, full-width, `flex-shrink: 0`
- Background: `surface-base`, `border-bottom: 1px border-default`
- Left: logo-icon (24×24px, brand green `#1A8C6F` rounded square, white SVG icon inside) + "Lorem" (DM Sans 14px/600, `text-primary`) + "UX Writing Assistant" (DM Sans 13px/400, `text-secondary`)
- Right: "Changelog" and "Feedback" text links using header nav link component
- On mobile (≤768px): hamburger button (left of logo) to toggle sidebar

**Sidebar:**
- Width: 228px, full body height
- Background: `surface-base`, `border-right: 1px border-default`
- "WORKSPACE" section label above nav items (DM Sans 11px/600, uppercase, 0.07em tracking, `text-secondary`)
- Nav items: Assistant, Library
  - **Assistant** navigates to the Ask Lorem landing state (empty state), not to any existing conversation
  - **Library** navigates to the Library screen
- "ASSISTANT HISTORY" section header row (flex, space-between) + search icon button on the right
  - Search button: 20×20px, `r-sm` radius, toggles an inline search input below the header
  - Inline search input: 28px height, `surface-white` bg, `border-input` border, `r-md` radius; filters session titles live; Escape closes
  - When search is open, all items are visible regardless of truncation state
- Session list: `overflow: hidden` (no scroll). If session content exceeds the available sidebar height, items beyond the last fully visible one are hidden and a "View all" button appears below the list
  - "View all": 30px height, `color-primary` text, ghost hover, flex with chevron-right icon; clicking it navigates to the Assistant history screen
- On mobile: slides in from left as overlay; backdrop overlay `rgba(30,45,58,0.3)` with transition

**Content area:**
- `flex: 1`, no explicit padding at shell level — each page owns its internal layout
- Background: `surface-white` for content pages

---

## Layout: Landing state (Assistant screen)

The landing state shows a centered card on a `surface-base` background with a subtle radial gradient.

```
┌───────────────────────────────────────────────────────────────┐
│  (surface-base bg + radial gradient atmosphere)               │
│                                                               │
│               ┌──────────────────────────────┐               │
│               │  [brand-icon 44×44]          │               │
│               │  Ask Lorem  (italic Lorem)   │               │
│               │  Paste a draft or describe   │               │
│               │  what you need — Lorem       │               │
│               │  checks approved patterns    │               │
│               │  first.                      │               │
│               │                              │               │
│               │  [textarea                ]  │               │
│               │                              │               │
│               │  Try [chip] [chip] [chip]    │               │
│               │                              │               │
│               │  [Get suggestions          ] │               │
│               └──────────────────────────────┘               │
└───────────────────────────────────────────────────────────────┘
```

**Ask Lorem card:**
- Max-width: 560px, centered
- Background: `surface-white`, border `1px border-default`, `border-radius: 16px`, `box-shadow: var(--shadow-sm)`
- Padding: 40px
- Animation: `opacity 0→1, translateY 10px→0`, 300ms `cubic-bezier(0.25,1,0.5,1)`
- Brand icon: 44×44px, `#1A8C6F` background, 12px radius, white SVG icon
- Heading: "Ask *Lorem*" — DM Serif Display 26px/700, `text-primary`. "Lorem" uses `font-style: italic; color: color-primary`
- Subtitle: DM Sans 14px/400, `text-secondary`, single line
- Textarea: `surface-base` background, `1.5px border-default` border, 10px radius, focus shifts to `color-primary` border + `surface-white` background
- "Try" chips: `tag-default-border` border, `text-chip` text, transparent background, hover `tag-accent-bg` fill
- Submit button: full-width primary button, "Get suggestions"
- Background atmosphere: `radial-gradient(ellipse 60% 50% at 50% 60%, rgba(59,91,165,0.05) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 20% 20%, rgba(26,140,111,0.04) 0%, transparent 60%)`

---

## Layout: Response state (Assistant screen)

```
┌──────────────────────────────────────────────────────────────┐
│ CPF contribution label         [🔍 Search] [Version history] │  ← page-header
│ Today                                                        │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────┐                        │
│  │ User bubble (right-aligned)      │  ← bubble-user        │
│  └──────────────────────────────────┘                        │
│                                                              │
│  ┌──────────────────────────────────────────┐                │
│  │ [↗ Adapted from library] [✓ Form labels] │  ← bot-card   │
│  │ SUGGESTED COPY                           │                │
│  │ ┌──────────────────────────────────────┐ │                │
│  │ │ Annual CPF contribution              │ │                │
│  │ └──────────────────────────────────────┘ │                │
│  │ 23 characters                            │                │
│  │ [Copy text]  [View rationale]            │                │
│  │ Quick actions [Shorter] [Alternatives]   │                │
│  └──────────────────────────────────────────┘                │
├──────────────────────────────────────────────────────────────┤
│ [Ask for more tweaks…                           ] [→ Send]   │  ← follow-up bar
└──────────────────────────────────────────────────────────────┘
```

**Page header:**
- Height: 80px, padding: 0 20px, `border-bottom: 1px border-default`
- Left: page title (DM Sans 18px/600, `text-primary`) + date (DM Sans 13px/400, `text-tertiary`)
- Right: search box + "Version history" toggle button
- "Version history" button: outlined style, `border-default` border, `text-secondary` label, `text-chip` icon. Active state: `color-primary` border and text, `color-primary-ghost` fill

**User bubble:**
- Background: `bubble-user-bg` (`#3A5068`), text: `bubble-user-text` (`#EDF2F6`)
- Right-aligned, max-width 65%, `border-radius: 16px 16px 4px 16px`
- DM Sans 14px/400, padding 11px 16px

**Bot card:**
- Background: `bubble-bot-bg` (`#F0EDE8`), text: `bubble-bot-text` (`#1E2D3A`)
- Left-aligned, max-width 75%, `border-radius: 16px 16px 16px 4px`
- Padding: 20px, gap 14px between sections
- Top row: source tag (left) + char count (right) — both in a flex row
- Source tag: inline-flex, `border-tag` border, `text-secondary` text, 4px radius, 11px/500 uppercase. "Adapted from library" uses `tag-accent` styles
- Char count: DM Sans 12px, `text-secondary`
- Copy preview: `surface-input` background, `border-input` border, 8px radius, DM Mono 13.5px/400, 1.5 line height
- Action row: primary button ("Copy text") + ghost button ("View rationale"), then quick action chips below
- Quick action chips: `border-tag` border, `text-chip` text, hover `tag-accent-bg` fill; `flex-wrap: nowrap; overflow: hidden` to keep on single line

**Alternatives group (multi-card):** when Lorem returns multiple alternatives, they are stacked in an `.alt-group` flex column. All cards in the group have equal width (`align-items: stretch`). Each card shows "Alternative N" source label in place of the standard tag. No quick action chips on alternative cards (actions on primary card only).

**"View rationale" button:** triggers version history panel (see Version history panel below). Carries `data-version` attribute.

**Version history toggle button:** opens/closes the same panel. Active state uses `color-primary` border and text.

**Scroll-to-bottom button:** absolute-positioned pill (30px height) centered above the follow-up bar (`bottom: 78px`). Hidden by default; appears when the user scrolls more than 120px above the bottom of the message list. Smooth-scrolls to the latest message on click. Fade + translateY transition (150ms). `surface-white` bg, `border-default` border, `shadow-md` elevation.

**Follow-up bar:**
- `border-top: 1px border-default`, `surface-white` background
- Padding: 14px 24px
- Input: `surface-base` background, `1.5px border-default` border, 8px radius, placeholder `text-secondary`
- Send button: primary button style

---

## Behaviour: Input scope validation

Lorem only handles UX writing tasks. When a user submits a prompt that is unrelated to UX copy, content design, or adjacent topics (guidelines, terminology, accessibility for copy), the input is rejected before the agent is called.

**Trigger surfaces:** Ask Lorem page (landing state) and the follow-up input on the conversation page (response state).

**Error treatment — same on both surfaces:**
- The textarea gets a red border: `border-color: var(--crit)` (`oklch(53% 0.22 27)`)
- Red error text appears directly below the textarea: "Lorem is a UX writing assistant. Try a UX copy question."
- Error text colour: `var(--crit-txt)` (`oklch(44% 0.19 27)`), 13px, `var(--font-ui)`
- No bot message is added to the chat thread
- The user's original prompt remains in the input field so they can edit and retry
- The error clears as soon as the user types (on `input` event)

**What does not happen:**
- No bot message, no toast, no modal
- No "your prompt was rejected" language — the error text states scope, not rejection
- No redirect suggestions or rephrasing of the user's prompt

**Production architecture (webapp backend):**
The validation uses a pre-flight LLM classification call (Approach B):
1. Frontend sends prompt to the backend
2. Backend runs a short classification call using a fast model (e.g. Haiku) with a scope-aware system prompt
3. System prompt instructs the model to return `{ in_scope: true/false, reason: string }`. It classifies broadly — passes anything plausibly related to copy, content, or writing for digital services. Only blocks prompts with no plausible connection.
4. If `in_scope: false`, backend returns a `validation_error` response; frontend shows the error state above
5. If `in_scope: true`, backend forwards to the lorem-uxwriter agent as normal

The classifier's `reason` field is for internal logging only and never surfaces to the user.

**Prototype simulation:** The prototype uses a client-side keyword list to simulate off-topic detection for demo purposes. The "Off-topic demo" chip on the Ask Lorem page populates the textarea with a clearly off-topic prompt to demonstrate the error state.

---

## Version history panel

Opened by "View rationale" on any bot card, or the "Version history" button in the page header.

**Desktop (>768px):** right-side panel, 380px wide, slides in via `width: 0 → 381px`, 250ms `cubic-bezier(0.25,1,0.5,1)`. No backdrop. `border-left: 1px border-default`, `surface-white` background.

**Mobile (≤768px):** full-screen overlay, bottom sheet. The panel becomes the backdrop (`rgba(30,45,58,0.4)`, `backdrop-filter: blur(2px)`). Sheet: `border-radius: 16px 16px 0 0`, `max-height: 92vh`, slides in from bottom (`translateY`), 220ms `cubic-bezier(0.25,1,0.5,1)`.

- Close: X button or Escape on desktop; X button, backdrop tap, or Escape on mobile
- Three ways to open: "View rationale" button, "Version history" button, clicking a version tab

**Internal structure:**
1. Header: "Version history" title (DM Sans 15px/600) + X close button (32×32px, 8px radius)
2. Version tabs: underline style, **descending order — newest version is always leftmost** (e.g. V5, V4, V3, V2, V1). The active tab is the latest and shows a "Latest" badge (`color-primary` bg, white text, `r-full` radius) with `color-primary` 2px underline. When the number of versions exceeds the panel width, the tab row scrolls horizontally; the scrollbar is hidden. New versions are prepended (inserted at the left), and the tab row scrolls back to `scrollLeft = 0` so the latest tab is always in view on open.
   - **Alternatives grouping:** when a response contains multiple alternatives, their version tabs are wrapped in a `.detail-tab-group` container (`role="presentation"`) with a 2px `provisional` indicator line along the top edge and 0.45 opacity. Inside each alternative's panel, an "Alternative N of M" badge (`provisional` color, 11px/600 uppercase) appears above the copy section. This makes it visually clear which versions came from the same multi-alternative response.
3. Body (scrollable, 20px padding, 16px gap):
   - Alternatives badge (when applicable): "Alternative N of M" — `provisional` color, 11px/600 uppercase, letter-spacing 0.05em
   - Source tag (accent style for "Adapted from library")
   - "SUGGESTED COPY" label + copy preview (DM Mono, `surface-input` bg, `1px border-input` border) + char count
   - Inactive versions (non-latest): copy preview switches to `surface-base` bg + `border-default` border
   - Rationale section (collapsible, `border-default` border, 10px radius)
   - Guidelines met section (collapsible, same style) with green check icons (`#1A8C6F`)

---

## Layout: Assistant history screen

A dedicated full-screen view of all past sessions. Accessed by clicking "View all" in the sidebar when the session list overflows the available height. Uses the standard app shell (topbar + sidebar + content).

```
┌──────────────────┬───────────────────────────────────────────┐
│ Sidebar          │  Assistant history        19 sessions     │  ← hist-header
│ WORKSPACE        │  [Search sessions...                    ] │
│  — Assistant     ├───────────────────────────────────────────┤
│  — Library       │  CPF contribution label          Today    │
│                  │  Error message — OTP timeout  Yesterday   │
│                  │  Confirmation — file upload   2 days ago  │
│                  │  Button copy — SingPass login 3 days ago  │
│                  │  ...                                       │
│                  ├───────────────────────────────────────────┤
│                  │  1–10 of 19     Page 1 of 2   [←]  [→]  │  ← pagination
└──────────────────┴───────────────────────────────────────────┘
```

**Sidebar (history screen):**
- Shows Workspace nav only: Assistant and Library. No session list section.
- Assistant → Ask Lorem landing state (empty state). Library → Library screen.
- The session history is the main content; repeating it in the sidebar would be redundant.

**Page header (`hist-header`):**
- Padding: 28px 40px 0, `border-bottom: 1px border-default`, `flex-shrink: 0`
- Title row: "Assistant history" (DM Sans 18px/600, `text-primary`) + session count inline (DM Sans 13px/400, `text-secondary`, e.g. "19 sessions"). Count updates live as search filters results.
- Search input: 32px height, max-width 300px, `surface-base` bg with embedded search icon (SVG inline via `background-image`, 10px left offset; padding-left 32px to clear icon), `border-input` border, `r-md` radius. Focus: `color-primary` border + `signal-subtle` ring + `surface-white` bg.

**Session list (`hist-list`):**
- `flex: 1`, `overflow-y: auto` — scrolls within the content area
- Each row is a `<button>` (full-width, `background: none`, `border: none`) with:
  - Session title: DM Sans 14px/500, `text-primary`, flex-1, left-aligned
  - Relative date: DM Sans 13px, `text-tertiary`, flex-shrink 0, right side (e.g. "Today", "Yesterday", "2 weeks ago")
  - Chevron-right icon: 13×13px, `text-tertiary`, `opacity: 0` at rest, `opacity: 1` on hover
- Row padding: 13px 40px. `border-bottom: 1px border-default`.
- Hover: `surface-base` bg, 100ms ease-out transition.
- Click: navigates to the Assistant screen in response state with the selected session loaded.
- Empty state (search returns no results): "No sessions match your search." in `text-secondary`, 14px, padding 48px 40px.

**Pagination bar (`hist-pagination`):**
- `border-top: 1px border-default`, flex space-between, padding 14px 40px, `flex-shrink: 0`
- Left: range label, DM Sans 13px, `text-secondary` — e.g. "1–10 of 19". Updates on every page change or search.
- Right: Prev button + page label + Next button
  - Prev/Next: 30×30px icon buttons, `border-default` border, `r-md` radius, `text-secondary` icon. Hover: `nav-bg-hover` bg, `text-primary` icon. Disabled: 0.35 opacity, `cursor: not-allowed`.
  - Page label: DM Sans 13px, `text-secondary` — e.g. "Page 1 of 2"
- Page size: 10 sessions per page
- Search filters the full list live and resets to page 1. Empty search restores the full unfiltered list.

---

## Layout: Library screen

```
┌──────────────────────────────────────────────────────────────┐
│ Library                                          [🔍 Search] │  ← page-header
│ Approved copy patterns for Singapore government              │
│ digital services.                                            │
├────────┬──────────┬─────────┬─────────┬──────────────────────┤  ← tabs
│ All    │ Forms    │ Modals  │ Buttons │ Errors               │
├──────────────────────────────────────────────────────────────┤
│ 39 entries · Global                                          │  ← list-meta
├──────────────────────┬───────────────────────────────────────┤
│ List (scrollable)    │ Detail (scrollable)                   │
│ [badge] copy text…   │ [source badge] [status badge]  [Copy] │
│ [badge] copy text…   │                                       │
│ ─ selected item ─    │ COPY                                  │
│ (blue left border,   │ [copy preview DM Mono]                │
│  primary ghost bg)   │                                       │
│                      │ METADATA                              │
│                      │ [table: ID, element type, scope…]     │
│                      │                                       │
│                      │ SCREENSHOT                            │
│                      │ [placeholder dashed border]           │
└──────────────────────┴───────────────────────────────────────┘
```

**Page header:** DM Sans 18px/600 title, 13px/400 `text-secondary` subtitle, `border-bottom: 1px border-default`

**Tabs:** underline style, `tab-rail` bottom border, `tab-active-indicator` 2px underline on active

**List pane:** 320px wide, `border-right: 1px border-default`
- Each item: DM Mono 13px for copy text, type badge left, status dot right
- Selected item: `2px signal` left border, `signal-subtle` background, `padding-left: 14px`
- Type badges: Label (blue tint), Hint (purple tint), Error (amber tint) — using source label token families

**Detail pane:** flex-1, 24px 28px padding
- Top row: source badges + "Copy text" primary button
- "COPY" section label + `border-input`-bordered copy box (`surface-input` bg, DM Mono)
- "METADATA" section label + table (`border-default` border, DM Mono values, DM Sans keys)
- "SCREENSHOT" section label + dashed placeholder

**Status badge:** pill shape (`border-radius: 9999px`), 11px/500, 1px border
- Approved: `confirmed-subtle` bg, `confirmed` text
- Draft: `provisional-subtle` bg, `provisional` text

---

## Layout: Changelog screen

```
┌──────────────────────────────────────────────────────────────┐
│ Changelog & Roadmap                                          │
│ What's shipped, what's coming, and what you've asked for.    │
├──────────────────┬───────────────────────────────────────────┤
│ Releases         │ Feature requests  │ Roadmap              │
├──────────────────┴───────────────────────────────────────────┤
│  (scrollable, max-width 680px centered, padding 32px 40px)   │
│                                                              │
│  v1.0.0  [major]                             26 May 2026     │
│  First release                                               │
│  ·  [feat]  UX writing assistant…                            │
└──────────────────────────────────────────────────────────────┘
```

**Content area:** `surface-white` background, `overflow-y: auto`. Inner container: max-width 680px, centered, padding 32px 40px.

**Page heading:** DM Sans 20px/600, `text-primary`. Subtitle: DM Sans 13.5px/400, `text-secondary`.

**Tabs:** underline style, same component as Library tabs.

**Release entry:**
- Version: DM Mono 15px/500, `text-primary`
- Version badge: pill, 12px/500, 1px border. major → adapted token family, minor → library token family, patch → AI token family
- Date: DM Sans 13px, `text-secondary`, pushed right
- Title: DM Sans 15px/600, `text-primary`
- Change tags: DM Mono 11px, 4px radius. feat → adapted family, fix → critical family, perf → AI-low family
- Entry separated by `border-bottom: 1px border-default`

**Feature requests tab:** vote button (upvote + count), title, description, status badge. Status: planned → adapted, reviewing → AI, considering → neutral.

**Roadmap tab:** three columns (Now / Next / Later), each with cards (`surface-white`, `border-default` border, 8px radius, hover `box-shadow: var(--shadow-sm)`).

**Data source:** all content comes from `changelog-data.js` (`CHANGELOG_RELEASES`, `CHANGELOG_REQUESTS`, `CHANGELOG_ROADMAP`). Never hardcode changelog content in HTML.

---

## Components

### Button

Three variants: `primary`, `secondary`, `ghost`. Plus `danger`.
Two sizes: `md` (default, 36px height), `sm` (28px height).

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| `primary` | `color-primary` | `text-inverse` | none | `color-primary-hover` |
| `secondary` | transparent | `color-primary` | 1.5px `color-primary` | `color-primary-ghost` fill |
| `ghost` | transparent | `text-secondary` | none | `nav-bg-hover` fill |
| `danger` | `critical` | `text-inverse` | none | `oklch(47% 0.21 27)` |

**Sizing:** md: 36px height, 0 16px padding, 14px font, 6px radius. sm: 28px height, 0 12px padding, 13px font, 5px radius.

**Font:** DM Sans, weight 500.

**States:** Loading = spinner replaces label (width fixed). Disabled = 0.5 opacity, cursor not-allowed.

**Transitions:** `background-color 100ms ease-out` only.

---

### Input / Textarea

- Background: `surface-white` (input), `surface-base` (textarea)
- Border: `1px border-input` (input), `1.5px border-default` (textarea)
- Border radius: 6px (input), 8-10px (textarea)
- Font: DM Sans 14px/400
- Placeholder: `text-tertiary`
- Focus: `color-primary` border, `surface-white` background (textarea), 2px Signal ring
- Disabled: 0.5 opacity

---

### Source label

```
[icon] Label text
```

- Display: inline-flex, align-items center, gap 4px
- Padding: 2px 8px
- Radius: 4px
- Font: DM Sans 12px/500
- Border: 1px (see source label tokens)
- **Icon is mandatory.** Never color alone.

| Tier | Icon |
|---|---|
| Library match | `check-circle-2` (Lucide) |
| Adapted from library | `arrow-up-right` |
| AI-generated | `sparkles` |
| AI-generated · lower confidence | `alert-triangle` |

---

### Navigation item (sidebar)

- Height: 36px, padding 0 8px, border-radius 6px
- Font: DM Sans 14px/400 (resting and hover), 500 when selected
- Icon: 15×15px Lucide, stroke-width 1.5
- Resting: `nav-text-resting`, no background
- Hover: `nav-bg-hover`, `nav-text-active`
- Selected: `nav-bg-selected`, `nav-text-active`, font-weight 500
- Transition: `background-color 100ms ease-out, color 100ms ease-out`

**Top nav links:** same three states, no selected state for single links (e.g. Changelog).

**Session list items:** DM Sans 13px, truncated, 30px height, same hover/active tokens.

---

### Tabs (all instances)

Used identically on Library, Changelog, and Version history modal. Same component, same tokens everywhere.

- Font: DM Sans 14px/500
- Resting: `tab-inactive-text`, `border-bottom: 2px solid transparent`
- Hover: `tab-hover-text`
- Active: `tab-active-text`, `border-bottom: 2px solid tab-active-indicator`, font-weight 600
- Container: `border-bottom: 1px solid tab-rail`
- Active tab `margin-bottom: -1px` so its underline merges with the rail

---

### Card

- Background: `surface-white`
- Border: `1px border-default`
- Border radius: 8px
- Padding: 16px (standard), 24px (content-heavy)
- Shadow: none at rest. `var(--shadow-sm)` only when card must lift off a tinted background.
- No nested cards. No side-stripe borders.

---

### Chip / tag

- Background: `tag-default-bg` (transparent)
- Border: `1px border-tag`
- Radius: 99px (pill)
- Font: DM Sans 12.5px/500, `text-chip`
- Hover: `tag-accent-bg` fill, `border-tag-accent` border
- Padding: 4-5px 12px

---

### Modal

- Backdrop: `rgba(30,45,58,0.4)`, `backdrop-filter: blur(2px)`
- Container: `surface-white`, 16px radius, max-width 560px, max-height 90vh, `var(--shadow-lg)`
- Animation: `opacity 0→1, translateY 12px→0, scale 0.98→1`, 200ms `cubic-bezier(0.25,1,0.5,1)`
- Close button: 32×32px, 8px radius, transparent, X icon (Lucide). Hover: `nav-bg-hover`
- Dismiss: X button, backdrop click, Escape key
- Body scroll lock while open (`document.body.style.overflow = 'hidden'`)
- Focus trap

---

## Elevation

Static surfaces have no shadow. Shadows appear only for floating elements.

| Token | Value | Use |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Card lift off tinted bg (use sparingly) |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)` | Modals |

**The Flat-By-Default Rule.** Cards, panels, sidebar items, and input fields have no shadow at rest. Borders define them. Shadows appear only when an element floats above the page.

---

## Spacing system

8-point base grid. All values are multiples of 4px.

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Icon-to-label gap, tight internal padding |
| `space-2` | 8px | Default gap between related elements |
| `space-3` | 12px | Input internal padding; small component padding |
| `space-4` | 16px | Card padding, section gap |
| `space-6` | 24px | Page-level content padding |
| `space-8` | 32px | Section separation |
| `space-10` | 40px | Major section gaps |
| `space-12` | 48px | Page-level vertical rhythm |

---

## Border radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 4px | Badges, source labels, tags |
| `radius-md` | 6px | Buttons, inputs, sidebar items |
| `radius-lg` | 8px | Cards, panels, dropdowns |
| `radius-xl` | 12px | Modals, landing card |
| `radius-full` | 9999px | Pills, chips |

---

## Mobile

At ≤768px:
- Hamburger button appears left of logo in topbar
- Sidebar slides in from left as overlay (`transform: translateX(-100%) → 0`)
- Backdrop overlay appears behind sidebar, tap to close
- Version history modal is full-screen (100vw, 100vh from 48px down)
- Page headers stack vertically
- Bot card actions stack to single column
- At ≤400px: "UX Writing Assistant" subtitle hides in topbar

---

## Motion

All animations respect `prefers-reduced-motion: reduce`.

| Element | Duration | Easing | Property |
|---|---|---|---|
| Button hover | 100ms | ease-out | background-color only |
| Nav item hover | 100ms | ease-out | background-color only |
| Modal open | 200ms | `cubic-bezier(0.25,1,0.5,1)` | opacity, translateY, scale |
| Card enter | 300ms | `cubic-bezier(0.25,1,0.5,1)` | opacity, translateY |
| AI response | 200ms | ease-out | opacity, translateY 4px→0 |
| Sidebar slide | 220ms | `cubic-bezier(0.25,1,0.5,1)` | transform |

Never animate layout properties (width, height, padding, margin). Transition opacity and transform only.

---

## Icons

Use **Lucide** exclusively. Stroke-width: 1.5 everywhere. Never use emoji as structural icons.

| Context | Icon |
|---|---|
| Assistant | `pen-line` |
| Library | `book-open` |
| Copy to clipboard | `copy` |
| Search | `search` |
| Menu (hamburger) | `menu` |
| Close | `x` |
| Send | `send` |
| More options | `ellipsis` |
| Collapse/expand | `chevron-down` / `chevron-up` |
| Version history | `layout-panel-right` |
| Source — library match | `check-circle-2` |
| Source — adapted | `arrow-up-right` |
| Source — AI generated | `sparkles` |
| Source — lower confidence | `alert-triangle` |

---

## Accessibility

- All interactive elements: visible focus rings (`2px signal, 2px offset`, `:focus-visible` only)
- Color is never the sole differentiator. Source labels require icon + text + color.
- All icon-only buttons have `aria-label`
- Form labels always visible; no placeholder-only patterns
- Minimum contrast: 4.5:1 body text, 3:1 large text and UI components
- All modals trap focus, close on Escape
- `aria-live="polite"` on AI response container
- `prefers-reduced-motion: reduce` respected on all transitions
- Mobile tap targets: minimum 44×44px

---

## Anti-patterns

- No shadows on static cards or panels
- No gradients on buttons, backgrounds, or any surface
- No side-stripe borders (`border-left` or `border-right` > 1px as a colored accent)
- No gradient text
- No emoji as structural icons
- No placeholder-as-label patterns
- No nested cards
- No full-bleed illustrations or decorative graphics
- No identical card grids
- No modals as first-thought solutions
- No DM Mono outside copy string display
- No Signal used beyond focus rings and active states
- No source label colors repurposed for decoration
- No hardcoded hex values in component code — use semantic tokens
- No system font stack — DM Sans is now the UI font everywhere

---

## How to read this document

**DESIGN.md takes precedence over MASTER.md in all conflicts.** DESIGN.md is the implementation spec. MASTER.md provides rationale and layout context.

Values marked **[ABSOLUTE]** are exact — never approximate, never use judgment. Values not marked are guidelines.

---

## Absolute dimension reference

These values appear throughout the spec. They are all **[ABSOLUTE]**.

| Element | Property | Value |
|---|---|---|
| Topbar | height | 48px |
| Topbar | padding | 0 24px |
| Sidebar | width | 228px |
| Sidebar | min-width | 228px |
| Nav item | height | 36px |
| Nav item | padding | 0 8px |
| Nav item | icon size | 15×15px |
| Nav item | icon-to-label gap | 8px |
| Nav item icon | stroke-width | 1.5 |
| History item | height | 30px |
| Landing card | max-width | 560px |
| Landing card | padding | 40px |
| Landing card | internal gap | 20px |
| Brand icon | size | 44×44px |
| Brand icon | border-radius | 12px |
| Landing textarea | min-height | 120px |
| Landing textarea | padding | 12px 14px |
| Submit button | height | 44px |
| Submit button | width | 100% |
| Library list pane | width | 320px |
| Library list pane | min-width | 320px |
| Bot card | padding | 12px |
| Bot card | internal gap | 9px |
| Source tag | font-size | 11.5px |
| Source tag | icon size | 11×11px |
| Copy preview | font-size | 13px DM Mono |
| Inline action button | height | 26px |
| Version history panel | width (desktop) | 380px |
| Page title | font-size | 18px |
| Nav section label | font-size | 11px |
| Quick label | font-size | 11px |
| Chip | font-size | 12px |
| Tab | font-size | 13.5px |

---

## Implementation verification

**Before marking any task complete, open each affected page in a browser and check every item below. Do not mark done based on code review alone — visual confirmation is required.**

### Fonts — open devtools, inspect each element type

- [ ] `body` uses DM Sans — geometric, slightly rounded letterforms. If it looks like San Francisco or Segoe UI, the font is not loading.
- [ ] Copy preview boxes (`.suggested-copy-box`, `.list-item-text`, `.detail-copy-box`) use DM Mono — obviously monospaced, fixed-width characters
- [ ] "Ask *Lorem*" heading on landing uses DM Serif Display — serif, editorial. "Lorem" is italic and `#3B5BA5` blue.
- [ ] No element uses a standalone system font stack — inspect `font-family` in devtools on body, nav items, and buttons to confirm

### Dimensions — use devtools ruler or computed styles

- [ ] Topbar: 48px tall
- [ ] Sidebar: 228px wide (check computed width, not just CSS)
- [ ] Nav items: 36px tall
- [ ] Nav icons: 15×15px and rendering (not empty squares or emoji fallbacks)
- [ ] Landing card: max-width 560px, 40px padding on all sides
- [ ] Submit button: full width, 44px tall
- [ ] Textarea: at least 120px tall
- [ ] Library list pane: 320px wide

### Colours — compare visually against these values

- [ ] Submit button: solid `#3B5BA5` — saturated blue, not grey, not washed out
- [ ] Bot card background: `#F0EDE8` — warm off-white with a beige cast, clearly different from white
- [ ] User bubble background: `#3A5068` — dark slate blue, not black, not navy
- [ ] "Adapted from library" tag: `#E8E2D9` background, `#4A5D6B` text — warm taupe, not blue, not green
- [ ] Landing page background: faint radial gradient (subtle blue-green atmosphere) — not flat white or flat grey
- [ ] Active nav item: white pill background on `#F7F8FA` sidebar — visually distinct from resting items

### Layout structure

- [ ] Library: two-pane split — list (320px left) + detail (flex-1 right) — NOT a single full-width column
- [ ] Library data loads — real entries visible in list, NOT "No entries yet" empty state
- [ ] Library page title reads "Library" — NOT "Copy library"
- [ ] Library has search box top-right and tab bar (All, Forms, Modals, Buttons, Errors)
- [ ] Landing "Try" chips sit on a single row — NOT wrapping to two lines
- [ ] Topbar spans full viewport width on every page
- [ ] Sidebar right border starts below the topbar, not running behind it
- [ ] Version history panel: slides in as right panel on desktop (≥768px), bottom sheet on mobile

### States

- [ ] Active nav item (current page) shows white pill background, `#1E2D3A` text
- [ ] Resting nav items show no background, `#6B8499` text
- [ ] Active tab shows `#3B5BA5` 2px underline, font-weight 600
- [ ] Textarea focus shows `#3B5BA5` border, white background
- [ ] Primary button hover darkens to `#334F94`
- [ ] Chip hover shows `#E8E2D9` fill, `#B8AA9E` border
