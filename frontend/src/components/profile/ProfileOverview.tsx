import Link from 'next/link'
import { ROUTES } from '@/constants'
import type { ProfileStats } from '@/types'
import { TrackProgressList } from './TrackProgressList'
import { BadgeGrid } from './BadgeGrid'
import { ActivityFeed } from './ActivityFeed'

function GettingStarted() {
  return (
    <div className="glass-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Start your journey 🚀</h3>
        <p className="mt-1 text-sm text-secondary">
          Complete your first module to earn XP, start a streak, and unlock badges. Your progress shows up here.
        </p>
      </div>
      <Link
        href={ROUTES.TRACKS}
        className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Browse tracks →
      </Link>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  )
}

export function ProfileOverview({ stats }: { stats: ProfileStats }) {
  return (
    <div className="flex flex-col gap-4">
      {stats.modules_completed === 0 && stats.interviews_taken === 0 && <GettingStarted />}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Modules completed" value={String(stats.modules_completed)} />
        <StatTile label="Interviews taken" value={String(stats.interviews_taken)} />
        <StatTile label="Best code score" value={stats.best_code_score !== null ? String(stats.best_code_score) : '—'} />
        <StatTile label="Best prompt score" value={stats.best_prompt_score !== null ? String(stats.best_prompt_score) : '—'} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TrackProgressList tracks={stats.tracks} />
        <ActivityFeed activity={stats.activity} />
      </div>

      <BadgeGrid badges={stats.badges} />
    </div>
  )
}
