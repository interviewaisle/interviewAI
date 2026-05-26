# Frontend Developer AI Briefing — InterviewAI Platform

You are the AI assistant for the **frontend developer** on a two-person engineering team building an interactive AI engineering learning platform. The backend developer has completed **Phase 1** (auth + database + API skeleton) and **Phase 2** (real-time simulation engine + WebSocket gateway). Both are live and ready to integrate against.

**Your job:** Build the full Next.js frontend against the contracts defined in this document. Do not deviate from the API shapes, WebSocket message formats, or state structure described here — the backend is already running and the contracts are fixed.

Read this entire document before writing a single line of code.

---

## 1. WHAT WE ARE BUILDING

An interactive AI engineering learning platform where users progress through **tracks**, each containing a sequence of **modules**. There are three module types:

- **CONCEPT** — Markdown article with a progress step sidebar
- **CODING** — Monaco IDE + Xterm.js terminal. User writes code, submits it for sandboxed execution, sees real stdout/stderr
- **SIMULATOR** — Real-time infrastructure dashboard. User adjusts config parameters (chunk size, embedding model, etc.) and watches latency, cost, cache hit, and error rate update live via WebSocket

Users on the free tier can access Stage 0–1. Stages 2–5 require a Pro subscription (Stripe, Phase 4 — show a locked CTA for now).

---

## 2. TECH STACK

Use the following exactly. Do not substitute.

| Concern | Library |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript — strict mode throughout |
| State | Zustand (flat slice store) |
| Code editor | `@monaco-editor/react` |
| Terminal | `xterm` + `xterm-addon-fit` + `xterm-addon-attach` |
| Styling | Tailwind CSS |
| WebSocket | Native browser `WebSocket` API — no socket.io |
| HTTP | Custom `apiFetch` wrapper — no axios (see Section 8) |
| Auth tokens | `localStorage` — key `interviewai_token` |

---

## 3. RECOMMENDED FOLDER STRUCTURE

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (platform)/
│   │   ├── layout.tsx            ← auth guard lives here
│   │   ├── tracks/page.tsx
│   │   └── tracks/[trackId]/
│   │       ├── page.tsx          ← track detail + module list
│   │       └── modules/[moduleId]/page.tsx
│   └── layout.tsx
├── components/
│   ├── modules/
│   │   ├── ModuleRouter.tsx
│   │   ├── ConceptModule.tsx
│   │   ├── CodingModule.tsx
│   │   └── SimulatorModule.tsx
│   ├── editor/
│   │   ├── MonacoEditor.tsx
│   │   └── Terminal.tsx
│   └── ui/                       ← shared primitives (Button, Badge, Modal, etc.)
├── hooks/
│   ├── useSimulatorSocket.ts
│   └── useExecution.ts           ← Phase 3
├── lib/
│   ├── api.ts                    ← typed fetch wrapper
│   ├── auth.ts                   ← getToken / setToken / clearToken
│   └── mockRunner.ts             ← fake execution output until Phase 3
├── store/
│   └── workspace.ts              ← Zustand store
└── types/
    └── index.ts                  ← all shared TypeScript types
```

---

## 4. SHARED TYPESCRIPT TYPES

Define these in `src/types/index.ts`. Every component and hook imports from here — no inline type redefinitions.

```typescript
// src/types/index.ts

export interface User {
  id: string
  email: string
  subscription_status: 'FREE' | 'ACTIVE_PRO' | 'CANCELLED'
  created_at: string
}

export interface Track {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Module {
  id: string
  track_id: string
  stage_index: number
  tier_type: 'CONCEPT' | 'CODING' | 'SIMULATOR'
  company_tags: string[]
  content_payload: Record<string, unknown>
  created_at: string
}

export interface TrackProgress {
  completed_modules: string[]
  current_stage: number
}

export interface SimulationMetrics {
  latencyMs: number
  tokenSpendUsd: number
  errorRate: number
  cacheHitRatio: number
}

export interface SubmissionFile {
  name: string
  content: string
}

export interface SubmissionBody {
  module_id: string
  stage_index: number
  track_id: string
  files: SubmissionFile[]
}

export type ExecutionStatus = 'IDLE' | 'BUILDING' | 'RUNNING' | 'STREAMING' | 'ERROR'

export type ExitStatus = 'PASS' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'OUT_OF_MEMORY'

// WebSocket frame types
export type WsFrame =
  | { type: 'STATE_SYNC'; metrics: { latency_ms: number; token_spend_usd: number; error_rate_percentage: number; cache_hit_ratio: number } }
  | { type: 'STDOUT'; data: string }
  | { type: 'STDERR'; data: string }
  | { type: 'EXIT'; code: number; status: ExitStatus }
```

---

## 5. ZUSTAND STORE

The store must match this shape exactly. The backend pushes `STATE_SYNC` frames that map directly to `simulationMetrics`.

```typescript
// src/store/workspace.ts
import { create } from 'zustand'
import type { ExecutionStatus, SimulationMetrics } from '../types'

interface FileBuffer {
  content: string
  isDirty: boolean
  language: string
}

interface WorkspaceState {
  // Editor buffers
  activeFileId: string
  files: Record<string, FileBuffer>
  setActiveFile: (id: string) => void
  upsertFile: (id: string, buf: Partial<FileBuffer>) => void

  // Execution lifecycle
  status: ExecutionStatus
  setStatus: (s: ExecutionStatus) => void

  // Simulator metrics — driven by WS STATE_SYNC frames
  simulationMetrics: SimulationMetrics
  setSimulationMetrics: (m: SimulationMetrics) => void

  // Pane layout
  layout: { editorWidth: number; terminalHeight: number; simulatorVisible: boolean }
  setLayout: (l: Partial<WorkspaceState['layout']>) => void
}

export const useWorkspace = create<WorkspaceState>((set) => ({
  activeFileId: '',
  files: {},
  setActiveFile: (id) => set({ activeFileId: id }),
  upsertFile: (id, buf) =>
    set((s) => ({ files: { ...s.files, [id]: { ...s.files[id], ...buf } } })),

  status: 'IDLE',
  setStatus: (status) => set({ status }),

  simulationMetrics: { latencyMs: 0, tokenSpendUsd: 0, errorRate: 0, cacheHitRatio: 0 },
  setSimulationMetrics: (m) => set({ simulationMetrics: m }),

  layout: { editorWidth: 60, terminalHeight: 30, simulatorVisible: true },
  setLayout: (l) => set((s) => ({ layout: { ...s.layout, ...l } })),
}))
```

---

## 6. AUTH

### Token helpers

```typescript
// src/lib/auth.ts
const KEY = 'interviewai_token'
export const getToken = () => localStorage.getItem(KEY)
export const setToken = (t: string) => localStorage.setItem(KEY, t)
export const clearToken = () => localStorage.removeItem(KEY)
```

### Auth guard (platform layout)

```typescript
// src/app/(platform)/layout.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    if (!getToken()) router.replace('/login')
  }, [])
  return <>{children}</>
}
```

### Signup — `POST /api/v1/auth/signup`

```
Body:   { "email": "user@example.com", "password": "minlength8" }
201:    { "user_id": "uuid" }
400:    { "error": "SIGNUP_FAILED" | "VALIDATION_ERROR", "message": "..." }
```

### Login — `POST /api/v1/auth/login`

```
Body:   { "email": "user@example.com", "password": "..." }
200:    { "access_token": "eyJ...", "refresh_token": "eyJ...", "expires_at": 1234567890 }
401:    { "error": "LOGIN_FAILED", "message": "Invalid login credentials" }
```

After login: `setToken(data.access_token)`. Send on all subsequent requests:
```
Authorization: Bearer <access_token>
```

### Get current user — `GET /api/v1/auth/me`

```
200:    { "id": "uuid", "email": "...", "subscription_status": "FREE" | "ACTIVE_PRO" | "CANCELLED", "created_at": "..." }
401:    { "error": "UNAUTHORIZED" }
404:    { "error": "USER_NOT_FOUND" }
```

---

## 7. REST API CONTRACTS

### 7.1 Tracks

```
GET /api/v1/tracks
→ 200: Track[]
```

```
GET /api/v1/tracks/:trackId/modules
→ 200: Module[]    (ordered by stage_index ASC)
```

```
GET /api/v1/tracks/:trackId/progress
→ 200: { "completed_modules": ["uuid", ...], "current_stage": 2 }
```

### 7.2 Code Submission

```
POST /api/v1/submissions/run
Body: {
  "module_id": "uuid",
  "stage_index": 0,
  "track_id": "uuid",
  "files": [{ "name": "main.py", "content": "print('hello')" }]
}

202: { "execution_id": "uuid", "status": "QUEUED" }
402: { "error": "PAYMENT_REQUIRED", "message": "Stages 2-5 require a Pro subscription.", "checkout_url": null }
400: { "error": "VALIDATION_ERROR", "message": { "fieldErrors": { ... } } }
401: { "error": "UNAUTHORIZED" }
```

After `QUEUED` is received, the run button flow switches to watching a WebSocket for output. See Section 9.2.

---

## 8. TYPED FETCH WRAPPER

```typescript
// src/lib/api.ts
import { getToken } from './auth'
import type { Track, Module, TrackProgress, User, SubmissionBody } from '../types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw Object.assign(new Error(err.message ?? 'Request failed'), {
      status: res.status,
      data: err,
    })
  }

  return res.json() as Promise<T>
}

export const api = {
  auth: {
    signup: (body: { email: string; password: string }) =>
      apiFetch<{ user_id: string }>('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      apiFetch<{ access_token: string; refresh_token: string; expires_at: number }>(
        '/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) }
      ),
    me: () => apiFetch<User>('/api/v1/auth/me'),
  },
  tracks: {
    list: () => apiFetch<Track[]>('/api/v1/tracks'),
    modules: (trackId: string) => apiFetch<Module[]>(`/api/v1/tracks/${trackId}/modules`),
    progress: (trackId: string) => apiFetch<TrackProgress>(`/api/v1/tracks/${trackId}/progress`),
  },
  submissions: {
    run: (body: SubmissionBody) =>
      apiFetch<{ execution_id: string; status: string }>(
        '/api/v1/submissions/run', { method: 'POST', body: JSON.stringify(body) }
      ),
  },
}
```

### Error handling pattern

```typescript
try {
  const data = await api.submissions.run(body)
  // handle success
} catch (err: unknown) {
  const e = err as { status: number; data: { error: string; checkout_url?: string } }
  if (e.status === 402) {
    showPaywall(e.data.checkout_url)
  } else if (e.status === 401) {
    clearToken()
    router.push('/login')
  } else {
    showErrorToast(e.data.error)
  }
}
```

---

## 9. WEBSOCKET CONTRACTS

There are **two separate WebSocket use cases** with different endpoints. Do not mix them.

### 9.1 Simulator Stream — `/api/v1/simulator/stream`

**Purpose:** Real-time infrastructure metric updates driven by user config mutations.
**Status: Live now.**

```
Connection URL:
ws://localhost:3001/api/v1/simulator/stream?token=<access_token>&moduleId=<module_uuid>
```

Auth is via query param — browsers cannot send custom headers on WebSocket upgrade.
Always pass `moduleId` — it scopes the state to the current module.

---

**On connect**, the server immediately sends the current session state (no mutation needed):
```json
{ "type": "STATE_SYNC", "metrics": { "latency_ms": 89.3, "token_spend_usd": 0.002, "cache_hit_ratio": 0.64, "error_rate_percentage": 0.018 } }
```
Use this to hydrate the metrics panel on mount so the user sees real numbers before touching anything.

---

**Client → Server** (user changes a config param):
```json
{ "action": "MUTATE_CONFIG", "key": "chunk_size", "value": 1024 }
```

Valid keys and value types:
| Key | Type | UI Control |
|---|---|---|
| `chunk_size` | number (128–2048) | Slider |
| `chunk_overlap` | number (0–200) | Slider |
| `embedding_model` | `"text-embedding-3-small"` \| `"text-embedding-3-large"` \| `"text-embedding-ada-002"` | Dropdown |
| `vector_index_type` | `"HNSW"` \| `"IVFFlat"` \| `"Flat"` | Dropdown |
| `cache_enabled` | boolean | Toggle |

---

**Server → Client** (after any mutation):
```json
{ "type": "STATE_SYNC", "metrics": { "latency_ms": 158.2, "token_spend_usd": 0.0043, "error_rate_percentage": 0.01, "cache_hit_ratio": 0.85 } }
```

The backend uses a **leaky bucket** — if mutations fire faster than frames can be sent, intermediate frames are dropped. You will always receive the latest state, never a backlog. This means you can fire `MUTATE_CONFIG` freely on every slider tick without throttling client-side.

---

**Simulator WebSocket hook:**

```typescript
// src/hooks/useSimulatorSocket.ts
import { useEffect, useRef } from 'react'
import { getToken } from '@/lib/auth'
import { useWorkspace } from '@/store/workspace'
import type { WsFrame } from '@/types'

const WS_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') ?? 'ws://localhost:3001'

export function useSimulatorSocket(moduleId: string) {
  const socketRef = useRef<WebSocket | null>(null)
  const setMetrics = useWorkspace((s) => s.setSimulationMetrics)

  useEffect(() => {
    const token = getToken()
    if (!token || !moduleId) return

    const ws = new WebSocket(`${WS_BASE}/api/v1/simulator/stream?token=${token}&moduleId=${moduleId}`)
    socketRef.current = ws

    ws.onmessage = (event) => {
      const frame = JSON.parse(event.data) as WsFrame
      if (frame.type === 'STATE_SYNC') {
        setMetrics({
          latencyMs: frame.metrics.latency_ms,
          tokenSpendUsd: frame.metrics.token_spend_usd,
          errorRate: frame.metrics.error_rate_percentage,
          cacheHitRatio: frame.metrics.cache_hit_ratio,
        })
      }
    }

    ws.onerror = (e) => console.error('[SimulatorSocket] error', e)

    return () => ws.close()
  }, [moduleId])

  const mutateConfig = (key: string, value: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'MUTATE_CONFIG', key, value }))
    }
  }

  return { mutateConfig }
}
```

---

### 9.2 Execution Stream — `/api/v1/submissions/stream/:executionId`

**Purpose:** Stream sandboxed code execution stdout/stderr to the Xterm.js terminal.
**Status: Phase 3 — NOT live yet. Use the mock runner below.**

When Phase 3 is ready, this endpoint will exist. For now, after `POST /submissions/run` returns `QUEUED`, call `simulateMockExecution` instead of opening a WebSocket.

Future frame shapes (implement against these now so Phase 3 is a drop-in):
```json
{ "type": "STDOUT", "data": "[32mRunning tests...[0m\n" }
{ "type": "STDERR", "data": "[31mTraceback...[0m\n" }
{ "type": "EXIT",   "code": 0, "status": "PASS" }
```

Exit status → Zustand `status` mapping:
| `status` | Zustand `ExecutionStatus` |
|---|---|
| `PASS` | `'IDLE'` |
| `RUNTIME_ERROR` | `'ERROR'` |
| `TIME_LIMIT_EXCEEDED` | `'ERROR'` |
| `OUT_OF_MEMORY` | `'ERROR'` |

**Mock runner (use until Phase 3):**

```typescript
// src/lib/mockRunner.ts
import type { Terminal } from 'xterm'
import type { ExitStatus } from '@/types'

export function simulateMockExecution(
  term: Terminal,
  onExit: (status: ExitStatus) => void
) {
  term.write('\x1b[33mSpinning up sandbox...\x1b[0m\r\n')
  setTimeout(() => term.write('\x1b[32mRunning main.py\x1b[0m\r\n'), 600)
  setTimeout(() => term.write('Hello, world!\r\n'), 1100)
  setTimeout(() => term.write('\x1b[32m✓ All tests passed (3/3)\x1b[0m\r\n'), 1500)
  setTimeout(() => onExit('PASS'), 1700)
}
```

---

## 10. MODULE ROUTER

Route: `/tracks/[trackId]/modules/[moduleId]`

```typescript
// src/components/modules/ModuleRouter.tsx
import type { Module } from '@/types'
import ConceptModule from './ConceptModule'
import CodingModule from './CodingModule'
import SimulatorModule from './SimulatorModule'

export default function ModuleRouter({ module }: { module: Module }) {
  switch (module.tier_type) {
    case 'CONCEPT':   return <ConceptModule module={module} />
    case 'CODING':    return <CodingModule module={module} />
    case 'SIMULATOR': return <SimulatorModule module={module} />
  }
}
```

### 10.1 CONCEPT Module

- Render `module.content_payload.content` as markdown (use `react-markdown`)
- Left sidebar shows all modules in the track with a progress indicator
- "Mark Complete" button — optimistically mark complete in local state for now (POST endpoint coming Phase 3)

### 10.2 CODING Module

Three-pane layout:
```
┌──────────────────────────────────┬────────────────────┐
│  Monaco Editor (files + buffer)  │  Problem statement  │
│                                  │  + test cases       │
├──────────────────────────────────┤  (collapsible)      │
│  Xterm.js terminal               │                     │
└──────────────────────────────────┴────────────────────┘
```

Monaco rules:
- Debounce keystrokes 300ms before writing to Zustand `files`
- On file switch: `monaco.editor.setModel(models[newFileId])` — do NOT destroy and recreate the editor instance
- Derive language from extension: `.py → 'python'`, `.ts → 'typescript'`, `.js → 'javascript'`

Run button flow:
```
1. setStatus('BUILDING')
2. POST /api/v1/submissions/run  →  { execution_id, status: 'QUEUED' }
3. setStatus('RUNNING')
4. simulateMockExecution(term, (exitStatus) => {
     setStatus(exitStatus === 'PASS' ? 'IDLE' : 'ERROR')
     showResultBanner(exitStatus)
   })
```

### 10.3 SIMULATOR Module

```
┌──────────────────────────────────┬────────────────────────────┐
│  Infrastructure Config           │  Live Metrics               │
│                                  │                             │
│  Chunk Size     [=====●===] 512  │  Latency       89.3 ms     │
│  Chunk Overlap  [==●======]  50  │  Cost         $0.0020      │
│  Embedding Model [dropdown]      │  Error Rate    1.8%        │
│  Vector Index   [dropdown]       │  Cache Hit    64.0%        │
│  Cache Enabled  [toggle ON]      │                             │
└──────────────────────────────────┴────────────────────────────┘
```

Behaviour:
- On mount: `useSimulatorSocket(module.id)` — receives initial `STATE_SYNC` immediately
- On every slider **release** (not drag): send `MUTATE_CONFIG`
- On every dropdown/toggle change: send `MUTATE_CONFIG` immediately
- On `STATE_SYNC` received: `setSimulationMetrics(...)` — Zustand re-renders the right panel
- Animate metric value transitions (CSS or a number spring library like `react-spring`) over ~300ms — raw number jumps look broken

---

## 11. ENTITLEMENT GATE UI

When `POST /api/v1/submissions/run` returns `402`:

Show a modal over the workspace:
- Lock icon + "Pro Required" heading
- The `message` field from the response body
- "Upgrade to Pro" button — **disabled** with "Coming Soon" label until `checkout_url` is non-null
- Do NOT let the user run code client-side as a workaround

---

## 12. STATUS TABLE — WHAT IS LIVE VS MOCKED

| Feature | Status | Notes |
|---|---|---|
| `POST /auth/signup` | **Live** | |
| `POST /auth/login` | **Live** | |
| `GET /auth/me` | **Live** | |
| `GET /tracks` | **Live** | Returns `[]` until DB is seeded |
| `GET /tracks/:id/modules` | **Live** | Returns `[]` until DB is seeded |
| `GET /tracks/:id/progress` | **Live** | Works once modules exist |
| `POST /submissions/run` | **Live** | Returns `QUEUED` — no execution yet |
| Entitlement gate (402) | **Live** | Fires for `stage_index > 1` on free tier |
| Simulator WebSocket | **Live** | Auth + leaky bucket + metric engine active |
| `STATE_SYNC` frames | **Live** | Responds to all 5 `MUTATE_CONFIG` keys |
| Execution stdout/stderr stream | **Mocked** | Use `mockRunner.ts` — Phase 3 |
| Stripe `checkout_url` | **Null** | Disabled CTA — Phase 4 |

---

## 13. SEEDING TEST DATA

The database is empty on first boot. To test the UI against real data, run this SQL in the Supabase SQL Editor:

```sql
-- Insert a test track
INSERT INTO tracks (id, name, description)
VALUES ('00000000-0000-0000-0000-000000000001', 'RAG Systems', 'Build production-grade retrieval-augmented generation pipelines');

-- Concept module (free)
INSERT INTO modules (track_id, stage_index, tier_type, company_tags, content_payload)
VALUES (
  '00000000-0000-0000-0000-000000000001', 0, 'CONCEPT',
  ARRAY['Google', 'OpenAI'],
  '{"content": "# Introduction to RAG\n\nRetrieval-Augmented Generation (RAG) combines..."}'::jsonb
);

-- Simulator module (free)
INSERT INTO modules (track_id, stage_index, tier_type, company_tags, content_payload)
VALUES (
  '00000000-0000-0000-0000-000000000001', 1, 'SIMULATOR',
  ARRAY['Pinecone', 'Weaviate'],
  '{"description": "Tune your RAG pipeline parameters and observe the effect on retrieval latency and cost."}'::jsonb
);

-- Coding module (Pro)
INSERT INTO modules (track_id, stage_index, tier_type, company_tags, content_payload)
VALUES (
  '00000000-0000-0000-0000-000000000001', 2, 'CODING',
  ARRAY['Anthropic'],
  '{"description": "Implement a chunking strategy.", "starter_files": [{"name": "main.py", "content": "# Your code here\n"}]}'::jsonb
);
```

---

## 14. ENVIRONMENT VARIABLES

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 15. THINGS TO NOT BUILD YET

- No Stripe payment UI beyond the disabled CTA button
- No AI agent chat panel (Phase 3+)
- No admin / content management pages
- No token refresh logic — if a 401 is received, clear the token and redirect to `/login`
- No real execution stream WebSocket — use `mockRunner.ts`

---

## 16. BUILD ORDER

Build in this exact sequence. Each step gives you something testable before moving to the next.

1. **`/login` and `/signup` pages** — wire to `api.auth.login` / `api.auth.signup`, store token on success, redirect to `/tracks`
2. **Auth guard** — platform layout redirects to `/login` if no token. `GET /auth/me` on mount to verify it is still valid
3. **`/tracks` page** — fetch `api.tracks.list()`, render track cards with name + description
4. **`/tracks/[trackId]` page** — fetch modules + progress, render a step-by-step sidebar with `CONCEPT / CODING / SIMULATOR` badges
5. **Module router** — `/tracks/[trackId]/modules/[moduleId]` fetches the module and delegates to `ModuleRouter`
6. **CONCEPT module** — markdown renderer + sidebar + "Mark Complete" (optimistic)
7. **SIMULATOR module** — this is the highest-priority interactive piece. Wire `useSimulatorSocket`, build the config panel + metrics panel. Every slider/dropdown/toggle change sends `MUTATE_CONFIG`, every `STATE_SYNC` updates the right panel
8. **CODING module** — Monaco editor + `simulateMockExecution` + run button flow + entitlement modal
