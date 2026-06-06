'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  ph: number
}

interface CanvasState {
  w: number
  h: number
  pts: Point[]
}

export function SparseMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const stRef = useRef<CanvasState | null>(null)

  const setupCanvas = useCallback((isDark: boolean) => {
    const cv = canvasRef.current
    if (!cv) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = cv.clientWidth
    const h = cv.clientHeight
    cv.width = w * dpr
    cv.height = h * dpr
    cv.getContext('2d')?.scale(dpr, dpr)

    stRef.current = {
      w,
      h,
      pts: Array.from({ length: 36 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1.3 + Math.random() * 1.5,
        ph: Math.random() * Math.PI * 2,
      })),
    }

    const tick = () => {
      const st = stRef.current
      if (!st) { animRef.current = requestAnimationFrame(tick); return }
      const { pts, w: sw, h: sh } = st
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, sw, sh)

      const MAXD = Math.min(sw, sh) * 0.40

      pts.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.ph += 0.005
        if (p.x < 0 || p.x > sw) p.vx *= -1
        if (p.y < 0 || p.y > sh) p.vy *= -1
      })

      ctx.lineWidth = 0.75
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < MAXD) {
            const t = d / MAXD
            const a = isDark
              ? (0.36 * (1 - t * t)).toFixed(3)
              : (0.18 * (1 - t * t)).toFixed(3)
            const isViolet = (i + j) % 3 === 0
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = isDark
              ? (isViolet ? `rgba(170,150,235,${a})` : `rgba(125,200,235,${a})`)
              : `rgba(110,148,190,${a})`
            ctx.stroke()
          }
        }
      }

      pts.forEach((p, i) => {
        const g = (Math.sin(p.ph) + 1) * 0.5
        const rr = p.r * (0.85 + g * 0.32)
        const isViolet = i % 4 === 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, rr, 0, Math.PI * 2)
        ctx.fillStyle = isDark
          ? (isViolet
            ? `rgba(190,170,240,${(0.55 + g * 0.28).toFixed(3)})`
            : `rgba(155,210,240,${(0.52 + g * 0.28).toFixed(3)})`)
          : `rgba(110,148,190,${(0.30 + g * 0.14).toFixed(3)})`
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(tick)
    }

    tick()
  }, [])

  useEffect(() => {
    let isDark = document.documentElement.classList.contains('dark')

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(animRef.current)
      isDark = document.documentElement.classList.contains('dark')
      setupCanvas(isDark)
    })
    if (canvasRef.current) ro.observe(canvasRef.current)

    const mo = new MutationObserver(() => {
      const next = document.documentElement.classList.contains('dark')
      if (next !== isDark) {
        isDark = next
        cancelAnimationFrame(animRef.current)
        setupCanvas(isDark)
      }
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    setupCanvas(isDark)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
      mo.disconnect()
    }
  }, [setupCanvas])

  return (
    <canvas
      ref={canvasRef}
      className="sparse-mesh fixed inset-0 z-0 pointer-events-none w-full h-full"
      aria-hidden="true"
    />
  )
}
