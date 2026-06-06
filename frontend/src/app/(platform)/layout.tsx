'use client'

import { useAuthGuard } from '@/hooks/useAuthGuard'
import { ErrorBoundary } from '@/components/ui'

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
    </div>
  )
}

function PlatformLayoutInner({ children }: { children: React.ReactNode }) {
  const { isVerified } = useAuthGuard()
  if (!isVerified) return <FullPageSpinner />
  return <>{children}</>
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <PlatformLayoutInner>{children}</PlatformLayoutInner>
    </ErrorBoundary>
  )
}
