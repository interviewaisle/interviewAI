// Brand mark: a filled rounded-square badge with a terminal-prompt glyph (›_).
// The badge fill inherits `currentColor` (wrap in a text-* class); glyph is white.
export function LandingLogo({ className = 'text-primary' }: { className?: string }) {
  return (
    <svg
      width="32" height="32" viewBox="0 0 32 32" fill="none"
      className={className} aria-hidden="true"
    >
      <rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor" />
      <path d="M11 11l5 5-5 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="17" y1="21" x2="23" y2="21" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
