@AGENTS.md

# InterviewAI — Frontend

Read the root `CLAUDE.md` for project overview, backend architecture, and cross-cutting conventions. This file adds frontend-specific rules that **override or extend** those conventions.

---

## Actual stack (not what root CLAUDE.md originally assumed)

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | **16** (App Router) | Breaking changes vs 14 — read `node_modules/next/dist/docs/` |
| React | **19** | |
| Tailwind CSS | **v4** | CSS-first config — **no `tailwind.config.ts`** |
| TypeScript | strict | `tsc --noEmit` must pass before committing |

---

## Build status

| Phase | Status | What exists |
|-------|--------|-------------|
| 0 — Foundation | ✅ Done | types, constants, lib, store, styles |
| 1 — Auth Pages | ✅ Done | login/signup pages, Button, ErrorBoundary, form hooks |
| 2 — Auth Guard + Tracks List | ✅ Done | platform layout guard, tracks page, TrackCard, Badge |
| 3 — Track Detail | ✅ Done | `[trackId]/page.tsx`, `ModuleStepItem` |
| 4 — Module Router + CONCEPT | ✅ Done | module page, ModuleRouter, ConceptModule, ModuleSidebar, stubs, useModuleCompletion |
| 5 — SIMULATOR | ✅ Done | `useSimulatorSocket`, SimulatorConfigPanel, SimulatorMetricsPanel, SimulatorModule |
| 6 — CODING | ✅ Done | MonacoEditor, Terminal, useExecution, CodingModule, Modal, PaywallModal |
| 7 — E2E Testing | ✅ Done | frontend-only flows automated (Playwright); backend-dependent flows verified by code review |
| 8 — Bug Fixes + Navigation | ✅ Done | dead 401 branch removed, fetchError state, back navigation links |
| 9 — DB Setup via Supabase MCP | ✅ Done | All 5 tables created, seed data inserted, auth trigger updated — see Phase 9 below |
| 10 — User Testing | ⬜ Next | Manual smoke test with live stack — see Phase 10 below |
| 11 — Design Overhaul (Auth theme) | ✅ Done | Color system, fonts, light/dark toggle, NeuralCanvas, AuthInput, PasswordStrengthMeter, signup page redesign |

See `PLAN.md` in the repo root for full specifications and the User Testing Phase setup guide.

### Environment files

| File | Status | Notes |
|------|--------|-------|
| `frontend/.env.local` | ✅ Created | `NEXT_PUBLIC_API_URL=http://localhost:3001` |
| `backend/.env` | ✅ Should exist | Was a pre-condition for Phase 9; Supabase project is `cshfpyqzdqyclcdwwbnr` |

Running `npm run dev` from `frontend/` works immediately. The backend requires `backend/.env` before it can start.

---

---

## Design system (Phase 11)

### Theme toggle (light/dark)
- Theme is user-toggled via `useTheme()` hook (`src/hooks/useTheme.ts`). Persists to `localStorage` under `STORAGE_KEYS.THEME` (`'iai-theme'`).
- An inline `<script>` in `layout.tsx` applies the `dark` class to `<html>` before React hydrates (prevents FOUC). The `<html>` element no longer has a hardcoded `dark` class.
- To read the current theme: `document.documentElement.classList.contains('dark')`.

### Gradient accent
- Gradient: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)` — cyan `#06B6D4` → indigo `#6366F1`.
- Apply as background: `className="gradient-accent"` (CSS utility in `globals.css`).
- Apply as text fill: `className="gradient-text"` (CSS utility in `globals.css`), or use `<GradientText>` component.
- CTA buttons use `variant="cta"` on `<Button>` — gradient background, 52px height, full-width, rounded-xl.

### Typography
- Primary font: **Plus Jakarta Sans** (weights 400/500/600/700/800) — loaded via `next/font/google` as CSS variable `--font-sans`.
- Mono labels font: **JetBrains Mono** (weights 400/500) — loaded as CSS variable `--font-mono-ui`; use class `font-mono-labels`.
- `body { font-family: var(--font-sans), 'Plus Jakarta Sans', sans-serif }` is set in `globals.css`.

### Auth components (`src/components/auth/`)
- `NeuralCanvas` — full-viewport animated canvas background (fixed, z-0). Load via `next/dynamic` with `ssr: false`.
- `AuthInput` — 52px glassmorphic input with gradient focus border (CSS module), node connector dot, optional eye toggle.
- `PasswordStrengthMeter` — 4-segment bar + label, driven by `usePasswordStrength(password)` hook.
- `AuthOAuthRow` — OAuth provider row (Google / GitHub).
- `AuthDivider` — `—— or ——` divider.
- Forms that use `AuthInput` must have `pl-9` (36px) on the `<form>` to give the node dots (positioned at `-left-5`) room to appear.

### New shared UI components (`src/components/ui/`)
- `GradientText` — renders children with gradient text fill. Props: `children`, `as` (default `span`).
- `ThemeToggle` — 38×38px circle button; sun/moon icon; calls `useTheme()`.

---

## Tailwind v4 quick reference

- No `tailwind.config.ts` — do not create one.
- Color tokens live in `src/styles/globals.css` under `@theme inline { --color-primary: var(--primary); ... }`.
- Raw CSS variable values are set by `buildCssVars()` in `src/styles/colors.ts`, injected by `app/layout.tsx`.
- Dark mode: `@custom-variant dark (&:where(.dark, .dark *))`. Theme is user-toggled via `useTheme()` hook; anti-FOUC script in `layout.tsx` applies the `dark` class before hydration. Use `prose prose-invert` only inside `.dark`-scoped content areas.
- Typography plugin: `@plugin "@tailwindcss/typography"` in `globals.css` — the `prose` class is available everywhere.
- Semantic Tailwind classes wired: `bg-primary`, `bg-primary-hover`, `text-muted`, `text-secondary`, `bg-surface`, `bg-surface-raised`, `bg-surface-overlay`, `text-foreground`, `border-border`, `text-destructive`, `text-success`, `text-warning`, `text-accent`, `bg-node-dot`.
- CSS utilities (not Tailwind tokens): `gradient-accent`, `gradient-text`, `font-mono-labels`, `fade-in-up` keyframe.

---

## CSS architecture (UI overhaul readiness)

A full visual redesign is planned after all phases are implemented. The architecture is designed so that redesign touches **exactly two files**:

| File | What changes in the overhaul |
|------|------------------------------|
| `src/styles/colors.ts` | All color token values (the palette) |
| `src/styles/globals.css` | Global keyframes, base resets, shared animation utilities |

### Rules every agent must follow

1. **No raw color values anywhere outside `colors.ts`.**
   - No hex, rgb, or hsl in any component file, CSS module, or inline style.
   - In component CSS files: always `var(--primary)`, `var(--surface)`, etc.
   - In Tailwind: always semantic classes (`bg-primary`) — never `bg-[#1a1a2e]`.
   - **Exception:** third-party library config objects that cannot consume CSS variables (e.g. xterm's `theme` option) must read computed values via `getComputedStyle(document.documentElement).getPropertyValue('--token')` at runtime. This is the established pattern — do not revert to hardcoded hex.

2. **Component CSS files are allowed — with constraints.**
   A component may have a co-located CSS file (e.g. `Button.module.css`) for:
   - Component-specific `@keyframes`
   - Complex pseudo-element overrides (`::-webkit-scrollbar`, `::placeholder`, `::before/after` with `content`)
   - Layout tricks that produce unreadable utility strings (e.g. complex `clip-path`)

   A component CSS file must **never** contain color values — only `var(--*)` references.
   Any `@keyframes` or pattern needed by two or more components moves to `globals.css`.

3. **No inline style objects for visual properties.**
   The only allowed `style` prop form is `style={{ '--my-var': computedValue }}` to pass a dynamic value to a CSS variable, which is then consumed by a Tailwind class or component CSS rule.

---

## Auth pattern

- Token stored in `localStorage` under `STORAGE_KEYS.AUTH_TOKEN` (`'interviewai_token'`).
- `src/lib/auth.ts` — `getToken()` (SSR-safe), `setToken(t)`, `clearToken()`.
- All routes under `(platform)/` are automatically guarded by `src/app/(platform)/layout.tsx` via `useAuthGuard()`.
- On **any** 401 response from the API: `clearToken()` → `router.replace(ROUTES.LOGIN)`. Do not show an error screen.
- On **402**: show `PaywallModal` (already built — see Phase 6 notes). Do not redirect.

---

## Component conventions

- One component per file. Filename = exported component name (PascalCase).
- ≤ 150 lines per file. Extract sub-components into the same directory when this limit is approached.
- Props interfaces defined in the same file as the component — not in `src/types/index.ts`.
- Stateful logic belongs in `src/hooks/` custom hooks, not inline in component bodies.
- Every page-level component (`app/**/page.tsx`) is wrapped in `<ErrorBoundary>`.
- Browser-only libs (Monaco, xterm) loaded via `next/dynamic` with `{ ssr: false }`.

### `'use client'` placement

- Add `'use client'` only when the file uses browser APIs, React hooks, or event handlers.
- Push client boundaries as far down the tree as possible — prefer Server Components for data-fetch-only pages.
- All hook files (`src/hooks/`) that use React hooks start with `'use client'`.

### Barrel files

Each `components/` subdirectory has an `index.ts` exporting its public surface. Internal sub-components not used outside the directory are not exported.

---

## Loading and error states (mandatory on every page)

- Show `animate-pulse` skeleton cards while data is `null` (initial fetch in progress).
- After fetch: show an empty-state message if the array is empty.
- Wrap every page component in `<ErrorBoundary>` for unhandled throw.
- Call `notFound()` (from `next/navigation`) for missing tracks or modules.

---

## File structure

```
frontend/
├── e2e/
│   └── auth.spec.ts                                 ✅ 12 Playwright smoke tests (frontend-only, no backend needed)
├── playwright.config.ts                             ✅ Playwright config; baseURL :3000; webServer auto-starts dev
frontend/src/
├── app/
│   ├── layout.tsx                                   ✅ root layout; anti-FOUC script, font vars (Plus Jakarta Sans, JetBrains Mono), CSS vars
│   ├── page.tsx                                     ✅ redirects → /login
│   ├── (auth)/
│   │   ├── login/page.tsx                           ✅
│   │   └── signup/page.tsx                          ✅ redesigned — NeuralCanvas + AuthInput + PasswordStrengthMeter
│   └── (platform)/
│       ├── layout.tsx                               ✅ auth guard
│       └── tracks/
│           ├── page.tsx                             ✅ tracks list
│           └── [trackId]/
│               ├── page.tsx                         ✅ track detail / stepper
│               └── modules/[moduleId]/page.tsx      ✅ module router entry
├── components/
│   ├── ui/
│   │   ├── index.ts                                 ✅ barrel
│   │   ├── Badge.tsx                                ✅
│   │   ├── Button.tsx                               ✅ variants: primary | ghost | cta (gradient); loadingStep prop for 3-step auth animation
│   │   ├── ErrorBoundary.tsx                        ✅
│   │   ├── GradientText.tsx                         ✅ gradient text fill via .gradient-text CSS util
│   │   ├── Modal.tsx                                ✅ generic modal (Escape + backdrop close)
│   │   ├── ModuleStepItem.tsx                       ✅
│   │   ├── PaywallModal.tsx                         ✅ lock icon + "Coming Soon" disabled CTA
│   │   ├── ThemeToggle.tsx                          ✅ 38px circle; sun/moon icon; uses useTheme()
│   │   └── TrackCard.tsx                            ✅
│   ├── auth/
│   │   ├── index.ts                                 ✅ barrel
│   │   ├── NeuralCanvas.tsx                         ✅ animated canvas bg (load with next/dynamic ssr:false); reads CSS vars at mount
│   │   ├── AuthInput.tsx + AuthInput.module.css     ✅ glassmorphic 52px input; gradient focus border; node dot; eye toggle
│   │   ├── PasswordStrengthMeter.tsx                ✅ 4-segment bar driven by usePasswordStrength()
│   │   ├── AuthOAuthRow.tsx                         ✅ Google + GitHub OAuth rows
│   │   ├── AuthDivider.tsx                          ✅ "or" divider
│   │   └── neuralGraph.ts + neuralDraw.ts           ✅ internal helpers (not in barrel)
│   ├── modules/
│   │   ├── index.ts                                 ✅ barrel (public: ModuleRouter, ConceptModule, CodingModule, SimulatorModule)
│   │   ├── ModuleRouter.tsx                         ✅
│   │   ├── ConceptModule.tsx                        ✅
│   │   ├── ModuleSidebar.tsx                        ✅ internal
│   │   ├── CodingModule.tsx                         ✅
│   │   ├── CodingFileTabBar.tsx                     ✅ internal
│   │   ├── SimulatorModule.tsx                      ✅
│   │   ├── SimulatorConfigPanel.tsx                 ✅ internal
│   │   └── SimulatorMetricsPanel.tsx                ✅ internal
│   ├── editor/
│   │   ├── index.ts                                 ✅ barrel: MonacoEditor, Terminal, TerminalHandle type
│   │   ├── MonacoEditor.tsx                         ✅
│   │   └── Terminal.tsx                             ✅
│   └── layout/                                      (empty — not needed through Phase 7)
├── hooks/
│   ├── useAuthGuard.ts                              ✅
│   ├── useExecution.ts                              ✅
│   ├── useLoginForm.ts                              ✅
│   ├── useModuleCompletion.ts                       ✅
│   ├── usePasswordStrength.ts                       ✅ pure scoring fn: score 0–4, label
│   ├── useSignupForm.ts                             ✅ extended: name, confirmPassword, loadingStep (0-2 steps, -1 success)
│   ├── useSimulatorSocket.ts                        ✅
│   └── useTheme.ts                                  ✅ reads/writes iai-theme in localStorage; toggles .dark class on <html>
├── lib/             api.ts ✅  auth.ts ✅  mockRunner.ts ✅
├── store/           workspace.ts ✅  (shape is contractual — do not change)
├── types/           index.ts ✅  (import from here — never redefine inline)
├── constants/       routes.ts ✅  storage.ts ✅ (THEME key added)  api.ts ✅  index.ts ✅
└── styles/          colors.ts ✅ (updated palette + new tokens)  globals.css ✅ (fonts, gradient utils, fade-in-up)
```

---

## Phase 3 implementation notes

- `src/app/(platform)/tracks/[trackId]/page.tsx` — client component; `Promise.all` fetches modules, progress, **and** `api.auth.me()` together (user is needed for entitlement check).
- `src/components/ui/ModuleStepItem.tsx` — vertical stepper item; `isLocked`, `isCurrent`, `isCompleted` are props, calculated by the page.
- Entitlement: `isLocked = user.subscription_status === 'FREE' && module.stage_index > 1`
- 401 in `.catch`: use `clearToken()` + `window.location.replace(ROUTES.LOGIN)` — not `router.replace` — because there is no router instance available in the catch closure.

---

## Phase 4 implementation notes

- `src/app/(platform)/tracks/[trackId]/modules/[moduleId]/page.tsx` — same `Promise.all([modules, progress, me])` pattern as the track detail page. Finds module by `moduleId`; calls `notFound()` if missing. Passes `{ module, allModules, progress, user }` to `<ModuleRouter>`.
- `src/components/modules/ModuleRouter.tsx` — `switch (module.tier_type)` dispatches to the correct component; all three variants receive `{ module, allModules, progress, user }`.
- `src/components/modules/ConceptModule.tsx` — two-panel `h-screen overflow-hidden` layout. Left: `<ModuleSidebar>`. Right: `react-markdown` with `prose prose-invert` + a "Mark Complete" button backed by `useModuleCompletion`.
- `src/components/modules/ModuleSidebar.tsx` — **internal**. Compact list: check icon for completed, stage number for others, locked items rendered as plain divs with `opacity-50`.
- `react-markdown` v10 (ESM) works fine when imported directly in a `'use client'` component — no `next/dynamic` wrapper needed.

### content_payload casting pattern (established in Phase 4)
```ts
const content = (module.content_payload as { content?: string }).content ?? ''
```
Use the same narrow cast pattern for any `content_payload` field access.

---

## Phase 5 implementation notes

- **`src/hooks/useSimulatorSocket.ts`** — `useEffect` opens a native `WebSocket` at `${WS_BASE}/api/v1/simulator/stream?token=<jwt>&moduleId=<uuid>`. On `STATE_SYNC` frames maps snake_case fields to camelCase and calls `setSimulationMetrics`. Cleanup closes the socket. Returns `{ mutateConfig, isConnected }`.
- **`src/components/modules/SimulatorConfigPanel.tsx`** (internal) — sliders fire `mutateConfig` only on `onMouseUp`/`onTouchEnd` (reads `e.target.value` directly because React batches `onChange` setState). Dropdowns fire on `onChange`. Toggle fires on click.
- **`src/components/modules/SimulatorMetricsPanel.tsx`** (internal) — four metric cards; value `<p>` elements carry `style={{ transition: 'all 300ms ease' }}` (intentional — CSS variable approach adds complexity for no gain here).
- WS URL constructed via `.replace(/^http/, 'ws')` so `https → wss` automatically.

---

## Phase 6 implementation notes

### What was built

- **`src/components/editor/MonacoEditor.tsx`** — `'use client'` component. Loads `@monaco-editor/react` via `next/dynamic<EditorProps>({ ssr: false })`. `onMount` creates one `editor.ITextModel` per starter file and stores them in a `useRef<Map<string, editor.ITextModel>>`. A `useEffect` on the `activeFileId` prop calls `editorInstance.setModel(model)` — the editor is never remounted. `onChange` is debounced 300ms before calling Zustand `upsertFile`. Props: `starterFiles: SubmissionFile[]`, `activeFileId: string`.

- **`src/components/editor/Terminal.tsx`** — `'use client'` `forwardRef` component. Must be loaded by its consumer via `next/dynamic({ ssr: false })` because xterm is imported at module level. `useEffect` inits `xterm.Terminal` + `FitAddon`, attaches to a `div` ref, and sets up a `ResizeObserver`. Theme colours are read via `getComputedStyle(document.documentElement).getPropertyValue('--surface/--foreground')` at mount time (xterm theme config cannot consume CSS variables directly). `useImperativeHandle` exposes `{ write(text): void; clear(): void }`.

- **`src/hooks/useExecution.ts`** — Takes `termRef: RefObject<TerminalHandle | null>`. Run flow: `setStatus('BUILDING')` → `await api.submissions.run(...)` → `setStatus('RUNNING')` → `termRef.current?.clear()` → `simulateMockExecution(termRef.current as unknown as XTerm, onExit)`. 402 → re-throws to caller. 401 → `clearToken()` + `router.replace(ROUTES.LOGIN)`. Other errors → `setStatus('ERROR')`.

- **`src/components/modules/CodingModule.tsx`** — `flex h-screen flex-col` shell. Header contains run button (disabled while `status` is `BUILDING/RUNNING/STREAMING`). Left column: `CodingFileTabBar` (internal, file tabs) + `MonacoEditor` (flex-1) + `TerminalDynamic` (h-48). Right column (w-80 border-l): problem description from `content_payload.description`. Seeds Zustand with starter files in a `useEffect(fn, [])` (empty deps — fires once on mount only). `handleRun` reads current file contents from `useWorkspace().files` at click time. 402 catch → sets `paywallMessage` state → `PaywallModal` appears.

- **`src/components/modules/CodingFileTabBar.tsx`** — **internal** (not in modules barrel). Simple tab row; active tab gets `bg-surface-raised text-foreground`, others are muted.

- **`src/components/ui/Modal.tsx`** — `fixed inset-0 z-50` overlay with `bg-surface-overlay/80`. Centered card `max-w-md`. Escape key handled in `useEffect`; backdrop click calls `onClose`; card click stops propagation.

- **`src/components/ui/PaywallModal.tsx`** — Wraps `<Modal>`. Lock SVG (text-warning), "Pro Required" heading, `message` prop, always-disabled `<Button>` labelled "Coming Soon". `checkout_url` is always null — never attempt to navigate to it.

### Key implementation patterns established in Phase 6

- **Terminal dynamic import with forwardRef:** CodingModule loads Terminal as:
  ```ts
  const TerminalDynamic = dynamic(
    () => import('@/components/editor/Terminal').then(m => m.Terminal),
    { ssr: false }
  ) as React.ForwardRefExoticComponent<
    { className?: string } & React.RefAttributes<TerminalHandle>
  >
  ```
  The type cast is necessary because `next/dynamic` does not preserve forwardRef types in its return type.

- **File IDs:** Filenames (e.g. `"main.py"`) are used as the `activeFileId` key in the Zustand workspace store. `MonacoEditor` uses `file.name` as the model map key.

- **`simulateMockExecution` type cast:** `mockRunner.ts` types its `term` arg as xterm's full `Terminal`, but `TerminalHandle` only exposes `{ write, clear }`. Cast in `useExecution`: `termRef.current as unknown as XTerm`. Safe at runtime because `simulateMockExecution` only calls `.write()`.

- **xterm CSS:** `import 'xterm/css/xterm.css'` is in `app/layout.tsx`. Global CSS from node_modules cannot be imported inside a component in Next.js App Router — it must live in a layout or page.

---

## Phase 8 — Bug Fixes + Navigation ✅ Done

Three findings from Phase 7 fixed; back navigation added across all views. `npx tsc --noEmit` passes with zero errors.

### What changed

**`src/components/modules/CodingModule.tsx`**
- Removed `useRouter`, `clearToken` imports — no longer used in this file.
- Removed dead `else if (e.status === 401)` branch from `handleRun` — `useExecution` already handles 401 internally and never re-throws it.
- Added `← Track` back link (left of header row) pointing to `ROUTES.TRACK_DETAIL(module.track_id)`. Header restructured from `justify-between` to `gap-4` flex to accommodate three elements. `ROUTES` import is still present (used by the back link).

**`src/app/(platform)/tracks/page.tsx`**
- `TracksGrid` now has a `fetchError: boolean` state alongside `tracks`.
- `.catch()` sets `fetchError(true)` instead of silently falling through to the empty state.
- Render order: skeleton → error message (`text-destructive`) → empty state → grid.

**`src/app/(platform)/tracks/[trackId]/page.tsx`**
- Added `Link` import.
- "← All Tracks" link above `<h1>`, pointing to `ROUTES.TRACKS`.

**`src/components/modules/ModuleSidebar.tsx`**
- Added `trackId: string` to `ModuleSidebarProps`.
- "← Back to Track" link at the top of the sidebar, pointing to `ROUTES.TRACK_DETAIL(trackId)`.
- `ConceptModule` passes `trackId={module.track_id}` — that is the only caller.

**`src/components/modules/SimulatorModule.tsx`**
- Added `Link` + `ROUTES` imports.
- "← Track" link added to the left of the header row; title given `flex-1` so the connection status stays right-aligned.

---

## ✅ Phase 9 — DB Setup via Supabase MCP — DONE

**Supabase project:** "InterviewAI" — project ID `cshfpyqzdqyclcdwwbnr`.

### What was done

- Old incompatible schema dropped (had `profiles`, wrong column names, wrong `tier_type` values).
- `backend/migrations/001_initial_schema.sql` applied — created `users`, `tracks`, `modules`, `active_simulation_sessions`, `user_progress` with all indexes and constraints.
- `backend/migrations/002_simulation_session_unique.sql` applied — added `UNIQUE (user_id, module_id)` on `active_simulation_sessions`.
- `handle_new_user()` trigger function updated — now inserts into `public.users (id, email, subscription_status)` on every Supabase Auth signup, so the backend's `users` table stays in sync automatically.
- Seed data inserted: 1 track ("RAG Systems", id `00000000-0000-0000-0000-000000000001`), 3 modules (CONCEPT stage 0, SIMULATOR stage 1, CODING stage 2 with two starter files).
- **Playwright suite** also built during this phase — 12 frontend-only tests in `e2e/auth.spec.ts`, all passing. Run with `npm test` from `frontend/`.

### Database state (as of Phase 9)

| Table | Rows |
|-------|------|
| `users` | 0 — populated automatically on first Supabase Auth signup |
| `tracks` | 1 |
| `modules` | 3 |
| `active_simulation_sessions` | 0 |
| `user_progress` | 0 |

> RLS is **disabled** on all tables. The backend uses the service role key (bypasses RLS) — this is safe. Do not enable RLS without adding policies first, or all backend queries will break.

---

## Phase 10 — User Testing ← start here

**Goal:** Smoke-test every user-facing flow with both servers running against the live Supabase + Redis backend.

### Pre-conditions checklist

Before starting the test checklist, confirm these are true:

- [ ] `backend/.env` exists and is filled in (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `REDIS_URL`, `STRIPE_SECRET_KEY`)
- [ ] Redis is running: `cd backend && docker compose up -d`
- [ ] Backend is running: `cd backend && npm run dev` → "Server listening on port 3001"
- [ ] Frontend is running: `cd frontend && npm run dev` → "Ready on http://localhost:3000"

If `backend/.env` is missing, the expected shape is:
```
PORT=3001
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=https://cshfpyqzdqyclcdwwbnr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.cshfpyqzdqyclcdwwbnr:PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_placeholder
```

### Manual smoke-test checklist

Work through these in order. All should pass with no `console.error` output.

#### Auth
- [ ] Fresh signup → `/login?registered=1` → green "Account created" banner
- [ ] Duplicate signup → red error message
- [ ] Wrong password login → red error message
- [ ] Correct login → `interviewai_token` in DevTools → Application → Local Storage → `/tracks`

#### Auth guard
- [ ] Delete token in DevTools → visit `/tracks` → redirects to `/login`
- [ ] Set token to `garbage` in DevTools → visit `/tracks` → `/me` 401 → token cleared → `/login`

#### Tracks list
- [ ] "RAG Systems" card shows name + description clipped at 2 lines
- [ ] Clicking the card → `/tracks/00000000-0000-0000-0000-000000000001`
- [ ] "← All Tracks" back link visible and works

#### Track detail
- [ ] Three modules in stage order: CONCEPT (0), SIMULATOR (1), CODING (2)
- [ ] CODING shows lock icon (FREE user, stage 2 > 1)
- [ ] "← All Tracks" back link above heading works

#### CONCEPT module
- [ ] Markdown renders with `prose` styling (headings, body text, numbered list)
- [ ] Left sidebar lists all 3 modules with check/number/lock indicators
- [ ] "← Back to Track" link in sidebar works
- [ ] "Mark Complete" → green "Marked as complete" state (optimistic, no API call)

#### SIMULATOR module
- [ ] DevTools Network → WS: connection to `ws://localhost:3001/api/v1/simulator/stream?...`
- [ ] Header shows green "Connected" dot
- [ ] Initial STATE_SYNC populates all four metric cards with non-zero values
- [ ] Release Chunk Size slider → `MUTATE_CONFIG` frame sent → `STATE_SYNC` received → metric cards update with smooth transition
- [ ] Toggle Cache off → Latency ↑ ~35%
- [ ] Switch Vector Index to `Flat` → Latency ~2×
- [ ] Dragging slider without releasing → metric cards do NOT update mid-drag
- [ ] Slider thumb does NOT jump when STATE_SYNC arrives
- [ ] "← Track" link in header works

#### CODING module — temporarily unlock for testing

Run this in the Supabase MCP or SQL editor to set `stage_index = 0` (bypass paywall):
```sql
UPDATE modules SET stage_index = 0
WHERE track_id = '00000000-0000-0000-0000-000000000001' AND tier_type = 'CODING';
```
Navigate to the module URL, then:
- [ ] Monaco renders with `vs-dark` theme; `main.py` and `utils.py` tabs visible
- [ ] Type in `main.py`, switch to `utils.py`, switch back → `main.py` content preserved
- [ ] Click Run → "Building…" → ANSI-colored terminal output → button returns to "Run"
- [ ] "← Track" link in header works

Restore `stage_index = 2` after testing:
```sql
UPDATE modules SET stage_index = 2
WHERE track_id = '00000000-0000-0000-0000-000000000001' AND tier_type = 'CODING';
```

#### Paywall (CODING at stage 2, FREE user)
- [ ] Navigate directly to the CODING module URL → `POST /submissions/run` → 402 → PaywallModal appears
- [ ] Modal shows "Pro Required" heading and a disabled "Coming Soon" button
- [ ] Closing the modal → editor visible, no crash

### Pass criteria

All checkboxes checked. No `console.error` output. No unhandled promise rejections. Console warnings are acceptable.

---

## Environment

```bash
# frontend/.env.local (must exist before npm run dev)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Commands (run from `frontend/`):

```bash
npm run dev        # dev server on :3000
npm run build      # production build
npx tsc --noEmit   # type check — must pass with zero errors
npm test           # Playwright suite (starts dev server automatically if not running)
npm run test:ui    # Playwright interactive UI
```
