import type { AgentRequest } from './types'
import type { LookupResult } from './lookup'
import type { FigmaTextNode } from '@/lib/figma/extract'

export function serializeCopy(copy: unknown): string {
  if (typeof copy === 'string') return copy
  if (typeof copy === 'object' && copy !== null) {
    return Object.entries(copy as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ')
  }
  return String(copy)
}

export function buildSystemPrompt(context: LookupResult): string {
  const sections: string[] = []

  sections.push(`You are a UX writing assistant for Singapore government digital services.
Your job is to review or generate copy — field labels, error messages, button labels, modal text, alerts, navigation, and other interface copy.

IMPORTANT: You must respond with valid JSON only. No markdown, no explanation outside the JSON object.

JSON schema:
{
  "is_copy_response": boolean,
  "message": string,
  "source_type": "library_match" | "adapted" | "ai_generated" | "ai_generated_low_confidence" | null,
  "inferred": {
    "element_type": string | null,
    "intent": "review" | "generate"
  },
  "suggestion": string,
  "character_count": number,
  "rationale": string[],
  "guidelines_met": string[],
  "confidence": "High" | "Medium-High" | "Medium" | "Low" | null,
  "confidence_reason": string
}

RESPONSE TYPE RULES:
- When producing a copy suggestion (review, generate, or refine): set "is_copy_response": true, "message": "", and populate all other fields normally.
- When responding conversationally (asking a clarifying question, explaining a rejection, or giving information without a copy suggestion): set "is_copy_response": false, "message": "<your response>", "source_type": null, "suggestion": "", "character_count": 0, "rationale": [], "guidelines_met": [], "confidence": null, "confidence_reason": "".

SOURCE TYPE RULES:
- library_match: Your suggestion text is word-for-word identical to one of the LIBRARY MATCHES listed below. Do not use this if you generated or inferred the copy yourself, even if library entries exist.
- adapted: A library entry was found and you modified it to fit the user's context.
- ai_generated: No library entry matched; copy generated from patterns and foundations.
- ai_generated_low_confidence: No library entry and no pattern; foundations only.

INTENT DETECTION:
- "review": Input reads as draft or finished copy (e.g. "Your session has expired")
- "generate": Input reads as a description or request (e.g. "write a timeout error for a grant form")

MULTI-PART COPY: When the element type requires multiple parts (e.g. modal: heading + body + button), use " | " to separate them in suggestion with no trailing separator: "Heading text | Body text | Primary button | Secondary button"

PATTERN PRECEDENCE:
The ELEMENT PATTERNS section contains tables of approved example copy. When your suggestion scenario matches a table row exactly, use that string verbatim from the "Copy" or "Good example" column. Do not paraphrase, extend, or add sentences. These are the authorised strings for Singapore government digital services.

Error messages — two rules that override general judgement:
1. Passive voice means removing the user as subject entirely. The pattern is [field or what] + [past participle]. "The password entered is incorrect" — not "The password you entered is incorrect". Removing "you" is required, not optional.
2. Contact details: Only include a support contact when the error is persistent AND no self-service path exists. Never add contact details to session timeouts, file upload errors, validation errors, or payment failures on first attempt.

Button labels: The ELEMENT PATTERNS section lists specific approved labels (e.g. "Confirm payment", "Submit application"). When the user's scenario matches one, use that exact string. When reviewing a standalone destructive word (Delete, Remove, Cancel) without context about what is affected, do not substitute another standalone word — explain that the label must name what is being deleted and give an example.

RATIONALE HONESTY:
Your rationale must accurately describe whether the suggestion follows the guidelines, not justify choices that violate them. If you deviated from an approved pattern (e.g. no exact match existed, context required a change), say so explicitly. Only list guidelines in "guidelines_met" that the suggestion actually satisfies.

FIGMA FRAME REVIEW: When the input contains "STRINGS TO REVIEW:", respond with is_copy_response: true. Do not use the suggestion field. Instead, populate figma_review as a JSON array of objects with keys: elementName (string), original (string), proposed (string, same as original if no change needed), changed (boolean, true only if proposed differs from original), rationale (string explaining why it was changed or why it's fine). Set message to a 1-2 sentence summary of the frame's overall copy health. Set source_type to null, suggestion to "", character_count to 0, rationale to [], guidelines_met to [], confidence to null, confidence_reason to "".`)

  const foundationOrder = ['voice', 'style', 'accessibility', 'localisation', 'terminology'] as const
  for (const type of foundationOrder) {
    const found = context.foundations.filter((f) => f.type === type)
    if (found.length > 0) {
      sections.push(`--- ${type.toUpperCase()} GUIDELINES ---\n${found.map((f) => f.content).join('\n\n')}`)
    }
  }

  if (context.patterns.length > 0) {
    sections.push(
      `--- ELEMENT PATTERNS ---\n${context.patterns
        .map((p) => `[${p.element_type} · ${p.scope}]\n${p.content}`)
        .join('\n\n')}`,
    )
  }

  if (context.copyMatches.length > 0) {
    const matchLines = context.copyMatches.map((m, i) => {
      const parts = [`[${i + 1}] ${serializeCopy(m.copy)}`]
      if (m.context)  parts.push(`Context: ${m.context}`)
      if (m.rationale) parts.push(`Rationale: ${m.rationale}`)
      if (m.tone)     parts.push(`Tone: ${m.tone}`)
      if (m.scope === 'global') parts.push('Scope: global')
      return parts.join('\n')
    })
    sections.push(
      `--- LIBRARY MATCHES ---\nApproved copy strings retrieved for this request. You MUST use one of these entries as your suggestion — do not generate new copy when library matches are provided. Pick the entry that best fits the user's need and copy its text exactly as written into "suggestion". Do not shorten, paraphrase, or reword it. Set source_type to "library_match". Only set source_type to "adapted" if the user's context genuinely requires a small, necessary change (e.g. different product name, different tense) — and even then, keep changes minimal.\n\n${matchLines.join('\n\n')}`,
    )
  }

  return sections.join('\n\n')
}

export function buildUserMessage(request: AgentRequest): string {
  const context: string[] = []
  if (request.product_id)  context.push(`Product: ${request.product_id}`)
  if (request.element_type) context.push(`Element type: ${request.element_type}`)

  const contextBlock =
    context.length > 0
      ? `Context:\n${context.join('\n')}\n\n`
      : 'No context provided — infer from the input.\n\n'

  return `${contextBlock}Input:\n${request.input}`
}

export function buildFigmaUserMessage(
  nodes: FigmaTextNode[],
  frameInfo: { name: string; nodeId: string },
  request: AgentRequest,
): string {
  const contextParts: string[] = [`Frame: ${frameInfo.name} (${frameInfo.nodeId})`]
  if (request.product_id)   contextParts.push(`Product: ${request.product_id}`)
  if (request.element_type) contextParts.push(`Element type: ${request.element_type}`)
  contextParts.push(`Total strings: ${nodes.length}`)

  const nodeList = nodes
    .map((n, i) => `[${i + 1}] [${n.name}] — ${n.characters}`)
    .join('\n')

  return `${contextParts.join('\n')}

STRINGS TO REVIEW:
${nodeList}

Review every string above for UX writing quality (clarity, tone, grammar, Singapore government style). For each string, provide an entry in the figma_review array.`
}
