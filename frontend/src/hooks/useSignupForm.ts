'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ROUTES } from '@/constants'

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export function useSignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadingStep, setLoadingStep] = useState<number | null>(null)

  const isLoading = loadingStep !== null && loadingStep !== -1

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Real loading state during the actual request — no artificial delay.
    setLoadingStep(0)

    try {
      await api.auth.signup({ email, password })
      setLoadingStep(-1) // brief success tick
      await delay(400)
      router.replace(ROUTES.LOGIN + '?registered=1')
    } catch (err: unknown) {
      const cast = err as { data?: { message?: string }; message?: string }
      setError(cast.data?.message ?? cast.message ?? 'Signup failed')
      setLoadingStep(null)
    }
  }

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error, isLoading, loadingStep, onSubmit,
  }
}
