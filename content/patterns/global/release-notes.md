---
last-updated: 2026-05-12
---
# Release notes guidelines

Rules for writing release notes and app update copy across all products. Products can override by creating `patterns/{product}/release-notes.md`.

---

## What release notes are for

Release notes tell users what has changed and why it matters to them. They are not a technical changelog for developers. They are a user-facing communication. Write from the user's perspective: what can they now do, do better, or no longer have to deal with?

---

## Structure

### Standard format
```
## [Version number or date]

### What's new
[New features: what the user can now do]

### Improvements
[Changes to existing features: what works better]

### Fixed
[Bugs resolved: what the user no longer experiences]
```

Use only the sections that are relevant for each release. Do not include an empty section.

---

## Core rules

### 1. Write for the user, not the developer
Focus on the user benefit, not the technical implementation.

| Bad example | Good example |
| --- | --- |
| `Refactored authentication module` | `Signing in is now faster` |
| `Fixed null pointer exception on document upload` | `Fixed a bug that prevented some documents from uploading` |
| `Migrated to new API endpoint` | (no user-facing change; omit) |

### 2. Lead with the benefit, not the feature name
Tell users what they can do, not just what was added.

| Bad example | Good example |
| --- | --- |
| `Added dark mode` | `You can now switch to dark mode in Settings` |
| `New filter functionality` | `Filter your applications by status and date` |
| `Improved performance` | `Pages load faster, especially on slower connections` |

### 3. Use plain language
Avoid technical terms, product jargon, and internal terminology.

| Bad example | Good example |
| --- | --- |
| `Deprecated legacy SSO flow` | `Removed the old sign-in method. Use Singpass to sign in.` |
| `Optimised payload size for API responses` | `The app uses less data when loading` |

### 4. Be specific
Vague entries give users no useful information.

| Bad example | Good example |
| --- | --- |
| `Bug fixes and performance improvements` | `Fixed a bug that caused the form to lose your progress on some devices` |
| `Various UI improvements` | `Updated the application status page to make your next steps clearer` |

### 5. Present tense for new features; past tense for fixes
- New features: `You can now…`, `Filter your…`
- Improvements: `[Feature] is now faster / clearer / easier`
- Fixes: `Fixed a bug that…`, `Resolved an issue where…`

### 6. Sentence case, full stops on complete sentences
Each release note entry is a complete sentence. End with a full stop.

### 7. Omit internal-only changes
Do not include changes users cannot see or experience: infrastructure updates, code refactors, dependency upgrades. When in doubt, ask: will a user notice this? If not, leave it out.

### 8. Start with the most important update
Put the change that affects the most users first. Users skim release notes; the first entry sets expectations for the whole update.

---

## Version header formats

Use one of these formats consistently within a product:

| Format | Example |
| --- | --- |
| Version number | `## Version 2.4.1` |
| Date | `## 12 May 2026` |
| Version + date | `## Version 2.4.1, 12 May 2026` |

---

## Examples

### What's new
- `You can now save a draft and come back to your application later.`
- `Filter your applications by status: active, completed, or withdrawn.`
- `Share your end-of-life plan with a family member directly from the app.`

### Improvements
- `The document upload screen now shows a preview before you confirm.`
- `The application form remembers your progress if you switch apps mid-way.`
- `Status labels are now clearer: "Pending review" instead of "In progress".`

### Fixed
- `Fixed a bug that caused the form to reload when you tapped the back button.`
- `Resolved an issue where some users could not sign in after a password reset.`
- `Fixed an error that prevented documents larger than 4 MB from uploading.`

---

## Mobile app stores

For release notes published to the App Store or Google Play:

- Do not mention iOS, Android, iPhone, or iPad. Users know what platform they are on.
- Do not use "What's new" as a heading. The iOS App Store adds this automatically to every update.
- Keep it under 500 characters (including spaces). This is an Android Play Store requirement.

---

## Anti-patterns

| Copy | Why |
| --- | --- |
| `Bug fixes and performance improvements` | Too vague; tells users nothing |
| Mentioning iOS, Android, iPhone, or iPad in mobile app release notes | The app update will be rejected from the app stores. |
| Starting mobile app release notes with "What's new" | The iOS App Store adds this automatically; it will appear twice |
| `Refactored X module` | Developer language; no user benefit |
| `We have been working hard to improve your experience` | Filler; get to the changes |
| `Minor UI tweaks` | Not specific enough to be useful |
| `This update contains important security patches` (alone) | Tell users what this means for them |
