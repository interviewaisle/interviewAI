'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export function useModuleCompletion(initialCompleted: boolean, trackId?: string, moduleId?: string) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)

  const markComplete = () => {
    setIsCompleted(true) // optimistic
    if (trackId && moduleId) {
      // Persist; ignore errors so the UI never blocks on it.
      api.tracks.complete(trackId, moduleId).catch(() => {})
    }
  }

  return { isCompleted, markComplete }
}
