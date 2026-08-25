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

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

// oEmbed needs the full unlisted URL (id + hash) — a bare id 404s. Non-public
// videos also only return a thumbnail if the request's referrer matches an
// allowed embed domain — the Vimeo embed setting here is already "Anywhere",
// same as the player itself.
export async function fetchVimeoThumbnail(videoUrl: string): Promise<string | null> {
  const vimeo = parseVimeo(videoUrl)
  if (!vimeo) return null
  const fullUrl = vimeo.hash
    ? `https://vimeo.com/${vimeo.id}/${vimeo.hash}`
    : `https://vimeo.com/${vimeo.id}`
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(fullUrl)}&width=400`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.thumbnail_url === 'string' ? data.thumbnail_url : null
  } catch {
    return null
  }
}
