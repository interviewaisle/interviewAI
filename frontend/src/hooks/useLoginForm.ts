'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { setToken } from '@/lib/auth'
import { ROUTES } from '@/constants'

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export function useLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadingStep, setLoadingStep] = useState<number | null>(null)
  const [slowHint, setSlowHint] = useState(false)

  const isLoading = loadingStep !== null && loadingStep !== -1

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Show a real loading state during the actual request — no artificial delay.
    setLoadingStep(0)
    setSlowHint(false)
    // If the request drags (free-tier cold start), tell the user what's happening.
    const slowTimer = setTimeout(() => setSlowHint(true), 3000)

    try {
      const data = await api.auth.login({ email, password })
      clearTimeout(slowTimer)
      setSlowHint(false)
      setToken(data.access_token)
      setLoadingStep(-1) // brief success tick
      await delay(400)
      router.replace(ROUTES.HOME)
    } catch (err: unknown) {
      clearTimeout(slowTimer)
      setSlowHint(false)
      const cast = err as { data?: { message?: string }; message?: string }
      setError(cast.data?.message ?? cast.message ?? 'Login failed')
      setLoadingStep(null)
    }
  }

  return { email, setEmail, password, setPassword, error, isLoading, loadingStep, slowHint, onSubmit }
}
