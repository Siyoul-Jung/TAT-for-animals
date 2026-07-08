// Video display helpers shared by the library UI (and unit-tested directly —
// they used to live inside LibraryClient.tsx, where the test suite could only
// exercise a hand-copied duplicate of them).

export function parseVimeo(url: string): { id: string; hash: string | null } | null {
  // URLs come in two shapes: public `vimeo.com/{id}` and unlisted
  // `vimeo.com/{id}/{hash}` (or `?h={hash}`). The hash is the private-link key —
  // the player fails with "Video not available" if it is dropped.
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:[/?](?:h=)?(\w+))?/)
  if (!match) return null
  return { id: match[1], hash: match[2] ?? null }
}

export function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
