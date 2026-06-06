'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import { clearToken } from '@/lib/auth'
import { ErrorBoundary } from '@/components/ui'
import { ModuleRouter } from '@/components/modules'
import { ROUTES } from '@/constants'
import type { Module, TrackProgress, User } from '@/types'

function ModulePageSkeleton() {
  return (
    <div className="flex h-screen animate-pulse">
      <div className="w-64 shrink-0 border-r border-border bg-surface-raised" />
      <div className="flex-1 space-y-4 px-8 py-10">
        <div className="h-8 w-72 rounded bg-surface-overlay" />
        <div className="h-4 w-full rounded bg-surface-overlay" />
        <div className="h-4 w-3/4 rounded bg-surface-overlay" />
        <div className="h-4 w-5/6 rounded bg-surface-overlay" />
      </div>
    </div>
  )
}

interface ModulePageData {
  modules: Module[]
  module: Module
  progress: TrackProgress
  user: User
}

function ModulePageContent() {
  const { trackId, moduleId } = useParams<{ trackId: string; moduleId: string }>()
  const [data, setData] = useState<ModulePageData | null>(null)
  const [notFoundFlag, setNotFoundFlag] = useState(false)

  useEffect(() => {
    Promise.all([
      api.tracks.modules(trackId),
      api.tracks.progress(trackId),
      api.auth.me(),
    ])
      .then(([modules, progress, user]) => {
        const module = modules.find(m => m.id === moduleId)
        if (!module) {
          setNotFoundFlag(true)
          return
        }
        setData({ modules, module, progress, user })
      })
      .catch((err: unknown) => {
        const status = (err as { status?: number }).status
        if (status === 401) {
          clearToken()
          window.location.replace(ROUTES.LOGIN)
        } else {
          setNotFoundFlag(true)
        }
      })
  }, [trackId, moduleId])

  if (notFoundFlag) notFound()
  if (!data) return <ModulePageSkeleton />

  return (
    <ModuleRouter
      module={data.module}
      allModules={data.modules}
      progress={data.progress}
      user={data.user}
    />
  )
}

export default function ModulePage() {
  return (
    <ErrorBoundary>
      <ModulePageContent />
    </ErrorBoundary>
  )
}
