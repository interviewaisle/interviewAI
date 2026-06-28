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
  switch (module.tier_type) {
    case 'CONCEPT':
      return <ConceptModule {...shared} />
    case 'CODING':
      return <CodingModule {...shared} />
    case 'SIMULATOR':
      return <SimulatorModule {...shared} />
    case 'INTERVIEW':
      return <InterviewModule {...shared} />
  }
}
