export const STORAGE_KEYS = {
  AUTH_TOKEN: 'interviewai_token',
  THEME: 'iai-theme',
  codeDraft: (moduleId: string) => `iai-draft-${moduleId}`,
} as const
