import type { ProfileStats } from '@/types'

function BadgeIcon({ earned }: { earned: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="6" />
      <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
      {earned && <path d="M9.5 8l1.8 1.8L15 6" />}
    </svg>
  )
}

export function BadgeGrid({ badges }: { badges: ProfileStats['badges'] }) {
  const earnedCount = badges.filter((b) => b.earned).length
  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-foreground">Badges</h3>
        <span className="text-xs text-muted">{earnedCount}/{badges.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((b) => (
          <div
            key={b.id}
            title={b.description}
            className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center ${
              b.earned ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border bg-surface-raised text-muted opacity-60'
            }`}
          >
            <BadgeIcon earned={b.earned} />
            <span className={`text-xs font-medium ${b.earned ? 'text-foreground' : 'text-muted'}`}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
