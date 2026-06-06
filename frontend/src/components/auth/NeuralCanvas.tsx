'use client'

import { useEffect, useRef } from 'react'
import { buildGraph, tickGraph, type Graph } from './neuralGraph'
import { drawFrame, type CanvasColors } from './neuralDraw'

export function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas API cannot consume CSS variables — read computed values at mount
    const style = getComputedStyle(document.documentElement)
    const colors: CanvasColors = {
      isDark: document.documentElement.classList.contains('dark'),
      cyan: style.getPropertyValue('--gradient-start').trim() || '#06B6D4',
      indigo: style.getPropertyValue('--gradient-end').trim() || '#6366F1',
    }

    let graph: Graph
    let raf: number
    let frame = 0

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      graph = buildGraph(canvas!.width, canvas!.height)
      frame = 0
    }

    function animate() {
      graph = tickGraph(graph, canvas!.width, canvas!.height, frame++)
      drawFrame(ctx!, graph, colors)
      raf = requestAnimationFrame(animate)
    }

    resize()
    animate()

    const ro = new ResizeObserver(resize)
    ro.observe(document.body)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
