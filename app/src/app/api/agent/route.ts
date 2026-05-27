import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { lookupContext } from '@/lib/agent/lookup'
import { buildSystemPrompt, buildUserMessage } from '@/lib/agent/prompt'
import type { AgentRequest } from '@/lib/agent/types'

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

async function classifyScope(input: string): Promise<boolean> {
  try {
    const result = await anthropic.messages.create({
      model: 'bedrock.claude-sonnet-4-5',
      max_tokens: 64,
      system: CLASSIFIER_SYSTEM,
      messages: [{ role: 'user', content: input }],
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

  if (!body.input || typeof body.input !== 'string' || body.input.trim().length === 0) {
    return NextResponse.json({ error: 'input is required' }, { status: 400 })
  }

  const inScope = await classifyScope(body.input)
  if (!inScope) {
    return NextResponse.json({ error: 'out_of_scope' }, { status: 422 })
  }

  const context = await lookupContext(body.element_type ?? null, body.product_id ?? null)
  const systemPrompt = buildSystemPrompt(context)
  const userMessage  = buildUserMessage(body)

  let rawContent: string
  try {
    const message = await anthropic.messages.create({
      model: 'bedrock.claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    rawContent = message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (err) {
    console.error('Claude API error', err)
    return NextResponse.json({ error: 'Agent service unavailable' }, { status: 502 })
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

  // Session management
  let sessionId = body.session_id ?? null

  if (!sessionId) {
    const sessionName = body.input.trim().slice(0, 60)
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
