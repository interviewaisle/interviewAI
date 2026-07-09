'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLoginForm } from '@/hooks/useLoginForm'
import { ROUTES } from '@/constants'
import { Button, ErrorBoundary, GradientText, ThemeToggle } from '@/components/ui'
import { AuthInput } from '@/components/auth'

const NeuralCanvas = dynamic(
  () => import('@/components/auth').then(m => m.NeuralCanvas),
  { ssr: false }
)

const LOGIN_STEPS = ['Verifying credentials...', 'Connecting to AI Core...', 'Launching session...'] as const

function LoginContent() {
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') === '1'
  const { email, setEmail, password, setPassword, error, isLoading, loadingStep, onSubmit } = useLoginForm()

  return (
    <div className="page-bg relative h-screen flex flex-col overflow-hidden">
      <NeuralCanvas />

      <header className="fixed top-0 right-0 p-5 z-20">
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[420px]">
          <h1
            className="text-foreground font-extrabold leading-[1.05] tracking-[-0.025em] mb-1.5"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)', animation: 'fade-in-up 0.38s ease both' }}
          >
            Sign in to <GradientText>InterviewAI</GradientText>
          </h1>
          <p className="text-[13.5px] text-secondary leading-[1.6] mb-5">
            Resume your AI-powered interview sessions.
          </p>

          {registered && (
            <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              Account created — please sign in.
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
            <AuthInput
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <AuthInput
              label="Password"
              showToggle
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="text-destructive text-sm -mt-1">{error}</p>
            )}

            <Button
              variant="cta"
              type="submit"
              isLoading={isLoading}
              loadingStep={loadingStep ?? undefined}
              loadingSteps={LOGIN_STEPS}
              className="mt-0.5"
            >
              {loadingStep === -1 ? 'Signed in!' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            New here?{' '}
            <Link
              href={ROUTES.SIGNUP}
              className="gradient-text font-semibold hover:opacity-80 transition-opacity"
            >
              Create an account
            </Link>
          </p>

          <p className="text-[11.5px] text-muted text-center mt-4 leading-relaxed">
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center bg-surface">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </ErrorBoundary>
  )
}
