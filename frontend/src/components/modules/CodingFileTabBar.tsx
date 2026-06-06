'use client'

interface Tab {
  id: string
  name: string
}

interface CodingFileTabBarProps {
  tabs: Tab[]
  activeId: string
  onSelect: (id: string) => void
}

export function CodingFileTabBar({ tabs, activeId, onSelect }: CodingFileTabBarProps) {
  return (
    <div className="flex flex-shrink-0 overflow-x-auto border-b border-border bg-surface">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={`flex-shrink-0 border-r border-border px-4 py-2 text-xs font-medium transition-colors focus:outline-none ${
            tab.id === activeId
              ? 'bg-surface-raised text-foreground'
              : 'text-muted hover:bg-surface-raised hover:text-foreground'
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  )
}
