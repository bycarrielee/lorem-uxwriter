---
last-updated: 2026-05-12
---
# States copy guidelines

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
| Colour-only status indicators | Must pair with a text label for accessibility |
