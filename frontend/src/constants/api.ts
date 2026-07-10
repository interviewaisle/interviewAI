export const WS_ACTIONS = {
  MUTATE_CONFIG: 'MUTATE_CONFIG',
} as const

export const WS_FRAME_TYPES = {
  STATE_SYNC: 'STATE_SYNC',
  STDOUT: 'STDOUT',
  STDERR: 'STDERR',
  EXIT: 'EXIT',
} as const

export const API_PATHS = {
  AUTH_SIGNUP: '/api/v1/auth/signup',
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_ME: '/api/v1/auth/me',
  TRACKS: '/api/v1/tracks',
  TRACK_MODULES: (trackId: string) => `/api/v1/tracks/${trackId}/modules`,
  TRACK_PROGRESS: (trackId: string) => `/api/v1/tracks/${trackId}/progress`,
  MODULE_COMPLETE: (trackId: string, moduleId: string) => `/api/v1/tracks/${trackId}/modules/${moduleId}/complete`,
  PROFILE_STATS: '/api/v1/profile/stats',
  SUBMISSIONS_RUN: '/api/v1/submissions/run',
  SIMULATOR_STREAM: '/api/v1/simulator/stream',
  INTERVIEW_CHAT: '/api/v1/interview/chat',
  INTERVIEW_EVALUATE: '/api/v1/interview/evaluate',
} as const
