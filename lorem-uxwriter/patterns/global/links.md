---
last-updated: 2026-05-12
---
# Link copy guidelines

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

| Link text | Destination page title |
| --- | --- |
| `Privacy policy` | `Privacy policy` |
| `Terms of use` | `Terms of use` |
| `Baby Bonus eligibility` | `Baby Bonus: eligibility` |

### 5. Do not display raw URLs
Never use a URL as link text. URLs are not meaningful to screen reader users and are not translatable.

| Bad example | Good example |
| --- | --- |
| `Go to www.cpf.gov.sg/member to check your balance` | `Check your CPF balance` |
| `https://www.singpass.gov.sg` | `Sign in with Singpass` |

### 6. Do not link directly to file attachments without warning
When a link opens a file (PDF, Word document), indicate the file type and size in the link text or immediately after it.

| Bad example | Good example |
| --- | --- |
| `Click here` (links to a PDF) | `Application guide (PDF, 1.2 MB)` |
| `Download` | `Download the grant guide (PDF, 340 KB)` |

---

## Inline links vs standalone links

#### Inline links
Inline links appear within a sentence or paragraph. They should flow naturally as part of the sentence.

> If you need help, visit the [Help Centre] or email us at [support@agency.gov.sg].

#### Standalone links
Standalone links appear on their own line or as part of a list. They should be self-contained and descriptive without relying on surrounding text.

> [Apply for the Baby Bonus scheme]
> [Check your CPF balance]
> [Download the application guide (PDF, 1.2 MB)]

---

## External links

When a link opens a new tab or leaves the product entirely, indicate this. Do not assume users expect to leave.

- Add "(opens in a new tab)" after the link text for links that open in a new window
- Only open in a new tab when there is a strong reason (e.g., an external government portal the user will need alongside the current page)

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
| Displaying a raw URL | Not accessible; not translatable |
| `This link` | Redundant; users know it is a link |
