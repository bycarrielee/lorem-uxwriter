---
last-updated: 2026-05-12
---
# Form copy guidelines

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
| `N/A` as a label for optional fields | Use `(optional)` instead |
