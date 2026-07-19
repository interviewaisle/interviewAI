import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/auth'
import { sql } from '../db/client'

const XP_PER_MODULE = 100
const XP_PER_LEVEL = 500

type CompletedRow = { module_id: string; completed_at: string; track_id: string; tier_type: string; track_name: string }
type ScoreRow = { code_score: number; prompt_score: number; total_tokens: number | null; turn_count: number | null; created_at: string }
type TrackRow = { id: string; name: string; total: number }
type LeaderboardRow = { id: string; display_name: string | null; completed_count: number; score_points: number }

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// Current streak: consecutive calendar days (UTC) with activity, ending today or yesterday.
function computeStreak(dates: Date[]): number {
  const days = new Set(dates.map(ymd))
  const cursor = new Date()
  if (!days.has(ymd(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1)
  let streak = 0
  while (days.has(ymd(cursor))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}

export async function profileRoutes(app: FastifyInstance) {
  app.get('/stats', { preHandler: authenticate }, async (req, reply) => {
    const uid = req.user.id

    const completed = (await sql`
      SELECT up.module_id, up.completed_at, m.track_id, m.tier_type, t.name AS track_name
      FROM user_progress up
      JOIN modules m ON m.id = up.module_id
      JOIN tracks t ON t.id = m.track_id
      WHERE up.user_id = ${uid}
      ORDER BY up.completed_at DESC
    `) as unknown as CompletedRow[]

    const scores = (await sql`
      SELECT code_score, prompt_score, total_tokens, turn_count, created_at
      FROM interview_scores
      WHERE user_id = ${uid}
      ORDER BY created_at DESC
    `) as unknown as ScoreRow[]

    const tracks = (await sql`
      SELECT t.id, t.name, COUNT(m.id)::int AS total
      FROM tracks t LEFT JOIN modules m ON m.track_id = t.id
      GROUP BY t.id, t.name, t.created_at
      ORDER BY t.created_at ASC
    `) as unknown as TrackRow[]

    // XP + level
    const scorePoints = scores.reduce((s, r) => s + r.code_score + r.prompt_score, 0)
    const xp = completed.length * XP_PER_MODULE + scorePoints
    const level = Math.floor(xp / XP_PER_LEVEL) + 1
    const xpIntoLevel = xp % XP_PER_LEVEL

    // Streak from all activity dates
    const activityDates = [
      ...completed.map((c) => new Date(c.completed_at)),
      ...scores.map((s) => new Date(s.created_at)),
    ]
    const streakDays = computeStreak(activityDates)

    // Per-track progress
    const completedByTrack = new Map<string, number>()
    for (const c of completed) completedByTrack.set(c.track_id, (completedByTrack.get(c.track_id) ?? 0) + 1)
    const trackProgress = tracks.map((t) => {
      const done = completedByTrack.get(t.id) ?? 0
      return { track_id: t.id, name: t.name, completed: done, total: t.total, pct: t.total ? Math.round((done / t.total) * 100) : 0 }
    })

    // Aggregate stats
    const bestCode = scores.length ? Math.max(...scores.map((s) => s.code_score)) : null
    const bestPrompt = scores.length ? Math.max(...scores.map((s) => s.prompt_score)) : null

    // Badges (earned flags)
    const distinctTracks = new Set(completed.map((c) => c.track_id)).size
    const badges = [
      { id: 'first_steps', label: 'First Steps', description: 'Complete your first module', earned: completed.length >= 1 },
      { id: 'committed', label: 'Committed', description: 'Complete 5 modules', earned: completed.length >= 5 },
      { id: 'polyglot', label: 'Polyglot', description: 'Make progress in 3 tracks', earned: distinctTracks >= 3 },
      { id: 'debugger', label: 'Debugger', description: 'Take an AI interview', earned: scores.length >= 1 },
      { id: 'sharp_prompter', label: 'Sharp Prompter', description: 'Score 80+ on prompt engineering', earned: scores.some((s) => s.prompt_score >= 80) },
      { id: 'perfectionist', label: 'Perfectionist', description: 'Score 90+ on code quality', earned: scores.some((s) => s.code_score >= 90) },
      { id: 'track_master', label: 'Track Master', description: 'Complete every module in a track', earned: trackProgress.some((t) => t.total > 0 && t.completed === t.total) },
      { id: 'week_streak', label: 'Week Streak', description: 'Keep a 7-day activity streak', earned: streakDays >= 7 },
      { id: 'dedicated', label: 'Dedicated', description: 'Keep a 30-day activity streak', earned: streakDays >= 30 },
      { id: 'renaissance', label: 'Renaissance', description: 'Score 80+ on both code and prompt in one interview', earned: scores.some((s) => s.code_score >= 80 && s.prompt_score >= 80) },
    ]

    // Recent activity feed
    const activity = [
      ...completed.map((c) => ({
        type: 'module' as const,
        label: `Completed ${c.tier_type[0] + c.tier_type.slice(1).toLowerCase()} · ${c.track_name}`,
        at: c.completed_at,
      })),
      ...scores.map((s) => ({
        type: 'interview' as const,
        label: `Interview scored ${s.code_score}/${s.prompt_score} (code/prompt)`,
        at: s.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8)

    return reply.send({
      xp,
      level,
      xp_into_level: xpIntoLevel,
      xp_for_next_level: XP_PER_LEVEL,
      streak_days: streakDays,
      modules_completed: completed.length,
      interviews_taken: scores.length,
      best_code_score: bestCode,
      best_prompt_score: bestPrompt,
      tracks: trackProgress,
      badges,
      activity,
    })
  })

  app.get('/leaderboard', { preHandler: authenticate }, async (req, reply) => {
    const uid = req.user.id

    const rows = (await sql`
      SELECT u.id, u.display_name,
             COUNT(DISTINCT up.id)::int AS completed_count,
             COALESCE(SUM(isc.code_score + isc.prompt_score), 0)::int AS score_points
      FROM users u
      LEFT JOIN user_progress up ON up.user_id = u.id
      LEFT JOIN interview_scores isc ON isc.user_id = u.id
      GROUP BY u.id
    `) as unknown as LeaderboardRow[]

    const leaderboard = rows
      .map((r) => {
        const xp = r.completed_count * XP_PER_MODULE + r.score_points
        return { id: r.id, display_name: r.display_name, xp, level: Math.floor(xp / XP_PER_LEVEL) + 1 }
      })
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 20)
      .map((r, i) => ({
        rank: i + 1,
        display_name: r.display_name ?? 'Anonymous',
        xp: r.xp,
        level: r.level,
        is_current_user: r.id === uid,
      }))

    return reply.send(leaderboard)
  })
}
