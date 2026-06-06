'use client'

import { useState } from 'react'

export function useModuleCompletion(initialCompleted: boolean) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const markComplete = () => setIsCompleted(true)
  return { isCompleted, markComplete }
}
