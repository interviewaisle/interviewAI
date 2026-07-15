// Fire-and-forget ping to wake the free-tier backend from sleep. Called when the
// user lands on an auth page so the ~50s Render cold start overlaps with them
// typing their credentials instead of blocking the login request.
export function warmBackend(): void {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  fetch(`${base}/health`).catch(() => {})
}
