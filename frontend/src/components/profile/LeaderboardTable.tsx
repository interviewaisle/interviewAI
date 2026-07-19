'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { LeaderboardEntry } from '@/types'

export function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)

  useEffect(() => {
    api.profile.leaderboard().then(setEntries).catch(() => setEntries([]))
  }, [])

  if (!entries) {
    return <div className="glass-card h-64 animate-pulse" />
  }

  if (entries.length === 0) {
    return (
      <div className="glass-card p-5">
        <p className="text-sm text-muted">No leaderboard data yet — complete a module to appear here.</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-foreground">Leaderboard</h3>
      <ul className="flex flex-col gap-1.5">
        {entries.map((entry) => (
          <li
            key={entry.rank}
            className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 ${
              entry.is_current_user ? 'border-primary/30 bg-primary/5' : 'border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-sm font-semibold text-muted">#{entry.rank}</span>
              <span className={`text-sm ${entry.is_current_user ? 'font-semibold text-primary' : 'text-foreground'}`}>
                {entry.display_name}
                {entry.is_current_user && ' (you)'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>Level {entry.level}</span>
              <span className="font-medium text-foreground">{entry.xp.toLocaleString()} XP</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
