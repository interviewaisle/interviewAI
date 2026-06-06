const lightColors: Record<string, string> = {
  // Core palette
  primary: '#6366F1',
  'primary-hover': '#4F46E5',
  surface: '#F7F9FC',
  'surface-raised': '#FFFFFF',
  'surface-overlay': '#E8ECF4',
  foreground: '#0F172A',
  muted: '#64748B',
  accent: '#5DC9DF',
  border: '#CBD5E1',
  destructive: '#B91C1C',
  success: '#16a34a',
  warning: '#D97706',
  secondary: '#475569',
  // Input
  'input-bg': 'rgba(250,251,254,0.92)',
  'input-bg-solid': 'rgba(250,251,254,0.92)',
  'input-border': 'rgba(203,213,228,0.9)',
  'input-focus-ring': 'rgba(140,160,220,0.14)',
  // Gradient (3-stop: icy-cyan → silver-blue → violet)
  'gradient-start': '#5DC9DF',
  'gradient-mid': '#8FA8E0',
  'gradient-end': '#A78BFA',
  // Canvas node dot
  'node-dot': 'rgba(110,148,190,0.35)',
  // Glassmorphism — card
  'card-bg': 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(245,248,253,0.84))',
  'card-border-color': 'rgba(200,214,232,0.78)',
  'card-border-hover': 'rgba(140,160,220,0.45)',
  'module-card-bg': 'linear-gradient(135deg, rgba(255,255,255,0.90), rgba(245,248,253,0.82))',
  'module-border-cur': 'rgba(140,160,220,0.50)',
  // Header
  'header-bg': 'rgba(247,249,252,0.82)',
  'header-border': 'rgba(200,214,232,0.55)',
  // Progress bar rail
  'progress-rail': 'rgba(200,214,232,0.85)',
  // Module timeline connector line
  'connector-color': 'rgba(140,160,220,0.18)',
  // Shadows
  'card-shadow-hover': '0 20px 44px -8px rgba(120,140,200,0.18)',
  'module-shadow-cur': '0 8px 28px -4px rgba(120,140,200,0.16)',
  // CTA brushed-platinum button
  'cta-btn-bg': 'linear-gradient(180deg, #DCE6F2 0%, #B0C2DD 32%, #7B95BC 70%, #54719C 100%)',
  'cta-btn-shadow': 'inset 0 1px 0 rgba(255,255,255,0.50), 0 4px 12px -2px rgba(80,110,160,0.30)',
  'cta-btn-shadow-hover': 'inset 0 1px 0 rgba(255,255,255,0.55), 0 10px 28px -6px rgba(80,110,160,0.50)',
  // Ambient page glows
  'glow-top-right': 'rgba(160,180,220,0.18)',
  'glow-bottom-left': 'rgba(140,170,210,0.14)',
}

const darkColors: Record<string, string> = {
  // Core palette
  primary: '#818CF8',
  'primary-hover': '#6366F1',
  surface: '#060B14',
  'surface-raised': '#0D1120',
  'surface-overlay': '#1A2035',
  foreground: '#F1F5F9',
  muted: '#94A3B8',
  accent: '#5DC9DF',
  border: '#1E2844',
  destructive: '#FCA5A5',
  success: '#4ade80',
  warning: '#FBBF24',
  secondary: '#CBD5E1',
  // Input
  'input-bg': 'rgba(16,24,48,0.88)',
  'input-bg-solid': 'rgba(16,24,48,0.88)',
  'input-border': 'rgba(80,120,170,0.45)',
  'input-focus-ring': 'rgba(140,160,220,0.20)',
  // Gradient (same 3-stop)
  'gradient-start': '#5DC9DF',
  'gradient-mid': '#8FA8E0',
  'gradient-end': '#A78BFA',
  // Canvas node dot
  'node-dot': '#5DC9DF',
  // Glassmorphism — card
  'card-bg': 'linear-gradient(135deg, rgba(18,28,48,0.82), rgba(20,42,68,0.74))',
  'card-border-color': 'rgba(80,120,170,0.38)',
  'card-border-hover': 'rgba(140,160,235,0.45)',
  'module-card-bg': 'linear-gradient(135deg, rgba(16,26,46,0.80), rgba(18,38,62,0.72))',
  'module-border-cur': 'rgba(155,180,235,0.55)',
  // Header
  'header-bg': 'rgba(6,11,20,0.78)',
  'header-border': 'rgba(80,120,170,0.30)',
  // Progress bar rail
  'progress-rail': 'rgba(28,46,80,0.85)',
  // Module timeline connector line
  'connector-color': 'rgba(140,160,220,0.22)',
  // Shadows
  'card-shadow-hover': '0 20px 44px -8px rgba(120,140,220,0.28)',
  'module-shadow-cur': '0 8px 32px -4px rgba(125,200,235,0.25)',
  // CTA brushed-platinum button
  'cta-btn-bg': 'linear-gradient(180deg, #C8D5EC 0%, #8FA6CB 32%, #5C7BA8 70%, #3E5887 100%)',
  'cta-btn-shadow': 'inset 0 1px 0 rgba(255,255,255,0.40), 0 6px 16px -3px rgba(60,90,150,0.45)',
  'cta-btn-shadow-hover': 'inset 0 1px 0 rgba(255,255,255,0.50), 0 10px 28px -6px rgba(60,90,150,0.60)',
  // Ambient page glows
  'glow-top-right': 'rgba(130,90,200,0.16)',
  'glow-bottom-left': 'rgba(40,160,220,0.12)',
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
