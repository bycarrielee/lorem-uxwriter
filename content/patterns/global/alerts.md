---
last-updated: 2026-05-12
---
# Alert guidelines

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
| `Please note that…` | Unnecessary preamble; start with the information |
