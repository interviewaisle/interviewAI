const FEATURES: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'AI Interview Simulator',
    body: 'Debug real, broken code with an AI pair. Scored on both your fix and the quality of your prompts.',
    icon: (
      <path d="M8 9h8M8 13h5M21 12a9 9 0 1 1-4.5-7.8L21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Live Infrastructure Simulators',
    body: 'Tune RAG pipeline parameters and watch latency, cost, and cache hit-rate react in real time.',
    icon: (
      <path d="M4 20V10M10 20V4M16 20v-6M22 20h-2M2 20h20" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Real Code Execution',
    body: 'Write and run code in-browser across languages, with real output — not a mocked sandbox.',
    icon: (
      <path d="M8 9l3 3-3 3M13 15h3M4 4h16v16H4z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Concept Lessons',
    body: 'Structured, hands-on lessons that build the mental models behind the AI engineering stack.',
    icon: (
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 0-2 2V5zM18 3v18" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
]

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-24">
      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="glass-card p-6">
            <svg
              width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.6" className="text-primary" aria-hidden="true"
            >
              {f.icon}
            </svg>
            <h3 className="mt-3.5 text-[15px] font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-[1.6] text-secondary">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
