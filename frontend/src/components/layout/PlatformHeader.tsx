'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui'
import { ROUTES } from '@/constants'
import { UserMenu } from './UserMenu'

interface PlatformHeaderProps {
  userInitial?: string
  /** Email shown in the account dropdown (hub pages) */
  userEmail?: string
  /** Content rendered between the logo and the right controls (back-link + title for module views) */
  center?: React.ReactNode
  /** Extra controls rendered before ThemeToggle (e.g. Run button, connection status) */
  rightExtra?: React.ReactNode
  /** 'fixed' (default) for platform pages; 'static' for module views that are part of a flex layout */
  position?: 'fixed' | 'static'
  /** Highlights the matching primary nav link on hub pages (no effect when `center` is set) */
  activeNav?: 'home' | 'tracks'
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
        active ? 'text-foreground' : 'text-muted hover:text-foreground'
      }`}
    >
      {label}
    </Link>
  )
}

function LogoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" className="text-primary" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor" />
      <path d="M11 11l5 5-5 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="17" y1="21" x2="23" y2="21" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function PlatformHeader({ userInitial = '?', userEmail, center, rightExtra, position = 'fixed', activeNav }: PlatformHeaderProps) {
  const positionClass = position === 'fixed'
    ? 'fixed top-0 inset-x-0 z-50'
    : 'flex-shrink-0'

  return (
    <header className={`platform-header flex items-center gap-3 px-6 py-3 ${positionClass}`}>
      {/* Logo + wordmark */}
      <Link href={ROUTES.HOME} className="flex items-center gap-2.5 shrink-0">
        <LogoMark />
        <span className="text-foreground text-sm font-semibold tracking-[-0.01em]">
          InterviewAI
        </span>
      </Link>

      {/* Center slot: back-link + title for module views; primary nav for hub pages */}
      {center ? (
        <>
          <span className="header-sep" />
          <div className="flex items-center gap-3 flex-1 min-w-0">{center}</div>
        </>
      ) : (
        <>
          <span className="header-sep" />
          <nav className="flex items-center gap-1 flex-1">
            <NavLink href={ROUTES.HOME} label="Home" active={activeNav === 'home'} />
            <NavLink href={ROUTES.TRACKS} label="Tracks" active={activeNav === 'tracks'} />
          </nav>
        </>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {rightExtra}
        {!center && <UserMenu email={userEmail ?? (userInitial !== '?' ? userInitial : undefined)} />}
        <ThemeToggle />
      </div>
    </header>
  )
}
