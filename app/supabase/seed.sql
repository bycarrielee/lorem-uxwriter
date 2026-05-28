-- Products
insert into public.products (name, slug, description) values
  ('MyLegacy', 'mylegacy', 'End-of-life planning service'),
  ('SupportGoWhere', 'sgw', 'Social support finder for citizens');

-- Global foundations (voice)
insert into public.foundations (type, scope, content) values
('voice', 'global', '# Voice guidelines

## Voice attributes

1. **Clear, not bureaucratic** — Use conversational plain language. No jargon. Write like you speak to a person, not a committee.
2. **Helpful, not condescending** — Be supportive without over-explaining. Trust users.
3. **Direct but empathetic** — Be clear about rules and requirements, but acknowledge when something is difficult.
4. **Transparent, not evasive** — Be upfront about requirements, timelines, and decisions.

## Tone by context

- **Success:** Confirming, brief. "Your application has been submitted."
- **Neutral:** Clear, direct. "Select a date to continue."
- **Guidance:** Helpful, specific. "Your NRIC number is on the front of your card."
- **Warning:** Clear, no panic. "Your session will close in 2 minutes."
- **Error:** Specific, solution-focused. "Enter a valid Singapore phone number (e.g. 9123 4567)."
- **Rejection:** Direct, factual, actionable. "You do not meet the income criteria. You may appeal within 30 days."
- **Destructive action:** Serious, precise. "This will permanently delete your draft. You cannot undo this."

## Writing principles

- Be concise — shorter is better, one idea per sentence
- Be specific — not vague or generic
- Be positive — focus on what users can do, not what they cannot
- Be direct — get to the point immediately');

-- Global foundations (accessibility)
insert into public.foundations (type, scope, content) values
('accessibility', 'global', '# Accessibility guidelines

## Plain language (WCAG 3.1.5)

- Flesch-Kincaid reading level ≤ 8
- Sentences ≤ 15 words
- Prefer common words over technical terms
- Define acronyms on first use

## Button and link text

- Describe the action or destination — never "Click here" or "Read more"
- Text must make sense out of context (screen reader users navigate by links)
- Button: verb phrase. "Download report", not "Report"

## Form labels

- Every input must have a visible label
- Error messages must identify the field and explain how to fix it
- Do not use placeholder text as a substitute for labels

## WCAG 2.1 Level AA

- Colour is not the only way to convey meaning
- All content is keyboard-navigable
- Focus indicators are visible');

-- Global foundations (style)
insert into public.foundations (type, scope, content) values
('style', 'global', '# Style guide

## Capitalisation
- Sentence case by default: "Save and continue", not "Save And Continue"
- Proper nouns and official scheme names use their official capitalisation

## Dates
- Format: 19 April 2026 (not 19/04/2026 or Apr 19)

## Numbers
- Spell out one to nine; use numerals for 10 and above
- Currency: S$1,234.56

## Punctuation
- Oxford comma: "voice, style, and accessibility"
- Curly apostrophes: you''re, it''s
- No ampersands except in official names

## Active voice
- Default to active voice: "Submit your application" not "Your application should be submitted"
- Use passive voice only when the actor is unknown or irrelevant

## Contractions
- Use common positive contractions: you''re, it''s, we''ve
- Avoid negative contractions in critical contexts: "You are not eligible" not "You aren''t eligible"');

-- Global foundations (localisation)
insert into public.foundations (type, scope, content) values
('localisation', 'global', '# Localisation guidelines

## Text expansion allowance

Leave space for translations to be longer:
- Chinese: text can be ~25% shorter
- Malay: text can be ~15% longer
- Tamil: text can be ~40% longer

Design UI to accommodate the longest variant.

## Frontloading

Put the most important information first — translated text may be truncated in tight spaces.

## Avoid

- Idioms and puns (do not translate well)
- Culturally specific references
- Embedding UI element labels inside sentences

## Icons

Always pair icons with text labels. Icon meanings vary across cultures.');

-- Global foundations (terminology)
insert into public.foundations (type, scope, content) values
('terminology', 'global', '# Government terminology

Always use the official names. These are legal names — incorrect usage is a factual error.

## Common agencies

- Central Provident Fund Board (CPF Board) — not "CPF" alone or "CPF Board"
- Ministry of Social and Family Development (MSF)
- Ministry of Health (MOH)
- Housing & Development Board (HDB)
- Inland Revenue Authority of Singapore (IRAS)
- Immigration & Checkpoints Authority (ICA)

## Common schemes (use exact names)

- Baby Bonus Cash Gift — not "Baby Bonus Scheme"
- ComLink+ Progress Package for Debt Clearance — not "ComLink Package"
- Workfare Income Supplement (WIS) — not "Workfare Scheme"
- MediShield Life — not "MediShield" (discontinued)
- Silver Support Scheme

## NRIC/FIN

- NRIC number — not "IC number" or "identity card number"
- Use "NRIC/FIN" when referring to both Singapore citizens/PRs and foreign nationals');

-- Global patterns (buttons)
insert into public.patterns (element_type, scope, content) values
('buttons', 'global', '# Button copy guidelines

## Rules

1. Start with a verb: "Save", "Submit", "Download", not "Saving", "Submission"
2. Sentence case: "Save and continue", not "Save And Continue"
3. Be specific: "Submit grant application" beats "Submit"
4. Keep it short: 1–4 words for primary actions, up to 6 for complex flows
5. No punctuation at the end

## Primary buttons (one per page)
Use for the main forward action. Examples:
- "Continue"
- "Submit application"
- "Create account"
- "Confirm and pay"

## Secondary buttons
- "Cancel"
- "Go back"
- "Save draft"

## Destructive buttons
Be explicit about consequences:
- "Delete account" not "Remove"
- "Withdraw application" not "Cancel"

## Common patterns
- Multi-step form progress: "Save and continue"
- Final submission: "Submit [thing]"
- Notification opt-in: "Get notified"
- File actions: "Download [filetype]", "Upload document"');

-- Global patterns (errors)
insert into public.patterns (element_type, scope, content) values
('errors', 'global', '# Error message guidelines

## Structure

1. **What went wrong** — specific, not generic ("Enter a valid NRIC number", not "Invalid input")
2. **Why** — only if not obvious and genuinely helpful
3. **How to fix** — actionable next step

## Rules

- Never blame the user: "The date entered is not valid" not "You entered an invalid date"
- Be specific: name the field, name the requirement
- Avoid technical language: no error codes, stack traces, or system messages visible to users
- Use plain language: Flesch-Kincaid ≤ 8

## Patterns by error type

**Format errors:**
"Enter a valid [field name] (e.g. [example])"
Example: "Enter a valid phone number (e.g. 9123 4567)"

**Required field:**
"Enter your [field name]"
Example: "Enter your date of birth"

**Out of range:**
"[Field] must be [constraint]"
Example: "Date must be in the past"

**System errors:**
"Something went wrong. Try again or contact [support]."
Never expose system details.');

-- Global patterns (modals)
insert into public.patterns (element_type, scope, content) values
('modals', 'global', '# Modal copy guidelines

## Structure

Every modal needs:
1. **Header** — short, describes the situation (not a question unless confirmation modal)
2. **Body** — one clear paragraph, what the user needs to know
3. **Primary action button** — specific verb, what happens next
4. **Secondary action** (optional) — "Cancel" or "Go back"

## Rules

- Header: 3–6 words, sentence case, no punctuation
- Body: ≤ 2 sentences, plain language
- Primary button: specific ("Delete account", not "OK" or "Confirm")
- Never use "Yes/No" as button labels — they have no meaning out of context

## Patterns by type

**Confirmation (destructive):**
Header: "Delete [thing]?"
Body: "This cannot be undone."
Primary: "Delete [thing]" (red/destructive styling)
Secondary: "Cancel"

**Session timeout:**
Header: "Your session is about to end" (warning) or "Your [form] has been closed" (post-timeout)
Body: Explain what happened and what to do next
Primary: "Continue session" or "Back to [service]"

**Information:**
Header: States the situation
Body: What the user needs to know
Primary: "OK" or specific action if there is one');

-- Global patterns (alerts)
insert into public.patterns (element_type, scope, content) values
('alerts', 'global', '# Alert guidelines

Rules for writing alert, banner, and toast copy across all products.

## Core rules

1. **Frontload the most important information** — Lead with the outcome, not the action.
2. **Frame messages from the user''s perspective** — Focus on what happens to the user, not what the system is doing.
3. **Match verbs between headers and buttons for risky actions** — Primary button verb must mirror the verb in the header.
4. **No apologies for expected system behaviour** — Do not apologise for maintenance windows, session timeouts, or routine alerts.
5. **Keep informational alerts short** — Single sentence or short phrase unless the user must take action.

## Alert types

**Informational:** `Draft saved`, `Changes saved`, `Added to your list`
**Warning:** `3 days left to submit your application`, `You have unsaved changes`
**Success/toast:** `Application submitted`, `Document uploaded`

**Confirmation (risky action):**
Header must be a question. Primary button verb mirrors the header verb.
- Leave and lose changes? → Primary: Leave | Cancel: Stay
- Delete this document? → Primary: Delete | Cancel: Cancel
- Withdraw your application? → Primary: Withdraw | Cancel: Go back

**Session timeout (form, about to expire):**
Header: Your session will close soon
Body: You have [X minutes] left. Save your progress to avoid losing your changes.
Primary: Save draft | Cancel: Continue

**Session timeout (form, expired):**
Header: Your form has been closed
Body: It looks like you''ve left, so we closed the form to protect your privacy.
Primary: Back to service

**Session timeout (signed-in):**
Header: Still there?
Body: For your security, you''ll be signed out in [X minutes] due to inactivity.
Primary: Stay signed in | Cancel: Sign out

**Maintenance:** Bold "Maintenance alert" as header. No apologies.
Format: Day, Date Month Year, Time to Time.
Example: This service will be unavailable on Saturday, 20 June 2026, 10pm to 2am. Save your progress before then.

## Anti-patterns

- `Oops! Something went wrong` — Informal; provides no action
- `Are you sure?` alone — Not descriptive
- `Please note that…` — Unnecessary preamble');

-- Global patterns (forms)
insert into public.patterns (element_type, scope, content) values
('forms', 'global', '# Form copy guidelines

Rules for writing form labels, helper text, placeholder text, and hint text across all products.

## Labels

1. **Keep labels short and direct** — Labels name the field. Explanations belong in helper text.
2. **No colons** — The input field itself indicates a response is expected.
3. **Sentence case** — `Date of birth`, not `Date Of Birth`
4. **Use nouns, not instructions** — `Email address`, not `Enter your email address`
5. **Required vs optional** — Mark optional fields with `(optional)` after the label. Do not mark required fields.

## Helper text

Use when format is not self-evident, a specific value is required, or the field has an unexpected consequence.
Rules: one or two short sentences, sentence case with full stop, do not repeat the label, do not start with "Please".

Examples:
- NRIC number: `Your NRIC starts with S, T, F, or G`
- Company UEN: `Enter your Unique Entity Number, not your trading name`
- Income: `Include all sources: salary, freelance, rental income`

## Placeholder text

Use to show a concrete example of the expected format only. Never as a substitute for a label.

Examples:
- Email address: `example: name@email.com`
- Postal code: `example: 560123`
- Date of birth: `DD/MM/YYYY`

Rules: sentence case, no full stops, one example only.

## Hint text

Short guidance for specific components (passwords, file uploads).

- Password: `At least 8 characters, including 1 number`
- File upload: `JPG, PNG, or PDF. Maximum 5 MB.`
- Character limit: `Maximum 200 characters`
- Multiple selection: `Select all that apply`

## Anti-patterns

- `Please enter your…` as a label — labels name fields, not give instructions
- Placeholder text as the only label — placeholder disappears on focus; inaccessible
- `N/A` for optional fields — use `(optional)` instead');

-- Global patterns (states)
insert into public.patterns (element_type, scope, content) values
('states', 'global', '# States copy guidelines

Rules for writing loading, success, empty, and status state copy across all products.

## Loading states

Use present continuous tense. End with an ellipsis (…). No full stops.

Examples: `Loading…`, `Saving…`, `Submitting…`, `Retrieving your Myinfo details…`
Always follow with a completion state: `Document uploaded`, `Application submitted`, `Saved`

## Success states

Use past tense or passive construction to front-load the outcome.
Always include a next step or timeline if one exists.
No exclamation marks except for genuine first-time milestone moments.
Do not use "Congratulations!" — government services cover a wide range of life circumstances. Confirm the action; do not interpret what it means to the person.

Examples:
- Application submitted → `We''ll email you within 14 working days with our decision.`
- Payment confirmed → `Your receipt has been sent to [email address].`
- Registration complete → `You can now use [product name] to [key action].`

## Empty states

Do not write `No items found` or `Nothing here`. Explain what the space is for.

First-use: explain the feature and how to get started.
User-triggered (search/filter): address the underlying goal.

Examples:
- No applications: `You haven''t submitted any applications` / `Applications you submit will appear here.`
- No search results: `No results for "[search term]". Try different keywords or remove some filters.`

## Status labels

Use these consistently across all products:

Pending · In progress · Action required · Approved · Rejected · Cancelled · Completed · Draft · Expired

Pair with description when label alone is not enough: `Action required: Upload your supporting documents by 30 June 2026`

## Anti-patterns

- `No items found` — unhelpful; does not tell the user what to do
- `Congratulations!` on life events — do not assume the event is a happy one
- Colour-only status indicators — must pair with a text label');

-- Global patterns (links)
insert into public.patterns (element_type, scope, content) values
('links', 'global', '# Link copy guidelines

Rules for writing link text across all products.

## Core rules

1. **Frontload important words** — Users focus on the first 2 words. Put the most meaningful words first.
2. **Use verb phrases for task initiation** — `Apply for subsidies`, not `Subsidy application`
3. **Make the label meaningful out of context** — Screen reader users navigate by links. Every link must make sense in isolation.
4. **Match the link text to the destination page title** — Helps users confirm they are in the right place.
5. **Never display raw URLs** — Not meaningful to screen readers; not translatable.
6. **Warn before linking to files** — Indicate file type and size: `Application guide (PDF, 1.2 MB)`

## Examples

Bad → Good:
- `Click here to read the privacy policy` → `Read the privacy policy`
- `Learn more` → `Learn more about the Workfare Income Supplement`
- `https://www.singpass.gov.sg` → `Sign in with Singpass`

## External links

Add "(opens in a new tab)" when the link opens a new window.
Only open in a new tab when there is a strong reason.

## Anti-patterns

- `Click here` — assumes mouse input; no destination context; inaccessible
- `Read more` / `Learn more` without context — meaningless out of context
- `Apply here` — use `Apply for [scheme name]` instead
- Raw URLs — not accessible or translatable');

-- Global patterns (content — long-form)
insert into public.patterns (element_type, scope, content) values
('content', 'global', '# Long-form copy guidelines

Rules for writing long-form content across all products.

## Core rules

1. **Write for readers who skim** — Use headings, summary sentences, lists, and tables as navigation tools.
2. **Frontload the answer** — State the answer, then explain it. Frame from user''s perspective: "You can" or "You are entitled to", not "The scheme provides".
3. **Cut content that does not help the user act** — If removing a sentence does not affect the user''s ability to decide or act, remove it.
4. **Use plain language** — Flesch-Kincaid accessible level. Avoid legal language, bureaucratic phrasing, unexplained acronyms, and idioms.
5. **Use exact figures** — Not "around $3,000" but "$3,000". Not "approximately 4 weeks" but "4 weeks".
6. **Keep sentences short** — 15 to 20 words per sentence.
7. **Use consistent terminology** — One term per concept throughout. Introduce new terms with a definition sentence.
8. **Open each section with a summary sentence** — Readers who scan get the key point.
9. **Use lists for conditions, steps, and options** — Bullets for 3+ parallel items; numbered lists for sequential steps.
10. **Use tables for comparisons and structured data** — Eligibility tiers, payment amounts, option comparisons.
11. **Write self-contained paragraphs** — Each paragraph must make sense without surrounding context.
12. **Match tone to subject:**
  - Benefits and entitlements: practical, direct, neutral
  - Life events: warm but not effusive
  - Loss and death: calm, practical, compassionate
  - Legal criteria: precise, factual

For sensitive topics, acknowledge briefly before practical steps. Do not linger.

## Anti-patterns

- Opening with policy rationale before the answer
- Using synonyms to avoid repetition — creates inconsistency
- Section headings like "Overview", "Background", "Introduction"
- Soft-pedalling thresholds: "around", "approximately"
- Ending without a next step or action');

-- Global patterns (push-notifications)
insert into public.patterns (element_type, scope, content) values
('push-notifications', 'global', '# Push notification guidelines

Rules for writing push notifications across all products.

Every notification must justify the interruption. Only send notifications for something timely, actionable, or genuinely important.

## Structure

| Part | Max length | Purpose |
| --- | --- | --- |
| Title | ~30 characters | What this is about |
| Body | ~120 characters | The key information or action |

Frontload everything — only title and first ~2 lines of body are visible on a locked screen.

## Core rules

1. **Lead with the most important information** — If the title does not communicate the core message, the notification will be ignored.
2. **Be specific in the body** — Tell users exactly what happened or what they need to do.
3. **State deadlines** — If the user must act by a date, include it.
4. **No clickbait** — Users who feel misled will disable notifications. `3 days left to complete your application`, not `Don''t miss out!`
5. **Plain language** — No jargon, no bureaucratic language.
6. **Sentence case, no full stops in titles** — Body copy ends with a full stop.
7. **Match to in-app destination** — Tap should land on the relevant screen, not the home page.

## Notification types

**Transactional** (always send):
- Application approved: `Application approved` / `Your [scheme] application has been approved. First payment by [date].`
- Action required: `Action required` / `Upload your [document] by [date] to avoid delays.`

**Reminder** (time-sensitive):
- Deadline: `[X] days left` / `Your [scheme] application closes on [date]. Submit it before then.`

**Informational** (use sparingly):
- New scheme: `New scheme available` / `You may be eligible for [scheme]. Tap to find out.`

## Anti-patterns

- `You have a new notification` — circular; meaningless
- `Don''t miss out!` — clickbait
- `Hi [name], we wanted to let you know…` — filler preamble');

-- Global patterns (release-notes)
insert into public.patterns (element_type, scope, content) values
('release-notes', 'global', '# Release notes guidelines

Rules for writing release notes and app update copy across all products.

Write from the user''s perspective: what can they now do, do better, or no longer have to deal with?

## Structure

### What''s new
[New features: what the user can now do]

### Improvements
[Changes to existing features: what works better]

### Fixed
[Bugs resolved: what the user no longer experiences]

Use only relevant sections. Do not include an empty section.

## Core rules

1. **Write for the user, not the developer** — `Signing in is now faster`, not `Refactored authentication module`
2. **Lead with the benefit** — `You can now switch to dark mode in Settings`, not `Added dark mode`
3. **Plain language** — No technical terms, jargon, or internal terminology
4. **Be specific** — `Fixed a bug that caused the form to lose your progress`, not `Bug fixes`
5. **Tense:** New features: `You can now…` / Improvements: `[Feature] is now faster` / Fixes: `Fixed a bug that…`
6. **Sentence case, full stops on complete sentences**
7. **Omit internal-only changes** — No infrastructure updates, code refactors, or dependency upgrades users cannot see
8. **Most important update first**

## Mobile app stores

- Do not mention iOS, Android, iPhone, or iPad
- Do not use "What''s new" as a heading (iOS App Store adds this automatically)
- Keep under 500 characters (Android Play Store requirement)

## Anti-patterns

- `Bug fixes and performance improvements` — too vague
- `Refactored X module` — developer language
- `We have been working hard to improve your experience` — filler
- `This update contains important security patches` alone — tell users what it means for them');

-- Seed one copy entry as an example
insert into public.copy_entries (
  element_type, scope, copy, context, rationale, tags, tone, journey_stage, status
) values (
  'modals',
  'global',
  '{"header": "Your form has been closed", "body": "It looks like you''ve left, so we closed the form to protect your privacy.", "primary_button": "Back to service"}',
  'Session timeout modal — appears after user has been inactive for 15–30 minutes on a form or authenticated page.',
  'Frames timeout as a privacy feature, not a system failure. "It looks like you''ve left" is gentler than "You were inactive". "Back to service" is specific about the destination.',
  ARRAY['timeout', 'session', 'inactivity', 'privacy', 'error-recovery'],
  'empathetic',
  'error-recovery',
  'active'
);
