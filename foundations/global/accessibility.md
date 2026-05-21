---
last-updated: 2026-03-04
---
# Accessibility standards
Guidelines for writing inclusive, accessible content. All content must meet these standards.

## 1. Perceivable
Users must be able to take in the information provided, whether they view it directly or use assistive technologies.

### Rules
- All images and icons must have alt text. 
- Use empty alt text (`alt=""`) for decorative images. 
- Do not include `image of` or `picture of` in the alt text. 
- Do not rely on colour, shape, size, or position alone to provide meaning. 

### Examples

| Bad example                           | Good example                                          |
| ------------------------------------- | ----------------------------------------------------- |
| `alt="image"`                         | `alt="Bar chart showing 40% increase in users in Q2"` |
| `Select the button on the right`      | `Select the Save button`                              |
| `Enter your code in the square boxes` | `Enter your 6-digit verification code`                |
| `Required fields are in red` <br>     | `Required fields are marked with an asterisk*`        |
| `Select the green button`             | `Select the Continue button`                          |

## 2. Operable
Users must be able to navigate and interact with the interface.

### Rules
- All link text must describe the purpose of the link, and make sense when taken out of context. 
- Write clear button labels that describe the action that will be taken.
- Icon buttons must have an accessible name.
- Write unique and descriptive page titles 
- Write descriptive section headings 

### Examples

| Bad example  | Good example           |
| ------------ | ---------------------- |
| `Click here` | `Privacy policy`       |
| `Learn more` | `View pricing details` |
| `Submit`     | `Submit application`   |

## 3. Understandable
Users must be able to understand the information.

- Use plain language. Keep the Flesch–Kincaid Grade Level at 8 or below. Exception: Remove government scheme names before checking readability.
- Keep sentences short. Most should have 15 words or fewer. Never exceed 25 words.
- Use active voice and positive framing. Choose specific verbs. Write literally—do not use idioms and metaphors. 
- Define abbreviations and technical terms the first time you use them. Exception: If space is limited in a title, define them at first mention in the body copy instead.
- Provide clear instructions and error messages. 
- Make content easy to scan: break them up into short paragraphs, use bullet points where appropriate. 
- Front-load important information.
- Use the same words for the same actions.

### Examples

| Bad example                    | Good example    |
| ------------------------------ | --------------- |
| `Utilize`                      | `Use`           |
| `Purchase`                     | `Buy`           |
| `Make a selection`             | `Choose`        |
| `You cannot continue without…` | `To continue,…` |

## 4. Robust
Content must work with different devices, including assistive technologies. 

- Form labels must be clear and explicit. Labels and instructions should appear before the input fields. Do not place the label only as placeholder text.
- Write error messages that are specific, clear, and actionable. Tell users exactly what went wrong and how to fix it.
- Associate error messages with their form field in code so screen reader users know which field to correct.
- Write dynamic status updates (use `aria-live`) that announce changes to assistive technologies like screen readers.
- Structure content with clear, hierarchical headings (`h1`, `h2`, `h3`) — do not skip levels. 

### Examples

| Bad example                                                                                      | Good example                          |
| ------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Image of a spinner that disappears after it's saved                                              | `Saving…`, `Saved`                    |
| Animation of skeleton content which is replaced by actual content after results have been loaded | `Loading results…`, `4 results found` |
| Animation of item being added to cart                                                            | `Added to cart`                       |
