'use client'

import { Badge, Button } from '@/components/ui'
import { useAccountSettings } from '@/hooks/useAccountSettings'
import type { User } from '@/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function AccountSettings({ user, onUserUpdate }: { user: User; onUserUpdate: (user: User) => void }) {
  const s = useAccountSettings(user, onUserUpdate)

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-5">
        <h3 className="mb-4 text-[15px] font-semibold text-foreground">Profile</h3>
        <form onSubmit={s.saveDisplayName} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="mb-1 block text-xs text-muted">Display name</span>
            <input
              type="text"
              value={s.displayName}
              onChange={(e) => s.setDisplayName(e.target.value)}
              placeholder={user.email}
              maxLength={50}
              required
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <Button type="submit" isLoading={s.nameStatus === 'saving'}>
            Save
          </Button>
        </form>
        {s.nameStatus === 'saved' && <p className="mt-2 text-xs text-success">Display name updated.</p>}
        {s.nameStatus === 'error' && <p className="mt-2 text-xs text-destructive">{s.nameError}</p>}
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 text-[15px] font-semibold text-foreground">Password</h3>
        <form onSubmit={s.savePassword} className="flex flex-col gap-3">
          <input
            type="password"
            value={s.currentPassword}
            onChange={(e) => s.setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="password"
              value={s.newPassword}
              onChange={(e) => s.setNewPassword(e.target.value)}
              placeholder="New password"
              minLength={8}
              required
              className="w-full flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            <input
              type="password"
              value={s.confirmPassword}
              onChange={(e) => s.setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={8}
              required
              className="w-full flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <Button type="submit" isLoading={s.passwordStatus === 'saving'} className="self-start">
            Change password
          </Button>
        </form>
        {s.passwordStatus === 'saved' && <p className="mt-2 text-xs text-success">Password changed.</p>}
        {s.passwordStatus === 'error' && <p className="mt-2 text-xs text-destructive">{s.passwordError}</p>}
      </div>

      <div className="glass-card flex flex-col gap-3 p-5 text-sm">
        <h3 className="text-[15px] font-semibold text-foreground">Account</h3>
        <div className="flex items-center justify-between">
          <span className="text-muted">Email</span>
          <span className="text-foreground">{user.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Subscription</span>
          <div className="flex items-center gap-3">
            <Badge variant={user.subscription_status === 'FREE' ? 'free' : 'pro'}>
              {user.subscription_status === 'FREE' ? 'Free' : 'Pro'}
            </Badge>
            {user.subscription_status === 'FREE' && (
              <Button variant="ghost" disabled className="px-3 py-1.5 text-xs">
                Upgrade — Coming soon
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Member since</span>
          <span className="text-foreground">{formatDate(user.created_at)}</span>
        </div>
      </div>
    </div>
  )
}
