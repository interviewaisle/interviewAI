'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui'
import { ROUTES } from '@/constants'
import { LandingLogo } from './LandingLogo'

export function LandingNav() {
  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-10">
      <Link href={ROUTES.LANDING} className="flex items-center gap-2.5">
        <LandingLogo />
        <span className="text-foreground text-sm font-semibold tracking-[-0.01em]">
          InterviewAI
        </span>
      </Link>

      <div className="flex items-center gap-2.5">
        <Link
          href={ROUTES.LOGIN}
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-raised"
        >
          Log in
        </Link>
        <Link
          href={ROUTES.SIGNUP}
          className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Get started
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
