interface BadgeProps {
  variant: 'concept' | 'coding' | 'simulator' | 'free' | 'pro'
  children: React.ReactNode
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  concept: 'bg-accent/10 text-accent',
  coding: 'bg-primary/10 text-primary',
  simulator: 'bg-warning/10 text-warning',
  free: 'bg-success/10 text-success',
  pro: 'bg-destructive/10 text-destructive',
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  )
}
