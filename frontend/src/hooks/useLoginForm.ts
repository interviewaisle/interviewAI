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

  const isLoading = loadingStep !== null && loadingStep !== -1

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoadingStep(0)
    await delay(800)
    setLoadingStep(1)
    await delay(800)
    setLoadingStep(2)

    try {
      const data = await api.auth.login({ email, password })
      setToken(data.access_token)
      setLoadingStep(-1)
      await delay(1600)
      router.replace(ROUTES.TRACKS)
    } catch (err: unknown) {
      const cast = err as { data?: { message?: string }; message?: string }
      setError(cast.data?.message ?? cast.message ?? 'Login failed')
      setLoadingStep(null)
    }
  }

  return { email, setEmail, password, setPassword, error, isLoading, loadingStep, onSubmit }
}
