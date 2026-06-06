'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center">
            <div className="rounded-lg border border-border bg-surface-raised p-6 text-center">
              <p className="text-sm text-destructive">Something went wrong.</p>
              <p className="mt-1 text-xs text-muted">{this.state.message}</p>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
