import type { ProfileStats } from '@/types'

export function TrackProgressList({ tracks }: { tracks: ProfileStats['tracks'] }) {
  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-foreground">Track progress</h3>
      <div className="flex flex-col gap-4">
        {tracks.map((t) => (
          <div key={t.track_id}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm text-foreground">{t.name}</span>
              <span className="text-xs text-muted">{t.completed}/{t.total}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-overlay">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${t.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
