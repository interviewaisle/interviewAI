import type { Module } from '@/types'

// Modules arrive from the API already ordered by stage_index; the next module
// is simply the following entry, or null if this is the last one.
export function getNextModule(allModules: Module[], currentId: string): Module | null {
  const idx = allModules.findIndex((m) => m.id === currentId)
  if (idx < 0 || idx >= allModules.length - 1) return null
  return allModules[idx + 1]
}
