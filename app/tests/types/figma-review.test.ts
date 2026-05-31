import { describe, it, expect, beforeEach } from 'vitest'
import { convertFigmaRows, getVisibleStrings, calcProgress, _resetNextId } from '@/types/figma-review'
import type { FigmaReviewRow } from '@/lib/agent/types'

const sampleRows: FigmaReviewRow[] = [
  { elementName: '[1] Page title', original: 'Create Admin Group', proposed: 'Create admin group', changed: true, rationale: 'Sentence case applied.' },
  { elementName: '[2] Form label', original: 'Group Name', proposed: 'Group name', changed: true, rationale: 'Sentence case.' },
  { elementName: '[3] Button', original: 'Cancel', proposed: 'Cancel', changed: false, rationale: 'No change needed.' },
]

beforeEach(() => { _resetNextId() })

describe('convertFigmaRows', () => {
  it('produces one ReviewString per row', () => {
    expect(convertFigmaRows(sampleRows)).toHaveLength(3)
  })

  it('sets status=no-change when row.changed is false', () => {
    expect(convertFigmaRows(sampleRows)[2].status).toBe('no-change')
  })

  it('sets status=suggestion when row.changed is true', () => {
    expect(convertFigmaRows(sampleRows)[0].status).toBe('suggestion')
  })

  it('omits original for unchanged rows', () => {
    expect(convertFigmaRows(sampleRows)[2].original).toBeUndefined()
  })

  it('sets original for changed rows', () => {
    expect(convertFigmaRows(sampleRows)[0].original).toBe('Create Admin Group')
  })

  it('creates one initial suggestion per string', () => {
    const r = convertFigmaRows(sampleRows)[0]
    expect(r.suggestions).toHaveLength(1)
    expect(r.suggestions[0].via).toBe('initial')
    expect(r.suggestions[0].copy).toBe('Create admin group')
  })

  it('sets removed=false and chatAnchor=null', () => {
    const r = convertFigmaRows(sampleRows)[0]
    expect(r.removed).toBe(false)
    expect(r.chatAnchor).toBeNull()
  })
})

describe('getVisibleStrings', () => {
  const strings = convertFigmaRows(sampleRows)

  it('excludes removed strings', () => {
    const copy = strings.map((s, i) => i === 0 ? { ...s, removed: true } : s)
    expect(getVisibleStrings(copy, 'all', '')).toHaveLength(2)
  })

  it('filters by status', () => {
    const r = getVisibleStrings(strings, 'no-change', '')
    expect(r).toHaveLength(1)
    expect(r[0].status).toBe('no-change')
  })

  it('filters by search query on element name', () => {
    expect(getVisibleStrings(strings, 'all', 'Page title')).toHaveLength(1)
  })

  it('filters by search query on suggestion copy', () => {
    expect(getVisibleStrings(strings, 'all', 'admin group')).toHaveLength(1)
  })
})

describe('calcProgress', () => {
  it('returns needsReview count and total', () => {
    const { needsReview, total } = calcProgress(convertFigmaRows(sampleRows))
    expect(total).toBe(3)
    expect(needsReview).toBe(2)
  })

  it('excludes removed strings from total', () => {
    const strings = convertFigmaRows(sampleRows)
    strings[0].removed = true
    expect(calcProgress(strings).total).toBe(2)
  })

  it('pct is 100 when no strings need review', () => {
    const rows = [{ elementName: '[1] x', original: 'x', proposed: 'x', changed: false, rationale: 'ok' }]
    expect(calcProgress(convertFigmaRows(rows)).pct).toBe(100)
  })
})
