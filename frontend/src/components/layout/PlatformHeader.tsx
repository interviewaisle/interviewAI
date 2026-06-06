'use client'

import { ThemeToggle } from '@/components/ui'

interface PlatformHeaderProps {
  userInitial?: string
  /** Content rendered between the logo and the right controls (back-link + title for module views) */
  center?: React.ReactNode
  /** Extra controls rendered before ThemeToggle (e.g. Run button, connection status) */
  rightExtra?: React.ReactNode
  /** 'fixed' (default) for platform pages; 'static' for module views that are part of a flex layout */
  position?: 'fixed' | 'static'
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logoGradPH" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5DC9DF" />
          <stop offset="55%" stopColor="#8FA8E0" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <path d="M16 1L30 9V23L16 31L2 23V9Z" stroke="url(#logoGradPH)" strokeWidth="1.2" fill="none" />
      <path
        d="M9 22L13.5 11L18 22M11 18.5H16"
        stroke="url(#logoGradPH)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="21" y1="11" x2="21" y2="22" stroke="url(#logoGradPH)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function PlatformHeader({ userInitial = '?', center, rightExtra, position = 'fixed' }: PlatformHeaderProps) {
  const positionClass = position === 'fixed'
    ? 'fixed top-0 inset-x-0 z-50'
    : 'flex-shrink-0'

  return (
    <header className={`platform-header flex items-center gap-3 px-6 py-3 ${positionClass}`}>
      {/* Logo + wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <LogoMark />
        <span className="text-foreground text-sm font-semibold tracking-[-0.01em]">
          InterviewAI
        </span>
      </div>

      {/* Center slot: back-link + title for module views, spacer for platform pages */}
      {center ? (
        <>
          <span className="header-sep" />
          <div className="flex items-center gap-3 flex-1 min-w-0">{center}</div>
        </>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {rightExtra}
        {!center && userInitial && (
          <div className="user-avatar" title="Profile" aria-label="User profile">
            {userInitial.toUpperCase()}
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
