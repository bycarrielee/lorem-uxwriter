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
