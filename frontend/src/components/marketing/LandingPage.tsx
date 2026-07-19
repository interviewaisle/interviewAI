'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { warmBackend } from '@/lib/warmup'
import { ROUTES } from '@/constants'
import { AuthModal } from '@/components/auth'
import { LandingNav } from './LandingNav'
import { LandingHero } from './LandingHero'
import { FeatureGrid } from './FeatureGrid'

export function LandingPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  // Logged-in visitors skip the marketing page and go straight to their home.
  useEffect(() => {
    if (getToken()) {
      router.replace(ROUTES.HOME)
    } else {
      setChecked(true)
      // Pre-warm the free-tier backend while the visitor reads the page / opens
      // the auth dialog, so login isn't blocked by a cold start.
      warmBackend()
    }
  }, [router])

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    )
  }

  return (
    <div className="page-bg min-h-screen">
      <LandingNav />
      <main>
        <LandingHero />
        <FeatureGrid />
      </main>
      <AuthModal />
    </div>
  )
}
