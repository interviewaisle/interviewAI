export const ROUTES = {
  LANDING: '/',
  HOME: '/home',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
  TRACKS: '/tracks',
  TRACK_DETAIL: (trackId: string) => `/tracks/${trackId}`,
  MODULE_DETAIL: (trackId: string, moduleId: string) =>
    `/tracks/${trackId}/modules/${moduleId}`,
} as const
