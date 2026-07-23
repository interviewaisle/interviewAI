import type { Module, TrackProgress, User } from '@/types'
import { ConceptModule } from './ConceptModule'
import { CodingModule } from './CodingModule'
import { SimulatorModule } from './SimulatorModule'
import { InterviewModule } from './InterviewModule'

interface ModuleRouterProps {
  module: Module
  allModules: Module[]
  progress: TrackProgress
  user: User
}

export function ModuleRouter({ module, allModules, progress, user }: ModuleRouterProps) {
  const shared = { module, allModules, progress, user }
  // key={module.id} forces a full remount when navigating between two
  // modules of the same tier_type — without it, CodingModule/InterviewModule
  // reuse the same instance and their "seed once on mount" effects never
  // re-run, leaving Monaco showing the previous module's stale file content.
  switch (module.tier_type) {
    case 'CONCEPT':
      return <ConceptModule key={module.id} {...shared} />
    case 'CODING':
      return <CodingModule key={module.id} {...shared} />
    case 'SIMULATOR':
      return <SimulatorModule key={module.id} {...shared} />
    case 'INTERVIEW':
      return <InterviewModule key={module.id} {...shared} />
  }
}
