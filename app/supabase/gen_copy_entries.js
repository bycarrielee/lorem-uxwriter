#!/usr/bin/env node
const fs = require('fs');

const raw = fs.readFileSync(0, 'utf8');
const data = JSON.parse(raw);

const entries = [];

function walk(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (obj.id && obj.elementType && 'value' in obj) {
    entries.push(obj);
    return;
  }
  for (const [key, val] of Object.entries(obj)) {
    if (key === 'field') continue; // skip field reference metadata inside errors
    walk(val);
  }
}

walk(data);

function sql(s) {
  return String(s).replace(/'/g, "''");
}

function idToContext(entry) {
  if (entry.elementType === 'form-field-error' && entry.field) {
    const errorType = entry.id.split('.').pop();
    const errorLabel = errorType.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    return `${entry.field.label} — ${errorLabel} error`;
  }
  // Label: derive context from id path
  const parts = entry.id.split('.');
  const section = parts[2] ? parts[2].replace(/([A-Z])/g, ' $1').toLowerCase().trim() : '';
  return `Form label: "${entry.value}" (${section})`;
}

function getTags(id) {
  return id.split('.')
    .filter(p => !['global', 'forms', 'label', 'errors'].includes(p))
    .slice(0, 5)
    .map(p => p.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''));
}

const lines = [
  '-- 004_form_labels: migrate form-labels.json into copy_entries',
  '-- All entries inserted as status=draft.',
  '-- Review each entry and set status to active to make it available to the agent.',
  '',
];

let labelCount = 0;
let errorCount = 0;

for (const entry of entries) {
  const elementType = entry.elementType === 'form-field-label' ? 'forms' : 'errors';
  if (elementType === 'forms') labelCount++; else errorCount++;

  // Store copy as a JSON string (jsonb-compatible, serializeCopy returns it as plain text)
  const copyJson = JSON.stringify(entry.value);
  const context = idToContext(entry);
  const tags = getTags(entry.id);
  const tagsSQL = tags.map(t => `'${sql(t)}'`).join(', ');

  lines.push(
    `insert into public.copy_entries (element_type, scope, copy, context, rationale, tags, status) values` +
    ` ('${elementType}', 'global', '${sql(copyJson)}', '${sql(context)}', '', ARRAY[${tagsSQL}], 'draft');`
  );
}

lines.push('');
lines.push(`-- Total: ${entries.length} entries (${labelCount} form labels, ${errorCount} errors)`);

fs.writeFileSync('/tmp/claude/004_form_labels.sql', lines.join('\n'));
process.stderr.write(`Generated ${entries.length} entries: ${labelCount} form labels, ${errorCount} errors\n`);
