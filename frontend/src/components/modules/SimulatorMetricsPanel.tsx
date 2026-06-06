'use client'
import { useWorkspace } from '@/store/workspace'

interface MetricCardProps {
  label: string
  value: string
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="glass-card p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted font-mono-labels">{label}</p>
      <p
        className="text-2xl font-semibold tabular-nums text-foreground"
        style={{ transition: 'all 300ms ease' }}
      >
        {value}
      </p>
    </div>
  )
}

export function SimulatorMetricsPanel() {
  const metrics = useWorkspace((s) => s.simulationMetrics)

  return (
    <main className="flex-1 overflow-y-auto bg-surface p-8">
      <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted font-mono-labels">
        Live Metrics
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Latency"
          value={`${metrics.latencyMs.toFixed(1)} ms`}
        />
        <MetricCard
          label="Token Spend"
          value={`$${metrics.tokenSpendUsd.toFixed(4)}`}
        />
        <MetricCard
          label="Error Rate"
          value={`${(metrics.errorRate * 100).toFixed(1)}%`}
        />
        <MetricCard
          label="Cache Hit Ratio"
          value={`${(metrics.cacheHitRatio * 100).toFixed(1)}%`}
        />
      </div>
    </main>
  )
}
