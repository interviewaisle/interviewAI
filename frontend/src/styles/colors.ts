// Linear-inspired palette: neutral grays + a single restrained indigo accent.
// No rainbow gradients, no glassmorphism, no metallic buttons, no ambient glows.
// Token keys are unchanged so no component needs editing — only values change here.

const lightColors: Record<string, string> = {
  // Core palette
  primary: '#5E6AD2',
  'primary-hover': '#4F5ABF',
  surface: '#FBFBFC',
  'surface-raised': '#FFFFFF',
  'surface-overlay': '#F3F3F5',
  foreground: '#1B1B1F',
  muted: '#70747D',
  accent: '#5E6AD2',
  border: '#E7E7EA',
  destructive: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  secondary: '#4B5059',
  // Input — solid, no translucency
  'input-bg': '#FFFFFF',
  'input-bg-solid': '#FFFFFF',
  'input-border': '#DEDEE2',
  'input-focus-ring': 'rgba(94,106,210,0.16)',
  // Gradient tokens collapsed to a tight indigo (kept so .gradient-* classes still resolve)
  'gradient-start': '#6E79DB',
  'gradient-mid': '#5E6AD2',
  'gradient-end': '#5E6AD2',
  // Canvas node dot — faint neutral
  'node-dot': 'rgba(27,27,31,0.06)',
  // Card — solid surface, real border, no blur
  'card-bg': '#FFFFFF',
  'card-border-color': '#E7E7EA',
  'card-border-hover': '#D3D3D8',
  'module-card-bg': '#FFFFFF',
  'module-border-cur': '#5E6AD2',
  // Header — solid
  'header-bg': '#FFFFFF',
  'header-border': '#ECECEE',
  // Progress bar rail
  'progress-rail': '#ECECEF',
  // Module timeline connector line
  'connector-color': '#E7E7EA',
  // Shadows — barely-there
  'card-shadow-hover': '0 1px 2px rgba(27,27,31,0.06)',
  'module-shadow-cur': '0 1px 2px rgba(27,27,31,0.05)',
  // CTA button — solid indigo, no metallic gradient
  'cta-btn-bg': '#5E6AD2',
  'cta-btn-shadow': '0 1px 2px rgba(27,27,31,0.06)',
  'cta-btn-shadow-hover': '0 2px 8px rgba(94,106,210,0.24)',
  // Ambient page glows — removed
  'glow-top-right': 'transparent',
  'glow-bottom-left': 'transparent',
}

const darkColors: Record<string, string> = {
  // Core palette
  primary: '#8D95F2',
  'primary-hover': '#7A82E0',
  surface: '#08090A',
  'surface-raised': '#101113',
  'surface-overlay': '#1A1B1E',
  foreground: '#E6E6E7',
  muted: '#8A8F98',
  accent: '#8D95F2',
  border: '#202123',
  destructive: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
  secondary: '#C3C4C7',
  // Input — solid
  'input-bg': '#101113',
  'input-bg-solid': '#101113',
  'input-border': '#2A2B2E',
  'input-focus-ring': 'rgba(141,149,242,0.24)',
  // Gradient tokens collapsed to a tight indigo
  'gradient-start': '#9AA1F5',
  'gradient-mid': '#8D95F2',
  'gradient-end': '#8D95F2',
  // Canvas node dot — faint
  'node-dot': 'rgba(255,255,255,0.05)',
  // Card — solid surface, real border, no blur
  'card-bg': '#101113',
  'card-border-color': '#202123',
  'card-border-hover': '#2E2F33',
  'module-card-bg': '#101113',
  'module-border-cur': '#8D95F2',
  // Header — solid
  'header-bg': '#08090A',
  'header-border': '#1A1B1E',
  // Progress bar rail
  'progress-rail': '#202123',
  // Module timeline connector line
  'connector-color': '#202123',
  // Shadows — barely-there
  'card-shadow-hover': '0 1px 3px rgba(0,0,0,0.4)',
  'module-shadow-cur': '0 1px 3px rgba(0,0,0,0.35)',
  // CTA button — solid indigo
  'cta-btn-bg': '#5E6AD2',
  'cta-btn-shadow': '0 1px 2px rgba(0,0,0,0.3)',
  'cta-btn-shadow-hover': '0 4px 12px rgba(94,106,210,0.4)',
  // Ambient page glows — removed
  'glow-top-right': 'transparent',
  'glow-bottom-left': 'transparent',
}

export function buildCssVars(): string {
  const light = Object.entries(lightColors)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n')
  const dark = Object.entries(darkColors)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n')
  return `:root {\n${light}\n}\n.dark {\n${dark}\n}`
}
