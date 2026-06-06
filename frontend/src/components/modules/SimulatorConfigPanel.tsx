'use client'
import { useState } from 'react'

type EmbeddingModel =
  | 'text-embedding-3-small'
  | 'text-embedding-3-large'
  | 'text-embedding-ada-002'
type VectorIndexType = 'HNSW' | 'IVFFlat' | 'Flat'

interface SimulatorConfigPanelProps {
  mutateConfig: (key: string, value: unknown) => void
}

export function SimulatorConfigPanel({ mutateConfig }: SimulatorConfigPanelProps) {
  const [chunkSize, setChunkSize] = useState(512)
  const [chunkOverlap, setChunkOverlap] = useState(50)
  const [embeddingModel, setEmbeddingModel] = useState<EmbeddingModel>('text-embedding-3-small')
  const [vectorIndexType, setVectorIndexType] = useState<VectorIndexType>('HNSW')
  const [cacheEnabled, setCacheEnabled] = useState(true)

  return (
    <aside className="module-sidebar w-80 flex-shrink-0 overflow-y-auto p-6">
      <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted font-mono-labels">
        Infrastructure Config
      </h2>
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-foreground">Chunk Size</span>
            <span className="font-mono text-accent">{chunkSize}</span>
          </div>
          <input
            type="range"
            min={128}
            max={2048}
            step={128}
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            onMouseUp={(e) =>
              mutateConfig('chunk_size', Number((e.target as HTMLInputElement).value))
            }
            onTouchEnd={(e) =>
              mutateConfig('chunk_size', Number((e.target as HTMLInputElement).value))
            }
            className="w-full accent-primary"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-foreground">Chunk Overlap</span>
            <span className="font-mono text-accent">{chunkOverlap}</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            step={10}
            value={chunkOverlap}
            onChange={(e) => setChunkOverlap(Number(e.target.value))}
            onMouseUp={(e) =>
              mutateConfig('chunk_overlap', Number((e.target as HTMLInputElement).value))
            }
            onTouchEnd={(e) =>
              mutateConfig('chunk_overlap', Number((e.target as HTMLInputElement).value))
            }
            className="w-full accent-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-foreground">Embedding Model</label>
          <select
            value={embeddingModel}
            onChange={(e) => {
              const val = e.target.value as EmbeddingModel
              setEmbeddingModel(val)
              mutateConfig('embedding_model', val)
            }}
            className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="text-embedding-3-small">text-embedding-3-small</option>
            <option value="text-embedding-3-large">text-embedding-3-large</option>
            <option value="text-embedding-ada-002">text-embedding-ada-002</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-foreground">Vector Index</label>
          <select
            value={vectorIndexType}
            onChange={(e) => {
              const val = e.target.value as VectorIndexType
              setVectorIndexType(val)
              mutateConfig('vector_index_type', val)
            }}
            className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="HNSW">HNSW</option>
            <option value="IVFFlat">IVFFlat</option>
            <option value="Flat">Flat</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Cache Enabled</span>
          <button
            type="button"
            role="switch"
            aria-checked={cacheEnabled}
            onClick={() => {
              const next = !cacheEnabled
              setCacheEnabled(next)
              mutateConfig('cache_enabled', next)
            }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              cacheEnabled ? 'bg-primary' : 'bg-surface-raised'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-foreground transition-transform ${
                cacheEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  )
}
