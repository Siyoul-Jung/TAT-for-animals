import { useEffect, useState } from 'react'

// Vimeo's oEmbed endpoint needs no API key/auth — it's the same public URL shape
// used for any embed. Passing the full videoUrl (unlisted videos included) keeps
// this in sync with the hash-aware parsing already used for playback in
// LibraryClient.tsx's parseVimeo().
function oEmbedUrl(videoUrl: string): string {
  return `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`
}

export function VimeoThumbnail({ videoUrl }: { videoUrl?: string }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!videoUrl) return
    let active = true
    fetch(oEmbedUrl(videoUrl))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.thumbnail_url) setThumbnailUrl(data.thumbnail_url)
      })
      .catch(() => {
        // No preview is a fine fallback — Jez still has the title/status text.
      })
    return () => {
      active = false
    }
  }, [videoUrl])

  if (!thumbnailUrl) {
    return <div style={{ width: '100%', height: '100%', background: '#e5e5e5' }} />
  }

  return (
    <img
      src={thumbnailUrl}
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}
