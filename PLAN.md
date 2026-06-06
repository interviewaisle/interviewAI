# InterviewAI Frontend Implementation Plan

## Context

The backend is complete through Phase 2 (auth, tracks API, submissions stub, simulator WebSocket). Frontend Phases 0–2 are done (scaffold, auth pages, auth guard, tracks list). **The next agent should start at Phase 3.**

See `FRONTEND_BRIEF.md` for all API contracts, WebSocket message formats, type definitions, and UI specs. Everything in that file is contractual — do not deviate.

### Before running the frontend

`frontend/.env.local` does **not** exist yet. Create it before starting `npm run dev`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Before running the backend

```bash
# 1. Copy and fill in credentials
cp backend/.env.example backend/.env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL

# 2. Start Redis
cd backend && docker compose up -d

# 3. Run migrations in Supabase SQL Editor (in order):
#    migrations/001_initial_schema.sql
#    migrations/002_simulation_session_unique.sql

# 4. Start backend (from backend/)
npm run dev
```

End-to-end testing requires both servers running and seed data inserted (see Phase 7).

---

## ✅ Preliminary: Backend Fixes — DONE

`backend/src/routes/tracks.ts` has been patched. The `GET /:trackId/modules` SQL now returns `track_id` and `content_payload`:

```sql
SELECT id, track_id, stage_index, tier_type, company_tags, content_payload, created_at
FROM modules WHERE track_id = ${trackId} ORDER BY stage_index ASC
```

---

## ✅ Scaffold — DONE

`frontend/` exists with all dependencies installed. **Do not re-run create-next-app.**

Installed packages: `next@16`, `react@19`, `zustand`, `@monaco-editor/react`, `xterm`, `xterm-addon-fit`, `xterm-addon-attach`, `react-markdown`, `@tailwindcss/typography`

**Critical: The installed stack is Next.js 16 + Tailwind v4 — NOT the v3 stack the scaffold section originally described.**

Tailwind v4 differences that affect all subsequent phases:
- **No `tailwind.config.ts`** — Tailwind v4 is configured entirely in CSS. Do not create one.
- Color tokens are registered in `src/styles/globals.css` via `@theme inline`. They reference CSS variables set at runtime by the root layout.
- Dark mode uses `@custom-variant dark (&:where(.dark, .dark *))` in `globals.css`.
- The `@tailwindcss/typography` plugin is loaded via `@plugin "@tailwindcss/typography"` in `globals.css` (not in a JS config file).
- Semantic Tailwind classes (`bg-primary`, `text-muted`, `bg-surface`, etc.) are already wired — use them freely in all components.

`frontend/.env.local` **has not been created yet** — see the "Before running the frontend" section above.

---

## ✅ Phase 0 — Foundation — DONE

All files created. `npx tsc --noEmit` passes with zero errors.

### What exists in `frontend/src/`

**`styles/`**
- `colors.ts` — exports `buildCssVars()` which generates `:root { --primary: ...; ... }` and `.dark { ... }` CSS injected by the root layout via `<style dangerouslySetInnerHTML>`. This is the single source of truth for the color palette. To change colors, update only this file.
- `globals.css` — `@import "tailwindcss"`, `@plugin "@tailwindcss/typography"`, `@custom-variant dark`, `@theme inline` block that maps `--color-primary → var(--primary)` etc.

**`constants/`**
- `routes.ts` — `ROUTES.LOGIN`, `ROUTES.SIGNUP`, `ROUTES.TRACKS`, `ROUTES.TRACK_DETAIL(trackId)`, `ROUTES.MODULE_DETAIL(trackId, moduleId)`
- `storage.ts` — `STORAGE_KEYS.AUTH_TOKEN = 'interviewai_token'`
- `api.ts` — `WS_ACTIONS.MUTATE_CONFIG`, `WS_FRAME_TYPES.{STATE_SYNC,STDOUT,STDERR,EXIT}`, `API_PATHS.*`
- `index.ts` — barrel re-export of all three

**`types/index.ts`** — `User`, `Track`, `Module`, `TrackProgress`, `SimulationMetrics`, `SubmissionFile`, `SubmissionBody`, `ExecutionStatus`, `ExitStatus`, `WsFrame` — exact shapes from `FRONTEND_BRIEF.md §4`. Import all types from here; never redefine inline.

**`lib/`**
- `auth.ts` — `getToken()`, `setToken(t)`, `clearToken()` using `STORAGE_KEYS.AUTH_TOKEN`. `getToken` is SSR-safe (`typeof window !== 'undefined'` guard, returns `string | null`).
- `api.ts` — `apiFetch<T>` wrapper + `api` object with `api.auth.{signup,login,me}`, `api.tracks.{list,modules,progress}`, `api.submissions.run`. Exact contract from `FRONTEND_BRIEF.md §8`.
- `mockRunner.ts` — `simulateMockExecution(term: Terminal, onExit: (status: ExitStatus) => void)` — use this for CODING module until Phase 3 live runner is built.

**`store/workspace.ts`** — `useWorkspace` Zustand store. Shape is contractual; do not change it. Fields: `activeFileId`, `files`, `status`, `simulationMetrics`, `layout`. Setters: `setActiveFile`, `upsertFile`, `setStatus`, `setSimulationMetrics`, `setLayout`.

**`app/layout.tsx`** — Root layout. Sets `className="dark"` on `<html>`, injects CSS variables from `buildCssVars()`, imports `@/styles/globals.css`. Body uses `bg-surface text-foreground`.

**`app/page.tsx`** — Redirects to `/login` (Server Component, `redirect()` from `next/navigation`).

### Conventions to follow in all phases

- All imports use `@/` alias — never relative paths climbing more than one level.
- All color values via Tailwind semantic classes (`bg-primary`, `text-muted`, `bg-surface-raised`, etc.) — never hardcoded hex, never `bg-[#...]`.
- No inline `style={{}}` — only `style={{ '--var': value }}` for CSS-variable-backed dynamic values.
- One component per file, ≤ 150 lines. Stateful logic in `src/hooks/`.
- No `any`. `JSON.parse` results cast through `WsFrame` union.
- Each `components/` subdirectory needs an `index.ts` barrel when it has more than one public export.

---

## ✅ Phase 1 — Auth Pages — DONE

**Goal:** User can sign up and log in. Token stored in localStorage. Redirects to `/tracks` on success.

### Files created

- `src/app/(auth)/login/page.tsx` — `LoginContent` (uses `useSearchParams` for `?registered=1` banner) wrapped in `<Suspense>` + `<ErrorBoundary>`. Calls `api.auth.login` → `setToken` → `router.replace(ROUTES.TRACKS)`. Shows API `message` on error.
- `src/app/(auth)/signup/page.tsx` — Calls `api.auth.signup` → `router.replace(ROUTES.LOGIN + '?registered=1')`. Shows API `message` on error.
- `src/components/ui/Button.tsx` — `variant: 'primary' | 'ghost'`, `isLoading: boolean` with inline spinner SVG.
- `src/components/ui/ErrorBoundary.tsx` — Class-based React error boundary used on all page-level components.
- `src/components/ui/index.ts` — Barrel: exports `Button`, `ErrorBoundary`.
- `src/hooks/useLoginForm.ts` — Form state + submit logic for login.
- `src/hooks/useSignupForm.ts` — Form state + submit logic for signup.

`npx tsc --noEmit` passes with zero errors.

---

## ✅ Phase 2 — Auth Guard + Tracks List — DONE

**Goal:** Protected routes redirect unauthenticated users. Authenticated users see track cards.

- [x] `src/app/(platform)/layout.tsx` — Guard: no token → `router.replace(ROUTES.LOGIN)`. Call `api.auth.me()` on mount to verify token not expired → 401 clears token + redirect. Show a full-page spinner during `/me` check.
- [x] `src/app/(platform)/tracks/page.tsx` — `api.tracks.list()` → grid of `TrackCard` components. Show `animate-pulse` skeleton on load.
- [x] `src/components/ui/TrackCard.tsx` — Name, description (`line-clamp-2`), links to `ROUTES.TRACK_DETAIL(track.id)`.
- [x] `src/components/ui/Badge.tsx` — `variant: 'concept' | 'coding' | 'simulator' | 'free' | 'pro'` with distinct colors per variant.

### Files created in Phase 2

- `src/hooks/useAuthGuard.ts` — checks token; if absent redirects immediately; if present calls `/me`; on error clears token + redirects; sets `isVerified = true` on success.
- `src/app/(platform)/layout.tsx` — client component; renders `<FullPageSpinner>` while `isVerified` is false; wraps children in `ErrorBoundary`.
- `src/app/(platform)/tracks/page.tsx` — client component; `null` state shows `TracksSkeleton` (three `animate-pulse` cards); empty array shows "No tracks" message; populated array renders `TrackCard` grid.
- `src/components/ui/TrackCard.tsx` — `<Link>` card: name + `line-clamp-2` description → `ROUTES.TRACK_DETAIL(track.id)`.
- `src/components/ui/Badge.tsx` — pill badge; five variants with semantically distinct colors (concept=accent, coding=primary, simulator=warning, free=success, pro=destructive).
- `src/components/ui/index.ts` — barrel updated to export `Badge` and `TrackCard`.

**Verify:** No token → `/login`. Corrupt token → `/me` 401 → token cleared → `/login`. Valid token + seeded DB → track cards render.

---

## ✅ Phase 3 — Track Detail + Module List — DONE

**Goal:** Clicking a track shows ordered modules with progress indicators and tier badges.

- [x] `src/app/(platform)/tracks/[trackId]/page.tsx` — `Promise.all([api.tracks.modules(trackId), api.tracks.progress(trackId), api.auth.me()])`. Renders a vertical stepper. Note: `api.auth.me()` is included (not in original spec) because `subscription_status` is needed to calculate `isLocked`.
- [x] `src/components/ui/ModuleStepItem.tsx` — Props: `module: Module`, `isCompleted: boolean`, `isCurrent: boolean`, `isLocked: boolean`. Renders tier badge, step dot (checkmark / current ring / lock icon / number), company tags. Wraps in `<Link>` when not locked; plain `<div>` when locked.
- [x] `src/components/ui/index.ts` — barrel updated to export `ModuleStepItem`.

**Entitlement logic applied in the page (not in the component):**
```ts
isLocked    = user.subscription_status === 'FREE' && module.stage_index > 1
isCurrent   = module.stage_index === progress.current_stage
isCompleted = progress.completed_modules.includes(module.id)
```

**Note:** The `modules` table has no `name` column. Display uses tier label + "Stage N".

---

## ✅ Phase 4 — Module Router + CONCEPT Module — DONE

**Goal:** Module detail page routes to the correct component. CONCEPT modules render markdown.

- [x] `src/app/(platform)/tracks/[trackId]/modules/[moduleId]/page.tsx` — Fetch all modules for track, find by `moduleId` client-side (`modules.find(m => m.id === moduleId)`). Call `notFound()` if missing.
- [x] `src/components/modules/ModuleRouter.tsx` — `switch (module.tier_type)` → delegates to correct module component.
- [x] `src/components/modules/ConceptModule.tsx` — Left sidebar listing all modules with progress indicator; right panel renders `module.content_payload.content` via `react-markdown` with `prose prose-invert` class. "Mark Complete" button → optimistic local state (no API call yet).
- [x] `src/components/modules/ModuleSidebar.tsx` — Internal sidebar component (not exported from barrel). Compact module list with check/number indicators and lock state.
- [x] `src/components/modules/CodingModule.tsx` — Stub (renders placeholder text).
- [x] `src/components/modules/SimulatorModule.tsx` — Stub (renders placeholder text).
- [x] `src/hooks/useModuleCompletion.ts` — Thin `useState` wrapper for optimistic Mark Complete state.

**Verify:** CONCEPT renders seeded markdown from `content_payload.content`. "Mark Complete" updates sidebar state. SIMULATOR/CODING stubs don't crash. `tsc --noEmit` passes with zero errors.

---

## ✅ Phase 5 — SIMULATOR Module — DONE

**Goal:** Config controls drive live metric updates via WebSocket.

- [x] `src/hooks/useSimulatorSocket.ts` — Connects to `ws://.../api/v1/simulator/stream?token=<jwt>&moduleId=<uuid>`. On `STATE_SYNC` frame → calls `useWorkspace.setSimulationMetrics(...)` mapping snake_case API fields to camelCase store fields. Returns `mutateConfig(key, value)` that sends `{ action: 'MUTATE_CONFIG', key, value }`. Exact implementation in `FRONTEND_BRIEF.md §9.1`.
- [x] `src/components/modules/SimulatorModule.tsx` — Two-panel layout:
  - **Left (Config):** `chunk_size` slider (128–2048, step 128, fire `mutateConfig` on `onMouseUp`/`onTouchEnd`), `chunk_overlap` slider (0–200, step 10), `embedding_model` dropdown (`text-embedding-3-small` | `text-embedding-3-large` | `text-embedding-ada-002`, fire on change), `vector_index_type` dropdown (`HNSW` | `IVFFlat` | `Flat`, fire on change), `cache_enabled` toggle (fire on click).
  - **Right (Metrics):** Four cards showing `latencyMs`, `tokenSpendUsd`, `errorRate`, `cacheHitRatio` from `useWorkspace`. Add `transition: all 300ms ease` to metric value elements.

Slider rule: local `useState` tracks UI position only. `STATE_SYNC` frames must NOT overwrite slider position — only the metric cards update.

### Files created in Phase 5

- `src/hooks/useSimulatorSocket.ts` — WS hook; maps STATE_SYNC → Zustand; returns `mutateConfig` + `isConnected`.
- `src/components/modules/SimulatorConfigPanel.tsx` — Config controls (internal; not in barrel).
- `src/components/modules/SimulatorMetricsPanel.tsx` — Metric cards with 300ms CSS transition (internal; not in barrel).
- `src/components/modules/SimulatorModule.tsx` — Two-panel layout; header with connection status indicator.

**Verify (with backend running):** WS connection visible in DevTools Network tab. Initial `STATE_SYNC` populates metric cards on mount. Moving a slider and releasing → `MUTATE_CONFIG` sent → `STATE_SYNC` received → metric cards update. Toggling cache off → latency increases ~35%. Switching to Flat index → latency roughly doubles.

---

## ✅ Phase 6 — CODING Module — DONE

**Goal:** Monaco + Xterm. Mock execution. Entitlement gate.

- [x] `src/components/editor/MonacoEditor.tsx` — Loads `@monaco-editor/react` via `next/dynamic({ ssr: false })`. Holds `Map<string, editor.ITextModel>` in a `useRef`. `onMount` creates one model per starter file and sets the active one. `useEffect` on `activeFileId` prop calls `editor.setModel(...)` — never remounts. Debounces keystrokes 300ms → `upsertFile`. Languages derived from extension. Theme `vs-dark`.
- [x] `src/components/editor/Terminal.tsx` — `forwardRef` component; parent (CodingModule) loads it via `next/dynamic({ ssr: false })`. Inits xterm `Terminal` + `FitAddon` in `useEffect`. `ResizeObserver` calls `fitAddon.fit()`. Theme colours read via `getComputedStyle(document.documentElement).getPropertyValue('--surface/--foreground')`. `useImperativeHandle` exposes `{ write, clear }`.
- [x] `src/components/editor/index.ts` — Barrel exporting `MonacoEditor`, `Terminal`, and `TerminalHandle` type.
- [x] `src/hooks/useExecution.ts` — Returns `{ run, status }`. Run flow: `BUILDING` → `api.submissions.run` → `RUNNING` → `simulateMockExecution` → `IDLE/ERROR`. 402 re-throws to caller; 401 clears token + redirects.
- [x] `src/components/modules/CodingFileTabBar.tsx` — Internal tab bar (not in barrel). Tabs over starter files; active tab highlighted.
- [x] `src/components/modules/CodingModule.tsx` — `flex h-screen flex-col` shell. Header with run button. Left column: tab bar + Monaco (flex-1) + terminal (h-48). Right column (w-80): problem description from `content_payload.description`. Seeds Zustand from `content_payload.starter_files` on mount (fires once with empty deps). 402 catch → `PaywallModal`. 401 catch → `clearToken()` + redirect.
- [x] `src/components/ui/Modal.tsx` — Dark `fixed inset-0` overlay, centered card. Escape key + backdrop click close.
- [x] `src/components/ui/PaywallModal.tsx` — Lock SVG + "Pro Required" + API `message` + always-disabled "Coming Soon" Button.
- [x] `src/components/ui/index.ts` — Updated barrel to export `Modal` and `PaywallModal`.
- [x] `src/app/layout.tsx` — Added `import 'xterm/css/xterm.css'` (xterm requires global CSS; cannot be imported inside a component).

### Key implementation details

- **Terminal dynamic import in CodingModule:** Because `Terminal.tsx` imports xterm at module level, it must be loaded by its consumer with `{ ssr: false }`. CodingModule does: `const TerminalDynamic = dynamic(() => import('@/components/editor/Terminal').then(m => m.Terminal), { ssr: false })` with an explicit type cast to `React.ForwardRefExoticComponent<...>` so TypeScript accepts the `ref` prop.
- **File IDs:** Filenames (e.g. `"main.py"`) double as the `activeFileId` key in the Zustand workspace store. `MonacoEditor` uses `file.name` as the model map key.
- **`simulateMockExecution` type cast:** `mockRunner.ts` expects xterm's full `Terminal` type, but `TerminalHandle` only exposes `{ write, clear }`. Cast in `useExecution`: `termRef.current as unknown as XTerm`. Safe at runtime because `simulateMockExecution` only calls `.write()`.
- **No arbitrary color values in Terminal theme:** xterm's `theme` config can't consume CSS variables directly, so Terminal reads them via `getComputedStyle` at mount time.

**Verify:** Monaco renders with `vs-dark` theme. File switch preserves content. Debounced Zustand updates. Mock run → ANSI-colored terminal output. Free user hitting a stage-2 CODING module → 402 → paywall modal appears.

---

## ✅ Phase 7 — End-to-End Testing — DONE (frontend-only scope)

**Goal:** Smoke-test every user-facing flow with both servers running.

### What was verified (automated, Playwright + headless Chrome)

All frontend-only flows pass with zero console errors. Backend-dependent flows were verified by code review and are structurally correct — they require a live Supabase + Redis environment to exercise at runtime.

#### Auth flows — PASSED (automated)
- [x] `/` → 307 → `/login`
- [x] Login page renders Email + Password fields and Sign in button
- [x] Signup link → `/signup` → form renders
- [x] Signup submit with backend down → "Failed to fetch" error in form, no crash, stays on `/signup`
- [x] Auth guard: no localStorage token → `/tracks` redirects to `/login`
- [x] Auth guard: garbage token → `/me` network-fails → token cleared to `null` → redirects to `/login`
- [x] Login submit with backend down → stays on `/login`, no crash
- [x] `/login?registered=1` → "Account created — please sign in." green banner visible
- [x] Empty submit / invalid email → browser validation fires, no crash
- [x] No console errors on login or signup page load

#### Backend-dependent flows — VERIFIED BY CODE REVIEW (require live backend)
- [x] `useSimulatorSocket`: `http→ws` / `https→wss` replacement correct; STATE_SYNC maps snake_case → camelCase; slider `useState` is fully isolated from `setSimulationMetrics`
- [x] `SimulatorMetricsPanel`: `style={{ transition: 'all 300ms ease' }}` on value elements
- [x] `MonacoEditor`: models in `useRef<Map>`, `useEffect` on `activeFileId` calls `setModel()` — no remount on file switch
- [x] `xterm/css/xterm.css` imported in `app/layout.tsx` (global, not in component)
- [x] `useExecution`: 402 re-thrown to caller; 401 clears token + redirects; `simulateMockExecution` receives correct type cast
- [x] `PaywallModal` wired from `CodingModule.handleRun` 402 catch; "Coming Soon" button is `disabled`
- [x] `useAuthGuard`: network errors (`status === undefined`) → redirect + token cleared

### Remaining manual checklist (needs live Supabase + Redis — see User Testing Phase below)
- [ ] Signup / login with real credentials
- [ ] Valid token → `/tracks` loads with seeded track cards
- [ ] Track detail: 3 modules in stage order; CODING locked for FREE user
- [ ] CONCEPT: seeded markdown renders with prose styling; "Mark Complete" updates sidebar
- [ ] SIMULATOR: WebSocket visible in DevTools; STATE_SYNC populates metrics; slider/toggle mutations update cards; cache-off latency ↑ ~35%; Flat index latency ~2×
- [ ] CODING: Monaco renders; file tabs switch without remount; Run → ANSI terminal output → IDLE; FREE user on stage-2 → PaywallModal

### Findings from Phase 7 (carried into Phase 8)

1. **Dead code — `CodingModule.handleRun`:** The `else if (e.status === 401)` branch is unreachable. `useExecution.run` already handles 401 internally and never re-throws it. The branch is harmless but misleading.

2. **Silent error swallowing — `TracksPage`:** `api.tracks.list()` errors are caught with `catch(() => setTracks([]))`, which shows "No tracks available yet." on any network failure. A user who has tracks but whose backend is temporarily down will see an empty state with no error signal.

3. **Double `/me` call on track/module pages:** The platform layout guard calls `/me` on every navigation to verify the token. Track detail and module pages also call `/me` inside their own `Promise.all`. This results in two `/me` requests per page load. Not a bug, but worth noting for Phase 8 if request reduction matters.

---

---

## ✅ Phase 8 — Bug Fixes, UX Polish & Navigation — DONE

**Goal:** Fix the three findings from Phase 7 and add breadcrumb/back navigation so users can move between track and module pages without using the browser back button.

### 8.1 Fix dead code in `CodingModule.handleRun`

**File:** `frontend/src/components/modules/CodingModule.tsx`

The `else if (e.status === 401)` branch in `handleRun` (lines ~73–77) is unreachable — `useExecution.run` handles 401 internally and never re-throws it. Remove the branch entirely. The catch block should only handle 402:

```ts
async function handleRun() {
  // ...
  try {
    await run(currentFiles, module.id, module.stage_index, module.track_id)
  } catch (err) {
    const e = err as { status?: number; data?: { message?: string } }
    if (e.status === 402) {
      setPaywallMessage(e.data?.message ?? 'This module requires a Pro subscription.')
    }
    // 401 is handled inside useExecution — do not duplicate it here
  }
}
```

### 8.2 Fix silent error swallowing in `TracksPage`

**File:** `frontend/src/app/(platform)/tracks/page.tsx`

Currently: `api.tracks.list().then(setTracks).catch(() => setTracks([]))` — any network error shows the empty state silently.

Add a separate error state. On error, show a message that distinguishes "no tracks yet" from "something went wrong":

```ts
const [tracks, setTracks] = useState<Track[] | null>(null)
const [fetchError, setFetchError] = useState(false)

useEffect(() => {
  api.tracks.list()
    .then(setTracks)
    .catch(() => {
      setTracks([])
      setFetchError(true)
    })
}, [])

// In render:
if (fetchError) return <p className="text-sm text-destructive">Failed to load tracks. Please refresh.</p>
```

### 8.3 Add back navigation to Track Detail and Module pages

Users currently have no way to navigate back except the browser button. Add a consistent back link:

**Track Detail page** (`frontend/src/app/(platform)/tracks/[trackId]/page.tsx`):
- Add `<Link href={ROUTES.TRACKS} className="...">← All Tracks</Link>` above the `<h1>`.

**Module page** (`frontend/src/app/(platform)/tracks/[trackId]/modules/[moduleId]/page.tsx`):
- Add a back link to `ROUTES.TRACK_DETAIL(trackId)` in the module header or as a small top bar.
- The CONCEPT and SIMULATOR modules both have an `h-screen` outer container — add a thin `<nav>` bar at the top or incorporate the back link into the existing header row inside each module component.

For CONCEPT: add the back link to the top of the sidebar (`ModuleSidebar.tsx`).
For SIMULATOR: add it to the left side of the existing header row in `SimulatorModule.tsx`.
For CODING: add it to the left of the header row in `CodingModule.tsx` (already has `flex items-center justify-between`).

Use `ROUTES.TRACK_DETAIL(trackId)` — the `trackId` is already available from the `module.track_id` field.

### 8.4 Expand CODING seed data to two starter files

The seed SQL in `FRONTEND_BRIEF.md §13` only includes one starter file in the CODING module's `content_payload`. For the Phase 7 file-switch test (switching between `main.py` and `utils.py`), the seed data needs two files. Run this UPDATE in Supabase SQL Editor after the initial seed:

```sql
UPDATE modules
SET content_payload = '{"description": "Implement a chunking strategy.", "starter_files": [{"name": "main.py", "content": "# Your code here\n"}, {"name": "utils.py", "content": "# Utilities\n"}]}'::jsonb
WHERE track_id = '00000000-0000-0000-0000-000000000001'
  AND tier_type = 'CODING';
```

### Phase 8 files to touch

| File | Change |
|---|---|
| `src/components/modules/CodingModule.tsx` | Remove unreachable 401 branch from `handleRun` |
| `src/app/(platform)/tracks/page.tsx` | Add `fetchError` state, show error message |
| `src/app/(platform)/tracks/[trackId]/page.tsx` | Add "← All Tracks" back link |
| `src/components/modules/ModuleSidebar.tsx` | Add "← Back to Track" link at top |
| `src/components/modules/SimulatorModule.tsx` | Add back link to header row |
| `src/components/modules/CodingModule.tsx` | Add back link to header row |

### Pass criteria

- `npx tsc --noEmit` passes with zero errors after changes
- All Phase 7 automated tests still pass
- Navigating from `/tracks` → track detail → module → back all the way to `/tracks` works via in-app links
- `TracksPage` shows a red error message (not empty state) when the backend is unreachable

---

## ✅ Phase 9 — Database Setup via Supabase MCP — DONE

**Supabase project:** "InterviewAI" — project ID `cshfpyqzdqyclcdwwbnr`, region `ap-northeast-1`.

### What was done

1. **Old schema dropped** — the project had a stale, incompatible schema (`profiles` instead of `users`, `tracks.title` instead of `name`, `modules` missing `company_tags`/`content_payload`). All old tables were empty and dropped cleanly.

2. **Migration 001 applied** (`backend/migrations/001_initial_schema.sql`) — created all 5 tables: `users`, `tracks`, `modules`, `active_simulation_sessions`, `user_progress` with correct columns, indexes, and constraints.

3. **Migration 002 applied** (`backend/migrations/002_simulation_session_unique.sql`) — added `UNIQUE (user_id, module_id)` constraint on `active_simulation_sessions`.

4. **Auth trigger updated** — `handle_new_user()` previously inserted into the now-deleted `profiles` table. It was updated (via `CREATE OR REPLACE FUNCTION`) to insert into `public.users` with `(id, email, subscription_status)` — so every Supabase Auth signup automatically mirrors a row into the backend's `users` table.

5. **Seed data inserted** — 1 track ("RAG Systems") and 3 modules: CONCEPT stage 0 (free), SIMULATOR stage 1 (free), CODING stage 2 (Pro required, two starter files).

### Current database state

| Table | Rows |
|-------|------|
| `users` | 0 (populated on first signup) |
| `tracks` | 1 — "RAG Systems" (`00000000-0000-0000-0000-000000000001`) |
| `modules` | 3 — CONCEPT (0), SIMULATOR (1), CODING (2) |
| `active_simulation_sessions` | 0 |
| `user_progress` | 0 |

> **Note — RLS is disabled** on all 5 tables. The backend uses the service role key (bypasses RLS), so this is safe for the current architecture. If a Supabase client key is ever used directly from the browser, RLS policies must be added first.

---

## Phase 10 — User Testing Phase ← agent starts here

**Goal:** Manually verify every user-facing flow with both servers running.

**Pre-conditions:** Phase 9 complete ✅ — tables seeded, Supabase project `cshfpyqzdqyclcdwwbnr` ready.

### What the next agent must do first

Ask the user to start the local stack if it isn't already running:

```bash
# Terminal 1 — Redis (requires Docker Desktop)
cd backend && docker compose up -d

# Terminal 2 — Backend
cd backend && npm run dev
# Expected: "Server listening on port 3001"

# Terminal 3 — Frontend
cd frontend && npm run dev
# Expected: "Ready on http://localhost:3000"
```

Then work through the manual checklist below with the user, ticking off each item. Report any failures with the exact error (console output, network response, visual glitch).

### Step 1 — Start the frontend

`frontend/.env.local` already exists (`NEXT_PUBLIC_API_URL=http://localhost:3001`).

```bash
cd frontend && npm run dev
```

Visit `http://localhost:3000` — should redirect to `/login`.

### Step 2 — Create a test user

Go to `http://localhost:3000/signup`. Create an account with any email + password (min 8 chars). You should be redirected to `/login?registered=1` with a green "Account created" banner. Log in — you should land on `/tracks` with the "RAG Systems" card visible.

### Manual test checklist

Work through these in order. All should pass with no console errors.

#### Auth
- [ ] Fresh signup → redirects to `/login?registered=1` → green "Account created" banner
- [ ] Duplicate signup → red error message visible
- [ ] Wrong password login → red error message visible
- [ ] Correct login → `interviewai_token` appears in DevTools → Application → Local Storage → redirects to `/tracks`

#### Auth guard
- [ ] Delete `interviewai_token` in DevTools → visit `/tracks` → redirects to `/login`
- [ ] Set `interviewai_token` to `garbage` in DevTools → visit `/tracks` → `/me` 401 → token cleared → redirects to `/login`

#### Tracks list
- [ ] "RAG Systems" card shows name and description (clipped at 2 lines)
- [ ] Clicking the card navigates to `/tracks/00000000-0000-0000-0000-000000000001`

#### Track detail
- [ ] Three modules listed in stage order: CONCEPT (0), SIMULATOR (1), CODING (2)
- [ ] CONCEPT and SIMULATOR are clickable links
- [ ] CODING shows a lock icon / locked state (FREE tier user)
- [ ] (Phase 8) "← All Tracks" back link works

#### CONCEPT module
- [ ] Markdown renders in the right panel with `prose` typography styling (headings, body text, numbered list)
- [ ] Left sidebar lists all 3 modules with check/number/lock indicators
- [ ] "Mark Complete" button changes to a green "Marked as complete" state (optimistic — no API call)
- [ ] (Phase 8) "← Back to Track" link in sidebar works

#### SIMULATOR module
- [ ] Open DevTools → Network → WS tab. A WebSocket connection to `ws://localhost:3001/api/v1/simulator/stream?...` appears
- [ ] The status indicator in the header reads "Connected" (green dot)
- [ ] On connect, the four metric cards show non-zero values (initial STATE_SYNC)
- [ ] Move the **Chunk Size** slider and release → in the WS tab, a `MUTATE_CONFIG` frame appears in the Messages panel → a `STATE_SYNC` frame follows → metric values update with a smooth transition
- [ ] Toggle **Cache Enabled** off → Latency increases by ~35%
- [ ] Switch **Vector Index** to `Flat` → Latency roughly doubles
- [ ] Drag the slider without releasing → metric cards do NOT update mid-drag (update only on mouseUp)
- [ ] Slider thumb does NOT jump when STATE_SYNC arrives

#### CODING module (navigate directly via URL as a Pro workaround for testing)
To test CODING without a Pro subscription, temporarily update the module to `stage_index = 0` in Supabase SQL Editor:

```sql
UPDATE modules SET stage_index = 0
WHERE track_id = '00000000-0000-0000-0000-000000000001' AND tier_type = 'CODING';
```

Navigate to the module. After testing, reset it back:

```sql
UPDATE modules SET stage_index = 2
WHERE track_id = '00000000-0000-0000-0000-000000000001' AND tier_type = 'CODING';
```

- [ ] Monaco editor renders with `vs-dark` theme
- [ ] Two file tabs visible: `main.py` and `utils.py`
- [ ] Type in `main.py`, switch to `utils.py`, switch back → `main.py` content preserved
- [ ] Click **Run** → button shows "Building…" → terminal shows ANSI-colored output (yellow "Spinning up sandbox…", green "Running main.py", "✓ All tests passed") → button returns to "Run"

#### Paywall (CODING at stage 2, FREE user)
- [ ] With `stage_index` restored to 2: navigate to the CODING module URL directly → `POST /submissions/run` returns 402 (entitlement middleware) → PaywallModal appears
- [ ] Modal shows "Pro Required" heading and a disabled "Coming Soon" button
- [ ] Closing the modal returns to the editor without crash

### Pass criteria

All checkboxes above checked. No unhandled promise rejections or `application error` screens. Console warnings are acceptable; console errors are not.

---

## Cross-cutting (apply throughout all phases)

- Wrap every page-level component in a React `ErrorBoundary`.
- `animate-pulse` skeleton loaders on every page-level fetch.
- `notFound()` for missing tracks/modules.
- No `any` anywhere — all props fully typed.
- `'use client'` only when needed; prefer Server Components for data-fetch-only pages.

---

## Phase Dependency Graph

```
✅ Phase 0 (Foundation)
  └── ✅ Phase 1 (Auth Pages)
        └── ✅ Phase 2 (Auth Guard + Tracks List)
              └── ✅ Phase 3 (Track Detail)
                    └── ✅ Phase 4 (Module Router + CONCEPT)
                          ├── ✅ Phase 5 (SIMULATOR)
                          └── ✅ Phase 6 (CODING)
                                └── ✅ Phase 7 (E2E Testing — frontend-only; Playwright suite)
                                      └── ✅ Phase 8 (Bug Fixes + Navigation)
                                            └── ✅ Phase 9 (DB Setup via Supabase MCP)
                                                  └── Phase 10 (User Testing — manual, needs live stack) ← agent starts here
```
