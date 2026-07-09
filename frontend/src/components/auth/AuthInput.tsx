'use client'

import { InputHTMLAttributes, useState } from 'react'
import styles from './AuthInput.module.css'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  showToggle?: boolean
}

export function AuthInput({
  label,
  error,
  showToggle,
  type,
  className = '',
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = showToggle ? (showPassword ? 'text' : 'password') : type

  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`${styles.input} w-full h-[52px] rounded-xl px-4 ${showToggle ? 'pr-11' : ''} text-[14.5px] text-foreground placeholder:text-muted ${className}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  )
}
