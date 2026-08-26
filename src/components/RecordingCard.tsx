'use client'

import { useState, useRef, useEffect } from 'react'
import { parseVimeo, formatDate } from '@/lib/video'
import type { WebinarRecording } from '@/app/library/page'

// Used by the Video Library's "Live" tab, for both the collapsed "Latest
// Recording" card and the expanded full archive grid.
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
  // Description starts collapsed, with a circled arrow to expand — matches
  // the regular Video Library card's disclosure pattern (Jez, 2026-08-26).
  const [expanded, setExpanded] = useState(false)

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
          <div className="flex items-start gap-2">
            {/* max-height (not line-clamp) so the expand/collapse can animate —
                same pattern as the Video Library's card. */}
            <p
              className={`text-sm text-charcoal/65 leading-relaxed flex-1 overflow-hidden transition-[max-height] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded ? 'max-h-[400px]' : 'max-h-[3.3rem]'}`}
            >
              {recording.summary}
            </p>
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Show less' : 'Show more'}
              className="shrink-0 -mt-1 -mr-1 w-11 h-11 rounded-full bg-charcoal/6 flex items-center justify-center text-charcoal/60 hover:text-charcoal hover:bg-charcoal/10 transition-colors focus-visible:[outline-offset:-2px]"
            >
              <svg
                width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.5}
                className={`transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 3.5L5 7l3.5-3.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
