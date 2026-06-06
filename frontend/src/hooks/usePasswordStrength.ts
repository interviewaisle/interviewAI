const LABELS = ['', 'Weak', 'Fair', 'Strong', 'Excellent'] as const

export function usePasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4
  label: string
} {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++
  return { score: score as 0 | 1 | 2 | 3 | 4, label: LABELS[score] }
}
