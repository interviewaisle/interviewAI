# Handoff: InterviewAI — Auth Pages (Login & Signup)

## Overview

This package contains the high-fidelity design reference for the **InterviewAI authentication flow** — a unified login/signup page featuring a full-screen animated crystalline neural network background, theme-aware color system, accessible form fields with gradient focus states, and a smooth animated transition between login and signup modes.

---

## About the Design Files

`Auth Nexus.html` is a **design reference built in HTML/React/Canvas** — a prototype showing the intended look, feel, and interactions. It is **not production code to ship directly**.

Your task is to **recreate these designs in the existing Next.js codebase** (`app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`) using its established patterns, component library (`@/components/ui`), hooks (`useLoginForm`, `useSignupForm`), and routing (`ROUTES`). Apply the visual system documented here on top of those existing structures.

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, interactions, and animations are all final. Recreate pixel-precisely using the codebase's existing libraries and patterns.

---

## Screens / Views

Both login and signup share a single page component with toggled state. On mobile they collapse to a centered single-column card.

---

### Screen 1 — Sign In (`/login`)

**Purpose:** Existing users authenticate.

**Layout:**
- Full-viewport, flex column, items centered, `min-height: 100vh`
- Top padding `100px` (clears the fixed header), bottom `60px`, horizontal `24px`
- Form container: `max-width: 420px`, `width: 100%`
- All form fields are offset `padding-left: 36px` to accommodate the node connector dots

**Header (fixed, full-width):**
- `position: fixed; top: 0; left: 0; right: 0; z-index: 50`
- `padding: 20px 32px`, flex row, space-between
- Left: Logo mark (SVG, 32×32) + "InterviewAI" wordmark (`14px / 600 / letter-spacing -0.01em`)
- Right: Theme toggle button (38×38 circle, border, backdrop blur)

**Heading block:**
- `font-size: clamp(36px, 5vw, 50px)`, `font-weight: 800`, `line-height: 1.05`, `letter-spacing: -0.025em`
- Line 1: "Sign in to" — solid text color
- Line 2: "InterviewAI" — gradient text (`linear-gradient(135deg, #06B6D4 10%, #6366F1 90%)`, CSS `background-clip: text`)
- Sub-paragraph: `14.5px / muted color / line-height 1.6`
- Text: *"Resume your AI-powered interview sessions."*
- Animates `fade-in-up` (opacity 0→1, translateY 10px→0, 0.38s ease) on mode switch

**Form fields (in order):**
1. Email Address
2. Password (with show/hide eye toggle)
3. "Keep me signed in" checkbox + "Forgot password?" gradient link
4. CTA button: **Sign In**

**Below form:**
- Divider: `—— or ——`
- OAuth: "Sign in with Google" / "Sign in with GitHub" (text + icon, no button border)
- Mode switch: *"New here? **Create an account**"*
- Terms: `10.5px / JetBrains Mono / subtle color`

---

### Screen 2 — Create Account (`/signup`)

**Purpose:** New users register.

**Same layout as Sign In**, with the following additions/differences:

**Additional fields (animated expand/collapse):**
- Full Name — appears above Email
- Confirm Password — appears below Password with its own eye toggle
- Password Strength Meter — 4-segment bar + label, appears below Password when password.length > 0

**Heading changes to:**
- Line 1: "Create your"
- Line 2: "account" (gradient)
- Sub: *"Join thousands of candidates acing their interviews."*

**CTA:** "Create Account"

**Mode switch:** *"Already have an account? **Sign in**"*

---

## Component Specs

### Neural Network Canvas

A decorative `<canvas>` element covering the full page (`position: fixed; inset: 0`).

**Algorithm:**
1. Generate ~60–80 points: irregular grid base (10×7, skip 12%) + 2–4 crystal cluster formations
2. Crystal cluster: 1 centre hub → 5–8 spoke nodes at varied angles → 1 sub-facet node per spoke
3. Connect each point to nearest 3–5 neighbors within `0.22 × min(width, height)` px
4. Find all triangles (3 mutually-connected nodes) and fill them faintly
5. Animate: points drift at 0.1px/frame, graph rebuilds every 100 frames

**Rendering layers (back to front):**
1. Triangle fills — `rgba(99,102,241, 0.032)` dark / `rgba(6,182,212, 0.022)` light
2. Edges — `0.6px` stroke, `rgba(6,182,212, 0.17)` dark / `rgba(6,182,212, 0.10)` light
3. Pathway edges (hub-connected) — `1px` stroke, `rgba(6,182,212, 0.38)` dark / `0.19` light
4. Regular nodes — `~1px` radius, crisp dot, no halo
5. Hub nodes — `~2px` radius, small soft glow (purple or cyan alternating)
6. Crystal centre nodes — `~3.5px`, radial glow halo, outer ring stroke

> **Implementation note:** This is the most complex visual. A lighter alternative: a static SVG mesh pattern as a CSS `background-image` using the same colors. The animated version is preferred for desktop; a static fallback is acceptable for mobile/reduced-motion.

---

### Input Field

```
height: 52px
border-radius: 12px
border: 1.5px solid <border-color>
background: <input-bg>
font-size: 14.5px
padding: 0 44px 0 16px   (right padding for eye button)
```

**Gradient focus border** (CSS technique):
```css
:focus {
  border-color: transparent;
  background-image:
    linear-gradient(<input-bg>, <input-bg>),
    linear-gradient(135deg, #06B6D4, #6366F1);
  background-origin: padding-box, border-box;
  background-clip: padding-box, border-box;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.13);
}
```

**Node connector dot** (left of each input, outside the field):
- `7×7px` circle, positioned `left: -20px, top: 50%`
- Light: `rgba(6,182,212, 0.45)` no shadow
- Dark: `#06B6D4` + `box-shadow: 0 0 7px rgba(6,182,212,0.8), 0 0 14px rgba(6,182,212,0.35)`

**Animated expand/collapse** for name + confirm fields:
```css
/* CSS grid row technique */
.collapsible { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.28s ease; }
.collapsible.open { grid-template-rows: 1fr; }
.collapsible > div { overflow: hidden; }
```

---

### CTA Button

```
width: 100%
height: 52px
border-radius: 12px
background: linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)
color: #FFFFFF
font-size: 15px / font-weight: 700
```

**States:**
- Hover: `translateY(-1.5px)`, `box-shadow: 0 14px 36px -6px rgba(99,102,241,0.5)`, inner highlight overlay opacity 0→1
- Active: `scale(0.985)`
- Loading: spinner + step text ("Verifying credentials…" → "Connecting to AI Core…" → "Launching session…"), 800ms per step
- Success: checkmark icon + "Signed in!" / "Account created!", 1.6s then reset
- Disabled: `opacity: 0.65`

---

### Password Strength Meter

4 segments, `3px` height, `border-radius: 99px`, flex row with `5px` gap.

| Score | Color |
|---|---|
| 1 (Weak) | `#F87171` |
| 2 (Fair) | `#FBBF24` |
| 3 (Strong) | `#06B6D4` |
| 4 (Excellent) | `#6366F1` |

Unfilled segment: `#1E2A3A` dark / `#E2E8F0` light.

**Scoring logic:**
- Length ≥ 8: +1
- Length ≥ 12: +1
- Mixed case: +1
- Digit AND special char: +1

---

### OAuth Rows

Plain flex rows, no border/background button treatment:

```
display: flex; align-items: center; gap: 10px
font-size: 14px; font-weight: 500
padding: 6px 0
```

Colors in the color tokens table below.

---

### Theme Toggle

```
38×38px circle
border: 1px solid <border-color>
background: rgba(255,255,255,0.7) / rgba(10,14,28,0.7)
backdrop-filter: blur(8px)
```

Persists to `localStorage` key `iai-theme`. Reads `prefers-color-scheme` on first visit. Toggles `dark` class on `<html>`.

---

## Interactions & Behavior

| Interaction | Behavior |
|---|---|
| Mode switch (Login ↔ Signup) | Name + confirm fields collapse/expand via CSS grid. Heading fades up. State resets (touched, submitted, field values). |
| Input focus | Gradient border activates via background-clip technique |
| Password typing (signup) | Strength meter appears, updates live |
| Form submit | Validates all fields first. On pass: loading spinner with 3 step messages (800ms each), then success state (1.6s), then reset. |
| Theme toggle | Adds/removes `dark` class on `<html>`, saves to `localStorage` |
| Eye toggle | Toggles `type="password"` ↔ `type="text"` |
| "Forgot password?" | Link — wire to your reset flow |
| OAuth buttons | Wire to your OAuth provider handlers |

**Validation rules:**
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`
- Password: minimum 8 characters
- Confirm password: must match password
- Name: no validation (optional field in current design; adjust as needed)

**Responsive:**
- The canvas background fills the full page at all sizes
- The form container is `max-width: 420px` and collapses to full-width on small screens
- The fixed header reduces padding on mobile

---

## Design Tokens

### Colors

| Token | Light | Dark |
|---|---|---|
| Page background | `#F4F6FA` | `#080C18` |
| Primary text | `#111827` | `#F1F5F9` |
| Muted text | `#374151` | `#CBD5E1` |
| Subtle / tertiary | `#6B7280` | `#94A3B8` |
| Field labels | `#4B5563` | `#94A3B8` |
| Input background | `rgba(255,255,255,0.85)` | `rgba(10,14,28,0.75)` |
| Input border | `rgba(203,213,225,0.9)` | `rgba(30,40,68,0.9)` |
| Input text | `#1F2937` | `#E8EDF5` |
| Input placeholder | `#6B7280` | `#64748B` |
| Error text | `#B91C1C` | `#FCA5A5` |
| Divider | `#6B7280` | `#64748B` |
| OAuth text | `#374151` | `#CBD5E1` |
| Node dot | `rgba(6,182,212,0.45)` | `#06B6D4` |

### Accent Gradient
```
linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)
```
Used on: CTA button, gradient border (focus), gradient text (heading accent, links), tab pill, strength meter (score 3–4), node connector dot (dark).

### Typography

| Role | Family | Size | Weight | Other |
|---|---|---|---|---|
| Page heading | Plus Jakarta Sans | `clamp(36px, 5vw, 50px)` | 800 | `letter-spacing: -0.025em`, `line-height: 1.05` |
| Sub-heading | Plus Jakarta Sans | 14.5px | 400 | `line-height: 1.6` |
| Field label | Plus Jakarta Sans | 11px | 600 | `text-transform: uppercase; letter-spacing: 0.1em` |
| Input text | Plus Jakarta Sans | 14.5px | 400 | — |
| CTA button | Plus Jakarta Sans | 15px | 700 | — |
| OAuth row | Plus Jakarta Sans | 14px | 500 | — |
| Mono labels | JetBrains Mono | 10.5–11.5px | 400–500 | terms, strength label |

### Spacing
- Form container max-width: `420px`
- Field gap: `18px`
- Input height: `52px`
- Input padding: `0 44px 0 16px`
- Node dot offset from input left edge: `36px` (input is padded-left 36px, dot at -20px = 16px from page)
- Header padding: `20px 32px`

### Border Radius
- Inputs: `12px`
- CTA button: `12px`
- Theme toggle: `50%` (circle)
- OAuth rows: no border

### Shadows
- CTA hover: `0 14px 36px -6px rgba(99,102,241,0.5)`
- Input focus ring: `0 0 0 3px rgba(99,102,241,0.13)`

---

## State Management

```typescript
// Form state
isLogin: boolean          // toggles login vs signup view
name: string              // signup only
email: string
password: string
confirm: string           // signup only
showPw: boolean           // password visibility
showPw2: boolean          // confirm password visibility
touched: Record<string, boolean>  // tracks blur events per field
submitted: boolean        // true after first submit attempt
loading: boolean
loadStep: 0 | 1 | 2       // index into LOADING_STEPS array
success: boolean          // brief success state post-submit

// Theme
isDark: boolean           // mirrors html.classList.contains('dark')
```

**Form validation** runs on every render via `useMemo` and is gated by `touched[field] || submitted`. This gives inline validation only after the user has interacted with a field, but shows all errors on submit attempt.

---

## Assets

| Asset | Description | Source |
|---|---|---|
| Logo mark | SVG hexagon with "AI" letterform, gradient stroke | Defined inline in `<Logo>` component in `Auth Nexus.html` |
| Google icon | Full-color Google G logo | Inline SVG, multi-path with official brand colors |
| GitHub icon | GitHub Invertocat | Inline SVG, `fill="currentColor"` |
| All icons (Eye, Lock, Sun, Moon, Arrow, Check) | Minimal stroke icons, 1.8px stroke | Defined inline in file |
| Neural network | Procedural canvas animation | See algorithm above |

No external image assets are required.

---

## Files in This Package

| File | Description |
|---|---|
| `Auth Nexus.html` | Complete high-fidelity design reference. Open in any browser to inspect and interact with the design. Includes light/dark toggle (top-right). |
| `README.md` | This document. |

---

## Implementation Notes for Claude Code

1. **Start with the existing TSX files** at `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`. Preserve the existing `useLoginForm` / `useSignupForm` hooks and routing — only replace the visual layer.

2. **The neural network canvas** is the most complex element. Implement it as a standalone `NeuralCanvas` client component. Consider using `@react-three/fiber` or `framer-motion` canvas utilities if your stack includes them. At minimum, implement the static triangle mesh; the animation is a progressive enhancement.

3. **The gradient border on focus** requires the `background-clip: padding-box, border-box` technique. This is not achievable with a simple `border` property. See the CSS in `Auth Nexus.html` (`.nxs-input:focus` rule) for the exact implementation.

4. **The animated field collapse** (name / confirm password) uses the CSS grid `grid-template-rows: 0fr → 1fr` trick. This is supported in all modern browsers.

5. **Theme persistence** — the existing codebase may already have a theme provider. If so, connect the toggle to that rather than manually managing the `dark` class.

6. **Fonts** — add `Plus Jakarta Sans` and `JetBrains Mono` to your `next/font` configuration or `globals.css`.
