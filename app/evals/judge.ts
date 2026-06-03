// LLM-as-judge for Lorem agent output quality.
// Loads guidelines from /content/ and calls Claude to score each response.

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { EvalFixture } from './fixtures'

// Resolve /content relative to the repo root (two levels up from /app/evals/)
const CONTENT_DIR = join(process.cwd(), '..', 'content')

export interface DimensionScore {
  pass: boolean
  reason: string
}

export interface JudgeResult {
  copy_quality: DimensionScore
  voice_adherence: DimensionScore
  style_correctness: DimensionScore
  accessibility: DimensionScore
  rationale_accuracy: DimensionScore
  overall_pass: boolean
  critical_issues: string[]
  // Set if the Claude judge call itself failed
  error?: string
}

export interface AgentResponse {
  is_copy_response: boolean
  suggestion: string
  message: string
  source_type: string | null
  inferred: {
    element_type: string | null
    intent: string
  }
  character_count: number
  rationale: string[]
  guidelines_met: string[]
  confidence: string | null
  confidence_reason: string
}

function readContent(relativePath: string): string {
  try {
    return readFileSync(join(CONTENT_DIR, relativePath), 'utf-8')
  } catch {
    return `(content not found: ${relativePath})`
  }
}

function loadGuidelines(elementType: string | undefined): string {
  const sections: string[] = []

  // Universal foundations
  for (const foundation of ['voice', 'style', 'accessibility']) {
    const content = readContent(`foundations/global/${foundation}.md`)
    sections.push(`=== ${foundation.toUpperCase()} GUIDELINES ===\n${content}`)
  }

  // Element-type specific pattern
  if (elementType) {
    const content = readContent(`patterns/global/${elementType}.md`)
    if (!content.startsWith('(content not found')) {
      sections.push(`=== ELEMENT TYPE PATTERN: ${elementType.toUpperCase()} ===\n${content}`)
    }
  }

  return sections.join('\n\n---\n\n')
}

const JUDGE_SYSTEM = `You are a strict quality evaluator for a UX writing assistant used by Singapore government digital services.

You will be given the guidelines the assistant was trained on, the user's input, and the assistant's response.

Your job is to evaluate whether the suggestion and rationale meet the exact standards in the guidelines. Be strict — apply the rules literally, not liberally.

Score each dimension pass or fail with a one-sentence reason. Cite the specific rule that was violated when marking a dimension as failed.

Respond with valid JSON only. No explanation outside the JSON object.

{
  "copy_quality": { "pass": boolean, "reason": "one sentence" },
  "voice_adherence": { "pass": boolean, "reason": "one sentence" },
  "style_correctness": { "pass": boolean, "reason": "one sentence" },
  "accessibility": { "pass": boolean, "reason": "one sentence" },
  "rationale_accuracy": { "pass": boolean, "reason": "one sentence — are rationale items accurate and grounded in real guidelines?" },
  "overall_pass": boolean,
  "critical_issues": ["one entry per failed dimension, empty array if all pass"]
}

Dimension definitions:
- copy_quality: Is the suggestion the right form for this element type? Specific, not generic? Appropriate for the context?
- voice_adherence: Clear, direct, helpful, transparent? Not bureaucratic, evasive, or over-apologetic?
- style_correctness: Sentence case? Correct punctuation per the style guide? Active/passive voice used correctly?
- accessibility: Plain language (simple words, short sentences)? Descriptive label that works without surrounding context? No reliance on colour/position/shape?
- rationale_accuracy: Does each rationale item make a factually correct claim about the suggestion? Are all cited guidelines real (not hallucinated or misquoted)? IMPORTANT: when source_type is "library_match", the agent retrieved the suggestion from a database you cannot see. Do not flag library entry references as hallucinated — they are real. For library_match, only evaluate whether the rationale correctly explains why the copy is appropriate for the user's request.`

export async function judgeResponse(
  fixture: EvalFixture,
  response: AgentResponse,
): Promise<JudgeResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const guidelines = loadGuidelines(fixture.input.element_type)

  const responseBlock = response.is_copy_response
    ? [
        `Suggestion: ${response.suggestion}`,
        `Source type: ${response.source_type ?? 'not set'}`,
        `Character count: ${response.character_count}`,
        `Inferred element type: ${response.inferred.element_type ?? 'not inferred'}`,
        `Inferred intent: ${response.inferred.intent}`,
        `Confidence: ${response.confidence ?? 'null'} — ${response.confidence_reason}`,
        `Rationale:\n${response.rationale.map((r) => `  - ${r}`).join('\n')}`,
        `Guidelines met:\n${response.guidelines_met.map((g) => `  - ${g}`).join('\n')}`,
      ].join('\n')
    : `This was a conversational response (no copy suggestion).\nMessage: ${response.message}`

  const userMessage = `## GUIDELINES\n\n${guidelines}

---

## EVALUATION TARGET

Element type: ${fixture.input.element_type ?? 'not specified'}
User input: ${fixture.input.input}
Evaluator focus areas: ${fixture.focus_areas.join('; ')}

## AGENT RESPONSE

${responseBlock}

## TASK

Score each of the 5 dimensions. When the agent produced a conversational response instead of copy, evaluate whether the message is clear, helpful, and an appropriate response to the input (use the voice and accessibility guidelines as your standard). Mark copy_quality and style_correctness as pass if a conversational response was appropriate for the input.`

  try {
    const result = await client.messages.create({
      model: 'bedrock.claude-sonnet-4-5',
      max_tokens: 768,
      system: JUDGE_SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = result.content[0].type === 'text' ? result.content[0].text : '{}'
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    return JSON.parse(stripped) as JudgeResult
  } catch (err) {
    const failedDim: DimensionScore = { pass: false, reason: 'Judge call failed' }
    return {
      copy_quality: failedDim,
      voice_adherence: failedDim,
      style_correctness: failedDim,
      accessibility: failedDim,
      rationale_accuracy: failedDim,
      overall_pass: false,
      critical_issues: ['Judge call failed'],
      error: String(err),
    }
  }
}
