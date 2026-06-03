---
last-updated: 2026-05-12
---
# Modal copy guidelines

Rules for writing modal copy across all products. Products can override by creating `patterns/{product}/modals.md`.

---

## Modal structure

Every modal has three copy-bearing parts:

| Part | Purpose |
| --- | --- |
| **Header** | Names the situation or asks the question |
| **Body** | Explains what is happening and what the user can do |
| **Buttons** | The actions available. See `buttons.md` for button rules. |

---

## Core rules

### 1. Header: name the situation clearly
Use a short noun phrase or question. Do not start with "Are you sure?"; it gives no context.

| Bad example | Good example |
| --- | --- |
| `Are you sure?` | `Delete this document?` |
| `Warning` | `Unsaved changes will be lost` |
| `Please confirm` | `Withdraw your application?` |

For confirmation modals, use a question: `Delete this document?`
For informational modals, use a noun phrase: `Your form has been closed`

### 2. Body: explain consequences, not just actions
Tell users what will happen as a result of their choice. Be specific.

| Bad example | Good example |
| --- | --- |
| `This action cannot be undone.` | `This will permanently delete your document. This cannot be undone.` |
| `Your session has expired.` | `It looks like you've left, so we closed the form to protect your privacy.` |
| `Are you sure you want to leave?` | `You'll lose any changes you haven't saved.` |

### 3. Match the primary button verb to the header verb
For confirmation modals, the primary button must use the same verb as the header. This makes the consequence of clicking unambiguous.

| Header | Primary button |
| --- | --- |
| `Delete this document?` | `Delete` |
| `Withdraw your application?` | `Withdraw` |
| `Leave and lose changes?` | `Leave` |

### 4. Keep body copy short
Modal body copy should be 1 to 3 sentences. If more explanation is needed, the action may need a separate confirmation page instead of a modal.

### 5. No full stops on headers
Modal headers follow the same rule as button labels and form labels: no full stop.

---

## Modal types

### Confirmation modals (destructive)
Used before an action that cannot be undone or is difficult to reverse. The header is a question. The primary button is destructive.

#### Delete
```
Header:  Delete this document?
Body:    This will be permanently deleted. This cannot be undone.
Primary: Delete
Cancel:  Cancel
```

#### Withdraw application
```
Header:  Withdraw your application?
Body:    You'll need to submit a new application if you change your mind.
Primary: Withdraw
Cancel:  Go back
```

#### Discard changes
```
Header:  Leave and lose changes?
Body:    You'll lose any changes you haven't saved.
Primary: Leave
Cancel:  Stay
```

### Confirmation modals (non-destructive)
Used to confirm a significant but reversible action.

#### Submit application
```
Header:  Submit your application?
Body:    Check that all your details are correct. You won't be able to edit them after you submit.
Primary: Submit
Cancel:  Go back
```

### Informational modals
Deliver information the user needs. No destructive action. Use `Close` or a specific action button.

#### Session closed (inactivity)
```
Header:  Your form has been closed
Body:    It looks like you've left, so we closed the form to protect your privacy.
Primary: Back to service
```

#### Feature unavailable
```
Header:  This feature isn't available yet
Body:    We're working on it. Check back soon.
Primary: Close
```

### Gate modals (access required)
Used when the user must complete a prerequisite before proceeding.

#### Sign in required
```
Header:  Sign in to continue
Body:    You need to be signed in to access this feature.
Primary: Sign in
Cancel:  Cancel
```

#### Verification required
```
Header:  Verify your identity to continue
Body:    This step protects your account. It only takes a moment.
Primary: Verify now
Cancel:  Cancel
```

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| `Are you sure?` as a header | No context; sure about what? |
| `OK` as the only button | Inaccessible; does not describe what OK does |
| `Yes` / `No` as buttons | Inaccessible out of context; replace with action verbs |
| Body that only restates the header | Every sentence must add information |
| `This action cannot be undone` without saying what the action is | Be specific about what will be deleted or lost |
| Apologies in informational modals | Do not apologise for expected system behaviour |
| `Cancel` as a button in a modal whose header contains the word "cancel" | Ambiguous. Users cannot tell if `Cancel` confirms the cancellation or dismisses the modal. Use a specific label: `Cancel application` to confirm, `Keep application` to dismiss |
