// Changelog data — edit this file to update releases, feature requests, and roadmap items.
// The component reads from these arrays; no need to touch editor.html.

const CHANGELOG_RELEASES = [
  {
    version: 'v1.0.0',
    badge: 'major',
    date: '26 May 2026',
    title: 'First release',
    changes: [
      { tag: 'feat', text: 'UX writing assistant with global foundation and pattern guidelines' },
      { tag: 'feat', text: 'Copy library with form labels suitable for global usage' },
    ],
  },
];

// votes: the baseline count before any user has voted.
// Individual user votes are stored in localStorage and added on top.
const CHANGELOG_REQUESTS = [
  {
    id: 'content-api',
    title: 'Content API',
    description: 'Makes it easier to add and maintain production copy for specific products.',
    status: 'considering',
    statusLabel: 'Considering',
    votes: 0,
  },
  {
    id: 'login',
    title: 'Login',
    description: 'To save past conversations.',
    status: 'considering',
    statusLabel: 'Considering',
    votes: 0,
  },
];

const CHANGELOG_ROADMAP = [
  {
    quarter: 'Q2 2026 — shipped',
    items: [
      { name: 'v1 assistant and library', status: 'done', label: 'Done' },
      { name: 'Global foundation guidelines — voice, style, accessibility, localisation', status: 'done', label: 'Done' },
      { name: 'Glossary for Singapore government agencies, scheme and service names', status: 'done', label: 'Done' },
      { name: 'Global copy pattern guidelines — alerts, buttons, errors, forms, links, long-form, modals, push notifications, release notes, states', status: 'done', label: 'Done' },
      { name: 'Library entries: form field labels and errors suitable for global usage', status: 'done', label: 'Done' },
    ],
  },
  {
    quarter: 'Later',
    items: [
      { name: 'Product-specific guidelines and library entries', status: 'planned', label: 'Considering' },
    ],
  },
];
