// Lorem quality eval runner.
//
// Calls the live /api/agent endpoint for each fixture, then runs the LLM judge
// on each response. Writes a JSON report to evals/reports/.
//
// Usage:
//   npm run eval
//
// Environment:
//   ANTHROPIC_API_KEY  — required (same key the app uses)
//   LOREM_API_URL      — defaults to http://localhost:3000

import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

// Load .env.local so the script works the same way as the Next.js app.
// Existing environment variables are not overwritten.
function loadEnvLocal() {
  try {
    const content = readFileSync(join(process.cwd(), '.env.local'), 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (key && !process.env[key]) process.env[key] = val
    }
  } catch {
    // .env.local not present — rely on the shell environment
  }
}
loadEnvLocal()

import { fixtures } from './fixtures'
import { judgeResponse } from './judge'
import type { AgentResponse, JudgeResult } from './judge'
import type { EvalFixture } from './fixtures'

const API_URL = process.env.LOREM_API_URL ?? 'http://localhost:3000'
const REPORTS_DIR = join(process.cwd(), 'evals', 'reports')

const DIMENSIONS = [
  'copy_quality',
  'voice_adherence',
  'style_correctness',
  'accessibility',
  'rationale_accuracy',
] as const

type Dimension = (typeof DIMENSIONS)[number]

interface EvalResult {
  id: string
  description: string
  input: EvalFixture['input']
  http_status: number
  agent_response: AgentResponse | null
  judge: JudgeResult | null
  overall_pass: boolean
  skipped_reason?: string
  error?: string
}

async function callAgent(input: EvalFixture['input']): Promise<{ status: number; body: AgentResponse | null }> {
  const res = await fetch(`${API_URL}/api/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) return { status: res.status, body: null }
  const body = await res.json()
  return { status: res.status, body: body as AgentResponse }
}

function printDimensionBreakdown(results: EvalResult[]): void {
  const counts: Record<Dimension, { pass: number; total: number }> = {
    copy_quality: { pass: 0, total: 0 },
    voice_adherence: { pass: 0, total: 0 },
    style_correctness: { pass: 0, total: 0 },
    accessibility: { pass: 0, total: 0 },
    rationale_accuracy: { pass: 0, total: 0 },
  }

  for (const r of results) {
    if (!r.judge) continue
    for (const dim of DIMENSIONS) {
      counts[dim].total++
      if (r.judge[dim]?.pass) counts[dim].pass++
    }
  }

  console.log('\nDimension breakdown:')
  for (const dim of DIMENSIONS) {
    const { pass, total } = counts[dim]
    if (total === 0) continue
    const rate = Math.round((pass / total) * 100)
    const status = pass === total ? '✓' : `${pass}/${total}`
    console.log(`  ${dim.padEnd(22)} ${status.padEnd(6)} (${rate}%)`)
  }
}

async function runEval(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY is not set')
    process.exit(1)
  }

  console.log(`\nLorem Quality Eval`)
  console.log('='.repeat(52))
  console.log(`API:      ${API_URL}`)
  console.log(`Fixtures: ${fixtures.length}`)
  console.log()

  const results: EvalResult[] = []
  let passed = 0
  let failed = 0
  let errors = 0

  for (const fixture of fixtures) {
    process.stdout.write(`  ${fixture.id.padEnd(36)} `)

    try {
      const { status, body } = await callAgent(fixture.input)

      // Out-of-scope cases: expect HTTP 422
      if (fixture.expect_out_of_scope) {
        const pass = status === 422
        results.push({
          id: fixture.id,
          description: fixture.description,
          input: fixture.input,
          http_status: status,
          agent_response: null,
          judge: null,
          overall_pass: pass,
          skipped_reason: pass ? undefined : `Expected 422, got ${status}`,
        })
        if (pass) { passed++; console.log('PASS  (correctly rejected)') }
        else { failed++; console.log(`FAIL  (expected 422, got ${status})`) }
        continue
      }

      if (status !== 200 || !body) {
        errors++
        console.log(`ERROR (HTTP ${status})`)
        results.push({
          id: fixture.id,
          description: fixture.description,
          input: fixture.input,
          http_status: status,
          agent_response: null,
          judge: null,
          overall_pass: false,
          error: `HTTP ${status}`,
        })
        continue
      }

      const judge = await judgeResponse(fixture, body)
      const pass = judge.overall_pass

      if (pass) passed++
      else failed++

      results.push({
        id: fixture.id,
        description: fixture.description,
        input: fixture.input,
        http_status: status,
        agent_response: body,
        judge,
        overall_pass: pass,
        error: judge.error,
      })

      if (pass) {
        console.log('PASS')
      } else {
        console.log('FAIL')
        for (const issue of judge.critical_issues) {
          console.log(`  ${''.padEnd(36)}  → ${issue}`)
        }
      }
    } catch (err) {
      errors++
      console.log(`ERROR (${err})`)
      results.push({
        id: fixture.id,
        description: fixture.description,
        input: fixture.input,
        http_status: 0,
        agent_response: null,
        judge: null,
        overall_pass: false,
        error: String(err),
      })
    }
  }

  // Summary
  const total = fixtures.length
  const passRate = Math.round((passed / total) * 100)

  console.log('\n' + '='.repeat(52))
  console.log(`Results: ${passed}/${total} passed (${passRate}%)`)
  if (failed > 0) console.log(`Failed:  ${failed}`)
  if (errors > 0) console.log(`Errors:  ${errors}`)

  printDimensionBreakdown(results)

  // Write report
  mkdirSync(REPORTS_DIR, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const reportPath = join(REPORTS_DIR, `${timestamp}.json`)
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        run_id: timestamp,
        api_url: API_URL,
        summary: { total, passed, failed, errors, pass_rate: passRate },
        cases: results,
      },
      null,
      2,
    ),
  )

  console.log(`\nReport: ${reportPath}`)

  // Exit with non-zero if any hard failures (not judge errors)
  if (failed > 0) process.exit(1)
}

runEval().catch((err) => {
  console.error('Eval runner failed:', err)
  process.exit(1)
})
