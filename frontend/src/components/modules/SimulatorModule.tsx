'use client'
import Link from 'next/link'
import { useSimulatorSocket } from '@/hooks/useSimulatorSocket'
import { PlatformHeader } from '@/components/layout'
import { SimulatorConfigPanel } from './SimulatorConfigPanel'
import { SimulatorMetricsPanel } from './SimulatorMetricsPanel'
import { ROUTES } from '@/constants'
import type { Module, TrackProgress, User } from '@/types'

interface SimulatorModuleProps {
  module: Module
  allModules: Module[]
  progress: TrackProgress
  user: User
}

export function SimulatorModule({ module }: SimulatorModuleProps) {
  const { mutateConfig, isConnected } = useSimulatorSocket(module.id)

  const connStatus = (
    <span className={`flex items-center gap-1.5 text-xs font-mono-labels ${isConnected ? 'text-success' : 'text-muted'}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-muted'}`} />
      {isConnected ? 'Connected' : 'Connecting…'}
    </span>
  )

  return (
    <div className="bg-surface flex h-screen flex-col overflow-hidden">
      <PlatformHeader
        position="static"
        center={
          <>
            <Link href={ROUTES.TRACK_DETAIL(module.track_id)} className="back-link shrink-0">← Track</Link>
            <span className="header-sep" />
            <span className="text-sm font-medium text-foreground truncate">Simulator · Stage {module.stage_index + 1}</span>
          </>
        }
        rightExtra={connStatus}
      />
      <div className="flex flex-1 overflow-hidden">
        <SimulatorConfigPanel mutateConfig={mutateConfig} />
        <SimulatorMetricsPanel />
      </div>
    </div>
  )
}
