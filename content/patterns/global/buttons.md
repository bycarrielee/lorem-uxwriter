---
last-updated: 2026-05-12
---
# Button copy rules

Rules for writing button labels across all products. Products can override by creating `patterns/{product}/buttons.md`.

---

## Core rules

### 1. Start with a verb
Button labels must begin with an action word. Single verbs are acceptable for common actions. Noun forms are an exception for secondary buttons in specific cases.

| Bad example | Good example |
| --- | --- |
| `Application submission` | `Submit application` |
| `Account deletion` | `Delete account` |
| `Document` | `Download document` |

Noun forms are acceptable for secondary buttons in specific cases: `Filters`, `About [service name]`.

Do not use `Click`, `Choose`, `See`, or `Type` as action verbs. `Type` excludes users who cannot type; use `Enter` instead.

### 2. Be specific when context requires it
Single verbs work for common, universally understood actions. Add a noun when the action is not self-evident from context.

| Use a single verb | Add a noun |
| --- | --- |
| `Continue` | `Submit application` |
| `Submit` (on a clearly labelled form) | `Download grant letter` |
| `OK` (to dismiss a message) | `Send verification code` |
| `Save` | `Withdraw application` |

Remove articles when possible: `Add service provider`, not `Add a new service provider`.

### 3. Use sentence case
No title case. No ALL CAPS. Capitalise only the first word and proper nouns.

| Bad example | Good example |
| --- | --- |
| `Save And Continue` | `Save and continue` |
| `SUBMIT APPLICATION` | `Submit application` |
| `View My Profile` | `View profile` |

### 4. No full stops
Button labels are not sentences. Do not end them with a full stop.

### 5. Keep it short
4 words or fewer. Add a fifth or sixth word only when a shorter label would be genuinely ambiguous.

### 6. Make the label accessible out of context
Screen reader users may hear button labels without surrounding context. The label must make sense on its own.

| Bad example | Good example |
| --- | --- |
| `Click here` | `View eligibility requirements` |
| `Learn more` | `Learn more about Baby Bonus` |
| `Yes` | `Delete account` |
| `No` | `Keep account` |

### 7. Account for text expansion
Button labels are translated into Chinese (-25%), Malay (+15%), and Tamil (+40%). Design containers that accommodate longer translations. Keep labels short in English so Tamil translations remain usable.

---

## Verb reference

Use these verbs consistently. Substituting synonyms creates inconsistency across products.

| Verb | When to use |
| --- | --- |
| `Add` | Brings an existing item into a list or set |
| `Create` | Builds something new from scratch |
| `Save` | Persists changes to the system |
| `Done` | Applies changes locally without saving to the system |
| `Edit` | Opens something for modification |
| `View` | Navigates to another screen to see details (read-only) |
| `Back` | Returns to the previous screen |
| `Close` | Dismisses an information view (modal, panel, drawer) |
| `Cancel` | Stops the current action and discards changes |
| `Select` | Picks from a predefined set of options |
| `Enter` | Requests the user to input information |
| `Show` | Reveals inline content |
| `Hide` | Conceals inline content |
| `Accept` | Gives formal agreement to legal terms or conditions |
| `Clear` | Removes user input from a field or set of fields |
| `Delete` | Permanently removes data |
| `Download` | Saves a file to the user's device |
| `Upload` | Sends a file from the user's device |
| `Submit` | Sends a completed form or application |
| `Confirm` | Confirms an action before it is executed |
| `Continue` | Moves to the next step |
| `Retrieve latest Myinfo data` | Fetches updated data from Singpass Myinfo (use verbatim) |

#### Add vs Create
- `Add document`: the document already exists; the user is attaching it
- `Create profile`: the user is building something new from nothing

#### Save vs Done
- `Save`: changes are written to the database
- `Done`: changes are applied in the current view without being saved (e.g., configuring a filter before running a search)

#### Back vs Close vs Cancel
- `Back`: returns the user to the previous step or screen (navigation)
- `Close`: dismisses a modal, panel, or overlay (the underlying page stays)
- `Cancel`: stops the current action and discards changes in progress

---

## Authentication

Use `Log in` for Singpass authentication. Use `Sign in` for all other authentication.

Use matching pairs:

| Pair | Use when |
| --- | --- |
| `Log in` / `Log out` | Singpass authentication |
| `Sign in` / `Sign out` | All other authentication |

Do not mix pairs (for example: `Log in` and `Sign out` together is incorrect).

---

## Button types

### Primary buttons
The main action on a screen.

#### Form progression
- `Save and continue`
- `Back`

#### Final submission
- `Submit application`
- `Submit claim`
- `Confirm payment`
- `Place order`

#### Authentication
- `Sign in` / `Sign out` (standard)
- `Log in` / `Log out` (Singpass only)
- `Create account`

#### Content actions
- `Download birth certificate`
- `Download receipt`
- `Add document`
- `Upload document`

### Secondary and tertiary buttons
Alternative or lower-priority actions. Follow the same rules.

- `Edit details`
- `View details`
- `Save as draft`
- `Cancel`
- `Clear`

### Destructive buttons
Actions that permanently delete, withdraw, or cancel something. Be explicit about what is being destroyed. Do not soften the label.

| Bad example | Good example |
| --- | --- |
| `Remove` | `Delete account` |
| `Yes` | `Withdraw application` |
| `Confirm` | `Cancel subscription` |
| `Delete` (alone) | `Permanently delete file` |

### Modal buttons
Replace Yes/No with action-specific labels. Use the verb reference above to choose the right verb.

| Scenario | Primary button | Secondary button |
| --- | --- | --- |
| Confirm deletion | `Delete account` | `Keep account` |
| Session timeout | `Back to service` | (none) |
| Unsaved changes | `Discard changes` | `Keep editing` |
| Accept terms | `Accept terms` | `Reject terms` |
