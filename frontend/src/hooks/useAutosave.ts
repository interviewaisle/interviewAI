'use client'

import { useEffect } from 'react'
import { useWorkspace } from '@/store/workspace'
import { STORAGE_KEYS } from '@/constants'

export function useAutosave(moduleId: string) {
  const files = useWorkspace((s) => s.files)

  useEffect(() => {
    const timer = setTimeout(() => {
      const dirty: Record<string, string> = {}
      for (const [name, buf] of Object.entries(files)) {
        if (buf.isDirty) dirty[name] = buf.content
      }
      if (Object.keys(dirty).length === 0) return
      try {
        localStorage.setItem(STORAGE_KEYS.codeDraft(moduleId), JSON.stringify(dirty))
      } catch { /* storage full — silent */ }
    }, 1500)

    return () => clearTimeout(timer)
  }, [files, moduleId])
}

export function loadDraft(moduleId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.codeDraft(moduleId))
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

export function clearDraft(moduleId: string) {
  try {
    localStorage.removeItem(STORAGE_KEYS.codeDraft(moduleId))
  } catch { /* ignore */ }
}
