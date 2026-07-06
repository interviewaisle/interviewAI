import type { FastifyInstance } from 'fastify'
import { Readable } from 'node:stream'
import { z } from 'zod'
import { sql } from '../db/client'
import { authenticate } from '../middleware/auth'
import { config } from '../config'

const GROQ_API_URL = 'https://api.groq.com/openai/v1'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const OLLAMA_MODEL = 'llama3.2:3b'

const DEBUGGER_SYSTEM = `You are an expert AI Debugging Assistant helping a software engineer debug code during a technical interview. You have deep expertise in Python, distributed systems, and RAG pipelines.

RULES:
- Never give the full solution directly. Guide them to discover it themselves.
- Respond to specific, targeted questions ("Why does this return None?") with specific technical guidance.
- Respond to vague requests ("fix my code", "what's wrong") by asking them to describe what behavior they observed vs. expected.
- Keep responses concise — 2-4 sentences for simple questions, up to 6 lines for technical explanations.
- Use code snippets only when a concept genuinely requires showing syntax.`

const EVALUATOR_SYSTEM = `You are an expert technical interview evaluator assessing two dimensions:

1. CODE QUALITY (0-100): How correct, clean, and efficient is the final submitted code?
2. PROMPT ENGINEERING (0-100): How well did the engineer use the AI assistant? Specific, targeted questions like "Why does retrieve_context return None when the list is non-empty?" score higher than generic "fix my code".

Respond ONLY with valid JSON matching this exact schema — no markdown, no preamble:
{"code_score":number,"prompt_score":number,"code_feedback":"string","prompt_feedback":"string","overall_feedback":"string"}`

const chatBody = z.object({
  module_id: z.string().uuid(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(4000),
  })).min(1).max(50),
})

const evaluateBody = z.object({
  module_id: z.string().uuid(),
  code: z.string().max(20000),
  chat_logs: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(50),
})

type Message = { role: 'user' | 'assistant' | 'system'; content: string }

async function logMessage(userId: string, moduleId: string, role: 'user' | 'assistant', content: string) {
  try {
    await sql`
      INSERT INTO ai_chat_logs (user_id, module_id, role, content)
      VALUES (${userId}, ${moduleId}, ${role}, ${content})
    `
  } catch (err) {
    console.error('Failed to log chat message:', err)
  }
}

// Stream tokens via Groq (OpenAI-compatible SSE) into a Readable
async function streamGroq(messages: Message[], readable: Readable): Promise<string> {
  let aiResponse = ''
  const res = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model: GROQ_MODEL, stream: true, messages }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error ${res.status}: ${err}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    const lines = decoder.decode(value, { stream: true }).split('\n')
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') {
        readable.push(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        continue
      }
      try {
        const chunk = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> }
        const text = chunk.choices?.[0]?.delta?.content ?? ''
        if (text) {
          aiResponse += text
          readable.push(`data: ${JSON.stringify({ type: 'token', text })}\n\n`)
        }
      } catch { /* skip malformed line */ }
    }
  }
  return aiResponse
}

// Stream tokens via Ollama (NDJSON) into a Readable
async function streamOllama(messages: Message[], readable: Readable): Promise<string> {
  let aiResponse = ''
  const res = await fetch(`${config.OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, stream: true, messages }),
  })

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean)
    for (const line of lines) {
      try {
        const chunk = JSON.parse(line) as { message?: { content?: string }; done?: boolean }
        const text = chunk.message?.content ?? ''
        if (text) {
          aiResponse += text
          readable.push(`data: ${JSON.stringify({ type: 'token', text })}\n\n`)
        }
        if (chunk.done) readable.push(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
      } catch { /* skip malformed line */ }
    }
  }
  return aiResponse
}

// Non-streaming evaluate — returns parsed JSON scores
async function evaluateWithAI(payload: string): Promise<string> {
  const messages: Message[] = [
    { role: 'system', content: EVALUATOR_SYSTEM },
    { role: 'user', content: payload },
  ]

  if (config.GROQ_API_KEY) {
    const res = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        stream: false,
        response_format: { type: 'json_object' },
        messages,
      }),
    })
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    return data.choices?.[0]?.message?.content ?? ''
  }

  // Ollama
  const res = await fetch(`${config.OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, stream: false, format: 'json', messages }),
  })
  const data = await res.json() as { message?: { content?: string } }
  return data.message?.content ?? ''
}

export async function interviewRoutes(app: FastifyInstance) {
  const provider = config.GROQ_API_KEY ? 'groq' : 'ollama'
  app.log.info(`Interview AI provider: ${provider}`)

  // SSE streaming chat — logs user prompt + AI response to DB
  app.post('/chat', { preHandler: [authenticate] }, async (req, reply) => {
    const parsed = chatBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: parsed.error.flatten() })
    }

    const { module_id, messages } = parsed.data
    const userId = req.user.id
    const lastUserMessage = messages[messages.length - 1]

    reply.header('Content-Type', 'text/event-stream')
    reply.header('Cache-Control', 'no-cache')
    reply.header('Connection', 'keep-alive')
    reply.header('X-Accel-Buffering', 'no')

    const readable = new Readable({ read() {} })

    void (async () => {
      await logMessage(userId, module_id, 'user', lastUserMessage.content)

      const systemMessages: Message[] = [{ role: 'system', content: DEBUGGER_SYSTEM }, ...messages]

      try {
        const aiResponse = config.GROQ_API_KEY
          ? await streamGroq(systemMessages, readable)
          : await streamOllama(systemMessages, readable)

        if (aiResponse) await logMessage(userId, module_id, 'assistant', aiResponse)
      } catch (err) {
        app.log.error(err, `${provider} chat error`)
        readable.push(`data: ${JSON.stringify({ type: 'error', message: 'AI service unavailable' })}\n\n`)
      }
      readable.push(null)
    })()

    return reply.send(readable)
  })

  // LLM-as-judge evaluation — saves scores to DB
  app.post('/evaluate', { preHandler: [authenticate] }, async (req, reply) => {
    const parsed = evaluateBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: parsed.error.flatten() })
    }

    const { module_id, code, chat_logs } = parsed.data
    const userId = req.user.id
    const chatSummary = chat_logs.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
    const evalPayload = `## Submitted Code\n\`\`\`\n${code}\n\`\`\`\n\n## Chat History (${chat_logs.length} messages)\n${chatSummary}`

    try {
      const text = await evaluateWithAI(evalPayload)
      const scores = JSON.parse(text) as {
        code_score: number
        prompt_score: number
        code_feedback: string
        prompt_feedback: string
        overall_feedback: string
      }

      sql`
        INSERT INTO interview_scores
          (user_id, module_id, code_score, prompt_score, code_feedback, prompt_feedback, overall_feedback)
        VALUES
          (${userId}, ${module_id}, ${scores.code_score}, ${scores.prompt_score},
           ${scores.code_feedback}, ${scores.prompt_feedback}, ${scores.overall_feedback})
      `.catch((err: unknown) => app.log.error(err, 'Failed to save interview scores'))

      return reply.send(scores)
    } catch {
      return reply.status(500).send({ error: 'EVAL_PARSE_FAILED', message: 'Could not parse evaluation' })
    }
  })

  // Monitoring: all chat logs for a module grouped by candidate
  app.get('/logs/:moduleId', { preHandler: [authenticate] }, async (req, reply) => {
    const { moduleId } = req.params as { moduleId: string }

    const rows = await sql`
      SELECT user_id, role, content, created_at
      FROM ai_chat_logs
      WHERE module_id = ${moduleId}
      ORDER BY user_id, created_at ASC
    `

    type LogRow = { user_id: string; role: string; content: string; created_at: string }
    const byUser: Record<string, LogRow[]> = {}
    for (const row of rows as unknown as LogRow[]) {
      if (!byUser[row.user_id]) byUser[row.user_id] = []
      byUser[row.user_id].push(row)
    }

    return reply.send({
      module_id: moduleId,
      candidate_count: Object.keys(byUser).length,
      candidates: byUser,
    })
  })

  // Monitoring: scores for a module
  app.get('/scores/:moduleId', { preHandler: [authenticate] }, async (req, reply) => {
    const { moduleId } = req.params as { moduleId: string }

    const rows = await sql`
      SELECT user_id, code_score, prompt_score, overall_feedback, created_at
      FROM interview_scores
      WHERE module_id = ${moduleId}
      ORDER BY created_at DESC
    `

    return reply.send({ module_id: moduleId, scores: rows })
  })
}
