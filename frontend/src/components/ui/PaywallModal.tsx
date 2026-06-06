import { Modal } from './Modal'
import { Button } from './Button'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 text-warning"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  )
}

export function PaywallModal({ isOpen, onClose, message }: PaywallModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 text-center">
        <LockIcon />
        <h2 className="text-xl font-semibold text-foreground">Pro Required</h2>
        <p className="text-sm text-muted">{message}</p>
        <Button variant="primary" disabled className="w-full">
          Coming Soon
        </Button>
      </div>
    </Modal>
  )
}
