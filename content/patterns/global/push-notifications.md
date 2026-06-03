---
last-updated: 2026-05-12
---
# Push notification guidelines

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

| Bad example | Good example |
| --- | --- |
| Title: `Update` | Title: `Application approved` |
| Title: `New message` | Title: `Action required: My Legacy` |

### 2. Be specific in the body
The body must tell the user exactly what happened or what they need to do. Do not send users into the app to find out what the notification was about.

| Bad example | Good example |
| --- | --- |
| Body: `You have a new notification.` | Body: `Your Baby Bonus application has been approved. Your first payout will arrive by 30 June.` |
| Body: `Action required.` | Body: `Upload your income documents by 15 June to avoid delays.` |

### 3. State the deadline when one exists
If the user must act by a certain date, include that date in the notification.

| Bad example | Good example |
| --- | --- |
| `Your application is expiring soon.` | `Your application expires on 20 June. Submit it to avoid losing your place.` |

### 4. Do not use clickbait
Do not write notifications designed to provoke curiosity. Users who feel misled will disable notifications.

| Bad example | Good example |
| --- | --- |
| `You won't believe what's new` | `New scheme available: check if you qualify` |
| `Something important has happened` | `Your claim status has been updated` |
| `Don't miss out!` | `3 days left to complete your application` |

### 5. Use plain language
No jargon, no bureaucratic language.

| Bad example | Good example |
| --- | --- |
| `Your disbursement has been processed and credited` | `Your payment has been credited to your account` |
| `Your application status has been updated pursuant to review` | `Your application is under review` |

### 6. Sentence case, no full stops in titles
Titles follow the same rule as button labels: sentence case, no full stop.
Body copy ends with a full stop if it is a complete sentence.

### 7. Match the notification to the in-app destination
When a user taps the notification, they should land on the relevant screen, not the home page. The notification copy should match what they see when they arrive.

---

## Notification types

### Transactional notifications
Triggered by a specific event related to the user's account or application. These are the highest priority, so always send them.

| Event | Title | Body |
| --- | --- | --- |
| Application approved | `Application approved` | `Your [scheme name] application has been approved. Your first payment will arrive by [date].` |
| Application rejected | `Application update` | `Your [scheme name] application was unsuccessful. Tap to see why and what you can do next.` |
| Action required | `Action required` | `Upload your [document name] by [date] to avoid delays to your application.` |
| Payment sent | `Payment sent` | `$[amount] has been credited to your [account type]. Tap to view your payment history.` |
| Document received | `Document received` | `We've received your [document name]. We'll let you know if we need anything else.` |
| Status update | `Application update` | `Your [scheme name] application is now [status]. Tap to view details.` |

### Reminder notifications
Time-sensitive nudges for incomplete actions or approaching deadlines.

| Event | Title | Body |
| --- | --- | --- |
| Incomplete application | `Continue your application` | `You started a [scheme name] application. You have [X days] left to submit it.` |
| Approaching deadline | `[X] days left` | `Your [scheme name] application closes on [date]. Submit it before then.` |
| Expiring document | `Document expiring soon` | `Your [document name] expires on [date]. Update it to keep your account active.` |

### Informational notifications
Non-urgent updates. Use sparingly. Do not send informational notifications that can wait for the user to open the app.

| Event | Title | Body |
| --- | --- | --- |
| New scheme available | `New scheme available` | `You may be eligible for [scheme name]. Tap to find out.` |
| Service maintenance | `Scheduled maintenance` | `[Product name] will be unavailable on [day, date] from [time] to [time].` |
| Feature update | `New in [product name]` | `[One-sentence description of what the user can now do].` |

---

## What not to notify about

Do not send push notifications for:
- Routine confirmation of actions the user just took in-app (they already know)
- Marketing or promotional content unrelated to the user's active services
- Events with no time-sensitive component (send in-app instead)
- Technical changes with no user-facing impact

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| `You have a new notification` | Circular; sends users into the app for no reason |
| `Don't miss out!` | Clickbait; erodes trust |
| `Important message` (alone) | Vague; does not communicate what is important |
| `Hi [name], we wanted to let you know…` | Filler preamble; get to the point |
| Notifications without a clear action or destination | Every notification should have a purpose |
