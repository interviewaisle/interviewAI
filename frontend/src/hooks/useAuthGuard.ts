'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, clearToken } from '@/lib/auth'
import { api } from '@/lib/api'
import { ROUTES } from '@/constants'

export function useAuthGuard() {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace(ROUTES.LOGIN)
      return
    }

    api.auth
      .me()
      .then(() => setIsVerified(true))
      .catch((err: unknown) => {
        clearToken()
        const status = (err as { status?: number }).status
        if (status === 401 || status === undefined) {
          router.replace(ROUTES.LOGIN)
        } else {
          router.replace(ROUTES.LOGIN)
        }
      })
  }, [router])

  return { isVerified }
}
