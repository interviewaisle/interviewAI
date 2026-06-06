import { ElementType, ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  as?: ElementType
  className?: string
}

export function GradientText({ children, as: Tag = 'span', className = '' }: GradientTextProps) {
  return (
    <Tag className={`gradient-text ${className}`}>
      {children}
    </Tag>
  )
}
