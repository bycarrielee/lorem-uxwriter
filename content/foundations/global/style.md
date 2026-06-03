---
last-updated: 2026-03-11
---
# Style guide
Default style and grammar rules for products without a custom style guide. Products can override by creating `foundations/{product}/style.md`. All content must follow the defined style guide.

## Abbreviations and acronyms
- Spell out abbreviations in full on first use (if space is limited in a title, define at first mention in body copy instead).
- Use globally recognised abbreviations without defining them: GIF, KB, MB, PDF, QR code.
- Avoid unnecessary abbreviations and Latin terms (such as _e.g._ or _etc._).

## Active voice
- Use active voice by default. 
- Use passive voice only to frontload headers, shift emphasis, or create distance.

### When to use passive voice
| Reason                                  | Use                                       | Do not use                                                                                    |
| --------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| Frontload headers for easy scanning     | Application submitted                     | You've submitted your application                                                             |
| Place emphasis on important information | Your Baby Bonus application was rejected. | The Ministry of Social and Family Development (MSF) has rejected your Baby Bonus application. |
| To avoid blaming the user for an error  | The NRIC number entered is invalid        | You entered an invalid NRIC number                                                            |

## Ampersands (&)
- Spell out the word `and`. 
- Do not use `&` unless it's part of an official name.

## Apostrophes (’)
- Always use curly apostrophes or smart quotes.
- Use double quotation marks for direct quotations.

## Capitalisation
- Use sentence case by default.
- Do not capitalise the letter after a colon, unless it begins a sentence or it's a proper noun.
- Use uppercase for file extensions: JPG, PNG, PDF.
- Use title case for proper nouns only; use sentence case for general mentions.

### General mentions vs proper nouns
| Type            | Example                                     |
| --------------- | ------------------------------------------- |
| General mention | `Contact your town council for help.`       |
| Proper noun     | `Contact West Coast Town Council for help.` |

## Commas (,)
- Use the Oxford comma.

## Contractions
- Use simple, positive contractions when appropriate: you're, you'll, it's.
- Avoid contractions in high-stakes or negative messages. For example: `you'll not be able to submit the form`.
- Avoid negative contractions: shouldn't, can't, don't.
- Avoid conditional contractions: should've, would've, could've.
- Avoid awkward contractions: you'd, they'd, there'd.

## Dates
- Use the date month year format without commas: 19 April 2026.
- Do not use ordinal numbers (1st, 2nd) for dates.
- Remove leading 0s for single digit dates.
- Spell out the month in full wherever possible. Use the 3-letter abbreviation if there are space constraints, such as in UI components.
- Avoid writing months numerically.
- Write the year in full.
- If referencing a specific date, include the day of the week.
- Use `to` when writing date ranges as part of a sentence:`1 January 2026 to 31 December 2026`.
- Use en-dashes (–) to show date ranges in a UI component: 1 Jan 2026 – 31 Dec 2026`.

## Exclamation marks (!)
- Use exclamation marks sparingly.
- No more than 1 per page or card.

## Full stops (.)
- Use in: subheaders and descriptions, helper text for form fields, alert messages, body copy, toasts.
- Do not use in: headers, buttons, navigation menu items, form labels, copy accompanying radio buttons or checkboxes, error messages, placeholder copy, sentence fragments in lists UNLESS it contains multiple sentences or other punctuation.

## Hyphens and dashes (-, –, —)
- Hyphen (-) is used in compound words. Do not add spaces before and after a hyphen.
- En dash (–) is used for date or time ranges, and occasionally as a separator. Add a space before and after an en dash.
- Em dash (—) is used in a sentence to add extra information. Do not add spaces before and after an em dash.

| Scenario                        | Use         | Example                                                                 |
| ------------------------------- | ----------- | ----------------------------------------------------------------------- |
| Indicate an empty value         | Hyphen (-)  | `Unit number: -`                                                        |
| Using a multiple-word adjective | Hyphen (-)  | `There is a 2-day waiting period.`                                      |
| Date or time ranges             | En dash (–) | `1 January 2026 – 31 December 2026`                                     |
| To expand on a sentence         | Em dash (—) | `Try not to use conditional contractions—they're harder to understand.` |

**Avoid hyphens unless you need to:
- separate duplicate letters from a prefix (except _mis-_)
- prevent misreading (for example: _re-sign_ vs. _resign_)

## Lists

### Bulleted lists
Use when order doesn't matter. Always introduce with a colon. Use either sentence fragments or complete sentences.

- **Sentence fragments:** start with lowercase, no full stop, kept short, and each item should complete the introductory line.
- **Complete sentences:** capitalised, end with a full stop.

### Numbered lists
Use when order matters (example: step-by-step instructions). Each item must be a complete sentence: capitalised and ending with a full stop.

## Numbers
- Use numerals (1, 2, 3), unless they're part of a figure of speech (example: `third-party provider`).
- For 1,000 and above, use a comma as a thousands separator (example: `10,000`).
- Spell out ordinal numbers first through ninth; use numerals from 10th onwards (example: `first` not `1st`; `10th` not `tenth`).
- Spell out common fractions (example: `half` not `1/2`).
- Use the % sign for percentages (example: `50%` not `50 percent`).

### Money
- No spaces between the dollar symbol and the amount (example: `$9.50`, not `$ 9.50`).
- Use $ even for amounts under $1 (example: `$0.80`, not `80¢`).
- Do not use SGD unless comparing across currencies (example `$9`, not `S$9` or `SGD$9`).
- Use 2 decimal places (example: `$8.90`, not `$8.9`).
- Keep zero cents when you want to emphasise the amount (example: `Remaining balance $2.00`).

### Phone numbers
- Use spaces to separate digits (example: `6354 8154`, not `63548154`).
- Do not add +65 unless the number is for overseas users (example: `+65 6354 8154`).

## Plurals in parentheses
- Do not use optional plurals in parentheses. It hurts readability and screen reader experience. Use plural by default, or choose whichever fits best.

| Bad example                                          | Good example                                             |
| ---------------------------------------------------- | -------------------------------------------------------- |
| `Select the word(s) that best describes your issue.` | `Select the keywords that best describe your issue.`<br> |
| `Browse type(s)`                                     | `Browse by type`                                         |
| `Enter your child(ren)'s details                     | `Enter your child's details`                             |

## Pronouns (you, I, we, they)

### You
- Address the user with `you`. It makes your writing more conversational. 
- Do not mix `you` and `my` when referring to the user.

### I, My
- Use _I_ and _my_ sparingly, and only when writing from the user's point of view. 

#### When to use first person
| Scenario                            | Use                                                     | Do not use                                                                  |
| ----------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| Getting consent                     | `[CHECKBOX] I agree to the terms and conditions.`       | `[CHECKBOX] You agree to the terms and conditions.`                         |
| Form options that the user selects. | `[RADIO BUTTON] I work at least 56 hours a month`       | `[RADIO BUTTON] You work at least 56 hours a month`<br><br><br><br><br><br> |
| Frequently asked questions (FAQs)   | `Can I use LifeSG to register my child’s birth online?` | `Can you use LifeSG to register your child’s birth online?`                 |
| Navigation labels                   | `Your end-of-life plans`                                | `My end-of-life plans`                                                      |

### We
- If you use _we_, make it clear who it refers to. Do not use it interchangeably for different entities. 

- Never use `we` to refer to the Singapore government, only the product or the government agency you're representing. 

### They
- Use `they` and `their` as singular gender-neutral pronouns.

#### Examples
| Bad example                                                                                                                  | Good example                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Complete this section with your child’s details for his or her birth certificate.`                                          | `Complete this section with your child’s details for their birth certificate.`<br>                                      |
| `The Child Development Account (CDA) trustee will manage your child’s CDA funds. He or she should be at least 18 years old.` | `The Child Development Account (CDA) trustee will manage your child’s CDA funds. They should be at least 18 years old.` |
| `Let the other parent know that he or she should start a new application.`                                                   | `Let the other parent know that they should start a new application.`                                                   |

## Slashes (/)
- Do not use slashes. It affects readability, and may affect the experience for screen reader users.

#### Examples
| Bad example                                       | Good example                                         |
| ------------------------------------------------- | ---------------------------------------------------- |
| `You'll need your NRIC/passport.`                 | `You'll need your NRIC or passport.`<br>             |
| `Enter letters and/or numbers.`                   | `Enter numbers or letters.`                          |
| `Your application will take 3/4 days to process.` | `Your application will take 3 to 4 days to process.` |
## Spelling
- Use British spelling.
- Check the [Oxford English Dictionary](https://www.oxfordlearnersdictionaries.com/) for the preferred spelling of specific terms.

#### Examples
| Use          | Do not use    |
| ------------ | ------------- |
| `ageing`     | `aging`<br>   |
| `catalogue`  | `catalog`     |
| `centre`     | `center`      |
| `colour`     | `color`       |
| `enrol`      | `enroll`      |
| `instalment` | `installment` |

## Time
- Use 12-hour format with lowercase _am_ or _pm_, no space before (example: `9am`, not `9 AM`).
- Remove leading 0s for single digit hours (example: `9:30am`, not `09:30am`).
- Use : to separate hours and minutes, no spaces (example: `9:30am`.
- Keep zero minutes when you want to emphasise the time (example: `Time remaining: 1 hour 0 minutes`).