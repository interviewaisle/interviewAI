export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  TRACKS: '/tracks',
  TRACK_DETAIL: (trackId: string) => `/tracks/${trackId}`,
  MODULE_DETAIL: (trackId: string, moduleId: string) =>
    `/tracks/${trackId}/modules/${moduleId}`,
} as const
