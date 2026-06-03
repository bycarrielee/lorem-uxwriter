---
last-updated: 2026-05-12
---
# Error message guidelines

Rules for writing error messages across all products. Products can override by creating `patterns/{product}/errors.md`.

---

## Core rules

### 1. Tell users what went wrong and how to fix it
Every error message must answer two questions: what is wrong, and what should the user do next.

| Bad example | Good example |
| --- | --- |
| `Invalid input` | `Mobile number must start with 8 or 9 and be 8 digits long` |
| `Error` | `We couldn't process your payment. Check your card details and try again.` |
| `Please try again` | `Your session has ended. Sign in again to continue.` |

### 2. Be specific: name the field, name the issue
Generic errors make users guess. Name exactly what is wrong.

| Bad example | Good example |
| --- | --- |
| `This field is required` | `Date of birth is required` |
| `Invalid format` | `NRIC must start with S, T, F, or G, followed by 7 digits and a letter` |
| `File cannot be uploaded` | `Your file is too large. Maximum size is 5 MB.` |
| `Please check your details` | `Email address is not in a valid format` |

### 3. Use passive voice to avoid blaming the user
Per the style guide, use passive voice to shift emphasis away from the user's mistake.

| Bad example | Good example |
| --- | --- |
| `You entered the wrong password` | `The password entered is incorrect` |
| `You've uploaded the wrong file type` | `The file type uploaded is not supported` |
| `You missed a required field` | `Date of birth is required` |

### 4. No full stops
Single-sentence error messages do not end with a full stop. Multi-sentence errors (where a second sentence is needed to explain or direct) may use full stops.

| Single sentence (no full stop) | Multi-sentence (full stops on both) |
| --- | --- |
| `Mobile number must start with 8 or 9 and be 8 digits long` | `We couldn't process your payment. Check your card details and try again.` |

### 5. Use "sorry" and "please" sparingly
Do not apologise for validation errors, required fields, or routine system behaviour.

Reserve "sorry" for serious errors: situations where something has gone significantly wrong and the user has experienced a real loss or disruption, for example, a critical submission failure or a rejected application after a long process. Do not use it for generic server errors, timeouts, or field validation.

Use "please" only when the user must go out of their way to resolve something, or in genuinely sensitive situations. Do not use it for routine guidance.

| Bad example | Good example |
| --- | --- |
| `Sorry, this field is required` | `Date of birth is required` |
| `Please enter a valid email address` | `Email address is not in a valid format` |
| `We're sorry, something went wrong` | `Something went wrong. Try again or come back later.` |
| `We're sorry, we couldn't load your details` | `We couldn't load your details. Refresh the page or try again later.` |

### 6. Frontload the most important information
Start with the key issue. Do not bury what went wrong at the end of the sentence.

| Bad example | Good example |
| --- | --- |
| `Due to the format requirements for this field, your NRIC is not valid` | `NRIC is not in the correct format` |
| `In order to proceed, you'll need to upload a supporting document` | `Supporting document is required to proceed` |

### 7. Sentence case, no exclamation marks
Errors are not dramatic. Write in sentence case. Never use exclamation marks.

---

## Error types

### Validation errors (field level)
Triggered when a user enters something in the wrong format or leaves a required field empty. Displayed inline, adjacent to the field.

**Structure:** [Field name or issue] + [what is expected]

| Scenario | Copy |
| --- | --- |
| Required field | `Date of birth is required` |
| Invalid NRIC | `NRIC must start with S, T, F, or G, followed by 7 digits and a letter` |
| Invalid mobile | `Invalid mobile number. Enter a Singapore mobile number that begins with 8 or 9.` |
| Invalid email | `Email address is not in a valid format` |
| Invalid postal code | `Postal code must be 6 digits` |
| Password too short | `Password must be at least 8 characters` |
| Passwords don't match | `Passwords do not match` |
| Future date not allowed | `Date of birth cannot be in the future` |
| Future date required | `Start date must be after today's date` |

### Format errors (file upload)
**Structure:** [What is wrong with the file] + [what is allowed]

| Scenario | Copy |
| --- | --- |
| File too large | `Your file is too large. Maximum size is 5 MB.` |
| Wrong file type | `Only JPG, PNG, and PDF files are accepted` |
| File corrupted | `This file could not be read. Upload a different file.` |
| Too many files | `You can only upload 3 files. Remove a file to add another.` |

### System and server errors
Displayed at page or form level when something went wrong on our end. Tone: direct, factual, actionable. Do not blame the user. Do not pretend the problem does not exist.

**Structure:** [What happened] + [what the user can do]

| Scenario | Copy |
| --- | --- |
| Generic server error | `Something went wrong. Try again or come back later.` |
| Payment failed | `We couldn't process your payment. Check your card details and try again.` |
| Service unavailable | `This service is temporarily unavailable. Try again later.` |
| Data failed to load | `We couldn't load your details. Refresh the page or try again later.` |
| Submission failed | `Your application could not be submitted. Try again or save a draft and come back.` |
| Persistent error (with support contact) | `Something went wrong. This could be temporary, so refresh or try again later. If the problem continues, email [support address].` |

For persistent errors where self-service is not possible, include a support contact. Only add contact details when all self-service options have been exhausted. Do not include support contact for errors users can resolve themselves.

### Session errors
Triggered by inactivity, expired tokens, or authentication issues.

| Scenario | Copy |
| --- | --- |
| Session expired | `Your session has ended. Sign in again to continue.` |
| Inactivity timeout (modal header) | `Your form has been closed` |
| Inactivity timeout (modal body) | `It looks like you've left, so we closed the form to protect your privacy.` |
| Not authenticated | `Sign in to continue` |

### Eligibility errors
Displayed when a user does not meet the criteria for a scheme, service, or action. Tone: direct, factual. State the reason and the threshold if applicable.

**Structure:** [What the user does not qualify for] + [specific reason] + [what they can do, if applicable]

| Scenario | Copy |
| --- | --- |
| Income above threshold | `You don't qualify because your household income is $4,200. The limit is $3,000.` |
| Age not met | `You don't qualify because you are under 21. You can apply once you turn 21.` |
| Citizenship required | `This scheme is only available to Singapore citizens and permanent residents.` |

### Permission errors
Displayed when a user tries to access something they don't have access to, or when the system cannot retrieve data because access was not granted.

| Scenario | Copy |
| --- | --- |
| Page not accessible | `You don't have access to this page` |
| Action not permitted | `You don't have permission to do this` |
| Feature restricted | `This feature is only available to administrators` |
| Data retrieval blocked (e.g. Myinfo access not granted) | `We need your permission. We couldn't retrieve your information because access was not granted.` |

### HTTP errors
Standard error pages for common HTTP status codes. Include context and a next step where possible.

| Code | Scenario | Copy |
| --- | --- | --- |
| 404 | Page not found | `We can't find this page. It may have moved or been removed. Go back or return to the home page.` |
| 500 | Internal server error | `Something went wrong on our end. Try again later.` |
| 503 | Service unavailable | `This service is temporarily unavailable. Try again later. If the problem continues, email [support address].` |

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| `Invalid input` | Too vague; which field? What's invalid? |
| `Error` | Meaningless without context |
| `Please try again` | Offers no guidance on what to try |
| `Sorry, something went wrong` | Vague and apologetic; provides no action |
| `This field is required` | Does not name the field |
| `You entered incorrect information` | Blames user; no guidance on what is incorrect |
| `An unexpected error occurred` | All errors are unexpected from the user's view; this says nothing |
| `Oops!` | Informal and unhelpful |
| `Contact support` (alone) | Unhelpful unless all self-service options are exhausted; always try to give a self-service fix first |
| `Error downloading file via Ajax POST request` | Technical jargon; keep error messages free of code references, status codes, and system internals |
