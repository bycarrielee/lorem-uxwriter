import type { AgentRequest } from './types'
import type { LookupResult } from './lookup'

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

MULTI-PART COPY: When the element type requires multiple parts (e.g. modal: heading + body + button), use " | " to separate them in suggestion: "Heading: ... | Body: ... | Button: ..."`)

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
      `--- LIBRARY MATCHES ---\nThese are approved copy strings. If an entry fits the user's need, use it verbatim as your suggestion and set source_type to "library_match". Do not shorten, paraphrase, or reword library entries — the approved text must be used exactly as written. Only set source_type to "adapted" if the user's specific context genuinely requires a change (e.g. different product name, different tense, a variation not covered by any entry). If no entry is relevant, generate from patterns and foundations instead.\n\n${matchLines.join('\n\n')}`,
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
