import { create } from 'zustand'
import type { ExecutionStatus, SimulationMetrics } from '@/types'

interface FileBuffer {
  content: string
  isDirty: boolean
  language: string
}

interface WorkspaceState {
  activeFileId: string
  files: Record<string, FileBuffer>
  setActiveFile: (id: string) => void
  upsertFile: (id: string, buf: Partial<FileBuffer>) => void

  status: ExecutionStatus
  setStatus: (s: ExecutionStatus) => void

  simulationMetrics: SimulationMetrics
  setSimulationMetrics: (m: SimulationMetrics) => void

  layout: { editorWidth: number; terminalHeight: number; simulatorVisible: boolean }
  setLayout: (l: Partial<WorkspaceState['layout']>) => void
}

export const useWorkspace = create<WorkspaceState>((set) => ({
  activeFileId: '',
  files: {},
  setActiveFile: (id) => set({ activeFileId: id }),
  upsertFile: (id, buf) =>
    set((s) => ({ files: { ...s.files, [id]: { ...s.files[id], ...buf } } })),

  status: 'IDLE',
  setStatus: (status) => set({ status }),

  simulationMetrics: { latencyMs: 0, tokenSpendUsd: 0, errorRate: 0, cacheHitRatio: 0 },
  setSimulationMetrics: (m) => set({ simulationMetrics: m }),

  layout: { editorWidth: 60, terminalHeight: 30, simulatorVisible: true },
  setLayout: (l) => set((s) => ({ layout: { ...s.layout, ...l } })),
}))
