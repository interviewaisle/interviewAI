'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants'

export function LandingHero() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-16 pb-14 text-center md:pt-24">
      <span className="font-mono-labels text-[11px] uppercase tracking-[0.14em] text-muted">
        The AI Engineering Era
      </span>

      <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] text-foreground md:text-6xl">
        Master AI engineering
        <br className="hidden sm:block" /> by building it.
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.65] text-secondary md:text-base">
        Interactive tracks that put you in the driver&apos;s seat — debug real code with an
        AI pair, tune live infrastructure, and run what you write. No passive videos.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href={ROUTES.SIGNUP}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Get started free
        </Link>
        <Link
          href={ROUTES.LOGIN}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-raised"
        >
          I have an account
        </Link>
      </div>
    </section>
  )
}
