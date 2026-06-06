# Handoff: InterviewAI — Auth, Tracks & Track Detail

## Overview

This handoff covers three connected screens for **InterviewAI**, a platform that helps candidates prepare for technical interviews:

1. **Auth Nexus** — Sign In / Create Account page (toggles between two modes)
2. **Tracks** — Learning Tracks dashboard showing all available preparation paths
3. **Track Detail** — Per-track view with module timeline and progress

The aesthetic is a "neural lattice / quantum mesh" feel: a faintly animated background of connected nodes, brushed-platinum CTA buttons, icy-cyan → violet gradient accents, and a clean dual-mode (light / dark) theme.

---

## About the Design Files

The files in this bundle (`Auth Nexus.html`, `Tracks.html`, `Track Detail.html`) are **design references created in HTML** — interactive prototypes that demonstrate the intended look, behavior, and motion. **They are NOT production code to copy directly.**

Your task is to **recreate these designs in the target codebase's existing environment** (React, Vue, SwiftUI, native, etc.) using its established patterns, component library, and design tokens. If no environment exists yet, choose the most appropriate framework for the project and implement the designs there.

Use the HTML as a precise visual + behavioral reference — match colors, typography, spacing, animations, and interactions exactly — but write idiomatic code for your stack.

---

## Fidelity

**High-fidelity (hifi).** These are pixel-precise mockups with finalized colors, typography, spacing, motion, and copy. Recreate the UI faithfully using the codebase's existing libraries and patterns. Where the codebase has its own design system, prefer existing tokens that match these values; where it doesn't, add the tokens listed in the **Design Tokens** section.

---

## Design System

### Color Tokens

#### Light Mode

| Token              | Value                                            | Usage                                            |
| ------------------ | ------------------------------------------------ | ------------------------------------------------ |
| `bg-base`          | `#F7F9FC`                                        | Page background (studio white)                   |
| `bg-glow-1`        | `rgba(160,180,220,0.18)` (radial top-right)      | Subtle ambient glow                              |
| `bg-glow-2`        | `rgba(140,170,210,0.14)` (radial bottom-left)    | Subtle ambient glow                              |
| `text-primary`     | `#0F172A`                                        | Headings, primary text (deep charcoal)           |
| `text-muted`       | `#475569`                                        | Body text, descriptions (slate)                  |
| `text-subtle`      | `#64748B`                                        | Captions, meta, mono labels                      |
| `card-bg`          | `linear-gradient(135deg, rgba(255,255,255,0.92), rgba(245,248,253,0.84))` | Glass-card fill |
| `card-border`      | `rgba(200,214,232,0.78)`                         | Glass-card border                                |
| `input-bg`         | `linear-gradient(135deg, rgba(255,255,255,0.94), rgba(245,248,253,0.86))` | Form input fill |
| `input-border`     | `rgba(203,213,228,0.9)`                          | Form input border                                |
| `lattice-edge`     | `rgba(110,148,190, a)` where `a = 0.18 * (1 − t²)` | Canvas mesh edges (steel-blue, distance-faded)  |
| `lattice-node`     | `rgba(110,148,190, 0.30 + g*0.14)`               | Canvas mesh nodes                                |
| `divider`          | `rgba(200,214,232,0.6)`                          | Hairlines                                        |

#### Dark Mode

| Token              | Value                                            | Usage                                            |
| ------------------ | ------------------------------------------------ | ------------------------------------------------ |
| `bg-base`          | `#060B14`                                        | Page background (obsidian midnight)              |
| `bg-glow-1`        | `rgba(130,90,200,0.16)` (radial top-right)       | Violet ambient glow                              |
| `bg-glow-2`        | `rgba(40,160,220,0.12)` (radial bottom-left)     | Cyan ambient glow                                |
| `text-primary`     | `#F1F5F9`                                        | Headings (platinum white)                        |
| `text-muted`       | `#CBD5E1`                                        | Body text (silver)                               |
| `text-subtle`      | `#94A3B8`                                        | Captions, meta, mono labels                      |
| `card-bg`          | `linear-gradient(135deg, rgba(18,28,48,0.82), rgba(20,42,68,0.74))` | Glass-card fill (smoky teal) |
| `card-border`      | `rgba(80,120,170,0.38)`                          | Glass-card border                                |
| `input-bg`         | `linear-gradient(135deg, rgba(20,30,50,0.85), rgba(18,46,72,0.72))` | Smoky graphite → teal-blue fill |
| `input-border`     | `rgba(80,120,170,0.45)`                          | Form input border                                |
| `lattice-edge-cyan`| `rgba(125,200,235, a)` where `a = 0.36 * (1 − t²)` | Canvas edges — electric cyan (2/3 of edges) |
| `lattice-edge-violet`| `rgba(170,150,235, a)` (same `a`)              | Canvas edges — soft violet-blue (1/3 of edges)   |
| `lattice-node-cyan`| `rgba(155,210,240, 0.52 + g*0.28)`               | Canvas nodes — cyan (3/4)                        |
| `lattice-node-violet`| `rgba(190,170,240, 0.55 + g*0.28)`             | Canvas nodes — violet (1/4)                      |

#### Shared / Accent

| Token              | Value                                            | Usage                                            |
| ------------------ | ------------------------------------------------ | ------------------------------------------------ |
| `accent-gradient`  | `linear-gradient(135deg, #5DC9DF 0%, #8FA8E0 55%, #A78BFA 100%)` | Logo, gradient text, progress fills, avatar, focus borders |
| `cta-platinum-light`| `linear-gradient(180deg, #DCE6F2 0%, #B0C2DD 32%, #7B95BC 70%, #54719C 100%)` | Primary CTA button (light mode) |
| `cta-platinum-dark`| `linear-gradient(180deg, #C8D5EC 0%, #8FA6CB 32%, #5C7BA8 70%, #3E5887 100%)` | Primary CTA button (dark mode) |
| `cta-text-shadow`  | `0 1px 0 rgba(40,60,90,0.18)`                    | CTA text shadow (metal etch effect)              |
| `cta-inset-highlight`| `inset 0 1px 0 rgba(255,255,255,0.55)`         | Top highlight on CTA (brushed-metal sheen)       |
| `error`            | `#B91C1C` (light) / `#FCA5A5` (dark)             | Validation error text                            |
| `pw-weak`          | `#F87171`                                        | Password strength: weak                          |
| `pw-fair`          | `#FBBF24`                                        | Password strength: fair                          |
| `pw-strong`        | `#7DD3F0`                                        | Password strength: strong (cyan)                 |
| `pw-excellent`     | `#A78BFA`                                        | Password strength: excellent (violet)            |

### Typography

| Role               | Font Family                            | Size                              | Weight | Letter Spacing | Line Height |
| ------------------ | -------------------------------------- | --------------------------------- | ------ | -------------- | ----------- |
| Display heading    | Plus Jakarta Sans                      | `clamp(36px, 5vw, 50px)`          | 800    | `-0.025em`     | 1.05        |
| Page heading       | Plus Jakarta Sans                      | `clamp(26px, 3.5vw, 40px)`        | 800    | `-0.025em`     | 1.10        |
| Section heading    | Plus Jakarta Sans                      | `clamp(22px, 3vw, 30px)`          | 800    | `-0.025em`     | 1.10        |
| Card title         | Plus Jakarta Sans                      | 16.5px (card) / 15.5px (module)   | 700    | `-0.015em`     | 1.20–1.25   |
| Body               | Plus Jakarta Sans                      | 14–15px                           | 400    | normal         | 1.6         |
| Form label         | Plus Jakarta Sans                      | 11px, ALL CAPS                    | 600    | `0.10em`       | 1.0         |
| Mono meta          | JetBrains Mono                         | 10–12px                           | 400–500| `0.04–0.10em`  | 1.0         |
| Button             | Plus Jakarta Sans                      | 13–15px                           | 700    | normal         | 1.0         |

Both fonts loaded from Google Fonts:
```
https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,700&family=JetBrains+Mono:wght@400;500&display=swap
```

### Spacing & Radius

| Token              | Value         | Usage                                            |
| ------------------ | ------------- | ------------------------------------------------ |
| `radius-input`     | 12px          | Inputs, primary CTA                              |
| `radius-card`      | 18px          | Glass cards, track cards                         |
| `radius-module`    | 14px          | Module cards                                     |
| `radius-icon-tile` | 11–13px       | Icon backgrounds                                 |
| `radius-button-sm` | 9px           | Small CTAs                                       |
| `radius-pill`      | 99px          | Progress tracks                                  |
| `radius-chip`      | 4px           | Tag chips, badges                                |
| Input height       | 52px          | Form inputs and primary CTA                      |
| Card padding       | 26–30px       | Glass cards                                      |
| Module card pad    | 18px × 20px   | Module cards                                     |
| Card grid gap      | 18px          | Track grid                                       |

### Shadows

| Token              | Value                                                                   | Usage                  |
| ------------------ | ----------------------------------------------------------------------- | ---------------------- |
| `shadow-card-hover`| Light: `0 20px 44px -8px rgba(120,140,200,0.18)`<br>Dark: `0 20px 44px -8px rgba(120,140,220,0.28)` | Track card hover lift  |
| `shadow-cta-rest`  | `inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(40,60,90,0.18), 0 6px 18px -4px rgba(80,110,160,0.30)` | Primary CTA rest state |
| `shadow-cta-hover` | …same + outer `0 14px 36px -6px rgba(80,110,160,0.55)`                  | Primary CTA hover      |
| `shadow-focus-ring`| `0 0 0 3px rgba(140,160,220,0.14)` (light) / `0.20` (dark)              | Input focus            |

### Motion

| Token              | Value                                          |
| ------------------ | ---------------------------------------------- |
| `dur-fast`         | 150ms                                          |
| `dur-default`      | 180–220ms                                      |
| `dur-slow`         | 300–380ms (heading swap, field collapse)       |
| `easing-default`   | `ease`                                         |
| `entrance`         | `fade-in-up` — opacity 0→1, translateY 10→0px  |

---

## Screens

### 1. Auth Nexus (`Auth Nexus.html`)

#### Purpose
Single page that toggles between **Sign In** and **Create Account** modes. Validates email + password, simulates a 3-step submission, and shows OAuth (Google, GitHub) and theme-toggle affordances.

#### Layout
- Full-viewport flex column, content centered horizontally and vertically.
- Animated `<canvas>` background (`NeuralCanvas`) fixed to viewport, behind content (`z-index: 0`).
- Header (fixed top, transparent, no border): logo (left) + theme toggle (right), padding `20px 32px`.
- Main form container: `max-width: 420px`, padding `100px 24px 60px`.

#### Heading
- Two-line display heading. **Sign In mode:** "Sign in to" / "InterviewAI" (second line = `.grad-text`). **Create Account mode:** "Create your" / "account" (second line = `.grad-text`).
- Subtitle below heading, 14.5px muted color.
- On mode switch, the heading re-animates with `fade-in-up` (`key` changes).

#### Form Fields
Vertical stack, `gap: 18px`. Each field has:
- Uppercase mini-label (11px, `0.10em`).
- A 36px left gutter, inside which sits a 14px horizontal "node-line" and a 7×7 "node-dot" — visually wiring the field into the lattice background (dark: cyan glow `0 0 7px rgba(125,211,240,0.85)`; light: muted blue).
- 52px-tall input with the smoky/gradient backgrounds described above.
- On focus, the border becomes a 1.5px cyan→violet gradient (via double-background-clip trick) and a 3px outer ring appears.
- Validation error renders as a 11.5px red text with a small dot, below the input.

**Sign In mode:** Email + Password only, plus "Keep me signed in" checkbox (accent: `#7B95BC`) and "Forgot password?" gradient-text link.
**Create Account mode:** Full Name + Email + Password + Confirm Password. Full Name and Confirm collapse in/out via `display:grid; grid-template-rows: 0fr → 1fr` + opacity transition (300ms ease).

#### Password Field
- Right-side eye toggle (16px icon), hover color → `#7B95BC` light, `#7DD3F0` dark.
- In Create Account mode, password ≥ 1 char shows a 4-segment strength meter directly below (filled = `pw-weak/fair/strong/excellent`; unfilled = `#E2E8F0` light, `#1A2640` dark).
- Strength label (11.5px mono, color matches active segment): `Weak / Fair / Strong / Excellent`.

#### Primary CTA (`.btn-cta`)
- Full-width, 52px tall.
- Brushed-platinum gradient (top highlight → mid icy blue → deeper slate at bottom). Different stops for light vs dark — see tokens above.
- 1px white-translucent top border, inset white highlight, inset dark hairline at bottom, soft text shadow → reads as **brushed metal**.
- Hover: `translateY(-1.5px)` + boosted outer shadow + a diagonal sheen overlay (white 30%→transparent) fades in via `::after`.
- Active: `translateY(0) scale(0.985)`.
- States:
  - Rest: text + right-arrow icon
  - Loading: spinner + step text rotating through "Verifying credentials… / Connecting to AI Core… / Launching session…" (850ms each).
  - Success: white check + "Signed in!" / "Account created!" for 1600ms, then resets.

#### Divider + OAuth
- Mono divider: `── OR ──`, 11px JetBrains Mono, `0.14em` letter-spacing.
- Two text-only OAuth rows (Google + GitHub), 14px medium weight, 6px vertical padding. Hover darkens text color slightly.

#### Mode Switch + Terms
- Below OAuth: `New here? Create an account` (or `Already have an account? Sign in`) — button styled as `.grad-text`, bold.
- Terms footer: 11px JetBrains Mono, underlined Terms / Privacy Policy links.

#### Theme Toggle
- 38×38 circle, glassy (white 75% / midnight 72%), sun/moon icon. Hover → scale 1.08.
- Persists choice to `localStorage` under key `iai-theme` (`'dark' | 'light'`).
- Initializes from `localStorage` or `prefers-color-scheme`.

#### Validation Rules
- **Email:** non-empty + regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`
- **Password:** non-empty + ≥ 8 chars. Strength: +1 for length ≥ 12, +1 for upper+lower mix, +1 for digit+symbol mix.
- **Confirm (signup only):** non-empty + must equal password.
- Errors show on field blur or on submit; not on first keystroke.

---

### 2. Tracks (`Tracks.html`)

#### Purpose
Browse-and-resume dashboard listing 6 Learning Tracks. Authenticated users see progress; locked (Pro) tracks are dimmed.

#### Layout
- Same `NeuralCanvas` background.
- **Fixed header** (this page, unlike Auth, has a glass border): logo + (user avatar, theme toggle), bg `rgba(247,249,252,0.82)` / `rgba(6,11,20,0.78)` with `backdrop-filter: blur(16px)` and 1px bottom border.
- Main: `max-width: 1100px`, padding `106px 28px 80px`.

#### Page Heading Block (top of main)
- "Learning **Tracks**" — h1 with `Tracks` wrapped in `.grad-text`. Sizing: `clamp(26px, 3.5vw, 40px)`.
- Subtitle 15px muted: "Structured preparation paths curated by domain experts."
- Mono meta row, 22px gap: `6 TRACKS · 3 IN PROGRESS · SELF-PACED` (each as a separate mono span, uppercase, `0.09em` tracking).

#### Track Grid
- CSS Grid: `repeat(auto-fill, minmax(308px, 1fr))`, gap 18px.
- 6 cards. Cards animate in with `fade-in-up`, staggered by 55ms × index.

#### TrackCard
Glass card (see tokens), 26px padding, flex column with 14px gap. Children:
1. **Icon row** (justify-between):
   - 42×42 rounded icon tile. Icons alternate between **icy-cyan** (`#4FA8C2` on `rgba(125,200,235,0.13)` bg) and **violet-silver** (`#7B7BB8` on `rgba(170,150,235,0.13)` bg) based on index parity.
   - Right side: if locked → `.locked-badge` ("🔒 PRO" mono pill). Else if progress > 0 → "%" mono text.
2. **Title** (16.5px / 700 / `-0.015em`).
3. **Tags row** — flex wrap, 5px gap, multiple `.tag-chip` (10px mono, uppercase, `rgba(140,160,200,0.16)` bg).
4. **Progress bar** (only if not locked) — 3px tall, `rgba(200,214,232,0.85)` track, accent-gradient fill set by `width: ${progress}%`.
5. **Footer row** (justify-between):
   - Left: "{modules} modules · {hours}h" mono meta.
   - Right: if locked → "Upgrade to unlock" 12px medium; else → `.btn-cta-sm` brushed-platinum pill button ("Start" or "Continue" + arrow icon).

Hover (not locked): `translateY(-3px)` + soft shadow + border tints to accent.
Locked cards: `opacity: 0.58`, no hover, click prevented.

#### Track Data
```js
[
  { id: 'system-design', title: 'System Design',                   icon: 'server',    modules: 8,  hours: 4.5, progress: 45, tags: ['Architecture','Scalability','CAP'], href: 'Track Detail.html' },
  { id: 'dsa',           title: 'Data Structures & Algorithms',     icon: 'code',      modules: 12, hours: 6,   progress: 20, tags: ['Arrays','Graphs','DP'],             href: 'Track Detail.html' },
  { id: 'behavioral',    title: 'Behavioral Interviews',            icon: 'users',     modules: 6,  hours: 3,   progress: 0,  tags: ['STAR Method','Leadership'],         href: 'Track Detail.html' },
  { id: 'frontend',      title: 'Frontend Engineering',             icon: 'gitbranch', modules: 10, hours: 5,   progress: 0,  tags: ['React','TypeScript','A11y'],        locked: true },
  { id: 'backend',       title: 'Backend Engineering',              icon: 'database',  modules: 9,  hours: 5,   progress: 0,  tags: ['Node.js','PostgreSQL','Redis'],     locked: true },
  { id: 'ml',            title: 'ML Engineering',                   icon: 'cpu',       modules: 7,  hours: 4,   progress: 0,  tags: ['PyTorch','MLOps','LLMs'],           locked: true },
]
```

#### Header Avatar
34×34 circle with accent-gradient background and inset white highlight; placeholder initials "JD" (12px / 700 / white).

---

### 3. Track Detail (`Track Detail.html`)

#### Purpose
Show one Learning Track (currently hard-coded to **System Design**) with progress overview and a vertical timeline of 8 modules.

#### Layout
- Same NeuralCanvas + glass header + theme toggle pattern as Tracks.
- Main column: `max-width: 720px`, padding `106px 28px 80px`.

#### Back Link
13.5px medium "← All Tracks" linking to `Tracks.html`. Hover lifts text color to primary.

#### Overview Card (`.glass-card`)
- 28px × 30px padding.
- **Top row** (flex, justify-between):
  - Left: mono eyebrow "SYSTEM DESIGN" (cyan accent), h1 "Track **Overview**" (Overview = `.grad-text`), description paragraph.
  - Right: 50×50 rounded icon tile (`#4FA8C2` on `rgba(125,200,235,0.13)`).
- **Progress block:**
  - Header row: "TRACK PROGRESS" mono label (left) + "{completed} / {total} modules" mono (right).
  - 5px-tall progress track with accent-gradient fill.
- **Stats row** — three mono spans (`{pct}% COMPLETE · {hours}h ESTIMATED · {remaining} REMAINING`), 24px gap.

#### Modules Section
- Eyebrow: mono "MODULES" label.
- Vertical timeline. Each `ModuleStep`:
  - **Left rail** (52px wide column): 28×28 status circle + connecting hairline below.
    - **Completed:** accent-gradient fill, white check icon.
    - **Current:** white/midnight center, 2px violet-blue border (`#8FA8E0`), 4px outer halo `rgba(140,160,220,0.18)` (+ 18px violet glow in dark mode), centered 8px dot.
    - **Upcoming:** white/midnight fill, 1.5px slate border, 7px inert dot.
    - **Locked:** muted fill, lock icon.
    - Connecting line below: 1px wide, `rgba(140,160,220,0.22)` dark / `0.18` light.
  - **Right card** (`.module-card`):
    - Header row: type chip (e.g. `LESSON` / `MOCK INTERVIEW` / `ASSESSMENT` — each with a colored mono pill, see TYPE_META) + duration mono ("25 min"). Right side: if `current` → `.btn-cta-sm` "Start ▶"; if `completed` → "✓ Completed" mono text in cyan accent.
    - Title (15.5px / 700) — muted color if locked.
    - Description (13.5px muted, `text-wrap: pretty`).
  - Current module's card has elevated border + soft shadow.
  - Locked module's card and rail are dimmed to opacity 0.5.

#### Module Type Colors
```js
'Lesson':         light bg rgba(125,200,235,0.14) / color #3F8FAE   ;   dark color #7DCCEB   (cyan)
'Mock Interview': light bg rgba(140,160,220,0.14) / color #5B73A0   ;   dark color #9BB0E0   (silver-blue)
'Assessment':     light bg rgba(170,150,235,0.14) / color #7B6CB2   ;   dark color #BFA8F0   (violet)
```

#### Module Data (hard-coded for demo — replace with real fetch)
8 modules; statuses: 3 × completed, 1 × current, 2 × upcoming, 2 × locked. Titles and descriptions are in the source — copy verbatim.

---

## Interactions & Behavior

### Auth Nexus
- Theme toggle persists to `localStorage['iai-theme']`; initial state respects `prefers-color-scheme`.
- Mode switch (`isLogin` boolean): clears all inputs and validation state, restarts heading animation.
- Form submit: simulated 3-step async flow (850ms intervals → success state → reset after 1600ms). Replace with real API integration.
- Field-level validation runs on blur and on submit (not on first keystroke).
- Password strength updates live as user types.
- Confirm-password and Full-Name fields use a grid-row collapse to appear/disappear smoothly.

### Tracks
- Card click navigates to `Track Detail.html` (for non-locked tracks). In a real codebase, route to `/tracks/:id`.
- Locked cards `preventDefault` on click.
- Header avatar should open a profile menu in production (currently a no-op).

### Track Detail
- Back link returns to `/tracks`.
- "Start" CTA on the current module should launch the module / mock interview flow.
- Locked modules are non-interactive.

### NeuralCanvas (shared background)
- ~36–42 points, gentle random drift (velocity ±0.18–0.22 px/frame), bouncing at edges.
- Each pair of points connects if distance < `min(w,h) × 0.40`; edge alpha fades quadratically with distance.
- In dark mode, edges and nodes alternate between **cyan** (most) and **violet** (every 3rd edge / every 4th node) for the "electric filament" feel.
- Node radius pulses sinusoidally (`p.r * (0.85 + sin(phase)*0.32)`); brightness also pulses.
- DPI-aware (`devicePixelRatio` up to 2×); resizes via `ResizeObserver`.
- Opacity: 0.65 light / 0.9 dark.
- Reduces GPU/CPU cost by reusing one canvas, fixed position, `pointer-events: none`.

---

## State Management

### Auth Nexus
```ts
interface AuthState {
  isDark: boolean;          // theme — persisted to localStorage
  isLogin: boolean;         // true = Sign In, false = Create Account
  name: string;
  email: string;
  password: string;
  confirm: string;
  showPw: boolean;          // password visibility toggle
  showPw2: boolean;         // confirm-password visibility toggle
  touched: Record<string, boolean>;  // tracks which fields were blurred
  submitted: boolean;       // true after first submit attempt
  loading: boolean;         // submission in flight
  step: 0 | 1 | 2;          // current step in the simulated submit flow
  success: boolean;         // brief success state before reset
}
```

### Tracks
```ts
interface TracksState {
  isDark: boolean;
  // Track data is static for the demo; in production fetch from /api/tracks
  tracks: Track[];
}
```

### Track Detail
```ts
interface TrackDetailState {
  isDark: boolean;
  // Track + modules are static; in production fetch from /api/tracks/:id
  track: { title: string; desc: string; total: number; completed: number; hours: number };
  modules: Array<{ id: number; title: string; type: 'Lesson'|'Mock Interview'|'Assessment'; dur: string; status: 'completed'|'current'|'upcoming'|'locked'; desc: string }>;
}
```

---

## Assets

- **Fonts:** Plus Jakarta Sans + JetBrains Mono (Google Fonts — see Typography section).
- **Icons:** Custom inline SVGs (24×24 viewBox, `currentColor` stroke). All defined in each HTML file; you can swap to your icon library (Lucide / Heroicons / Feather) — the included set is a Feather-equivalent subset:
  - `sun`, `moon`, `eye`, `eye-off`, `arrow-right`, `check`, `lock`, `server`, `code`, `users`, `database`, `cpu`, `git-branch`, `play`, `chevron-left`.
- **Google + GitHub OAuth icons:** Standard brand marks rendered inline in `Auth Nexus.html`. Use the official assets for production.
- **Logo:** Inline SVG hexagon containing the letters "A" + "I" stylized; gradient stroke uses the `accent-gradient`. Replace with the final InterviewAI brandmark when available.
- **Imagery:** No raster images — the design is fully vector/CSS.

---

## Accessibility Notes

- Contrast: text-primary on bg-base meets WCAG AAA in both modes (`#0F172A` on `#F7F9FC` ≈ 17:1; `#F1F5F9` on `#060B14` ≈ 18:1). Subtle text passes AA.
- Theme toggle has `aria-label="Toggle theme"`.
- Password show/hide buttons have `aria-label`.
- All buttons keyboard-focusable with default outline; consider adding visible focus rings that match `shadow-focus-ring`.
- Form validation errors should be associated with inputs via `aria-describedby` in production.
- Canvas has `pointer-events: none` and is purely decorative — screen readers skip it.

---

## Files in this Bundle

| File                  | Purpose                                                         |
| --------------------- | --------------------------------------------------------------- |
| `Auth Nexus.html`     | Sign In / Create Account screen (single-file React + Babel)     |
| `Tracks.html`         | Learning Tracks dashboard                                       |
| `Track Detail.html`   | Per-track module timeline                                       |
| `screenshots/`        | Light + dark mode screenshots of each screen                    |
| `README.md`           | This document                                                   |

### Screenshots

| Screen        | Light                                          | Dark                                          |
| ------------- | ---------------------------------------------- | --------------------------------------------- |
| Auth          | `screenshots/auth-light.png`                   | `screenshots/auth-dark.png`                   |
| Tracks        | `screenshots/tracks-light.png`                 | `screenshots/tracks-dark.png`                 |
| Track Detail  | `screenshots/track-detail-light.png`           | `screenshots/track-detail-dark.png`           |

Each HTML file is self-contained: it includes its CSS, React 18, Babel-standalone for JSX, and Tailwind (used minimally for class-darkMode). For production, lift the styles into your design-system tokens, replace React-CDN + Babel with your build tooling, and swap the SVG icons for your icon library.
