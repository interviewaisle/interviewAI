'use client'

import { useState, useEffect } from 'react'
import { STORAGE_KEYS } from '@/constants'

type Theme = 'dark' | 'light'

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Sync with DOM state set by the anti-FOUC script in layout.tsx
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  function toggleTheme() {
    setTheme(current => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      if (next === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem(STORAGE_KEYS.THEME, next)
      return next
    })
  }

  return { theme, toggleTheme }
}
