'use client'

import Link from 'next/link'
import { useSignupForm } from '@/hooks/useSignupForm'
import { ROUTES } from '@/constants'
import { Button, GradientText } from '@/components/ui'
import { AuthInput } from './AuthInput'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'

export function SignupForm() {
  const {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error, isLoading, loadingStep, slowHint, onSubmit,
  } = useSignupForm()

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <h1
        className="text-foreground font-extrabold leading-[1.05] tracking-[-0.025em] mb-1.5"
        style={{ fontSize: 'clamp(24px, 4vw, 32px)' }}
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

        {slowHint && (
          <p className="text-center text-xs text-muted">
            Waking up the server — the free tier can take up to a minute after a period of inactivity.
          </p>
        )}
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

      <p className="text-[11.5px] text-muted text-center mt-4 leading-relaxed">
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
