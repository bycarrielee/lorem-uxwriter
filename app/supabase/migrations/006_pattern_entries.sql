-- 006_pattern_entries: seed approved copy strings from global patterns as library entries.
--
-- These are the authoritative strings defined in the global patterns files.
-- Seeding them as copy_entries ensures they surface as LIBRARY MATCHES in the agent,
-- where they are enforced verbatim rather than treated as illustrative examples.


-- ============================================================
-- BUTTONS
-- ============================================================

-- Form progression
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Save and continue"',
  'Primary button for multi-step form progression — saves current step and advances to the next',
  'Combines save and advance into one clear action. Standard pattern for all multi-step government forms.',
  ARRAY['save', 'continue', 'form', 'progress', 'primary', 'multi', 'step', 'next'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Back"',
  'Navigation button to return to the previous step or screen in a multi-step flow',
  'Distinct from Cancel (discards changes) and Close (dismisses overlay). Use for step-back navigation only.',
  ARRAY['back', 'previous', 'navigation', 'return', 'step'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Continue"',
  'Primary navigation button to advance to the next step when no data needs to be saved',
  'Single verb acceptable for common, universally understood progression actions.',
  ARRAY['continue', 'next', 'progress', 'advance', 'forward'],
  'neutral', 'active'
);

-- Final submission
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Submit application"',
  'Final submission button for completed applications — primary action on the review and submit screen',
  'Specific label with object. More informative than Submit alone when the thing being submitted is an application.',
  ARRAY['submit', 'application', 'final', 'primary', 'form', 'send'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Confirm payment"',
  'Primary action button to execute a payment transaction on a payment confirmation screen',
  'Confirm is the correct verb from the verb reference for actions executed before completion. Specific to payment context.',
  ARRAY['confirm', 'payment', 'pay', 'transaction', 'checkout', 'primary'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Place order"',
  'Primary action button to finalise and submit a purchase order',
  'Use for e-commerce or transactional flows where the action is placing an order, not submitting an application.',
  ARRAY['place', 'order', 'purchase', 'checkout', 'primary'],
  'neutral', 'active'
);

-- Authentication
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Log in"',
  'Singpass authentication button — primary action for services that use Singpass login exclusively',
  'Use Log in / Log out only for Singpass. Do not use for standard username/password authentication.',
  ARRAY['log', 'singpass', 'authentication', 'primary', 'auth', 'login'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Log out"',
  'Button to end a Singpass-authenticated session',
  'Pair with Log in. Use only for Singpass. Log in / Log out must always be used as a pair.',
  ARRAY['log', 'out', 'singpass', 'authentication', 'auth', 'logout'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Sign in"',
  'Authentication button for non-Singpass login — standard username/password or other authentication methods',
  'Use Sign in / Sign out for all authentication that is not Singpass. Sign in / Sign out must always be used as a pair.',
  ARRAY['sign', 'authentication', 'primary', 'auth', 'signin', 'login'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Sign out"',
  'Button to end a standard (non-Singpass) authenticated session',
  'Pair with Sign in. Use for all non-Singpass authentication. Sign in / Sign out must always be used as a pair.',
  ARRAY['sign', 'out', 'authentication', 'auth', 'signout', 'logout'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Create account"',
  'Primary action button for new user registration — creates a new account from scratch',
  'Create is the correct verb when the user is building something new from nothing. Distinct from Add.',
  ARRAY['create', 'account', 'register', 'signup', 'new', 'primary'],
  'neutral', 'active'
);

-- Content actions
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Save as draft"',
  'Secondary action to save progress without submitting — preserves data for later completion',
  'Distinct from Save and continue (which advances the form). Use when the user explicitly wants to stop and return later.',
  ARRAY['save', 'draft', 'progress', 'secondary', 'incomplete'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Cancel"',
  'Secondary action to stop the current action and discard changes in progress',
  'Distinct from Back (navigation) and Close (dismisses overlay). Use when the current action is aborted and changes are lost.',
  ARRAY['cancel', 'stop', 'discard', 'abort', 'secondary'],
  'neutral', 'active'
);

-- Destructive actions
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Delete account"',
  'Destructive primary button for permanently deleting a user account — appears as the confirm action in a delete account modal',
  'Explicit about what is being destroyed. Destructive buttons must name the object. Never use Remove or Delete alone.',
  ARRAY['delete', 'account', 'destructive', 'permanent', 'irreversible', 'modal'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Keep account"',
  'Secondary button in the delete account confirmation modal — allows user to cancel the deletion and keep their account',
  'Replaces generic Cancel in destructive confirmation modals. Specific to what is being kept. Paired with Delete account.',
  ARRAY['keep', 'account', 'cancel', 'destructive', 'modal', 'confirmation'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Withdraw application"',
  'Destructive button for withdrawing a previously submitted application — appears in a confirmation modal',
  'Explicit verb for the destructive action of withdrawing. More precise than Cancel or Delete for application context.',
  ARRAY['withdraw', 'application', 'destructive', 'irreversible', 'cancel', 'modal'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Discard changes"',
  'Primary button in the unsaved changes confirmation modal — confirms the user wants to leave and lose their changes',
  'Specific label for the destructive action in unsaved-changes flows. Verb matches the consequence. Paired with Keep editing.',
  ARRAY['discard', 'changes', 'unsaved', 'leave', 'lose', 'modal', 'confirmation'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Keep editing"',
  'Secondary button in the unsaved changes confirmation modal — returns the user to the form to continue editing',
  'Specific label that communicates the outcome. Replaces generic Cancel. Paired with Discard changes.',
  ARRAY['keep', 'editing', 'stay', 'unsaved', 'changes', 'modal', 'continue'],
  'neutral', 'active'
);

-- Modal-specific navigation
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'buttons', 'global', '"Back to service"',
  'Primary button in a post-session-timeout modal — returns the user to the service start page after their session has ended',
  'Specific about destination. Used after session expiry, not as a generic back button.',
  ARRAY['back', 'service', 'session', 'timeout', 'return', 'modal'],
  'neutral', 'active'
);


-- ============================================================
-- ERRORS
-- ============================================================

-- Session errors
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Your session has ended. Sign in again to continue."',
  'Session expired error — shown when the user''s authentication session has timed out and they must sign in again',
  'Passive framing ("has ended") avoids blame. "Sign in again to continue" gives a direct, specific next step. Uses Sign in (not Log in) because this is a standard session, not Singpass.',
  ARRAY['session', 'timeout', 'expired', 'ended', 'sign', 'authentication', 'recovery'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Sign in to continue"',
  'Authentication required error — shown when an unauthenticated user tries to access a protected page or action',
  'Direct and actionable. Does not blame the user. The next step (sign in) is embedded in the message.',
  ARRAY['sign', 'authentication', 'required', 'protected', 'unauthenticated', 'access'],
  'neutral', 'active'
);

-- System and server errors
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Something went wrong. Try again or come back later."',
  'Generic system error — used when an unexpected server error occurs and the specific cause is unknown to the user',
  'Acknowledges the problem without technical jargon. Two recovery options cover immediate retry and deferred return. No support contact — this is not a persistent error.',
  ARRAY['server', 'error', 'system', 'generic', 'went', 'wrong', 'retry', '500', 'unexpected'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"We couldn''t process your payment. Check your card details and try again."',
  'Payment failure error — shown when a payment transaction fails, typically due to incorrect card details or a declined card',
  'Names exactly what failed (payment). Gives a specific, actionable next step (check card details). No apology — payment failures are a routine user-resolvable issue.',
  ARRAY['payment', 'failed', 'card', 'transaction', 'declined', 'checkout', 'process'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"This service is temporarily unavailable. Try again later."',
  'Service unavailability error — shown during planned maintenance, outages, or when the service cannot be reached',
  '"Temporarily" sets an expectation that it will be resolved. "Try again later" is the only available recovery action. No apology for expected system behaviour.',
  ARRAY['service', 'unavailable', 'maintenance', 'outage', 'temporary', 'down', '503'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"We couldn''t load your details. Refresh the page or try again later."',
  'Data loading failure — shown when user profile, application data, or other content fails to load',
  'Names what failed to load. Two recovery options (refresh vs retry later) cover transient failures.',
  ARRAY['load', 'data', 'retrieve', 'refresh', 'details', 'failed', 'profile'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Your application could not be submitted. Try again or save a draft and come back."',
  'Form submission failure — shown when a completed application fails to submit due to a server or network error',
  'Passive voice avoids blame. Two recovery paths: immediate retry or saving progress for later.',
  ARRAY['submit', 'application', 'failed', 'submission', 'server', 'draft', 'save'],
  'neutral', 'active'
);

-- Permission errors
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"You don''t have access to this page"',
  'Permission error — shown when an authenticated user does not have the role or permissions to view the requested page',
  'Direct and factual. Does not expose system internals. No technical codes.',
  ARRAY['access', 'permission', 'forbidden', 'role', 'authorisation', '403'],
  'neutral', 'active'
);

-- File upload errors
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Your file is too large. Maximum size is 5 MB."',
  'File upload size error — shown when the uploaded file exceeds the allowed maximum file size',
  'Two sentences: first names the problem, second states the constraint. "Your file" is acceptable here (it''s descriptive, not blaming). No apology.',
  ARRAY['file', 'upload', 'size', 'large', 'limit', 'maximum', 'too'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Only JPG, PNG, and PDF files are accepted"',
  'File upload format error — shown when the uploaded file type is not in the list of accepted formats',
  'Frontloads what is accepted (positive framing) rather than stating what is rejected. Oxford comma used.',
  ARRAY['file', 'upload', 'type', 'format', 'jpg', 'png', 'pdf', 'accepted', 'supported'],
  'neutral', 'active'
);

-- Validation errors
insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Date of birth is required"',
  'Required field validation error for date of birth — shown inline when the date of birth field is left empty',
  'Field name first (frontloaded). Passive construction avoids blame. No "please" for a standard required field.',
  ARRAY['date', 'birth', 'required', 'validation', 'field', 'empty'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Email address is not in a valid format"',
  'Format validation error for email address field — shown when the entered email does not match the expected format',
  'Passive voice: "is not in a valid format" avoids blame. Specific about what is wrong (the format, not the user).',
  ARRAY['email', 'format', 'invalid', 'validation', 'field', 'address'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"NRIC must start with S, T, F, or G, followed by 7 digits and a letter"',
  'NRIC format validation error — shown when the NRIC/FIN entered does not match the expected format',
  'States the exact format requirement. Specific enough that the user knows exactly how to fix it.',
  ARRAY['nric', 'format', 'invalid', 'validation', 'field', 'identity', 'fin'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Postal code must be 6 digits"',
  'Format validation error for postal code field — shown when the entered postal code is not 6 digits',
  'States the constraint directly. Short, specific, actionable.',
  ARRAY['postal', 'code', 'format', 'digits', 'validation', 'field', 'address'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Password must be at least 8 characters"',
  'Minimum length validation error for password field — shown when a new password is too short',
  'States the minimum requirement clearly. Short and actionable.',
  ARRAY['password', 'length', 'minimum', 'characters', 'validation', 'field', 'security'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"Passwords do not match"',
  'Password confirmation mismatch error — shown when the password and confirm password fields contain different values',
  'Passive construction avoids blame. Concise and clear.',
  ARRAY['password', 'confirm', 'match', 'mismatch', 'validation', 'field'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'errors', 'global', '"The password entered is incorrect"',
  'Password authentication error — shown when the entered password does not match the account password',
  'Passive voice removes the user as subject ("The password entered" not "The password you entered"). Does not confirm or deny whether the account exists.',
  ARRAY['password', 'incorrect', 'wrong', 'authentication', 'validation', 'login', 'sign'],
  'neutral', 'active'
);


-- ============================================================
-- STATES
-- ============================================================

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'states', 'global', '"You haven''t submitted any applications"',
  'Empty state headline for an applications list — shown on first use or when the user has no submitted applications',
  'Explains the current state in plain language. Does not say "No items found". Sets up the helper text that follows.',
  ARRAY['empty', 'applications', 'none', 'submitted', 'first', 'list'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'states', 'global', '"Applications you submit will appear here."',
  'Empty state supporting text for an applications list — explains what the space is for and prompts action',
  'Explains purpose of the empty space. Ends with a full stop (complete sentence in body copy).',
  ARRAY['empty', 'applications', 'appear', 'helper', 'state', 'list'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'states', 'global', '"Loading…"',
  'Loading state label — shown while content or data is being fetched',
  'Present continuous tense. Ends with an ellipsis to signal ongoing action. Always follow with a completion state.',
  ARRAY['loading', 'spinner', 'fetching', 'wait', 'progress'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'states', 'global', '"Saving…"',
  'Saving state label — shown while data is being written to the system',
  'Present continuous tense. Ends with ellipsis. Always follow with completion state "Saved".',
  ARRAY['saving', 'loading', 'progress', 'wait', 'write'],
  'neutral', 'active'
);

insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, tone, status) values (
  'states', 'global', '"Submitting…"',
  'Submitting state label — shown while a form or application is being sent to the server',
  'Present continuous tense. Ends with ellipsis. Always follow with a confirmation or error state.',
  ARRAY['submitting', 'loading', 'sending', 'progress', 'wait', 'form'],
  'neutral', 'active'
);
