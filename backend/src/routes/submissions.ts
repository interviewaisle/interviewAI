import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { authenticate } from '../middleware/auth'
import { entitlementGuard } from '../middleware/entitlement'
import { config } from '../config'

// Judge0 CE language IDs
const EXT_TO_LANGUAGE_ID: Record<string, number> = {
  py: 71,   // Python 3.8.1
  js: 63,   // Node.js 12.14.0
  ts: 74,   // TypeScript 3.7.4
  java: 62, // Java OpenJDK 13
  cpp: 54,  // C++ GCC 9.2.0
  c: 50,    // C GCC 9.2.0
  go: 60,   // Go 1.13.5
  rb: 72,   // Ruby 2.7.0
  rs: 73,   // Rust 1.40.0
}

const EXT_TO_LANG_NAME: Record<string, string> = {
  py: 'python', js: 'javascript', ts: 'typescript',
  java: 'java', cpp: 'c++', c: 'c', go: 'go', rb: 'ruby', rs: 'rust',
}

// Judge0 status IDs
const JUDGE0_ACCEPTED = 3
const JUDGE0_TLE = 5
const JUDGE0_COMPILE_ERROR = 6

const runBody = z.object({
  module_id: z.string().uuid(),
  stage_index: z.number().int().min(0),
  track_id: z.string().uuid(),
  files: z.array(z.object({
    name: z.string().min(1),
    content: z.string(),
  })).min(1).max(20),
})

interface Judge0Response {
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  message: string | null
  status: { id: number; description: string }
  time: string | null
  memory: number | null
}

// For multi-file Python: inject supporting modules via sys.modules so that
// "import utils" in main.py resolves to the injected utils.py content.
// Base64-encode each file to avoid any string escaping issues.
function buildPythonSource(files: { name: string; content: string }[]): string {
  const main = files[0]
  const supporting = files.slice(1).filter(f => f.name.endsWith('.py'))

  if (supporting.length === 0) return main.content

  const injections = supporting.map(f => {
    const modName = f.name.replace(/\.py$/, '').replace(/[^a-zA-Z0-9_]/g, '_')
    const b64 = Buffer.from(f.content, 'utf8').toString('base64')
    return [
      `_mod_${modName} = __import__('types').ModuleType('${modName}')`,
      `exec(compile(__import__('base64').b64decode('${b64}').decode(), '${f.name}', 'exec'), _mod_${modName}.__dict__)`,
      `__import__('sys').modules['${modName}'] = _mod_${modName}`,
    ].join('\n')
  })

  return `${injections.join('\n')}\n\n${main.content}`
}

export async function submissionsRoutes(app: FastifyInstance) {
  app.post('/run', {
    preHandler: [authenticate, entitlementGuard()],
  }, async (req, reply) => {
    const parsed = runBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: parsed.error.flatten() })
    }

    const { files } = parsed.data
    const mainFile = files[0]
    const ext = mainFile.name.split('.').pop()?.toLowerCase() ?? 'py'
    const languageId = EXT_TO_LANGUAGE_ID[ext] ?? 71
    const languageName = EXT_TO_LANG_NAME[ext] ?? 'python'
    const executionId = randomUUID()

    // Build source: multi-file Python gets module injection wrapper
    const sourceCode = ext === 'py' ? buildPythonSource(files) : mainFile.content

    try {
      const judge0Res = await fetch(
        `${config.JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_code: sourceCode,
            language_id: languageId,
            cpu_time_limit: 10,
            wall_time_limit: 15,
          }),
        }
      )

      if (!judge0Res.ok) {
        app.log.error({ status: judge0Res.status }, 'Judge0 API error')
        return reply.status(502).send({ error: 'EXECUTOR_UNAVAILABLE', message: 'Code execution service error' })
      }

      const data = await judge0Res.json() as Judge0Response
      const statusId = data.status.id

      if (statusId === JUDGE0_COMPILE_ERROR) {
        return reply.send({
          execution_id: executionId,
          status: 'COMPILE_ERROR',
          language: languageName,
          version: '',
          stdout: '',
          stderr: data.compile_output ?? data.stderr ?? 'Compilation failed',
          exit_code: 1,
        })
      }

      const execStatus = statusId === JUDGE0_TLE
        ? 'TIMEOUT'
        : statusId === JUDGE0_ACCEPTED ? 'COMPLETED' : 'RUNTIME_ERROR'

      return reply.send({
        execution_id: executionId,
        status: execStatus,
        language: languageName,
        version: '',
        stdout: data.stdout ?? '',
        stderr: data.stderr ?? '',
        exit_code: statusId === JUDGE0_ACCEPTED ? 0 : 1,
      })
    } catch (err) {
      app.log.error(err, 'Judge0 fetch failed')
      return reply.status(502).send({ error: 'EXECUTOR_UNAVAILABLE', message: 'Could not reach code execution service' })
    }
  })
}
