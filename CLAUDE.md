# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

InterviewAI is an interactive AI engineering learning platform. Users progress through **tracks** containing **modules** of three types: CONCEPT (markdown article), CODING (Monaco + Xterm.js sandbox), and SIMULATOR (real-time infrastructure dashboard tuned via WebSocket). Free users access stages 0–1; stages 2–5 require Pro (Stripe, Phase 4 — not yet built).

The repo has a completed **backend** (Phases 1–2) and a **frontend** that still needs to be built per `FRONTEND_BRIEF.md`.

---

## Backend

**Stack:** Fastify · TypeScript · Supabase (auth + Postgres) · Redis · Zod

### Commands (run from `backend/`)

```bash
npm run dev        # tsx watch — hot reload
npm run build      # tsup → dist/
npm run start      # node dist/index.js
npm run typecheck  # tsc --noEmit
```

### Local infrastructure

```bash
docker compose up -d   # starts Redis on :6379
```

Copy `backend/.env.example` → `backend/.env` and fill in Supabase + Redis credentials.

**Database:** Run migrations manually in the Supabase SQL Editor — `migrations/001_initial_schema.sql` then `002_simulation_session_unique.sql`. There is no migration runner.

### Architecture

```
src/
├── index.ts              — Fastify server bootstrap; registers all route plugins + hydration worker
├── config.ts             — env vars (PORT, CORS_ORIGIN, SUPABASE_*, DATABASE_URL, REDIS_URL, STRIPE_*)
├── middleware/
│   ├── auth.ts           — JWT verification via Supabase; attaches user to request
│   └── entitlement.ts    — blocks stage_index > 1 for FREE tier users (returns 402)
├── routes/
│   ├── auth.ts           — POST /signup, POST /login, GET /me
│   ├── tracks.ts         — GET /tracks, GET /tracks/:id/modules, GET /tracks/:id/progress
│   ├── submissions.ts    — POST /submissions/run (queues execution, returns QUEUED; real runner is Phase 3)
│   └── simulator.ts      — WS /simulator/stream — auth via ?token= query param
├── simulation/
│   ├── engine.ts         — pure deterministic metric recalculator (no I/O); formula: L = (L_base + α·S_c/512 + β·log₂(D_m)) × index_factor × cache_factor
│   ├── session.ts        — 3-layer session store: Redis hot → Postgres warm → cold start default
│   └── leakyBucket.ts    — rate-limiter; drops intermediate WS frames under backpressure
├── workers/
│   └── hydration.ts      — background timer (10s) that flushes Redis sessions to Postgres
├── db/client.ts          — postgres.js pool (Supabase transaction pooler)
├── lib/supabase.ts       — Supabase admin client (service role key)
└── redis/client.ts       — ioredis singleton
```

**Simulator WebSocket flow:** client connects with `?token=<jwt>&moduleId=<uuid>` → server verifies JWT via Supabase, loads/creates session (Redis → Postgres → cold start) → immediately sends `STATE_SYNC` → client sends `MUTATE_CONFIG` messages → server patches `InfrastructureState`, calls `recalculateMetrics()`, saves to Redis (fire-and-forget), pushes result through leaky bucket → `STATE_SYNC` frame to client.

**Session persistence:** Redis TTL is 1 hour. The hydration worker runs every 10 seconds and flushes live Redis sessions to `active_simulation_sessions` in Postgres so state survives a Redis restart.

---

## Frontend (Phases 0–2 complete — see `PLAN.md` for current status)

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Zustand · Tailwind CSS v4 · Monaco · Xterm.js

**Key contracts from the brief:**
- Auth token stored in `localStorage` under key `interviewai_token`
- All HTTP goes through a typed `apiFetch` wrapper (`src/lib/api.ts`) — no axios
- WebSocket uses the native browser API — no socket.io
- All shared types live in `src/types/index.ts` — no inline redefinitions
- Zustand store shape in `FRONTEND_BRIEF.md §5` is contractual — back-end `STATE_SYNC` frames map directly onto it
- Execution stream WebSocket (`/submissions/stream/:id`) is **not live yet** — use `mockRunner.ts` until Phase 3
- `checkout_url` is always null — show a disabled "Coming Soon" CTA; Stripe is Phase 4

**Build order:** login/signup → auth guard → tracks list → track detail → module router → CONCEPT → SIMULATOR (highest priority) → CODING.

**Frontend env:**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Frontend Conventions

These rules apply to every file in `frontend/src/` without exception.

### Colors — no hardcoded values

- All color tokens are CSS custom properties defined in `src/styles/colors.ts` and injected by the root layout as `:root` / `.dark` variables.
- Tailwind v4 maps these to utility classes via `@theme inline` in `globals.css` (no `tailwind.config.ts` — that file does not exist and must not be created).
- Components use only Tailwind semantic classes — never raw hex (`#fff`), rgb, or arbitrary Tailwind values (`bg-[#1a1a2e]`).
- To swap the entire palette, update `src/styles/colors.ts` only. Nothing else changes.

```
src/styles/
├── colors.ts     ← single source of truth: light + dark token values
└── globals.css   ← Tailwind imports, @theme inline, dark variant, shared keyframes
```

### Styles — Tailwind first, component CSS when needed

- Never use `style={{ color: …, background: … }}` inline style objects.
- Primary styling: Tailwind utility classes only.
- For genuinely dynamic values (e.g. a slider thumb position), use `style={{ '--my-var': value }}` to set a CSS variable and reference it in Tailwind — never a full inline style object.
- Components **may** have a co-located CSS file (e.g. `Button.module.css`) for component-specific keyframes, complex pseudo-element selectors (`::-webkit-scrollbar`), or layout tricks that Tailwind cannot cleanly express.
- **Hard rule for component CSS files:** never hardcode a color — always use `var(--primary)`, `var(--surface)`, etc. Shared keyframes or patterns used in ≥ 2 components go in `globals.css`, not in a component CSS file.

### Components — small and modular

- One component per file. Filename matches the exported component name (PascalCase).
- Target ≤ 150 lines per component file. When a component grows past this, extract sub-components into the same directory.
- Props interfaces are defined in the same file as the component, not in `types/index.ts` (which is for shared API/domain types only).
- All stateful logic lives in a custom hook (`src/hooks/`), not inline in the component body.

### File structure

```
frontend/src/
├── app/                  — Next.js App Router pages and layouts only
├── components/
│   ├── ui/               — shared atomic primitives (Button, Badge, Modal, …)
│   ├── modules/          — module-type renderers (ConceptModule, CodingModule, …)
│   ├── editor/           — Monaco and Terminal wrappers
│   └── layout/           — structural chrome (Sidebar, Header, TopNav, …)
├── hooks/                — all custom hooks; filenames prefixed with `use`
├── lib/                  — pure utilities: api.ts, auth.ts, mockRunner.ts
├── store/                — Zustand slices
├── types/                — shared API and domain types (index.ts)
├── constants/            — all literal values (see below)
└── styles/               — colors.ts + globals.css
```

Each `components/` subdirectory exports its public surface through an `index.ts` barrel file. Internal sub-components that are not used outside the directory are not exported from the barrel.

### Constants — no hardcoded literals

- No string or numeric literal that has semantic meaning is written directly in a component or hook.
- All literals live in `src/constants/`:

```
src/constants/
├── routes.ts     — all URL path strings (e.g. ROUTES.LOGIN = '/login')
├── storage.ts    — localStorage/sessionStorage keys
├── api.ts        — endpoint path segments, WS event names, action strings
└── index.ts      — barrel re-export
```

### TypeScript

- Strict mode is non-negotiable (`"strict": true` in `tsconfig.json`).
- No `any`. `JSON.parse` results are cast through a typed union (e.g. `WsFrame`), not `any`.
- All API/domain types are imported from `src/types/index.ts`. No ad-hoc inline type redefinitions.
- Import alias `@/` is used for all intra-project imports — never relative paths that climb more than one directory level.

### Next.js / React specifics

- Browser-only libraries (Monaco, xterm) are loaded with `next/dynamic` and `{ ssr: false }`.
- Every page-level component is wrapped in a React `ErrorBoundary`.
- `'use client'` is added only when necessary. Prefer Server Components for static/data-fetch-only pages and push interactivity down to leaf components.

---

## Database schema (key tables)

| Table | Purpose |
|---|---|
| `users` | Mirrors Supabase auth; holds `subscription_status` |
| `tracks` | Learning tracks |
| `modules` | Ordered steps in a track; `tier_type` ∈ {CONCEPT, CODING, SIMULATOR}; `content_payload` is JSONB |
| `active_simulation_sessions` | Durable WS session state (flushed from Redis every 10s) |
| `user_progress` | One row per completed module per user |

Seed test data SQL is in `FRONTEND_BRIEF.md §13`.
