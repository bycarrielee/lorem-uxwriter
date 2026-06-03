// Eval fixtures for the Lorem UX writer agent.
// Each fixture defines an input and focus areas for the judge.
// Run via: npm run eval (requires a running dev server at LOREM_API_URL)

export type ElementType =
  | 'buttons'
  | 'errors'
  | 'forms'
  | 'alerts'
  | 'modals'
  | 'states'
  | 'links'
  | 'content'
  | 'push-notifications'
  | 'release-notes'

export interface EvalFixture {
  id: string
  description: string
  input: {
    input: string
    element_type?: ElementType
    product_id?: string
  }
  // Hints passed to the judge about what to look for
  focus_areas: string[]
  // Set true when the response is expected to be conversational (no copy suggestion)
  expect_conversational?: boolean
  // Set true when the request should be rejected as out-of-scope (HTTP 422)
  expect_out_of_scope?: boolean
}

export const fixtures: EvalFixture[] = [
  // --- BUTTONS ---
  {
    id: 'btn-click-here',
    description: 'Classic anti-pattern: "Click here" link text used as a button',
    input: { input: 'Click here to view application status', element_type: 'buttons' },
    focus_areas: [
      '"Click here" is explicitly listed as a forbidden verb',
      'Button label must make sense out of context for screen readers',
      'Should suggest a specific alternative like "View application status"',
    ],
  },
  {
    id: 'btn-title-case',
    description: 'Title-cased button label — style error that should be caught',
    input: { input: 'Save And Continue', element_type: 'buttons' },
    focus_areas: [
      'Title case violates sentence case rule',
      'Agent should identify the style error and suggest "Save and continue"',
    ],
  },
  {
    id: 'btn-generate-confirm-payment',
    description: 'Generate a primary button for confirming a payment',
    input: { input: 'Write a button label for confirming a payment', element_type: 'buttons' },
    focus_areas: [
      'Starts with a verb',
      'Specific to the action (not generic "Submit" or "Confirm")',
      'Sentence case, no full stop, ≤4 words',
      '"Confirm payment" is in the approved button list',
    ],
  },
  {
    id: 'btn-destructive-vague',
    description: 'Review a vague destructive button that violates the destructive button rules',
    input: { input: 'Remove', element_type: 'buttons' },
    focus_areas: [
      'Destructive buttons must be explicit about what is being destroyed',
      '"Remove" alone is listed as a bad example',
      'Should suggest something like "Delete account" depending on context',
    ],
  },

  // --- ERRORS ---
  {
    id: 'err-vague-generic',
    description: 'Classic anti-pattern: vague, apologetic, no action',
    input: { input: 'An error occurred. Please try again.', element_type: 'errors' },
    focus_areas: [
      '"An error occurred" is listed in anti-patterns as meaningless',
      '"Please" should not be used for generic system errors',
      'Error must name what went wrong and what to do next',
      'Should suggest a specific alternative or ask for more context',
    ],
  },
  {
    id: 'err-blames-user',
    description: 'Error message that blames the user — violates passive voice rule',
    input: { input: 'You entered the wrong password', element_type: 'errors' },
    focus_areas: [
      'Should flag: active voice blames the user',
      'Rule: use passive voice to shift emphasis away from the user\'s mistake',
      'Expected correction: "The password entered is incorrect"',
    ],
  },
  {
    id: 'err-generate-session-timeout',
    description: 'Generate a session timeout error for a grant application form',
    input: {
      input: 'Write a session timeout error message for a grant application form',
      element_type: 'errors',
    },
    focus_areas: [
      'Session expired pattern: "[Your session/form] has ended. Sign in again to continue."',
      'Specific to session context, not generic',
      'Provides a clear next step',
      'Frontloads the most important information',
    ],
  },
  {
    id: 'err-generate-file-too-large',
    description: 'Generate a file upload size error',
    input: { input: 'Error for when a file is too large to upload (max 5 MB)', element_type: 'errors' },
    focus_areas: [
      'Names the issue specifically',
      'States the constraint clearly',
      'Pattern: "Your file is too large. Maximum size is 5 MB."',
      'No "sorry" — not a serious error',
      'Sentence case',
    ],
  },

  // --- FORMS ---
  {
    id: 'form-redundant-enter',
    description: 'Form label with redundant "Enter your" prefix — common UX writing mistake',
    input: { input: 'Enter your full name', element_type: 'forms' },
    focus_areas: [
      'Form labels should be nouns, not instructions',
      '"Enter your full name" should just be "Full name"',
      'Instruction prefix is redundant when a text field is visible',
    ],
  },
  {
    id: 'form-generate-date-of-birth',
    description: 'Generate a date of birth form field label',
    input: { input: 'Write a label for a date of birth field', element_type: 'forms' },
    focus_areas: [
      'Short and clear',
      'No unnecessary words',
      'Standard field label convention',
    ],
  },

  // --- MODALS ---
  {
    id: 'modal-generate-delete-account',
    description: 'Generate a delete account confirmation modal — multi-part output expected',
    input: { input: 'Write a modal to confirm deleting a user account', element_type: 'modals' },
    focus_areas: [
      'Multi-part output using " | " separator (heading | body | buttons)',
      'Specific destructive button labels — not "Yes/No"',
      'Pattern: primary "Delete account", secondary "Keep account"',
      'Body should explain consequence of action',
    ],
  },
  {
    id: 'modal-generate-unsaved-changes',
    description: 'Generate an unsaved changes warning modal',
    input: {
      input: 'Modal warning the user they have unsaved changes when they try to leave a form',
      element_type: 'modals',
    },
    focus_areas: [
      'Multi-part output',
      'Pattern: primary "Discard changes", secondary "Keep editing"',
      'Heading should be a clear question or statement',
      'Not "Are you sure?" — too generic',
    ],
  },

  // --- LINKS ---
  {
    id: 'link-learn-more',
    description: 'Review "Learn more" — accessibility anti-pattern',
    input: { input: 'Learn more', element_type: 'links' },
    focus_areas: [
      '"Learn more" is explicitly listed as a bad example',
      'Link text must describe the destination and make sense out of context',
      'Should suggest asking for context or provide a more descriptive alternative',
    ],
  },

  // --- STATES ---
  {
    id: 'state-empty-applications',
    description: 'Generate an empty state for a page with no applications',
    input: {
      input: 'Write an empty state message for a page where the user has not submitted any applications yet',
      element_type: 'states',
    },
    focus_areas: [
      'Helpful and encouraging',
      'Clear explanation of why the state exists',
      'Should include a call to action or guidance on what to do',
      'Not robotic — voice attributes apply',
    ],
  },

  // --- ALERTS ---
  {
    id: 'alert-expiring-documents',
    description: 'Generate a warning alert for expiring documents',
    input: {
      input: 'Warning alert: required documents will expire in 7 days',
      element_type: 'alerts',
    },
    focus_areas: [
      'Specific about the timeframe (7 days)',
      'Clear next step for the user',
      'Warning tone: clear urgency without panic',
      'Frontloads the most important information',
    ],
  },
]
