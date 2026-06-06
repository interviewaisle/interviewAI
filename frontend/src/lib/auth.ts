import { STORAGE_KEYS } from '@/constants/storage'

export const getToken = (): string | null =>
  typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    : null

export const setToken = (t: string): void =>
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, t)

export const clearToken = (): void =>
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
