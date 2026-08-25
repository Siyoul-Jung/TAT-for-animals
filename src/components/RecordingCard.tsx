'use client'

import { useState, useRef, useEffect } from 'react'
import { parseVimeo, formatDate } from '@/lib/video'
import type { WebinarRecording } from '@/app/library/page'

// Shared by the Video Library's "Live" tab and the Dashboard's latest-recording
// preview — pulled out so both stay visually identical by construction rather
// than by hand-matched copies (Jez, 2026-08-24: dashboard card should match
// the library page).
export default function RecordingCard({
  recording,
  scrollIntoViewOnMount = false,
}: {
  recording: WebinarRecording
  scrollIntoViewOnMount?: boolean
}) {
  // Only ever scrolls the matched card into view — it must never start
  // playback itself (site-wide no-autoplay rule, CLAUDE.md). Watching still
  // requires the member to press Play, same as every other card.
  const [playing, setPlaying] = useState(false)
  const vimeo = parseVimeo(recording.videoUrl)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollIntoViewOnMount) cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [scrollIntoViewOnMount])

  return (
    <div ref={cardRef} className="bg-white rounded-2xl border border-charcoal/10 overflow-hidden shadow-sm">
      <div className="relative aspect-video bg-charcoal">
        {playing && vimeo ? (
          <iframe
            src={vimeo.hash
              ? `https://player.vimeo.com/video/${vimeo.id}?h=${vimeo.hash}&autoplay=1`
              : `https://player.vimeo.com/video/${vimeo.id}?autoplay=1`}
            title={recording.title}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center group"
            aria-label={`Watch ${recording.title}`}
          >
            <span className="w-16 h-16 rounded-full bg-brand flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="text-cream ml-0.5">
                <path d="M3 2.5l13 6.5-13 6.5V2.5z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <div className="p-5">
        <p className="text-sm text-charcoal/65 mb-1">{formatDate(recording.date)}</p>
        <p className="font-semibold text-charcoal text-base leading-snug mb-2">{recording.title}</p>
        {recording.summary && (
          <p className="text-sm text-charcoal/65 leading-relaxed">{recording.summary}</p>
        )}
      </div>
    </div>
  )
}
