export type ProfileTab = 'overview' | 'leaderboard' | 'settings'

const TABS: { id: ProfileTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'settings', label: 'Settings' },
]

interface ProfileTabsProps {
  active: ProfileTab
  onChange: (tab: ProfileTab) => void
}

export function ProfileTabs({ active, onChange }: ProfileTabsProps) {
  return (
    <div className="mb-4 flex gap-1 border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            active === tab.id
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
