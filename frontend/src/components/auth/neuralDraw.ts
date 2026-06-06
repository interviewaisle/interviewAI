import type { Graph } from './neuralGraph'

export interface CanvasColors {
  isDark: boolean
  cyan: string
  indigo: string
}

export function drawFrame(ctx: CanvasRenderingContext2D, graph: Graph, colors: CanvasColors): void {
  const { isDark, cyan, indigo } = colors
  const { width, height } = ctx.canvas
  const nodes = graph.nodes

  ctx.clearRect(0, 0, width, height)

  // 1. Triangle fills
  ctx.fillStyle = indigo
  ctx.globalAlpha = isDark ? 0.032 : 0.022
  for (const [ai, bi, ci] of graph.triangles) {
    ctx.beginPath()
    ctx.moveTo(nodes[ai].x, nodes[ai].y)
    ctx.lineTo(nodes[bi].x, nodes[bi].y)
    ctx.lineTo(nodes[ci].x, nodes[ci].y)
    ctx.closePath()
    ctx.fill()
  }

  // 2. Regular edges
  ctx.strokeStyle = cyan
  ctx.lineWidth = 0.6
  ctx.globalAlpha = isDark ? 0.17 : 0.10
  for (const edge of graph.edges) {
    if (edge.isPathway) continue
    ctx.beginPath()
    ctx.moveTo(nodes[edge.a].x, nodes[edge.a].y)
    ctx.lineTo(nodes[edge.b].x, nodes[edge.b].y)
    ctx.stroke()
  }

  // 3. Pathway edges (hub-connected)
  ctx.lineWidth = 1
  ctx.globalAlpha = isDark ? 0.38 : 0.19
  for (const edge of graph.edges) {
    if (!edge.isPathway) continue
    ctx.beginPath()
    ctx.moveTo(nodes[edge.a].x, nodes[edge.a].y)
    ctx.lineTo(nodes[edge.b].x, nodes[edge.b].y)
    ctx.stroke()
  }

  // 4. Regular nodes
  ctx.fillStyle = cyan
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
  for (const node of nodes) {
    if (node.type !== 'regular') continue
    ctx.beginPath()
    ctx.arc(node.x, node.y, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  // 5. Hub nodes — 2px radius, soft glow in dark
  for (const node of nodes) {
    if (node.type !== 'hub') continue
    const color = node.hubColor === 'purple' ? indigo : cyan
    ctx.fillStyle = color
    ctx.globalAlpha = isDark ? 1 : 0.7
    ctx.shadowColor = color
    ctx.shadowBlur = isDark ? 6 : 0
    ctx.beginPath()
    ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // 6. Crystal center nodes — 3.5px, radial glow halo + outer ring
  for (const node of nodes) {
    if (node.type !== 'crystal') continue
    const color = node.hubColor === 'purple' ? indigo : cyan
    ctx.fillStyle = color
    ctx.globalAlpha = 1
    ctx.shadowColor = color
    ctx.shadowBlur = isDark ? 12 : 4
    ctx.beginPath()
    ctx.arc(node.x, node.y, 3.5, 0, Math.PI * 2)
    ctx.fill()
    // Outer ring
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.globalAlpha = isDark ? 0.4 : 0.2
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.arc(node.x, node.y, 7, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Reset context state
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
}
