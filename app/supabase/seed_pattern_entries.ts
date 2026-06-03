// Runner for migration 006_pattern_entries.
// Uses the service role client so it bypasses RLS.
//
// Usage (from /app):
//   tsx supabase/seed_pattern_entries.ts

import { readFileSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
function loadEnv() {
  try {
    const content = readFileSync(join(process.cwd(), '.env.local'), 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (key && !process.env[key]) process.env[key] = val
    }
  } catch { /* rely on shell env */ }
}
loadEnv()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

type Entry = {
  element_type: string
  scope: string
  copy: string
  context: string
  rationale: string
  tags: string[]
  tone: string
  status: string
}

const entries: Entry[] = [
  // --- BUTTONS ---
  {
    element_type: 'buttons', scope: 'global', copy: 'Save and continue',
    context: 'Primary button for multi-step form progression — saves current step and advances to the next',
    rationale: 'Combines save and advance into one clear action. Standard pattern for all multi-step government forms.',
    tags: ['save', 'continue', 'form', 'progress', 'primary', 'multi', 'step', 'next'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Back',
    context: 'Navigation button to return to the previous step or screen in a multi-step flow',
    rationale: 'Distinct from Cancel (discards changes) and Close (dismisses overlay). Use for step-back navigation only.',
    tags: ['back', 'previous', 'navigation', 'return', 'step'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Continue',
    context: 'Primary navigation button to advance to the next step when no data needs to be saved',
    rationale: 'Single verb acceptable for common, universally understood progression actions.',
    tags: ['continue', 'next', 'progress', 'advance', 'forward'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Submit application',
    context: 'Final submission button for completed applications — primary action on the review and submit screen',
    rationale: 'Specific label with object. More informative than Submit alone when the thing being submitted is an application.',
    tags: ['submit', 'application', 'final', 'primary', 'form', 'send'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Confirm payment',
    context: 'Primary action button to execute a payment transaction on a payment confirmation screen',
    rationale: 'Confirm is the correct verb from the verb reference for actions executed before completion. Specific to payment context.',
    tags: ['confirm', 'payment', 'pay', 'transaction', 'checkout', 'primary'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Place order',
    context: 'Primary action button to finalise and submit a purchase order',
    rationale: 'Use for e-commerce or transactional flows where the action is placing an order, not submitting an application.',
    tags: ['place', 'order', 'purchase', 'checkout', 'primary'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Log in',
    context: 'Singpass authentication button — primary action for services that use Singpass login exclusively',
    rationale: 'Use Log in / Log out only for Singpass. Do not use for standard username/password authentication.',
    tags: ['log', 'singpass', 'authentication', 'primary', 'auth', 'login'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Log out',
    context: 'Button to end a Singpass-authenticated session',
    rationale: 'Pair with Log in. Use only for Singpass. Log in / Log out must always be used as a pair.',
    tags: ['log', 'out', 'singpass', 'authentication', 'auth', 'logout'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Sign in',
    context: 'Authentication button for non-Singpass login — standard username/password or other authentication methods',
    rationale: 'Use Sign in / Sign out for all authentication that is not Singpass.',
    tags: ['sign', 'authentication', 'primary', 'auth', 'signin', 'login'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Sign out',
    context: 'Button to end a standard (non-Singpass) authenticated session',
    rationale: 'Pair with Sign in. Use for all non-Singpass authentication.',
    tags: ['sign', 'out', 'authentication', 'auth', 'signout', 'logout'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Create account',
    context: 'Primary action button for new user registration — creates a new account from scratch',
    rationale: 'Create is the correct verb when the user is building something new from nothing.',
    tags: ['create', 'account', 'register', 'signup', 'new', 'primary'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Save as draft',
    context: 'Secondary action to save progress without submitting — preserves data for later completion',
    rationale: 'Distinct from Save and continue (which advances the form). Use when the user explicitly wants to stop and return later.',
    tags: ['save', 'draft', 'progress', 'secondary', 'incomplete'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Cancel',
    context: 'Secondary action to stop the current action and discard changes in progress',
    rationale: 'Distinct from Back (navigation) and Close (dismisses overlay). Use when the current action is aborted and changes are lost.',
    tags: ['cancel', 'stop', 'discard', 'abort', 'secondary'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Delete account',
    context: 'Destructive primary button for permanently deleting a user account — appears as the confirm action in a delete account modal',
    rationale: 'Explicit about what is being destroyed. Destructive buttons must name the object. Never use Remove or Delete alone.',
    tags: ['delete', 'account', 'destructive', 'permanent', 'irreversible', 'modal'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Keep account',
    context: 'Secondary button in the delete account confirmation modal — allows user to cancel the deletion',
    rationale: 'Replaces generic Cancel in destructive confirmation modals. Specific to what is being kept. Paired with Delete account.',
    tags: ['keep', 'account', 'cancel', 'destructive', 'modal', 'confirmation'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Withdraw application',
    context: 'Destructive button for withdrawing a previously submitted application — appears in a confirmation modal',
    rationale: 'Explicit verb for the destructive action of withdrawing. More precise than Cancel or Delete for application context.',
    tags: ['withdraw', 'application', 'destructive', 'irreversible', 'cancel', 'modal'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Discard changes',
    context: 'Primary button in the unsaved changes confirmation modal — confirms the user wants to leave and lose their changes',
    rationale: 'Specific label for the destructive action. Verb matches the consequence. Paired with Keep editing.',
    tags: ['discard', 'changes', 'unsaved', 'leave', 'lose', 'modal', 'confirmation'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Keep editing',
    context: 'Secondary button in the unsaved changes confirmation modal — returns the user to the form to continue editing',
    rationale: 'Specific label that communicates the outcome. Replaces generic Cancel. Paired with Discard changes.',
    tags: ['keep', 'editing', 'stay', 'unsaved', 'changes', 'modal', 'continue'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'buttons', scope: 'global', copy: 'Back to service',
    context: 'Primary button in a post-session-timeout modal — returns the user to the service start page',
    rationale: 'Specific about destination. Used after session expiry, not as a generic back button.',
    tags: ['back', 'service', 'session', 'timeout', 'return', 'modal'],
    tone: 'neutral', status: 'active',
  },

  // --- ERRORS ---
  {
    element_type: 'errors', scope: 'global', copy: 'Your session has ended. Sign in again to continue.',
    context: 'Session expired error — shown when the user\'s session has timed out and they must sign in again',
    rationale: 'Passive framing avoids blame. "Sign in again to continue" gives a direct next step. Uses Sign in (not Log in) for standard sessions.',
    tags: ['session', 'timeout', 'expired', 'ended', 'sign', 'authentication', 'recovery'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'Sign in to continue',
    context: 'Authentication required error — shown when an unauthenticated user tries to access a protected page',
    rationale: 'Direct and actionable. Does not blame the user. The next step is embedded in the message.',
    tags: ['sign', 'authentication', 'required', 'protected', 'unauthenticated', 'access'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'Something went wrong. Try again or come back later.',
    context: 'Generic system error — used when an unexpected server error occurs and the cause is unknown',
    rationale: 'Acknowledges the problem without jargon. Two recovery options. No support contact — not a persistent error.',
    tags: ['server', 'error', 'system', 'generic', 'went', 'wrong', 'retry', '500', 'unexpected'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: "We couldn't process your payment. Check your card details and try again.",
    context: 'Payment failure error — shown when a payment transaction fails',
    rationale: 'Names exactly what failed. Gives a specific next step. No apology — payment failures are user-resolvable.',
    tags: ['payment', 'failed', 'card', 'transaction', 'declined', 'checkout', 'process'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'This service is temporarily unavailable. Try again later.',
    context: 'Service unavailability error — shown during maintenance or outages',
    rationale: '"Temporarily" sets an expectation it will be resolved. No apology for expected system behaviour.',
    tags: ['service', 'unavailable', 'maintenance', 'outage', 'temporary', 'down', '503'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: "We couldn't load your details. Refresh the page or try again later.",
    context: 'Data loading failure — shown when user profile or application data fails to load',
    rationale: 'Names what failed. Two recovery options cover transient failures.',
    tags: ['load', 'data', 'retrieve', 'refresh', 'details', 'failed', 'profile'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: "Your application could not be submitted. Try again or save a draft and come back.",
    context: 'Form submission failure — shown when a completed application fails to submit',
    rationale: 'Passive voice avoids blame. Two recovery paths: immediate retry or saving for later.',
    tags: ['submit', 'application', 'failed', 'submission', 'server', 'draft', 'save'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: "You don't have access to this page",
    context: 'Permission error — shown when an authenticated user does not have permission to view the page',
    rationale: 'Direct and factual. Does not expose system internals.',
    tags: ['access', 'permission', 'forbidden', 'role', 'authorisation', '403'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'Your file is too large. Maximum size is 5 MB.',
    context: 'File upload size error — shown when the uploaded file exceeds the maximum size',
    rationale: 'Two sentences: first names the problem, second states the constraint. No apology.',
    tags: ['file', 'upload', 'size', 'large', 'limit', 'maximum', 'too'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'Only JPG, PNG, and PDF files are accepted',
    context: 'File upload format error — shown when the uploaded file type is not accepted',
    rationale: 'Frontloads what is accepted (positive framing) rather than stating what is rejected.',
    tags: ['file', 'upload', 'type', 'format', 'jpg', 'png', 'pdf', 'accepted', 'supported'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'Date of birth is required',
    context: 'Required field validation error for date of birth — shown when field is left empty',
    rationale: 'Field name first (frontloaded). Passive construction avoids blame. No "please" for a standard required field.',
    tags: ['date', 'birth', 'required', 'validation', 'field', 'empty'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'Email address is not in a valid format',
    context: 'Format validation error for email address field',
    rationale: 'Passive voice avoids blame. Specific about what is wrong (the format, not the user).',
    tags: ['email', 'format', 'invalid', 'validation', 'field', 'address'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'NRIC must start with S, T, F, or G, followed by 7 digits and a letter',
    context: 'NRIC format validation error — shown when the NRIC/FIN entered does not match the expected format',
    rationale: 'States the exact format requirement so the user knows exactly how to fix it.',
    tags: ['nric', 'format', 'invalid', 'validation', 'field', 'identity', 'fin'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'Postal code must be 6 digits',
    context: 'Format validation error for postal code field',
    rationale: 'States the constraint directly. Short, specific, actionable.',
    tags: ['postal', 'code', 'format', 'digits', 'validation', 'field', 'address'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'Password must be at least 8 characters',
    context: 'Minimum length validation error for password field',
    rationale: 'States the minimum requirement clearly.',
    tags: ['password', 'length', 'minimum', 'characters', 'validation', 'field', 'security'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'Passwords do not match',
    context: 'Password confirmation mismatch — shown when password and confirm password fields differ',
    rationale: 'Passive construction avoids blame. Concise and clear.',
    tags: ['password', 'confirm', 'match', 'mismatch', 'validation', 'field'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'errors', scope: 'global', copy: 'The password entered is incorrect',
    context: 'Password authentication error — shown when the entered password does not match',
    rationale: 'Passive voice removes the user as subject. Does not confirm or deny whether the account exists.',
    tags: ['password', 'incorrect', 'wrong', 'authentication', 'validation', 'login', 'sign'],
    tone: 'neutral', status: 'active',
  },

  // --- STATES ---
  {
    element_type: 'states', scope: 'global', copy: "You haven't submitted any applications",
    context: 'Empty state headline for an applications list — first-use state with no submitted applications',
    rationale: 'Explains current state in plain language. Does not say "No items found".',
    tags: ['empty', 'applications', 'none', 'submitted', 'first', 'list'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'states', scope: 'global', copy: 'Applications you submit will appear here.',
    context: 'Empty state supporting text for an applications list — explains what the space is for',
    rationale: 'Explains purpose of the empty space. Ends with a full stop (complete sentence in body copy).',
    tags: ['empty', 'applications', 'appear', 'helper', 'state', 'list'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'states', scope: 'global', copy: 'Loading…',
    context: 'Loading state label — shown while content or data is being fetched',
    rationale: 'Present continuous tense. Ends with an ellipsis to signal ongoing action.',
    tags: ['loading', 'spinner', 'fetching', 'wait', 'progress'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'states', scope: 'global', copy: 'Saving…',
    context: 'Saving state label — shown while data is being written to the system',
    rationale: 'Present continuous tense. Ends with ellipsis. Always follow with completion state "Saved".',
    tags: ['saving', 'loading', 'progress', 'wait', 'write'],
    tone: 'neutral', status: 'active',
  },
  {
    element_type: 'states', scope: 'global', copy: 'Submitting…',
    context: 'Submitting state label — shown while a form or application is being sent',
    rationale: 'Present continuous tense. Ends with ellipsis. Follow with confirmation or error state.',
    tags: ['submitting', 'loading', 'sending', 'progress', 'wait', 'form'],
    tone: 'neutral', status: 'active',
  },
]

async function run() {
  console.log(`Seeding ${entries.length} pattern entries…`)

  let inserted = 0
  let skipped = 0
  let failed = 0

  for (const entry of entries) {
    const { error } = await supabase
      .from('copy_entries')
      .insert({
        element_type: entry.element_type as never,
        scope: entry.scope as never,
        copy: entry.copy,
        context: entry.context,
        rationale: entry.rationale,
        tags: entry.tags,
        tone: entry.tone as never,
        status: entry.status as never,
      })

    if (error) {
      if (error.code === '23505') {
        // Unique violation — entry already exists
        skipped++
      } else {
        console.error(`  FAIL [${entry.copy.slice(0, 40)}]: ${error.message}`)
        failed++
      }
    } else {
      inserted++
      console.log(`  OK   ${entry.element_type.padEnd(8)} "${entry.copy.slice(0, 50)}"`)
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped (already exist), ${failed} failed`)
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
