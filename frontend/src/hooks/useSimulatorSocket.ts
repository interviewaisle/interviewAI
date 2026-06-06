'use client'
import { useEffect, useRef, useState } from 'react'
import { getToken } from '@/lib/auth'
import { useWorkspace } from '@/store/workspace'
import { WS_ACTIONS, API_PATHS } from '@/constants'
import type { WsFrame } from '@/types'

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001')
  .replace(/^http/, 'ws')

export function useSimulatorSocket(moduleId: string) {
  const socketRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const setMetrics = useWorkspace((s) => s.setSimulationMetrics)

  useEffect(() => {
    const token = getToken()
    if (!token || !moduleId) return

    const ws = new WebSocket(
      `${WS_BASE}${API_PATHS.SIMULATOR_STREAM}?token=${token}&moduleId=${moduleId}`
    )
    socketRef.current = ws

    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onerror = (e) => console.error('[SimulatorSocket] error', e)

    ws.onmessage = (event) => {
      const frame = JSON.parse(event.data as string) as WsFrame
      if (frame.type === 'STATE_SYNC') {
        setMetrics({
          latencyMs: frame.metrics.latency_ms,
          tokenSpendUsd: frame.metrics.token_spend_usd,
          errorRate: frame.metrics.error_rate_percentage,
          cacheHitRatio: frame.metrics.cache_hit_ratio,
        })
      }
    }

    return () => ws.close()
  }, [moduleId, setMetrics])

  const mutateConfig = (key: string, value: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ action: WS_ACTIONS.MUTATE_CONFIG, key, value })
      )
    }
  }

  return { mutateConfig, isConnected }
}
