/**
 * Leaky bucket for WebSocket outbound frames.
 *
 * Drops intermediate state updates when mutations arrive faster than the client
 * can consume them. Only the latest state is ever flushed, guaranteeing the
 * client always sees a deterministic snapshot rather than a backlog.
 */
export class LeakyBucket {
  private pendingFrame: unknown = null
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  private readonly intervalMs: number

  constructor(intervalMs = 50) {
    this.intervalMs = intervalMs
  }

  push(frame: unknown, send: (data: string) => void): void {
    this.pendingFrame = frame  // replace — intermediate frames are intentionally dropped

    if (this.flushTimer === null) {
      this.flushTimer = setTimeout(() => {
        if (this.pendingFrame !== null) {
          try {
            send(JSON.stringify(this.pendingFrame))
          } catch {
            // socket closed between schedule and flush — safe to ignore
          }
          this.pendingFrame = null
        }
        this.flushTimer = null
      }, this.intervalMs)
    }
  }

  destroy(): void {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    this.pendingFrame = null
  }
}
