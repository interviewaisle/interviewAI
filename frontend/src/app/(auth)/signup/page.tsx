'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSignupForm } from '@/hooks/useSignupForm'
import { ROUTES } from '@/constants'
import { Button, ErrorBoundary, GradientText, ThemeToggle } from '@/components/ui'
import { AuthInput, PasswordStrengthMeter } from '@/components/auth'

const NeuralCanvas = dynamic(
  () => import('@/components/auth').then(m => m.NeuralCanvas),
  { ssr: false }
)

function SignupContent() {
  const {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error, isLoading, loadingStep, onSubmit,
  } = useSignupForm()

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
            Create your <GradientText>account</GradientText>
          </h1>
          <p className="text-[13.5px] text-secondary leading-[1.6] mb-5">
            Join thousands of candidates acing their interviews.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
            <AuthInput
              label="Full Name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              autoComplete="name"
            />

            <AuthInput
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <div className="flex flex-col gap-2">
              <AuthInput
                label="Password"
                showToggle
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <AuthInput
              label="Confirm Password"
              showToggle
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
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
              className="mt-0.5"
            >
              {loadingStep === -1 ? 'Account created!' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            Already have an account?{' '}
            <Link
              href={ROUTES.LOGIN}
              className="gradient-text font-semibold hover:opacity-80 transition-opacity"
            >
              Sign in
            </Link>
          </p>

          <p className="font-mono-labels text-[10.5px] text-muted text-center mt-4 leading-relaxed">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function SignupPage() {
  return (
    <ErrorBoundary>
      <SignupContent />
    </ErrorBoundary>
  )
}
