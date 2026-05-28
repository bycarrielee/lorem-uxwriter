import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { lookupContext } from '@/lib/agent/lookup'
import { buildSystemPrompt, buildUserMessage, buildFigmaUserMessage, serializeCopy } from '@/lib/agent/prompt'
import type { AgentRequest } from '@/lib/agent/types'
import { isFigmaUrl, parseFigmaUrl } from '@/lib/figma/parse'
import { fetchFigmaTextNodes } from '@/lib/figma/extract'

const COST_PER_INPUT_TOKEN  = 0.000003  // $3/1M tokens (Claude Sonnet)
const COST_PER_OUTPUT_TOKEN = 0.000015  // $15/1M tokens

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CLASSIFIER_SYSTEM = `You are a scope classifier for a UX writing assistant tool used by Singapore government practitioners.

The tool helps with: reviewing copy, generating copy, comparing copy options, explaining UX writing guidelines, looking up government terminology, and answering accessibility questions related to copy.

Classify the user's prompt as in_scope: true if it is related to any of the above, even loosely. Classify as in_scope: false only if the prompt has no plausible connection to UX writing, content design, or digital product copy.

Examples of in_scope: true
- "Review this error message"
- "Write a button label for a submit action"
- "What's the correct name for CPF?"
- "What does WCAG say about error messages?"
- "Is 'click here' accessible?"

Examples of in_scope: false
- "Write a Python function"
- "Plan a team offsite"
- "What's the weather in Singapore?"
- "Translate this document to Mandarin"

Respond with only valid JSON, no explanation outside it: { "in_scope": true or false, "reason": "one sentence" }`

async function classifyScope(input: string, elementType?: string): Promise<boolean> {
  // Include element_type in the classifier input so single-word or short inputs
  // (e.g. "Remove" with element_type "buttons") are not incorrectly rejected.
  const classifierInput = elementType ? `[Element type: ${elementType}]\n${input}` : input
  try {
    const result = await anthropic.messages.create({
      model: 'bedrock.claude-sonnet-4-5',
      max_tokens: 64,
      system: CLASSIFIER_SYSTEM,
      messages: [{ role: 'user', content: classifierInput }],
    })
    const text = result.content[0].type === 'text' ? result.content[0].text : '{}'
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(stripped)
    return parsed.in_scope === true
  } catch {
    // On classifier failure, fail open — allow the main agent to handle it
    return true
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  let body: AgentRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const clientId         = typeof body.client_id === 'string' ? body.client_id : 'unknown'
  const metricsSessionId = typeof body.metrics_session_id === 'string' ? body.metrics_session_id : null

  let apiStatus: 'success' | 'error' | 'timeout' = 'error'
  let apiErrorCode: string | null = null
  let inputTokens: number | null = null
  let outputTokens: number | null = null
  const callStart = Date.now()
  const serviceClient = createServiceClient()

  if (!body.input || typeof body.input !== 'string' || body.input.trim().length === 0) {
    return NextResponse.json({ error: 'input is required' }, { status: 400 })
  }

  const inScope = await classifyScope(body.input, body.element_type)
  if (!inScope) {
    return NextResponse.json({ error: 'out_of_scope' }, { status: 422 })
  }

  // Figma URL interception
  let figmaFrameName: string | null = null
  let isFigmaRequest = false

  const figmaParsed = isFigmaUrl(body.input) ? parseFigmaUrl(body.input) : null
  let effectiveInput = body.input
  let userMessage: string

  if (figmaParsed) {
    const clientToken = typeof body.figma_access_token === 'string' ? body.figma_access_token : undefined
    const figmaResult = await fetchFigmaTextNodes(figmaParsed.fileKey, figmaParsed.nodeId, clientToken)

    if ('error' in figmaResult) {
      const errorMap: Record<string, { status: number; message: string }> = {
        no_token:       { status: 502, message: 'Figma integration is not configured' },
        not_found:      { status: 404, message: 'Figma frame not found. Check the URL and that the file is shared.' },
        no_text_nodes:  { status: 422, message: 'No text found in this Figma frame.' },
        api_error:      { status: 502, message: `Figma API error: ${figmaResult.detail ?? 'unknown'}` },
      }
      const mapped = errorMap[figmaResult.error] ?? { status: 502, message: 'Figma error' }
      return NextResponse.json({ error: mapped.message }, { status: mapped.status })
    }

    isFigmaRequest = true
    figmaFrameName = figmaResult.frameInfo.name
    effectiveInput = `Review Figma frame UX copy: ${figmaResult.nodes.slice(0, 5).map((n) => n.characters).join(', ')}`
    userMessage = buildFigmaUserMessage(figmaResult.nodes, figmaResult.frameInfo, body)
  } else {
    userMessage = buildUserMessage(body)
  }

  const context = await lookupContext(body.element_type ?? null, body.product_id ?? null, effectiveInput)
  const systemPrompt = buildSystemPrompt(context)

  let rawContent: string
  try {
    const message = await anthropic.messages.create({
      model: 'bedrock.claude-sonnet-4-5',
      max_tokens: isFigmaRequest ? 4096 : 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    rawContent = message.content[0].type === 'text' ? message.content[0].text : ''
    inputTokens  = message.usage?.input_tokens  ?? null
    outputTokens = message.usage?.output_tokens ?? null
    apiStatus    = 'success'
  } catch (err) {
    console.error('Claude API error', err)
    apiStatus    = 'error'
    apiErrorCode = err instanceof Error ? err.message.slice(0, 100) : 'unknown'
    return NextResponse.json({ error: 'Agent service unavailable' }, { status: 502 })
  } finally {
    const durationMs = Date.now() - callStart
    const costUsd =
      inputTokens !== null && outputTokens !== null
        ? inputTokens * COST_PER_INPUT_TOKEN + outputTokens * COST_PER_OUTPUT_TOKEN
        : null
    try {
      await serviceClient.from('api_calls').insert({
        client_id: clientId,
        session_id: metricsSessionId,
        model: 'bedrock.claude-sonnet-4-5',
        status: apiStatus,
        error_code: apiErrorCode,
        duration_ms: durationMs,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: costUsd,
      })
    } catch (loggingErr) {
      console.error('api_calls logging failed (non-critical)', loggingErr)
    }
  }

  // Strip markdown fences if present
  const stripped = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(stripped)
  } catch {
    console.error('Failed to parse agent response', rawContent)
    return NextResponse.json({ error: 'Agent returned invalid response' }, { status: 502 })
  }

  if (!parsed.character_count && parsed.is_copy_response && typeof parsed.suggestion === 'string') {
    parsed.character_count = (parsed.suggestion as string).length
  }

  // Validate library_match: suggestion must be word-for-word identical to a retrieved entry.
  // If not, correct source_type so the badge is never misleading.
  // Skip for Figma responses (figma_review is set, suggestion is empty).
  if (!isFigmaRequest && parsed.source_type === 'library_match' && typeof parsed.suggestion === 'string') {
    const suggestion = parsed.suggestion as string
    const isVerified = context.copyMatches.some(
      (m) => serializeCopy(m.copy) === suggestion,
    )
    if (!isVerified) {
      parsed.source_type = context.copyMatches.length > 0 ? 'adapted' : 'ai_generated'
    }
  }

  // Session management
  let sessionId = body.session_id ?? null

  if (!sessionId) {
    const sessionName = isFigmaRequest && figmaFrameName
      ? `Figma: ${figmaFrameName}`.slice(0, 60)
      : body.input.trim().slice(0, 60)
    const { data: session } = await supabase
      .from('sessions')
      .insert({ product_id: body.product_id ?? null, name: sessionName })
      .select('id')
      .single()
    sessionId = session?.id ?? null
  }

  if (sessionId) {
    await supabase.from('session_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: { text: body.input, context: { product_id: body.product_id, element_type: body.element_type } },
      source_type: null,
    })
  }

  let messageId: string | null = null
  if (sessionId) {
    const { data: msg } = await supabase
      .from('session_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: parsed,
        source_type: parsed.source_type as string,
        copy_entry_ids: context.copyMatches.map((m) => m.id),
      })
      .select('id')
      .single()
    messageId = msg?.id ?? null
  }

  return NextResponse.json({ ...parsed, session_id: sessionId, message_id: messageId })
}
