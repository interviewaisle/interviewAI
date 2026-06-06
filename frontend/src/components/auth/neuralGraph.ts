export interface GraphNode {
  x: number
  y: number
  vx: number
  vy: number
  type: 'regular' | 'hub' | 'crystal'
  hubColor: 'purple' | 'cyan'
}

export interface GraphEdge {
  a: number
  b: number
  isPathway: boolean
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  triangles: [number, number, number][]
}

function nodeDist(a: GraphNode, b: GraphNode): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function buildConnections(nodes: GraphNode[], threshold: number) {
  const adj: Set<number>[] = nodes.map(() => new Set<number>())
  const hubSet = new Set(nodes.map((n, i) => (n.type !== 'regular' ? i : -1)).filter(i => i >= 0))

  for (let i = 0; i < nodes.length; i++) {
    const neighbors = nodes
      .map((_, j) => j)
      .filter(j => j !== i && nodeDist(nodes[i], nodes[j]) < threshold)
      .sort((a, b) => nodeDist(nodes[i], nodes[a]) - nodeDist(nodes[i], nodes[b]))
      .slice(0, 5)
    for (const j of neighbors) {
      adj[i].add(j)
      adj[j].add(i)
    }
  }

  const edges: GraphEdge[] = []
  const seen = new Set<string>()
  for (let i = 0; i < nodes.length; i++) {
    for (const j of adj[i]) {
      if (i < j && !seen.has(`${i}-${j}`)) {
        seen.add(`${i}-${j}`)
        edges.push({ a: i, b: j, isPathway: hubSet.has(i) || hubSet.has(j) })
      }
    }
  }

  const triangles: [number, number, number][] = []
  for (let i = 0; i < nodes.length; i++) {
    for (const j of adj[i]) {
      if (j > i) {
        for (const k of adj[j]) {
          if (k > j && adj[i].has(k)) triangles.push([i, j, k])
        }
      }
    }
  }

  return { edges, triangles }
}

export function buildGraph(width: number, height: number): Graph {
  const nodes: GraphNode[] = []
  const spd = () => (Math.random() - 0.5) * 0.2

  // Irregular 10×7 grid, skip ~12%
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 10; c++) {
      if (Math.random() < 0.12) continue
      nodes.push({
        x: (c + 0.1 + Math.random() * 0.8) * (width / 10),
        y: (r + 0.1 + Math.random() * 0.8) * (height / 7),
        vx: spd(), vy: spd(),
        type: 'regular', hubColor: 'cyan',
      })
    }
  }

  // 2–4 crystal clusters
  const clusters = 2 + Math.floor(Math.random() * 3)
  for (let ci = 0; ci < clusters; ci++) {
    const cx = width * (0.1 + Math.random() * 0.8)
    const cy = height * (0.1 + Math.random() * 0.8)
    const color = ci % 2 === 0 ? 'purple' : 'cyan' as const
    nodes.push({ x: cx, y: cy, vx: spd(), vy: spd(), type: 'crystal', hubColor: color })
    const spokes = 5 + Math.floor(Math.random() * 4)
    for (let s = 0; s < spokes; s++) {
      const angle = (s / spokes) * Math.PI * 2
      const r = 40 + Math.random() * 30
      const sx = cx + Math.cos(angle) * r
      const sy = cy + Math.sin(angle) * r
      nodes.push({ x: sx, y: sy, vx: spd(), vy: spd(), type: 'hub', hubColor: color })
      const fa = angle + (Math.random() - 0.5) * 0.8
      const fr = 15 + Math.random() * 15
      nodes.push({ x: sx + Math.cos(fa) * fr, y: sy + Math.sin(fa) * fr, vx: spd(), vy: spd(), type: 'regular', hubColor: 'cyan' })
    }
  }

  const threshold = 0.22 * Math.min(width, height)
  const { edges, triangles } = buildConnections(nodes, threshold)
  return { nodes, edges, triangles }
}

export function tickGraph(graph: Graph, width: number, height: number, frame: number): Graph {
  for (const node of graph.nodes) {
    node.x += node.vx
    node.y += node.vy
    if (node.x < 0 || node.x > width) { node.vx *= -1; node.x = Math.max(0, Math.min(width, node.x)) }
    if (node.y < 0 || node.y > height) { node.vy *= -1; node.y = Math.max(0, Math.min(height, node.y)) }
  }
  if (frame % 100 === 0) {
    const threshold = 0.22 * Math.min(width, height)
    const { edges, triangles } = buildConnections(graph.nodes, threshold)
    return { ...graph, edges, triangles }
  }
  return graph
}
