export interface InfrastructureState {
  embedding_model: string
  chunk_size: number
  chunk_overlap: number
  vector_index_type: string
  cache_enabled: boolean
}

export interface SimulationMetrics {
  latency_ms: number
  token_spend_usd: number
  error_rate_percentage: number
  cache_hit_ratio: number
}

// Embedding model → output dimension count
const MODEL_DIMS: Record<string, number> = {
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
  'text-embedding-ada-002': 1536,
}

// Index type → latency multiplier (HNSW is fastest, Flat is exact but slow)
const INDEX_LATENCY_FACTOR: Record<string, number> = {
  HNSW: 1.0,
  IVFFlat: 1.35,
  Flat: 2.1,
}

const BASE_LATENCY = 45.0
const ALPHA = 12.5  // chunk size scaling weight
const BETA = 8.0    // embedding dimension scaling weight

/**
 * Deterministic metric recalculation.
 * L_retrieval = L_base + α(S_c / 512) + β·log₂(D_m), adjusted for index type and cache.
 */
export function recalculateMetrics(infra: InfrastructureState): SimulationMetrics {
  const dims = MODEL_DIMS[infra.embedding_model] ?? 1536
  const chunkRatio = infra.chunk_size / 512
  const indexFactor = INDEX_LATENCY_FACTOR[infra.vector_index_type] ?? 1.0

  let latencyMs = (BASE_LATENCY + (ALPHA * chunkRatio) + (BETA * Math.log2(dims))) * indexFactor

  // Cache cuts latency significantly for repeated queries
  if (infra.cache_enabled) latencyMs *= 0.65

  // Token spend scales with chunk size and model dimension cost
  const tokenSpendUsd = chunkRatio * 0.002 * (dims / 1536)

  // Cache hit ratio: larger chunks = fewer unique queries = better cache reuse
  // Cache disabled → 0 by definition
  const cacheHitRatio = infra.cache_enabled
    ? Math.min(0.97, 0.55 + chunkRatio * 0.09)
    : 0

  // Overlap as a fraction of chunk introduces redundant context → slightly raises error rate
  const overlapFactor = infra.chunk_overlap / infra.chunk_size
  const errorRate = Math.max(0.001, 0.025 - chunkRatio * 0.005 + overlapFactor * 0.012)

  return {
    latency_ms: round(latencyMs, 1),
    token_spend_usd: round(tokenSpendUsd, 4),
    cache_hit_ratio: round(cacheHitRatio, 2),
    error_rate_percentage: round(errorRate, 3),
  }
}

export const DEFAULT_INFRA: InfrastructureState = {
  embedding_model: 'text-embedding-3-small',
  chunk_size: 512,
  chunk_overlap: 50,
  vector_index_type: 'HNSW',
  cache_enabled: true,
}

function round(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(n * factor) / factor
}
