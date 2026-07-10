'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { clearToken } from '@/lib/auth'
import { ROUTES } from '@/constants'

interface UserMenuProps {
  email?: string
}

export function UserMenu({ email }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const initial = (email?.[0] ?? '?').toUpperCase()

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function logOut() {
    clearToken()
    router.replace(ROUTES.LOGIN)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="user-avatar"
        title="Account"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg"
        >
          <div className="border-b border-border px-3.5 py-3">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">
              {email ?? 'Unknown'}
            </p>
          </div>
          <Link
            href={ROUTES.PROFILE}
            role="menuitem"
            className="block px-3.5 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-overlay"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button
            role="menuitem"
            onClick={logOut}
            className="block w-full px-3.5 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-surface-overlay"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
