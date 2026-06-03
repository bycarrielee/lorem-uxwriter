---
name: lorem-webapp
description: AI-assisted UX copy management for Singapore government digital services

# PRECEDENCE: In case of conflict between DESIGN.md and MASTER.md, DESIGN.md wins.
# DESIGN.md is the token and element implementation spec.
# MASTER.md is the rationale and layout context spec.

colors:
  # Surfaces
  surface-base: "#F7F8FA"
  surface-card: "#F0EDE8"
  surface-input: "#EDE8E0"
  surface-white: "#FFFFFF"
  # Borders
  border-default: "#E0E5EA"
  border-input: "#D9D2C8"
  border-tag: "#C4B9AE"
  border-tag-accent: "#B8AA9E"
  # Text
  text-primary: "#1E2D3A"
  text-secondary: "#6B8499"
  text-chip: "#4A5D6B"
  text-inverse: "#FFFFFF"
  text-tertiary: "#94A3B8"
  # Interactive
  color-primary: "#3B5BA5"
  color-primary-hover: "#334F94"
  color-primary-ghost: "rgba(59,91,165,0.06)"
  # Tabs
  tab-inactive-text: "#6B8499"
  tab-hover-text: "#1E2D3A"
  tab-active-text: "#1E2D3A"
  tab-active-indicator: "#3B5BA5"
  tab-rail: "#E0E5EA"
  # Navigation
  nav-text-resting: "#6B8499"
  nav-text-active: "#1E2D3A"
  nav-bg-hover: "#EAECEE"
  nav-bg-selected: "#FFFFFF"
  nav-pill-radius: "6px"
  # Chat bubbles
  bubble-user-bg: "#3A5068"
  bubble-user-text: "#EDF2F6"
  bubble-bot-bg: "#F0EDE8"
  bubble-bot-text: "#1E2D3A"
  # Tags
  tag-default-bg: "transparent"
  tag-default-border: "#C4B9AE"
  tag-default-text: "#1E2D3A"
  tag-accent-bg: "#E8E2D9"
  tag-accent-border: "#B8AA9E"
  tag-accent-text: "#4A5D6B"
  # Source labels (semantic provenance — never repurpose)
  confirmed: "oklch(44% 0.15 162)"
  confirmed-subtle: "oklch(97% 0.05 162)"
  provisional: "oklch(65% 0.17 72)"
  provisional-subtle: "oklch(99% 0.05 80)"
  critical: "oklch(53% 0.22 27)"
  critical-subtle: "oklch(98% 0.04 27)"
  # Focus ring
  signal: "oklch(51% 0.24 264)"
  signal-subtle: "oklch(97% 0.04 264)"
  # Shadows
  shadow-sm: "0 1px 2px rgba(0,0,0,0.05)"
  shadow-md: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)"
  shadow-lg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)"

typography:
  # UI font — loaded from Google Fonts
  ui-font: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  # Mono font — loaded from Google Fonts, copy string display only
  mono-font: "'DM Mono', 'JetBrains Mono', ui-monospace, monospace"
  # Wordmark font — loaded from Google Fonts, product name only
  display-font: "'DM Serif Display', Georgia, serif"

  display:
    fontFamily: "{typography.display-font}"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "{typography.ui-font}"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "{typography.ui-font}"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  heading-sm:
    fontFamily: "{typography.ui-font}"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body-lg:
    fontFamily: "{typography.ui-font}"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: "{typography.ui-font}"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  body-sm:
    fontFamily: "{typography.ui-font}"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "{typography.ui-font}"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.07em"
    textTransform: "uppercase"
  caption:
    fontFamily: "{typography.ui-font}"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.01em"
  code:
    fontFamily: "{typography.mono-font}"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"

rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"

spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"

components:
  button-primary:
    backgroundColor: "{colors.color-primary}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
    font: "{typography.body}"
    fontWeight: 500
  button-primary-hover:
    backgroundColor: "{colors.color-primary-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.color-primary}"
    borderColor: "{colors.color-primary}"
    borderWidth: "1.5px"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
    font: "{typography.body}"
    fontWeight: 500
  button-secondary-hover:
    backgroundColor: "{colors.color-primary-ghost}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-danger:
    backgroundColor: "{colors.critical}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  input-default:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border-input}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 12px"
    font: "{typography.body}"
  input-focus:
    borderColor: "{colors.color-primary}"
    boxShadow: "0 0 0 2px {colors.signal-subtle}"
  textarea-default:
    backgroundColor: "{colors.surface-base}"
    borderColor: "{colors.border-default}"
    borderWidth: "1.5px"
    rounded: "{rounded.lg}"
    minHeight: "120px"
    padding: "12px 14px"
    font: "{typography.body}"
  textarea-focus:
    borderColor: "{colors.color-primary}"
    backgroundColor: "{colors.surface-white}"
  topbar:
    height: "48px"
    backgroundColor: "{colors.surface-base}"
    borderBottom: "1px solid {colors.border-default}"
    padding: "0 24px"
  sidebar:
    width: "228px"
    minWidth: "228px"
    backgroundColor: "{colors.surface-base}"
    borderRight: "1px solid {colors.border-default}"
  nav-item:
    height: "36px"
    padding: "0 8px"
    rounded: "{rounded.md}"
    font: "{typography.body}"
    fontWeight: 400
    gap: "8px"
  nav-item-icon:
    width: "15px"
    height: "15px"
    strokeWidth: 1.5
  nav-item-resting:
    color: "{colors.nav-text-resting}"
    backgroundColor: "transparent"
  nav-item-hover:
    color: "{colors.nav-text-active}"
    backgroundColor: "{colors.nav-bg-hover}"
  nav-item-selected:
    color: "{colors.nav-text-active}"
    backgroundColor: "{colors.nav-bg-selected}"
    fontWeight: 500
  tab:
    font: "{typography.body}"
    fontWeight: 500
    paddingX: "4px"
    paddingY: "12px"
    marginRight: "20px"
  tab-inactive:
    color: "{colors.tab-inactive-text}"
    borderBottom: "2px solid transparent"
  tab-hover:
    color: "{colors.tab-hover-text}"
  tab-active:
    color: "{colors.tab-active-text}"
    borderBottom: "2px solid {colors.tab-active-indicator}"
    fontWeight: 600
  tab-rail:
    borderBottom: "1px solid {colors.tab-rail}"
  chat-bubble-user:
    backgroundColor: "{colors.bubble-user-bg}"
    textColor: "{colors.bubble-user-text}"
    borderRadius: "16px 16px 4px 16px"
    alignment: "right"
    padding: "11px 16px"
    font: "{typography.body}"
  chat-bubble-bot:
    backgroundColor: "{colors.bubble-bot-bg}"
    textColor: "{colors.bubble-bot-text}"
    borderRadius: "16px 16px 16px 4px"
    alignment: "left"
    padding: "12px"
    gap: "9px"
  badge-library:
    backgroundColor: "{colors.confirmed-subtle}"
    textColor: "{colors.confirmed}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
    font: "{typography.label}"
  badge-adapted:
    backgroundColor: "{colors.tag-accent-bg}"
    borderColor: "{colors.tag-accent-border}"
    textColor: "{colors.tag-accent-text}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
    font: "{typography.label}"
  badge-ai:
    backgroundColor: "{colors.provisional-subtle}"
    textColor: "{colors.provisional}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
    font: "{typography.label}"
  status-badge-approved:
    backgroundColor: "{colors.confirmed-subtle}"
    textColor: "{colors.confirmed}"
    borderColor: "oklch(85% 0.07 162)"
    rounded: "{rounded.full}"
    padding: "1px 7px"
    font: "{typography.caption}"
    fontWeight: 500
  status-badge-draft:
    backgroundColor: "{colors.provisional-subtle}"
    textColor: "{colors.provisional}"
    borderColor: "oklch(83% 0.1 72)"
    rounded: "{rounded.full}"
    padding: "1px 7px"
    font: "{typography.caption}"
    fontWeight: 500
  modal:
    backgroundColor: "{colors.surface-white}"
    borderRadius: "{rounded.xl}"
    maxWidth: "560px"
    shadow: "{colors.shadow-lg}"
    backdropColor: "rgba(30,45,58,0.4)"
    backdropFilter: "blur(2px)"
    animation: "opacity 0→1, translateY 12px→0, scale 0.98→1, 200ms ease-out"
  modal-close-btn:
    width: "32px"
    height: "32px"
    rounded: "{rounded.lg}"
    backgroundColor: "transparent"
    color: "{colors.text-secondary}"
  modal-close-btn-hover:
    backgroundColor: "{colors.nav-bg-hover}"
    color: "{colors.text-primary}"

# ─────────────────────────────────────────────────────────────
# ELEMENT SPECS
# These are ABSOLUTE. Every CSS selector listed below must be
# implemented with exactly these values. Do not approximate,
# do not inherit, do not use judgment. Set explicitly.
# ─────────────────────────────────────────────────────────────
element_specs:

  body:
    font-family: "var(--font-ui)"
    font-size: "14px"
    font-weight: 400
    line-height: 1.5
    color: "var(--text-primary)"
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale

  # ── Shell ──────────────────────────────────────────────────

  topbar:
    height: "48px"                          # ABSOLUTE
    padding: "0 24px"                       # ABSOLUTE
    display: flex
    align-items: center
    flex-shrink: 0
    background: "var(--surface-base)"
    border-bottom: "1px solid var(--border-default)"

  sidebar:
    width: "228px"                          # ABSOLUTE
    min-width: "228px"                      # ABSOLUTE — never shrink
    flex-shrink: 0
    height: "100%"
    background: "var(--surface-base)"
    border-right: "1px solid var(--border-default)"

  body-row:
    display: flex
    flex: 1
    overflow: hidden
    min-height: 0

  # ── Navigation ─────────────────────────────────────────────

  nav-section-label:
    font-family: "var(--font-ui)"           # ABSOLUTE — never mono or display
    font-size: "11px"                       # ABSOLUTE
    font-weight: 600                        # ABSOLUTE
    letter-spacing: "0.07em"               # ABSOLUTE
    text-transform: uppercase
    color: "var(--text-secondary)"
    padding: "0 8px"
    margin-bottom: "4px"

  nav-item:
    font-family: "var(--font-ui)"
    font-size: "13.5px"                     # ABSOLUTE
    font-weight: 400                        # resting; 500 when selected
    height: "36px"                          # ABSOLUTE
    padding: "0 8px"                        # ABSOLUTE
    border-radius: "6px"
    display: flex
    align-items: center
    gap: "8px"                              # ABSOLUTE — icon to label

  nav-item-icon:
    width: "15px"                           # ABSOLUTE
    height: "15px"                          # ABSOLUTE
    flex-shrink: 0
    stroke-width: 1.5                       # ABSOLUTE

  history-item:
    font-family: "var(--font-ui)"
    font-size: "13px"                       # ABSOLUTE
    font-weight: 400
    height: "30px"                          # ABSOLUTE
    padding: "0 8px"
    border-radius: "6px"
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  topnav-link:
    font-family: "var(--font-ui)"
    font-size: "13.5px"                     # ABSOLUTE
    font-weight: 500
    padding: "5px 10px"
    border-radius: "6px"

  # ── Page headers ───────────────────────────────────────────

  page-title:
    font-family: "var(--font-ui)"           # ABSOLUTE — never mono or display
    font-size: "18px"                       # ABSOLUTE
    font-weight: 600                        # ABSOLUTE
    line-height: 1.3

  page-meta:
    font-family: "var(--font-ui)"
    font-size: "13px"                       # ABSOLUTE
    font-weight: 400
    color: "var(--text-secondary)"

  # ── Tabs ───────────────────────────────────────────────────

  tab:
    font-family: "var(--font-ui)"
    font-size: "13.5px"                     # ABSOLUTE
    font-weight: 500
    padding: "12px 4px"
    margin-right: "20px"
    margin-bottom: "-1px"                   # merges underline with rail

  tab-active:
    font-weight: 600                        # ABSOLUTE

  # ── Bot card ───────────────────────────────────────────────

  bot-card:
    background: "var(--surface-card)"      # ABSOLUTE — #F0EDE8, the ONLY warm surface
    border-radius: "14px 14px 14px 4px"    # standalone; first-in-group: 14px 14px 10px 4px
    padding: "12px"                         # ABSOLUTE
    gap: "9px"                              # ABSOLUTE
    box-shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"

  source-tag:
    font-family: "var(--font-ui)"           # ABSOLUTE — never mono
    font-size: "11.5px"                     # ABSOLUTE
    font-weight: 500
    padding: "3px 9px"
    border-radius: "99px"
    display: inline-flex
    align-items: center
    gap: "5px"

  source-tag-icon:
    width: "11px"                           # ABSOLUTE
    height: "11px"                          # ABSOLUTE
    stroke-width: 1.2

  alt-label:
    font-family: "var(--font-ui)"
    font-size: "11px"                       # ABSOLUTE
    font-weight: 600
    letter-spacing: "0.05em"
    text-transform: uppercase
    color: "var(--text-secondary)"

  suggested-copy-box:
    font-family: "var(--font-mono)"         # ABSOLUTE — MUST be mono, never ui-font
    font-size: "13px"                       # ABSOLUTE
    font-weight: 400
    line-height: 1.55
    padding: "9px 11px"
    border-radius: "7px"
    background: "var(--surface-input)"
    border: "1px solid var(--border-input)"
    width: "100%"

  char-count:
    font-family: "var(--font-ui)"
    font-size: "11.5px"                     # ABSOLUTE
    font-weight: 400
    color: "var(--text-secondary)"
    font-variant-numeric: tabular-nums

  icon-btn:
    font-family: "var(--font-ui)"
    font-size: "12px"                       # ABSOLUTE
    font-weight: 500
    height: "26px"                          # ABSOLUTE
    padding: "0 10px"
    border-radius: "6px"
    display: inline-flex
    align-items: center
    gap: "5px"

  card-divider:
    height: "1px"
    background: "var(--border-input)"
    margin: "0 -12px"                       # bleeds to card edges

  quick-label:
    font-family: "var(--font-ui)"
    font-size: "11px"                       # ABSOLUTE
    font-weight: 500
    color: "var(--text-secondary)"

  chip:
    font-family: "var(--font-ui)"
    font-size: "12px"                       # ABSOLUTE
    font-weight: 500
    padding: "3px 10px"
    border-radius: "99px"
    border: "1px solid var(--border-tag)"
    background: transparent
    color: "var(--text-chip)"

  # ── Chat bubbles ───────────────────────────────────────────

  bubble-user:
    background: "var(--bubble-user-bg)"     # ABSOLUTE — #3A5068
    color: "var(--bubble-user-text)"        # ABSOLUTE — #EDF2F6
    font-family: "var(--font-ui)"
    font-size: "14px"
    font-weight: 400
    border-radius: "16px 16px 4px 16px"    # ABSOLUTE
    padding: "11px 16px"
    max-width: "65%"
    align-self: flex-end

  # ── Landing card ───────────────────────────────────────────

  landing-card:
    background: "var(--surface-white)"
    border: "1px solid var(--border-default)"
    border-radius: "16px"                   # ABSOLUTE
    padding: "40px"                         # ABSOLUTE
    max-width: "560px"                      # ABSOLUTE
    width: "100%"
    display: flex
    flex-direction: column
    gap: "20px"                             # ABSOLUTE
    box-shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)"

  brand-icon:
    width: "44px"                           # ABSOLUTE
    height: "44px"                          # ABSOLUTE
    border-radius: "12px"                   # ABSOLUTE
    background: "#1A8C6F"                   # ABSOLUTE

  card-title:
    font-family: "var(--font-display)"      # ABSOLUTE — MUST be DM Serif Display
    font-size: "26px"                       # ABSOLUTE
    font-weight: 700                        # ABSOLUTE
    letter-spacing: "-0.01em"
    line-height: 1.2

  card-title-em:
    font-style: italic
    color: "var(--color-primary)"           # ABSOLUTE — "Lorem" in heading is blue

  card-subtitle:
    font-family: "var(--font-ui)"
    font-size: "14px"
    font-weight: 400
    color: "var(--text-secondary)"

  landing-textarea:
    min-height: "120px"                     # ABSOLUTE
    padding: "12px 14px"                    # ABSOLUTE
    border-radius: "10px"
    border: "1.5px solid var(--border-default)"
    background: "var(--surface-base)"
    width: "100%"
    resize: none

  submit-button:
    width: "100%"                           # ABSOLUTE
    height: "44px"                          # ABSOLUTE
    border-radius: "8px"
    border: none
    background: "var(--color-primary)"      # ABSOLUTE — #3B5BA5, never grey
    color: "#ffffff"

  landing-background:
    background: |
      radial-gradient(ellipse 60% 50% at 50% 60%, rgba(59,91,165,0.05) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 20% 20%, rgba(26,140,111,0.04) 0%, transparent 60%)

  # ── Library ─────────────────────────────────────────────────

  list-pane:
    width: "320px"                          # ABSOLUTE
    min-width: "320px"                      # ABSOLUTE — never shrink
    flex-shrink: 0
    border-right: "1px solid var(--border-default)"
    overflow: hidden

  list-item-text:
    font-family: "var(--font-mono)"         # ABSOLUTE — MUST be mono
    font-size: "13px"                       # ABSOLUTE
    font-weight: 400
    line-height: 1.5

  detail-copy-box:
    font-family: "var(--font-mono)"         # ABSOLUTE — MUST be mono
    font-size: "13px"                       # ABSOLUTE
    font-weight: 400
    line-height: 1.6
    background: "var(--surface-input)"
    border: "1px solid var(--border-input)"
    border-radius: "8px"
    padding: "12px 14px"

  metadata-key:
    font-family: "var(--font-ui)"           # ABSOLUTE — keys are NOT mono
    font-size: "13.5px"
    font-weight: 500
    color: "var(--text-secondary)"

  metadata-value:
    font-family: "var(--font-mono)"         # ABSOLUTE — values ARE mono
    font-size: "13px"
    font-weight: 400

  library-badge:
    font-family: "var(--font-ui)"
    font-size: "11px"                       # ABSOLUTE
    font-weight: 600
    letter-spacing: "0.02em"
    border-radius: "4px"
    padding: "2px 8px"

  # ── Changelog ──────────────────────────────────────────────

  release-version:
    font-family: "var(--font-mono)"         # ABSOLUTE
    font-size: "15px"                       # ABSOLUTE
    font-weight: 500

  release-title:
    font-family: "var(--font-ui)"
    font-size: "15px"
    font-weight: 600

  release-item-text:
    font-family: "var(--font-ui)"
    font-size: "14px"
    font-weight: 400
    line-height: 1.5

  item-type-tag:
    font-family: "var(--font-mono)"         # ABSOLUTE
    font-size: "11px"                       # ABSOLUTE
    font-weight: 500
    border-radius: "4px"
    padding: "2px 8px"
---

# Design System: lorem-webapp

**DESIGN.md takes precedence over MASTER.md in all conflicts.**

See MASTER.md for rationale, layout diagrams, and context.
This file is the implementation spec. Claude Code reads this for exact values.

## Font loading

Add to `<head>` of every HTML page, before any stylesheets:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
```

## CSS custom properties

Add to `:root`:

```css
:root {
  /* Surfaces */
  --surface-base: #F7F8FA;
  --surface-card: #F0EDE8;
  --surface-input: #EDE8E0;
  --surface-white: #FFFFFF;

  /* Borders */
  --border-default: #E0E5EA;
  --border-input: #D9D2C8;
  --border-tag: #C4B9AE;
  --border-tag-accent: #B8AA9E;

  /* Text */
  --text-primary: #1E2D3A;
  --text-secondary: #6B8499;
  --text-chip: #4A5D6B;
  --text-inverse: #FFFFFF;
  --text-tertiary: #94A3B8;

  /* Interactive */
  --color-primary: #3B5BA5;
  --color-primary-hover: #334F94;
  --color-primary-ghost: rgba(59, 91, 165, 0.06);

  /* Tabs */
  --tab-inactive-text: #6B8499;
  --tab-hover-text: #1E2D3A;
  --tab-active-text: #1E2D3A;
  --tab-active-indicator: #3B5BA5;
  --tab-rail: #E0E5EA;

  /* Navigation */
  --nav-text-resting: #6B8499;
  --nav-text-active: #1E2D3A;
  --nav-bg-hover: #EAECEE;
  --nav-bg-selected: #FFFFFF;

  /* Chat bubbles */
  --bubble-user-bg: #3A5068;
  --bubble-user-text: #EDF2F6;
  --bubble-bot-bg: #F0EDE8;
  --bubble-bot-text: #1E2D3A;

  /* Tags */
  --tag-default-bg: transparent;
  --tag-default-border: #C4B9AE;
  --tag-default-text: #1E2D3A;
  --tag-accent-bg: #E8E2D9;
  --tag-accent-border: #B8AA9E;
  --tag-accent-text: #4A5D6B;

  /* Source labels */
  --lib-bg: oklch(97% 0.05 162);
  --lib-txt: oklch(44% 0.15 162);
  --lib-bd: oklch(85% 0.07 162);
  --ada-bg: #E8E2D9;
  --ada-txt: #4A5D6B;
  --ada-bd: #B8AA9E;
  --ai-bg: oklch(99% 0.05 80);
  --ai-txt: oklch(51% 0.16 72);
  --ai-bd: oklch(83% 0.1 72);
  --ail-bg: oklch(99% 0.04 55);
  --ail-txt: oklch(54% 0.18 45);
  --ail-bd: oklch(85% 0.09 55);
  --crit-bg: oklch(98% 0.04 27);
  --crit: oklch(53% 0.22 27);
  --crit-txt: oklch(44% 0.19 27);
  --crit-bd: oklch(86% 0.08 27);

  /* Signal */
  --signal: oklch(51% 0.24 264);
  --signal-subtle: oklch(97% 0.04 264);
  --provisional: oklch(65% 0.17 72);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);

  /* Border radius */
  --r-sm: 4px;
  --r-md: 6px;
  --r-lg: 8px;
  --r-xl: 12px;
  --r-full: 9999px;

  /* Spacing */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-6: 24px; --sp-8: 32px; --sp-10: 40px; --sp-12: 48px;

  /* Typography */
  --font-ui:      'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:    'DM Mono', 'JetBrains Mono', ui-monospace, monospace;
  --font-display: 'DM Serif Display', Georgia, serif;

  /* Legacy aliases — do not use in new code */
  --paper: var(--surface-base);
  --canvas: var(--surface-white);
  --divider: var(--border-default);
  --txt-1: var(--text-primary);
  --txt-2: var(--text-secondary);
  --txt-3: var(--text-tertiary);
  --ink: var(--text-primary);
  --txt-inv: var(--text-inverse);
}
```

## Font override sweep

After any implementation pass, search the codebase and fix:

| Find | Replace with |
|---|---|
| `font-family: system-ui` | `var(--font-ui)` |
| `font-family: -apple-system` | `var(--font-ui)` |
| `font-family: sans-serif` (standalone) | `var(--font-ui)` |
| `font-family: monospace` (standalone) | `var(--font-mono)` |
| `font-size: 16px` on any nav/label/badge/chip | check element_specs above |
| `font-size: 1rem` outside body-lg reading surfaces | convert to px |
