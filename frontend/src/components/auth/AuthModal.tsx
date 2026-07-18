'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Modal } from '@/components/ui'
import { ROUTES } from '@/constants'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

function AuthModalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('auth')
  const registered = searchParams.get('registered') === '1'
  const isOpen = mode === 'login' || mode === 'signup'

  function close() {
    router.replace(ROUTES.LANDING)
  }

  return (
    <Modal isOpen={isOpen} onClose={close}>
      {mode === 'login' && <LoginForm registered={registered} />}
      {mode === 'signup' && <SignupForm />}
    </Modal>
  )
}

// The URL (?auth=login|signup) is the single source of truth for which dialog
// is open, so deep links and hard 401 redirects to ROUTES.LOGIN/SIGNUP work
// without any extra client state.
export function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalContent />
    </Suspense>
  )
}
