import { ErrorBoundary } from '@/components/ui'
import { ProfileDashboard } from '@/components/profile'

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfileDashboard />
    </ErrorBoundary>
  )
}
