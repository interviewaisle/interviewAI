'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { User } from '@/types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function errorMessage(err: unknown, fallback: string): string {
  const cast = err as { data?: { message?: string }; message?: string }
  return cast.data?.message ?? cast.message ?? fallback
}

export function useAccountSettings(user: User | null, onUserUpdate: (user: User) => void) {
  const [displayName, setDisplayName] = useState('')
  const [nameStatus, setNameStatus] = useState<SaveStatus>('idle')
  const [nameError, setNameError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<SaveStatus>('idle')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (user) setDisplayName(user.display_name ?? '')
  }, [user])

  async function saveDisplayName(e: React.FormEvent) {
    e.preventDefault()
    setNameStatus('saving')
    setNameError(null)
    try {
      const updated = await api.auth.updateProfile({ display_name: displayName.trim() })
      onUserUpdate(updated)
      setNameStatus('saved')
    } catch (err) {
      setNameError(errorMessage(err, 'Failed to update name.'))
      setNameStatus('error')
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      setPasswordStatus('error')
      return
    }
    setPasswordStatus('saving')
    try {
      await api.auth.changePassword({ current_password: currentPassword, new_password: newPassword })
      setPasswordStatus('saved')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(errorMessage(err, 'Failed to change password.'))
      setPasswordStatus('error')
    }
  }

  return {
    displayName,
    setDisplayName,
    nameStatus,
    nameError,
    saveDisplayName,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordStatus,
    passwordError,
    savePassword,
  }
}
