import type { ProfileStats } from '@/types'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function ActivityFeed({ activity }: { activity: ProfileStats['activity'] }) {
  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-foreground">Recent activity</h3>
      {activity.length === 0 ? (
        <p className="text-sm text-muted">No activity yet — complete a module to get started.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {activity.map((a, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.type === 'interview' ? 'bg-primary' : 'bg-success'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{a.label}</p>
                <p className="text-xs text-muted">{relativeTime(a.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
