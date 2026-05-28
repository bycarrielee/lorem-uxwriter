-- Add new element_type enum values and missing global patterns.
--
-- IMPORTANT: Run in two steps in the Supabase SQL editor.
--
-- STEP 1: Run 003a_enum.sql first and wait for it to complete.
-- STEP 2: Then run this file (starting from the INSERT statements below).
--
-- PostgreSQL cannot use new enum values in the same transaction they are created.

-- (ALTER TYPE statements have been moved to 003a_enum.sql)

-- Global patterns (alerts)
insert into public.patterns (element_type, scope, content) values
('alerts', 'global', $$# Alert guidelines

Rules for writing alert, banner, and toast copy across all products. Products can override by creating `patterns/{product}/alerts.md`.

---

## What alerts are for

Alerts have three purposes:
- Inform users about expected events or status changes
- Communicate potential issues or risks
- Confirm risky actions before they are taken

---

## Core rules

### 1. Frontload the most important information
Lead with the outcome, not the action. The most critical information must come first.

| Bad example | Good example |
| --- | --- |
| `We've saved your changes` | `Changes saved` |
| `Your session will close in 5 minutes` | `5 minutes left before your session closes` |

Exception: a conversational tone is acceptable when the context calls for it (e.g., a warm success state on a first-time action).

### 2. Frame messages from the user's perspective
Focus on what happens to the user, not what the system is doing.

| Bad example | Good example |
| --- | --- |
| `The system will discard unsaved data` | `You'll lose unsaved changes` |
| `Session will be terminated due to inactivity` | `Your session will close because you've been inactive` |

### 3. Match verbs between headers and buttons for risky actions
When an alert asks a user to confirm a destructive or risky action, the primary button verb must mirror the verb in the header.

| Header | Primary button |
| --- | --- |
| `Leave and lose changes?` | `Leave` |
| `Delete this application?` | `Delete` |
| `Withdraw your claim?` | `Withdraw` |

### 4. No apologies for expected system behaviour
Do not apologise for maintenance windows, session timeouts, or routine alerts. These are expected events.

### 5. Keep informational alerts short
Informational alerts and toasts should be a single sentence or short phrase. No additional explanation is needed unless the user must take action.

---

## Alert types

### Informational alerts
Status updates or contextual information. No action required.

| Scenario | Copy |
| --- | --- |
| Draft saved | `Draft saved` |
| Changes saved | `Changes saved` |
| Item added | `Added to your list` |
| Deadline reminder | `Your application closes on 15 June 2026` |

### Warning alerts
Something may go wrong or there is a time-sensitive condition. The user may need to act.

| Scenario | Copy |
| --- | --- |
| Approaching deadline | `3 days left to submit your application` |
| Incomplete section | `You haven't completed Section 3. You need to finish it before you can submit.` |
| Unsaved changes | `You have unsaved changes` |

### Success alerts and toasts
Confirmation that an action completed. Keep it brief.

| Scenario | Copy |
| --- | --- |
| Form submitted | `Application submitted` |
| Changes saved | `Changes saved` |
| File uploaded | `Document uploaded` |
| Item removed | `Removed from your list` |

### Confirmation alerts (risky actions)
Before a destructive or irreversible action. Header must be a question. Primary button verb mirrors the header verb.

#### Unsaved changes
```
Header:  Leave and lose changes?
Body:    You'll lose any changes you haven't saved.
Primary: Leave
Cancel:  Stay
```

#### Deleting an item
```
Header:  Delete this document?
Body:    This will be permanently deleted. This cannot be undone.
Primary: Delete
Cancel:  Cancel
```

#### Withdrawing an application
```
Header:  Withdraw your application?
Body:    You'll need to submit a new application if you change your mind.
Primary: Withdraw
Cancel:  Go back
```

### Session timeout alerts
Displayed when a session is about to expire or has already expired.

#### Session about to expire (form)
```
Header:  Your session will close soon
Body:    You have [X minutes Y seconds] left. Save your progress to avoid losing your changes.
Primary: Save draft
Cancel:  Continue
```

#### Session expired (form)
```
Header:  Your form has been closed
Body:    It looks like you've left, so we closed the form to protect your privacy.
Primary: Back to service
```

#### Session about to expire (signed-in)
```
Header:  Still there?
Body:    For your security, you'll be signed out in [X minutes] due to inactivity.
Primary: Stay signed in
Cancel:  Sign out
```

### Concurrent session alert
Displayed when the user's account is accessed from another device.

In-app banner: `Your account has been signed in on another device. If this wasn't you, sign out and change your password.`

Email alert: include device type, approximate location, and date and time of sign-in.

### Maintenance alerts
Displayed before planned downtime. Bold "Maintenance alert" as the header. No apologies.

Format: Day, Date Month Year, Time to Time (spell out the day).

| Scenario | Copy |
| --- | --- |
| Upcoming maintenance | **Maintenance alert**<br>This service will be unavailable on Saturday, 20 June 2026, 10pm to 2am. Save your progress before then. |
| Service restored | `Service restored. You can continue where you left off.` |

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| `Oops! Something went wrong` | Informal; provides no action |
| `Are you sure?` (alone) | Not descriptive; sure about what? |
| `Warning!` (alone) | Not descriptive; no context or action |
| `Please note that…` | Unnecessary preamble; start with the information |$$);

-- Global patterns (forms)
insert into public.patterns (element_type, scope, content) values
('forms', 'global', $$# Form copy guidelines

Rules for writing form labels, helper text, placeholder text, and hint text across all products. Products can override by creating `patterns/{product}/forms.md`.

---

## Labels

### 1. Keep labels short and direct
Labels name the field. They do not explain it. Explanations belong in helper text.

| Bad example | Good example |
| --- | --- |
| `Please enter your full legal name as shown on your NRIC` | `Full name` |
| `Your current residential address in Singapore` | `Home address` |
| `Date of birth (DD/MM/YYYY)` | `Date of birth` |

Exception: you can use a question-style label in onboarding flows if a conversational tone is preferred. Questions should be natural and direct: `What's your name?`, `Where do you live?`. Apply this consistently across the flow. Do not mix question-style and noun-style labels in the same form.

### 2. No colons
Labels do not end with a colon. The input field itself indicates that a response is expected.

### 3. Sentence case
Capitalise only the first word and proper nouns.

| Bad example | Good example |
| --- | --- |
| `Date Of Birth` | `Date of birth` |
| `NRIC Number` | `NRIC number` |
| `Mobile Number` | `Mobile number` |

### 4. Use nouns, not instructions
Labels name the information requested. They are not instructions.

| Bad example | Good example |
| --- | --- |
| `Enter your email address` | `Email address` |
| `Select your nationality` | `Nationality` |
| `Upload your supporting document` | `Supporting document` |

Exception: use an instruction-style label when the action is not obvious, such as for file upload fields where format constraints are important.

### 5. Required vs optional fields
Mark optional fields with `(optional)` in lowercase after the label. Do not mark required fields. Required is the default expectation.

| Required | Optional |
| --- | --- |
| `Date of birth` | `Middle name (optional)` |
| `Mobile number` | `Alternative contact number (optional)` |

Do not use asterisks (*) for required fields unless they are accompanied by a visible legend explaining the convention. Per accessibility standards, labels and instructions must be explicit; do not rely on colour or symbols alone.

---

## Helper text

Helper text appears below the label (or below the field, depending on the design system). Use it to explain why a field exists or provide format guidance when it is not obvious.

### When to use helper text
- Format is not self-evident from the label alone
- A specific value is required (e.g., the registered number of a business, not a trading name)
- The field has a consequence the user may not expect

### When not to use helper text
- The field is self-explanatory (e.g., `Email address`)
- The helper text would simply repeat the label
- Format guidance is already shown in the placeholder

### Examples

| Field | Helper text |
| --- | --- |
| NRIC number | `Your NRIC starts with S, T, F, or G` |
| Company UEN | `Enter your Unique Entity Number, not your trading name` |
| Date of birth | `Enter the date as shown on your NRIC or passport` |
| Income | `Include all sources: salary, freelance, rental income` |

### Rules
- Keep helper text to one or two short sentences
- Sentence case, with a full stop if it is a complete sentence
- Do not repeat the label
- Do not front-load with "Please"; start with the information

---

## Placeholder text

Placeholder text appears inside the input field before the user types. It disappears when the user starts typing.

### When to use placeholder text
- To show a concrete example of the expected format
- `example:` prefix is acceptable when showing an example value

### When not to use placeholder text
- As a substitute for a label (labels must always be visible)
- As a substitute for helper text (placeholder text disappears and cannot be relied on for instructions)

### Examples

| Field | Placeholder |
| --- | --- |
| Email address | `example: name@email.com` |
| Postal code | `example: 560123` |
| Mobile number | `example: 9123 4567` |
| Date of birth | `DD/MM/YYYY` |

### Rules
- Sentence case
- No full stops
- Keep it short: one example value or format hint only

---

## Hint text

Short guidance shown alongside specific UI components (e.g., password fields, file upload fields). Often a condensed version of helper text when space is limited.

| Scenario | Hint |
| --- | --- |
| Password requirements | `At least 8 characters, including 1 number` |
| File upload | `JPG, PNG, or PDF. Maximum 5 MB.` |
| Character limit | `Maximum 200 characters` |
| Multiple selection | `Select all that apply` |

---

## Section headings and instructions

### Group headings
Use headings to group related fields in long forms. Keep them short noun phrases.

- `Personal details`
- `Contact information`
- `Income and employment`
- `Supporting documents`

### Form-level instructions
When a form has specific requirements a user must know before starting, state them at the top of the form, not buried in helper text.

| Bad example | Good example |
| --- | --- |
| Burying "You'll need your SingPass login" in section 3 | `Before you start: You'll need your SingPass login and a recent payslip.` |

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| `Please enter your…` (as a label) | Labels name fields; they do not give instructions |
| `*Required` legend at the bottom of the form | Required markers must be explained before the form, not after |
| Placeholder text as the only label | Placeholder disappears on focus; inaccessible |
| `Enter text here` as placeholder | Meaningless; provides no example or guidance |
| `N/A` as a label for optional fields | Use `(optional)` instead |$$);

-- Global patterns (states)
insert into public.patterns (element_type, scope, content) values
('states', 'global', $$# States copy guidelines

Rules for writing loading, success, empty, and status state copy across all products. Products can override by creating `patterns/{product}/states.md`.

---

## Loading states

Loading states must be announced to assistive technologies (use `aria-live`). They tell users something is happening so they do not think the page has frozen.

### Rules
- Use present continuous tense: `Loading…`, `Saving…`, `Submitting…`
- Add context when the loading action is not obvious
- Follow with a completion state when loading finishes

### Examples

| Scenario | Loading state | Completion state |
| --- | --- | --- |
| Page loading | `Loading…` | (none) |
| Search results loading | `Loading results…` | `4 results found` or `No results found` |
| File uploading | `Uploading…` | `Document uploaded` |
| Form submitting | `Submitting…` | `Application submitted` |
| Data saving | `Saving…` | `Saved` |
| Fetching Myinfo data | `Retrieving your Myinfo details…` | `Details retrieved` |

### Rules
- End with an ellipsis (`…`), which signals an in-progress state
- No full stops
- Sentence case
- Keep it to 1 to 3 words unless context is needed

---

## Success states

Success states confirm that something worked. They must be specific enough for the user to know exactly what succeeded.

### Rules
- Use past tense or passive construction to front-load the outcome: `Application submitted`, `Changes saved`
- For significant milestones (completing a multi-step process), a slightly warmer tone is appropriate
- Include a next step when the user needs to do something after the success

### Examples

| Scenario | Header | Body (if needed) |
| --- | --- | --- |
| Application submitted | `Application submitted` | `We'll email you within 14 working days with our decision.` |
| Payment confirmed | `Payment confirmed` | `Your receipt has been sent to [email address].` |
| Profile created | `Profile created` | (none needed) |
| Document uploaded | `Document uploaded` | (none needed) |
| Registration complete | `Registration complete` | `You can now use [product name] to [key action].` |
| Password changed | `Password updated` | `Use your new password next time you sign in.` |

### Rules
- No exclamation marks except for genuine milestone moments (completing a complex multi-step process for the first time)
- Do not use "Congratulations!" or assume the user's feelings about the event. A birth registration, for example, may be a moment of joy for most users but not for all. Government services handle a wide range of life circumstances. Confirm the action; do not interpret what it means to the person.
- Always include a next step or timeline if one exists

---

## Empty states

Empty states appear when there is no content to display. They should explain what the space is for and what the user can do to populate it.

### Two types

**First-use empty states** appear when users have never used a feature. Explain what it does and how to get started.

**User-triggered empty states** appear when users clear content through filters, search, or deletion. Address their underlying goal and offer a helpful next step.

### Rules
- Do not write `No items found` or `Nothing here`. Explain what the space is for
- Frame positively: empty states are opportunities to guide, not failures to apologise for
- Include an actionable suggestion where possible
- Keep it to 2 to 3 sentences maximum

### First-use empty state examples

| Screen | Header | Body | Action |
| --- | --- | --- | --- |
| Applications (none submitted) | `You haven't submitted any applications` | `Applications you submit will appear here. You can track their status and view decisions.` | `Browse available schemes` |
| Saved items (none saved) | `Nothing saved yet` | `Save services or articles to find them quickly later.` | (none) |
| Documents (none uploaded) | `No documents uploaded` | `Upload your documents here to keep them in one place.` | `Upload a document` |

### User-triggered empty state examples

| Scenario | Copy |
| --- | --- |
| No search results | `No results for "[search term]". Try different keywords or remove some filters.` |
| Filters return nothing | `No results match your filters. Try changing or removing some filters.` |
| All items deleted | `Your list is empty. Add items to get started.` |

---

## Status states

Used to communicate the current status of an application, document, or process. Status labels must be clear, consistent, and meaningful without relying on colour alone.

### Standard status labels

| Status | Label | Meaning |
| --- | --- | --- |
| Pending | `Pending` | Submitted; awaiting review |
| In progress | `In progress` | Being processed or reviewed |
| Action required | `Action required` | User must do something to proceed |
| Approved | `Approved` | Application or request accepted |
| Rejected | `Rejected` | Application or request declined |
| Cancelled | `Cancelled` | Withdrawn by the user or expired |
| Completed | `Completed` | Process finished successfully |
| Draft | `Draft` | Not yet submitted |
| Expired | `Expired` | Deadline passed without submission |

### Rules
- Use consistent labels across all products. Do not use `Submitted` in one product and `Pending` in another for the same state.
- Pair status labels with a description when the label alone is not enough: `Action required: Upload your supporting documents by 30 June 2026`
- Sentence case

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| `Loading…` with no completion state | Leaves users uncertain when loading finishes |
| `No items found` | Unhelpful; does not tell the user what the space is for or what to do |
| `Congratulations!` on life events such as birth or marriage registration | Do not assume the event is a happy one. Confirm the action was completed; do not interpret how the user feels about it |
| `Processing…` with no timeout or fallback message | Users need to know what to do if loading takes too long |
| `Unknown status` | Always show a meaningful status, even if it is `Pending review` |
| Colour-only status indicators | Must pair with a text label for accessibility |$$);

-- Global patterns (links)
insert into public.patterns (element_type, scope, content) values
('links', 'global', $$# Link copy guidelines

Rules for writing link text across all products. Products can override by creating `patterns/{product}/links.md`.

---

## Core rules

### 1. Frontload important words
Users scan link text; research shows they focus on the first 2 words. Put the most meaningful words first.

| Bad example | Good example |
| --- | --- |
| `Click here to read the privacy policy` | `Read the privacy policy` |
| `To apply for Baby Bonus, click here` | `Apply for Baby Bonus` |
| `Find out more about eligibility` | `Eligibility requirements` |

### 2. Use verb phrases for task initiation
When a link starts a task or takes the user somewhere to do something, begin with a verb.

| Bad example | Good example |
| --- | --- |
| `Preschool options` | `Find preschool options` |
| `Subsidy application` | `Apply for subsidies` |
| `Document download` | `Download the guide` |

### 3. Make the label meaningful out of context
Screen reader users may navigate a page by cycling through all links. Every link must make sense when read in isolation.

| Bad example | Good example |
| --- | --- |
| `Click here` | `View your application status` |
| `Learn more` | `Learn more about the Workfare Income Supplement` |
| `Read more` | `Read about eligibility for the Baby Bonus scheme` |

### 4. Match the link text to the destination page title
When a link leads to a specific page, the link text should match or closely reflect that page's title. This helps users confirm they are in the right place after clicking.

### 5. Do not display raw URLs
Never use a URL as link text. URLs are not meaningful to screen reader users and are not translatable.

| Bad example | Good example |
| --- | --- |
| `Go to www.cpf.gov.sg/member to check your balance` | `Check your CPF balance` |
| `https://www.singpass.gov.sg` | `Sign in with Singpass` |

### 6. Do not link to files without warning
When a link opens a file (PDF, Word document), indicate the file type and size in the link text or immediately after it.

| Bad example | Good example |
| --- | --- |
| `Click here` (links to a PDF) | `Application guide (PDF, 1.2 MB)` |
| `Download` | `Download the grant guide (PDF, 340 KB)` |

---

## Inline vs standalone links

**Inline links** appear within a sentence. They should flow naturally as part of the sentence.

**Standalone links** appear on their own line or in a list. They should be self-contained and descriptive without relying on surrounding text.

---

## External links

- Add "(opens in a new tab)" after the link text for links that open in a new window
- Only open in a new tab when there is a strong reason

| Link text |
| --- |
| `Singpass (opens in a new tab)` |
| `Government Terms Translated (opens in a new tab)` |

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| `Click here` | Assumes mouse input; no destination context; inaccessible |
| `Here` (as a link within a sentence) | Meaningless out of context |
| `Read more` (without context) | Does not describe what will be read |
| `Learn more` (without context) | Does not describe what will be learned |
| `Apply here` | "Here" has no meaning; use `Apply for [scheme name]` |
| Displaying a raw URL | Not accessible; not translatable |$$);

-- Global patterns (content — long-form)
insert into public.patterns (element_type, scope, content) values
('content', 'global', $$# Long-form copy guidelines

Rules for writing long-form content across all products. Products can override by creating `patterns/{product}/long-form.md`.

---

## What long-form copy is for

Long-form pages explain a service, policy, or life situation in enough depth for users to understand their eligibility, options, and next steps.

---

## Core writing rules

### 1. Write for readers who skim
Most users scan before they read. Use headings, summary sentences, lists, and tables as navigation tools, not formatting decoration.

### 2. Frontload the most important information
Lead with the most important information. State the answer, then explain it. Frame the answer from the user's perspective: what they can do or get, not how the scheme works. Start with "You can" or "You are entitled to", not "The scheme provides" or "Employers must".

### 3. Cut content that does not help the user act
Every sentence should help users understand their eligibility, options, or next steps. Background that does not change what the user knows or does should be cut.

### 4. Use plain language
Write at a level accessible to non-specialists. Avoid legal language, bureaucratic phrasing, and unexplained acronyms. Avoid idioms and phrasing that relies on native-speaker familiarity.

### 5. Be specific: use exact figures
Vague copy makes users contact the agency for clarification. Exact figures reduce misquotation when content is shared.

### 6. Keep sentences short
Aim for 15 to 20 words per sentence. Break long sentences at natural clause boundaries.

### 7. Use consistent terminology
Pick one term for each concept and use it throughout. Do not substitute synonyms for variety. Introduce new terms with a definition sentence: `[Term] is [definition].`

### 8. Open each section with a summary sentence
The first sentence of each section should summarise the whole section.

### 9. Use lists for conditions, steps, and options
Use a bulleted list when there are 3 or more parallel items. Use a numbered list for steps that must be followed in order.

### 10. Use tables for comparisons and structured data
When presenting eligibility tiers, quantum amounts, or comparisons between options, use a table.

### 11. Write self-contained paragraphs
Each paragraph should make sense without the surrounding context.

### 12. Match the tone to the subject

| Context | Tone |
| --- | --- |
| Benefits and entitlements | Practical, direct, neutral |
| Life events (birth, marriage) | Warm but not effusive |
| Loss and death | Calm, practical, compassionate |
| Eligibility and legal criteria | Precise, factual |

For sensitive topics (death, illness, relationship breakdown), acknowledge the situation briefly before moving to practical steps. Do not linger. The user came for information.

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| Opening with policy rationale or history before the answer | Users need the answer first; context can follow |
| Using synonyms for key terms to avoid repetition | Creates inconsistency; repeat the term |
| Burying eligibility criteria in a paragraph of prose | Use a list; criteria must be scannable |
| Soft-pedalling thresholds: `around $3,000`, `approximately 4 weeks` | Use exact figures; approximations invite misquotation |
| Section headings like `Overview`, `Background`, `Introduction` | Use specific, descriptive headings that match user search queries |
| Ending a page without a next step or action | Users need to know what to do with the information they just read |$$);

-- Global patterns (push-notifications)
insert into public.patterns (element_type, scope, content) values
('push-notifications', 'global', $$# Push notification guidelines

Rules for writing push notifications across all products. Products can override by creating `patterns/{product}/push-notifications.md`.

---

## What push notifications are for

Push notifications interrupt users. Every notification must justify that interruption. It should tell users something timely, actionable, or genuinely important. Do not send push notifications for content that can wait for the next time a user opens the app.

---

## Structure

Every push notification has two parts:

| Part | Max length | Purpose |
| --- | --- | --- |
| **Title** | ~30 characters | What this is about |
| **Body** | ~120 characters | The key information or action |

On a locked screen, only the title and first ~2 lines of the body are visible. Frontload everything.

---

## Core rules

### 1. Lead with the most important information
Users read the title first, then decide whether to read the body. If the title does not communicate the core message, the notification will be ignored.

### 2. Be specific in the body
The body must tell the user exactly what happened or what they need to do. Do not send users into the app to find out what the notification was about.

### 3. State the deadline when one exists
If the user must act by a certain date, include that date in the notification.

### 4. Do not use clickbait
Do not write notifications designed to provoke curiosity. Users who feel misled will disable notifications.

| Bad example | Good example |
| --- | --- |
| `You won't believe what's new` | `New scheme available: check if you qualify` |
| `Something important has happened` | `Your claim status has been updated` |
| `Don't miss out!` | `3 days left to complete your application` |

### 5. Use plain language
No jargon, no bureaucratic language.

### 6. Sentence case, no full stops in titles
Titles follow the same rule as button labels: sentence case, no full stop. Body copy ends with a full stop if it is a complete sentence.

### 7. Match the notification to the in-app destination
When a user taps the notification, they should land on the relevant screen, not the home page.

---

## Notification types

### Transactional notifications

| Event | Title | Body |
| --- | --- | --- |
| Application approved | `Application approved` | `Your [scheme name] application has been approved. Your first payment will arrive by [date].` |
| Application rejected | `Application update` | `Your [scheme name] application was unsuccessful. Tap to see why and what you can do next.` |
| Action required | `Action required` | `Upload your [document name] by [date] to avoid delays to your application.` |
| Payment sent | `Payment sent` | `$[amount] has been credited to your [account type]. Tap to view your payment history.` |
| Status update | `Application update` | `Your [scheme name] application is now [status]. Tap to view details.` |

### Reminder notifications

| Event | Title | Body |
| --- | --- | --- |
| Incomplete application | `Continue your application` | `You started a [scheme name] application. You have [X days] left to submit it.` |
| Approaching deadline | `[X] days left` | `Your [scheme name] application closes on [date]. Submit it before then.` |
| Expiring document | `Document expiring soon` | `Your [document name] expires on [date]. Update it to keep your account active.` |

### Informational notifications

| Event | Title | Body |
| --- | --- | --- |
| New scheme available | `New scheme available` | `You may be eligible for [scheme name]. Tap to find out.` |
| Service maintenance | `Scheduled maintenance` | `[Product name] will be unavailable on [day, date] from [time] to [time].` |

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| `You have a new notification` | Circular; sends users into the app for no reason |
| `Don't miss out!` | Clickbait; erodes trust |
| `Important message` (alone) | Vague; does not communicate what is important |
| `Hi [name], we wanted to let you know…` | Filler preamble; get to the point |$$);

-- Global patterns (release-notes)
insert into public.patterns (element_type, scope, content) values
('release-notes', 'global', $$# Release notes guidelines

Rules for writing release notes and app update copy across all products. Products can override by creating `patterns/{product}/release-notes.md`.

---

## What release notes are for

Release notes tell users what has changed and why it matters to them. They are not a technical changelog for developers. Write from the user's perspective: what can they now do, do better, or no longer have to deal with?

---

## Structure

```
## [Version number or date]

### What's new
[New features: what the user can now do]

### Improvements
[Changes to existing features: what works better]

### Fixed
[Bugs resolved: what the user no longer experiences]
```

Use only the sections that are relevant for each release. Do not include an empty section.

---

## Core rules

### 1. Write for the user, not the developer
Focus on the user benefit, not the technical implementation.

| Bad example | Good example |
| --- | --- |
| `Refactored authentication module` | `Signing in is now faster` |
| `Fixed null pointer exception on document upload` | `Fixed a bug that prevented some documents from uploading` |
| `Migrated to new API endpoint` | (no user-facing change; omit) |

### 2. Lead with the benefit, not the feature name

| Bad example | Good example |
| --- | --- |
| `Added dark mode` | `You can now switch to dark mode in Settings` |
| `New filter functionality` | `Filter your applications by status and date` |
| `Improved performance` | `Pages load faster, especially on slower connections` |

### 3. Use plain language
Avoid technical terms, product jargon, and internal terminology.

### 4. Be specific

| Bad example | Good example |
| --- | --- |
| `Bug fixes and performance improvements` | `Fixed a bug that caused the form to lose your progress on some devices` |
| `Various UI improvements` | `Updated the application status page to make your next steps clearer` |

### 5. Present tense for new features; past tense for fixes
- New features: `You can now…`, `Filter your…`
- Improvements: `[Feature] is now faster / clearer / easier`
- Fixes: `Fixed a bug that…`, `Resolved an issue where…`

### 6. Sentence case, full stops on complete sentences

### 7. Omit internal-only changes
Do not include changes users cannot see or experience: infrastructure updates, code refactors, dependency upgrades.

### 8. Start with the most important update

---

## Mobile app stores

For release notes published to the App Store or Google Play:

- Do not mention iOS, Android, iPhone, or iPad. Users know what platform they are on.
- Do not use "What's new" as a heading. The iOS App Store adds this automatically to every update.
- Keep it under 500 characters (including spaces). This is an Android Play Store requirement.

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| `Bug fixes and performance improvements` | Too vague; tells users nothing |
| Mentioning iOS, Android, iPhone, or iPad in mobile app release notes | The app update will be rejected from the app stores |
| Starting mobile app release notes with "What's new" | The iOS App Store adds this automatically; it will appear twice |
| `Refactored X module` | Developer language; no user benefit |
| `We have been working hard to improve your experience` | Filler; get to the changes |
| `This update contains important security patches` (alone) | Tell users what this means for them |$$);
