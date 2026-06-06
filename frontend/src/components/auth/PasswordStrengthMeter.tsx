import { usePasswordStrength } from '@/hooks/usePasswordStrength'

interface PasswordStrengthMeterProps {
  password: string
}

const SEGMENT_COLORS = [
  '',
  'bg-destructive',
  'bg-warning',
  'bg-accent',
  'bg-primary',
] as const

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label } = usePasswordStrength(password)

  if (!password.length) return null

  return (
    <div className="space-y-1.5">
      <div className="flex gap-[5px]">
        {[1, 2, 3, 4].map(seg => (
          <div
            key={seg}
            className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
              seg <= score ? SEGMENT_COLORS[score] : 'bg-surface-overlay'
            }`}
          />
        ))}
      </div>
      {label && (
        <p className="text-[11px] font-mono-labels text-muted">{label}</p>
      )}
    </div>
  )
}
