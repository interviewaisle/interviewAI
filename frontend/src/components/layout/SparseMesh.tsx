// Intentionally renders nothing. The animated node-graph background was removed
// in the Linear-style simplification — pages now use the flat `page-bg` surface.
// Kept as a no-op so page imports/JSX stay intact; remove usages when convenient.
export function SparseMesh() {
  return null
}
