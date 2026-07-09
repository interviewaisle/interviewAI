'use client'

import { ButtonHTMLAttributes } from 'react'

const CTA_STEPS = ['Validating...', 'Connecting to AI Core...', 'Launching session...'] as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'cta'
  isLoading?: boolean
  loadingStep?: number
  loadingSteps?: readonly [string, string, string]
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function Checkmark() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  isLoading = false,
  loadingStep,
  loadingSteps,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const steps = loadingSteps ?? CTA_STEPS
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    ghost: 'bg-transparent text-foreground hover:bg-surface-raised border border-border',
    cta: 'cta-btn',
  }

  const isSuccess = loadingStep === -1
  const isCTALoading = isLoading && variant === 'cta' && loadingStep !== undefined && loadingStep >= 0

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {isSuccess ? (
        <><Checkmark />{children}</>
      ) : isCTALoading ? (
        <><Spinner />{steps[loadingStep as 0 | 1 | 2] ?? steps[0]}</>
      ) : isLoading ? (
        <><Spinner />{children}</>
      ) : (
        children
      )}
    </button>
  )
}
