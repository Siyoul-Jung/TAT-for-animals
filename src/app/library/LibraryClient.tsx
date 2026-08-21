'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Player from '@vimeo/player'
import type { Video, WebinarRecording, WebinarSession, RecordingPreview } from './page'
import { loadAllProgress, saveProgress, type ProgressMap } from '@/lib/videoProgress'
import { parseVimeo, formatDuration } from '@/lib/video'
import { displayFirstName } from '@/lib/utils'
import type { Tab } from '@/lib/libraryLink'
import BackToTopButton from '@/components/BackToTopButton'
import AskTapasForm from './AskTapasForm'

// Display order for library shelves, grouped into Tapas's renamed/consolidated
// shelves (2026-08-20 "Library changes" doc): Main + Legacy merge into one
// open shelf, Foundational becomes the welcoming "Start Here" label, and the
// two Bonus years become Calm Circle-branded names. This is a display-only
// grouping — the underlying category values must stay identical to the
// options in sanity/schemaTypes/video.ts, so Jez's existing per-video category
// picks in Studio don't need any data migration.
const CATEGORY_GROUPS: { label: string; categories: string[] }[] = [
  { label: 'Start Here', categories: ['Foundational Content'] },
  { label: 'Full Library', categories: ['Main Content', 'Legacy Content'] },
  { label: 'Calm Circle Webinars 2025', categories: ['Bonus Content 2025'] },
  { label: 'Calm Circle Webinars 2026', categories: ['Bonus Content 2026'] },
]
const CATEGORY_ORDER = CATEGORY_GROUPS.flatMap((g) => g.categories)
function groupLabelFor(category: string): string | null {
  return CATEGORY_GROUPS.find((g) => g.categories.includes(category))?.label ?? null
}

// HTML ids can't contain spaces — shelf labels can ("Calm Circle Webinars 2025").
function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-')
}

// Matches on topic, keyword, or recording year — the three fields Jez asked for
// (2026-07-01). Title and summary are included too since that's where a member
// is most likely to recognize the video they're looking for.
function videoMatchesSearch(video: Video, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (video.title.toLowerCase().includes(q)) return true
  if (video.summary?.toLowerCase().includes(q)) return true
  if (video.keywords?.toLowerCase().includes(q)) return true
  if (video.topicTags?.some((t) => t.toLowerCase().includes(q))) return true
  if (video.dateRecorded?.slice(0, 4) === q) return true
  return false
}

function VideoCard({ video, progress, onOpen }: {
  video: Video
  progress: { lastPosition: number; completed: boolean } | undefined
  onOpen: (v: Video) => void
}) {
  const duration = formatDuration(video.duration)
  // A guest browsing before joining — videoUrl is withheld server-side for
  // any video they can't watch yet (see library/page.tsx).
  const locked = !video.videoUrl
  // A plain percentage (not a boolean flag) so TS narrows progress/duration
  // naturally at the point of use below, instead of needing non-null
  // assertions to work around a separately-computed boolean.
  const progressPercent =
    progress?.lastPosition && progress.lastPosition > 5 && video.duration
      ? Math.min((progress.lastPosition / video.duration) * 100, 100)
      : null
  // Jez's checklist item 2: description starts collapsed, with a circled
  // arrow to expand it — a per-card disclosure rather than the always-hidden
  // accordion pattern the project otherwise avoids, since the summary is
  // still visible (just truncated) before it's opened.
  const [expanded, setExpanded] = useState(false)
  return (
    // Not a single <button> anymore — the expand toggle below is its own
    // interactive control, and a <button> can't contain another <button>.
    <div className="group text-left rounded-2xl border border-charcoal/10 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-brand/30 hover:scale-[1.02] transition-all">
      <button
        onClick={() => onOpen(video)}
        aria-label={locked ? `Join to watch ${video.title}` : `Play ${video.title}`}
        className="block w-full focus-visible:[outline-offset:-2px]"
      >
        <div className="aspect-video bg-charcoal/10 relative border-b border-charcoal/8">
          {video.thumbnailUrl ? (
            // Most of these are auto-generated title-card graphics (mostly white
            // space, not a photo), which reads as "broken/empty" without a visible
            // frame edge — the border-b above gives the image its own boundary
            // instead of bleeding into the white card body below it.
            // eslint-disable-next-line @next/next/no-img-element -- external Vimeo CDN thumbnail, not a static/optimizable local asset
            <img src={video.thumbnailUrl} alt="" loading="lazy" className={`w-full h-full object-cover ${locked ? 'opacity-70' : ''}`} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal/30 text-sm">No preview</div>
          )}
          {locked ? (
            // No lock icon (Tapas, 2026-08-19: "nicer if the locks... were
            // removed") — the dimmed thumbnail (opacity-70 above) plus the
            // "Join to watch" label below the card is enough of a signal.
            null
          ) : (
            // Play affordance on hover — mouse-only by nature (group-hover), same
            // as the card scale-up above; touch users just tap the card.
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none">
              <span className="w-11 h-11 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all flex items-center justify-center shadow-md">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" className="text-charcoal ml-0.5">
                  <path d="M3 2.5l13 6.5-13 6.5V2.5z" />
                </svg>
              </span>
            </div>
          )}
          {progressPercent !== null && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-black/20">
              <div
                className="h-full"
                style={{ width: `${progressPercent}%`, backgroundColor: '#D4703A' }}
              />
            </div>
          )}
        </div>
        <div className="px-4 pt-4">
          {/* Tied to the same expanded state as the summary below — pressing the
              arrow should reveal the whole video, not just its description, so a
              long title doesn't stay stuck behind "…" once the card is open.
              min-h reserves 2 lines' worth of space even for a short one-line
              title — otherwise items-start (needed so expand doesn't stretch
              siblings) lets each card size to its own title length, and a row
              of 1-line and 2-line titles ends up visibly uneven in height. */}
          {/* min-h always on (not just collapsed) — dropping it on expand let a
              short 1-line title's box shrink the instant the arrow was pressed,
              yanking the summary up to visibly collide with the title. */}
          <p className={`font-medium text-base text-charcoal leading-snug text-left min-h-[2.75rem] ${expanded ? '' : 'line-clamp-2'}`}>{video.title}</p>
        </div>
      </button>
      <div className="px-4 pb-4">
        {video.summary && (
          <div className="mt-1 flex items-start gap-2">
            {/* max-height (not line-clamp) so the expand/collapse can animate —
                line-clamp's overflow is an all-or-nothing box, it can't tween.
                400px comfortably covers even the longest real summary. */}
            <p
              className={`text-sm text-charcoal/65 leading-relaxed flex-1 overflow-hidden transition-[max-height] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded ? 'max-h-[400px]' : 'max-h-[3.3rem] min-h-[3.3rem]'}`}
            >
              {video.summary}
            </p>
            {/* No drawn border/ring (was too heavy) — the 44px box is still the
                full tap target (WCAG touch-target minimum). The soft fill stays
                on at rest rather than only appearing on hover: Netflix, Disney+
                and YouTube all keep their "more" affordance visible without a
                hover, so a first-time or low-vision visitor doesn't have to
                discover it by accident. */}
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
        <div className="flex items-center gap-2 mt-2">
          {locked ? (
            <p className="text-sm font-medium text-green">Join to watch</p>
          ) : (
            duration && <p className="text-xs text-charcoal/60">{duration}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Mobile: a full-width grid card forces a huge 16:9 thumbnail at phone width
// (~390px → ~220px tall just for the image), so under sm: this small
// fixed-size thumbnail + text row keeps the "visual, not bare text" upgrade
// without the height cost (live-checked on a 390px viewport, 2026-07-30).
function MobileVideoRow({ video, onOpen }: {
  video: Video
  onOpen: (v: Video) => void
}) {
  // Same split as the desktop card, and for the same reason — the expand
  // toggle is its own button, and a button can't contain another button.
  const [expanded, setExpanded] = useState(false)
  const locked = !video.videoUrl
  return (
    <div className="border-b border-charcoal/8 last:border-0 py-3">
      <button
        onClick={() => onOpen(video)}
        aria-label={locked ? `Join to watch ${video.title}` : `Play ${video.title}`}
        className="w-full flex items-center gap-3 text-left min-h-[64px] focus-visible:[outline-offset:-2px]"
      >
        <div className="w-20 h-14 rounded-lg bg-charcoal/10 overflow-hidden shrink-0 relative">
          {video.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external Vimeo CDN thumbnail
            <img src={video.thumbnailUrl} alt="" loading="lazy" className={`w-full h-full object-cover ${locked ? 'opacity-70' : ''}`} />
          ) : null}
          {/* No lock icon (Tapas, 2026-08-19) — dimmed thumbnail + the
              "Join to watch" label below is enough. */}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-medium text-base text-charcoal leading-snug ${expanded ? '' : 'line-clamp-1'}`}>{video.title}</p>
          {locked && <p className="text-sm font-medium text-green mt-0.5">Join to watch</p>}
        </div>
      </button>
      {video.summary && (
        // Indented to align under the title, past the thumbnail (80px + 12px gap).
        <div className="flex items-start gap-2 mt-1 pl-[92px]">
          <p
            className={`text-sm text-charcoal/65 leading-snug flex-1 overflow-hidden transition-[max-height] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded ? 'max-h-[400px]' : 'max-h-10'}`}
          >
            {video.summary}
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
  )
}

function VideoPlayerModal({ video, progress, onClose, onProgressUpdate }: {
  video: Video
  progress: { lastPosition: number; completed: boolean } | undefined
  onClose: () => void
  onProgressUpdate: (contentId: string, lastPosition: number, completed: boolean) => void
}) {
  // This modal is only ever opened for a video the viewer can actually watch
  // (see canOpenVideo below) — videoUrl is guaranteed non-null at that point.
  const vimeo = parseVimeo(video.videoUrl ?? '')
  const [playerError, setPlayerError] = useState(false)
  // Jez's spec (2026-08-08): the modal opens paused on the thumbnail, not
  // autoplaying — playback only starts once the member presses Play.
  const [started, setStarted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentPositionRef = useRef(0)

  // Treat "watched to the end" generously: most people stop a few seconds short
  // of the literal end, so ≥95% counts as complete (the natural 'ended' event
  // still marks it too).
  const reachedEnd = (pos: number) => !!video.duration && pos >= video.duration * 0.95

  const cleanup = useCallback(() => {
    if (saveTimerRef.current) clearInterval(saveTimerRef.current)
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!started || !vimeo?.id || !containerRef.current) return

    // Once this player is torn down (close / remount), its in-flight Vimeo
    // callbacks must go quiet — a late ready()-rejection or 'error' event from a
    // superseded player used to flip the UI to "Video not available", which is
    // what made replay show blank sometimes.
    let cancelled = false
    setPlayerError(false)

    const player = new Player(containerRef.current, {
      // Pass the full URL (with the unlisted hash) rather than the bare id — the
      // hash is required for private videos or the player shows "not available".
      url: vimeo.hash
        ? `https://player.vimeo.com/video/${vimeo.id}?h=${vimeo.hash}`
        : `https://player.vimeo.com/video/${vimeo.id}`,
      autoplay: true,
      responsive: true,
      title: false,
      byline: false,
      portrait: false,
    })
    playerRef.current = player

    // A video already marked complete resumes from the start, not from its
    // saved (near-the-end) position — otherwise a rewatch ends within seconds.
    const lastPosition = progress?.completed ? 0 : progress?.lastPosition ?? 0

    player.ready()
      .then(() => {
        if (cancelled) return
        if (lastPosition > 30) player.setCurrentTime(lastPosition)
      })
      .catch(() => {
        if (!cancelled) setPlayerError(true)
      })

    player.on('error', () => {
      if (!cancelled) setPlayerError(true)
    })

    player.on('timeupdate', ({ seconds }: { seconds: number }) => {
      currentPositionRef.current = seconds
    })

    player.on('ended', () => {
      onProgressUpdate(video._id, currentPositionRef.current, true)
      saveProgress(video._id, currentPositionRef.current, true)
    })

    saveTimerRef.current = setInterval(() => {
      const pos = currentPositionRef.current
      // Ignore sub-second positions: Math.floor would store them as 0, leaving a
      // noise row with no visible progress.
      if (pos >= 1) {
        const done = reachedEnd(pos)
        onProgressUpdate(video._id, pos, done)
        saveProgress(video._id, pos, done)
      }
    }, 30000)

    return () => {
      cancelled = true
      cleanup()
    }
  }, [started, vimeo?.id, vimeo?.hash])

  const handleClose = () => {
    // Closing must never get stuck just because saving progress or tearing down
    // the Vimeo player throws (e.g. destroy() on a player that hasn't finished
    // initializing) — the modal has to close either way.
    try {
      const pos = currentPositionRef.current
      if (pos >= 1) {
        const done = reachedEnd(pos)
        saveProgress(video._id, pos, done)
        onProgressUpdate(video._id, pos, done)
      }
      cleanup()
    } catch {
      // Best-effort save/teardown — closing still has to happen below.
    }
    onClose()
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button onClick={handleClose} className="text-white text-sm min-h-[44px] px-3">Close ✕</button>
        </div>
        {vimeo?.id && !playerError ? (
          started ? (
            <div className="rounded-xl overflow-hidden" style={{ background: '#000', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
            </div>
          ) : (
            <button
              onClick={() => setStarted(true)}
              aria-label={`Play ${video.title}`}
              className="group w-full rounded-xl overflow-hidden relative aspect-video bg-charcoal/20"
            >
              {video.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external Vimeo CDN thumbnail
                <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="text-charcoal ml-0.5">
                    <path d="M3 2.5l13 6.5-13 6.5V2.5z" />
                  </svg>
                </span>
              </div>
            </button>
          )
        ) : (
          <div className="rounded-xl bg-charcoal/6 aspect-video flex items-center justify-center">
            <p className="text-sm text-charcoal/65">Video not available.</p>
          </div>
        )}
        {/* Summary intentionally omitted here — Tapas, 2026-08-05: it shouldn't be
            visible at all once someone has clicked in to watch the recording. */}
        <p className="text-white mt-3 font-medium">{video.title}</p>
      </div>
    </div>
  )
}

function VideoTab({ videos, progressMap, onOpen }: {
  videos: Video[]
  progressMap: ProgressMap
  onOpen: (v: Video) => void
}) {
  const presentGroups = CATEGORY_GROUPS.filter((g) => videos.some((v) => g.categories.includes(v.category)))
  const uncategorized = videos.filter((v) => !CATEGORY_ORDER.includes(v.category))
  // A category tab already labels the shelf being shown, so the header would
  // just repeat it — only show it when more than one group is present (e.g.
  // "All", or search results spanning categories).
  const showHeaders = presentGroups.length + (uncategorized.length > 0 ? 1 : 0) > 1

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
        <p className="text-charcoal/65 text-base">Videos are being prepared. Check back soon.</p>
      </div>
    )
  }

  function renderGroup(groupVideos: Video[]) {
    return (
      <>
        {/* Phone: compact rows (small thumbnail, no huge 16:9 image).
            Tablet/desktop: the thumbnail grid. */}
        <div className="sm:hidden bg-white rounded-2xl border border-charcoal/10 shadow-sm px-5">
          {groupVideos.map((video) => (
            <MobileVideoRow key={video._id} video={video} onOpen={onOpen} />
          ))}
        </div>
        {/* items-start: without it, CSS grid stretches every card in a row to
            match its tallest sibling — so expanding one card's description
            visually "grows" its neighbors too, leaving empty space in them. */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {groupVideos.map((video) => (
            <VideoCard key={video._id} video={video} progress={progressMap[video._id]} onOpen={onOpen} />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="space-y-6">
      {presentGroups.map((g) => (
        <div key={g.label}>
          {showHeaders && (
            <p className="text-sm font-bold uppercase tracking-wide text-green mb-4 pb-2 border-b border-green/15">{g.label}</p>
          )}
          {renderGroup(videos.filter((v) => g.categories.includes(v.category)))}
        </div>
      ))}
      {uncategorized.length > 0 && (
        <div>
          {showHeaders && (
            <p className="text-sm font-bold uppercase tracking-wide text-green mb-4 pb-2 border-b border-green/15">Videos</p>
          )}
          {renderGroup(uncategorized)}
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  // Always shown in Pacific Time regardless of the viewer's own timezone —
  // Jez schedules webinars in Pacific and wants members reading the same
  // time she does, not a value that silently shifts per visitor (2026-07-01).
  return new Date(iso).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: 'America/Los_Angeles',
  })
}

function RecordingCard({ recording, scrollIntoViewOnMount = false }: { recording: WebinarRecording; scrollIntoViewOnMount?: boolean }) {
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

// Shown when a guest taps a locked video card — parity with the modal-per-
// gate pattern already used for the Live tab's Calm Circle upgrade prompt.
function JoinPromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Join to watch this video"
      className="fixed inset-0 z-50 bg-charcoal/45 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-7 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-serif text-xl text-charcoal mb-2">Join to watch this video</p>
        <p className="text-charcoal/65 text-base leading-relaxed mb-6">
          Members get the full TAT for Animals video library, with new sessions added regularly.
        </p>
        <Link
          href="/membership"
          className="block w-full min-h-[44px] flex items-center justify-center rounded-full bg-brand text-white text-[17px] font-bold hover:opacity-90 transition-opacity mb-3"
        >
          See membership options
        </Link>
        {/* A signed-out existing member (cleared cookies, new device) hits this
            same locked state — give them a way back in, not just a sales page. */}
        <Link
          href="/login"
          className="block w-full min-h-[44px] flex items-center justify-center text-sm font-medium text-green hover:text-green transition-colors mb-1"
        >
          Already a member? Sign in
        </Link>
        <button
          onClick={onClose}
          className="w-full min-h-[44px] flex items-center justify-center text-sm text-charcoal/60 hover:text-charcoal/90 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  )
}

export default function LibraryClient({
  animalsVideos,
  recordings,
  upcoming,
  lockedRecordings,
  role,
  fullName,
  isPayPal,
  billingInterval,
}: {
  animalsVideos: Video[]
  recordings: WebinarRecording[]
  upcoming: WebinarSession[]
  lockedRecordings: RecordingPreview[]
  role: string
  fullName: string | null
  isPayPal: boolean
  billingInterval: string | null
}) {
  // Annual members can't self-serve upgrade (it targets the monthly price and
  // would flip their cadence), so route them to support instead of the confirm
  // flow — parity with the dashboard.
  const isAnnual = billingInterval === 'year'
  const firstName = displayFirstName(fullName)
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const videoParam = searchParams.get('video')

  function resolveTab(p: string | null): Tab {
    if (p === 'live') return 'live'
    return 'animals'
  }

  const [activeTab, setActiveTab] = useState<Tab>(() => resolveTab(tabParam))
  const [progressMap, setProgressMap] = useState<ProgressMap>({})
  const [openVideo, setOpenVideo] = useState<Video | null>(null)
  const [showJoinPrompt, setShowJoinPrompt] = useState(false)
  // A locked card (no videoUrl — see library/page.tsx) prompts to join instead
  // of opening the player, which only ever receives a watchable video.
  const handleOpenVideo = (v: Video) => {
    if (v.videoUrl) setOpenVideo(v)
    else setShowJoinPrompt(true)
  }
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)
  const [confirmingUpgrade, setConfirmingUpgrade] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewAmount, setPreviewAmount] = useState<string | null>(null)
  const [showAllRecordings, setShowAllRecordings] = useState(false)
  const [search, setSearch] = useState('')
  const filteredAnimalsVideos = useMemo(
    () => animalsVideos.filter((v) => videoMatchesSearch(v, search)),
    [animalsVideos, search]
  )

  // Category tabs — Jez asked to replace the single long scrolling list with
  // tabs per category (2026-07-01/02), so the visitor can land on one shelf
  // instead of five stacked ones. Nothing is selected by default — the first
  // screen is just the category buttons, no video list at all, so there is no
  // long scroll to avoid in the first place. "All" is still an explicit,
  // always-visible button for browsing everything at once.
  const hasUncategorized = animalsVideos.some((v) => !CATEGORY_ORDER.includes(v.category))
  const categoryTabs = useMemo(() => {
    const present = CATEGORY_GROUPS.filter((g) => animalsVideos.some((v) => g.categories.includes(v.category))).map((g) => g.label)
    return ['All', ...present, ...(hasUncategorized ? ['Other'] : [])]
  }, [animalsVideos, hasUncategorized])
  // Video count shown after each category name (Jez's request, 2026-07-06) —
  // tells the member how much is on a shelf before opening it. Recomputed from
  // animalsVideos every time, so a merged shelf's count (e.g. Full Library)
  // updates automatically with no separate migration step.
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: animalsVideos.length }
    for (const g of CATEGORY_GROUPS) counts[g.label] = animalsVideos.filter((v) => g.categories.includes(v.category)).length
    counts.Other = animalsVideos.filter((v) => !CATEGORY_ORDER.includes(v.category)).length
    return counts
  }, [animalsVideos])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [highlightedRecordingId, setHighlightedRecordingId] = useState<string | null>(null)

  // Deep link from /search (?tab=&video=<sanity id>) — runs once per landing.
  // The actual "can this viewer watch it" call already lives where the data
  // does: animalsVideos/recordings only ever carry a real videoUrl for a
  // viewer whose role qualifies (see library/page.tsx), so we don't re-derive
  // access here — we just find the item and let the existing open/locked
  // paths (handleOpenVideo, the Live tab's upgrade prompt) do what they
  // already do for every other card.
  const deepLinkHandled = useRef(false)
  useEffect(() => {
    if (!videoParam || deepLinkHandled.current) return
    deepLinkHandled.current = true
    if (activeTab === 'live') {
      const rec = recordings.find((r) => r._id === videoParam)
      if (rec) {
        setShowAllRecordings(true)
        setHighlightedRecordingId(rec._id)
      }
      // No match means this viewer's tier never received the recording list
      // (or it's an old link) — landing on the Live tab as-is already shows
      // the right upgrade messaging, so there's nothing more to do.
    } else {
      const match = animalsVideos.find((v) => v._id === videoParam)
      if (match) {
        setActiveCategory(groupLabelFor(match.category) ?? 'Other')
        handleOpenVideo(match)
      }
    }
  }, [videoParam, activeTab, recordings, animalsVideos])
  // A search spans every category — showing the tab row while its selection no
  // longer applies would be confusing, so results ignore the active tab and are
  // grouped by category automatically (VideoTab already does this).
  const isSearching = search.trim().length > 0
  const displayedAnimalsVideos = isSearching || activeCategory === 'All'
    ? filteredAnimalsVideos
    : activeCategory === null
    ? []
    : filteredAnimalsVideos.filter((v) =>
        activeCategory === 'Other' ? !CATEGORY_ORDER.includes(v.category) : groupLabelFor(v.category) === activeCategory
      )
  const handleCategoryKeyDown = (e: React.KeyboardEvent, currentCat: string) => {
    const idx = categoryTabs.indexOf(currentCat)
    let nextIdx: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % categoryTabs.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + categoryTabs.length) % categoryTabs.length
    else if (e.key === 'Home') nextIdx = 0
    else if (e.key === 'End') nextIdx = categoryTabs.length - 1
    if (nextIdx === null) return
    e.preventDefault()
    const nextCat = categoryTabs[nextIdx]
    setActiveCategory(nextCat)
    document.getElementById(`category-tab-${slugify(nextCat)}`)?.focus()
  }

  // Show what today's prorated charge will be before the member commits — same
  // promise the dashboard makes, so this CTA never charges without a confirm.
  async function fetchUpgradePreview() {
    setPreviewLoading(true)
    setPreviewAmount(null)
    try {
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier: 'pro_subscriber', preview: true }),
      })
      const data = await res.json()
      if (res.ok && typeof data.amountDue === 'number') {
        const amt = data.amountDue / 100
        setPreviewAmount(
          data.currency && data.currency.toLowerCase() !== 'usd'
            ? `${amt.toFixed(2)} ${data.currency.toUpperCase()}`
            : `$${amt.toFixed(2)}`
        )
      }
    } catch {
      // Preview is best-effort — fall back to generic copy if it fails.
    } finally {
      setPreviewLoading(false)
    }
  }

  function openUpgrade() {
    // Already open — ignore re-clicks so the amount doesn't reload mid-confirm.
    if (confirmingUpgrade) return
    setUpgradeError(null)
    setConfirmingUpgrade(true)
    // PayPal can't be previewed (the price is confirmed on PayPal's own screen),
    // so only fetch a proration amount for Stripe members.
    if (!isPayPal) fetchUpgradePreview()
  }

  async function handleUpgrade() {
    setUpgrading(true)
    setUpgradeError(null)
    try {
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier: 'pro_subscriber' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upgrade failed')
      // PayPal returns an approval URL; Stripe applies it server-side and
      // returns { ok: true } — reload so the now-unlocked Live tab appears.
      if (data.url) {
        window.location.href = data.url
        return
      }
      // Stripe applied it server-side — land on the now-unlocked Live tab.
      window.location.href = '/library?tab=live'
    } catch (err) {
      console.error('Upgrade error:', err)
      // Surface the server's message (e.g. PayPal members are told to cancel
      // and rejoin) in a calm inline box — not a native alert.
      setUpgradeError(
        err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.'
      )
      setUpgrading(false)
    }
  }

  useEffect(() => {
    setActiveTab(resolveTab(tabParam))
  }, [tabParam])

  // A fresh page load should always start with no category chosen and no
  // search — never leave a visitor stuck on whatever they last narrowed to.
  // Covers both a bfcache restore (persisted === true) and, defensively, any
  // other path that could leave this component's state stale on what the
  // visitor sees as a fresh reload.
  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        setActiveCategory(null)
        setSearch('')
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  // Leaving the Live tab closes the upgrade confirm, so switching tabs and coming
  // back never shows a half-open confirm. Tab switches keep this component mounted,
  // so the state would otherwise persist.
  useEffect(() => {
    if (activeTab !== 'live') {
      setConfirmingUpgrade(false)
      setUpgradeError(null)
    }
  }, [activeTab])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    const url = tab === 'animals' ? '/library' : `/library?tab=${tab}`
    window.history.replaceState({}, '', url)
  }

  useEffect(() => {
    loadAllProgress().then(setProgressMap)
  }, [])

  const handleProgressUpdate = useCallback((contentId: string, lastPosition: number, completed: boolean) => {
    setProgressMap((prev) => ({
      ...prev,
      [contentId]: { lastPosition, completed },
    }))
  }, [])

  const tabs: { id: Tab; label: string; locked?: boolean }[] = [
    { id: 'animals', label: 'Your Video Library' },
    { id: 'live', label: 'Upcoming Live Webinars', locked: role !== 'pro_subscriber' },
  ]

  // Roving keyboard navigation across the tabs (WCAG tab pattern): arrow keys move
  // between tabs, Home/End jump to the ends. Focus follows the new tab so a
  // keyboard user lands on it.
  const handleTabKeyDown = (e: React.KeyboardEvent, currentId: Tab) => {
    const order = tabs.map((t) => t.id)
    const idx = order.indexOf(currentId)
    let nextIdx: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % order.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + order.length) % order.length
    else if (e.key === 'Home') nextIdx = 0
    else if (e.key === 'End') nextIdx = order.length - 1
    if (nextIdx === null) return
    e.preventDefault()
    const nextId = order[nextIdx]
    handleTabChange(nextId)
    document.getElementById(`tab-${nextId}`)?.focus()
  }

  return (
    <main className="min-h-screen bg-cream pt-20 pb-16 px-6">
      {/* Grid needs more room than reading text does — the video grid below
          gets the full width of this wider container, while prose (greeting,
          tabs, search, category list) stays inside its own narrower
          max-w-3xl so line lengths don't get uncomfortably wide. */}
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto">

        {/* 인사말이 캡션에서 페이지 제목(H1)으로 승격 — "Your Video Library"는
            첫 탭 이름으로 이동 (Jez, 2026-07-31). Tapas 요청(2026-08-02): 인사말
            위에 여백을 더 줘 차분한 느낌으로. Jez 목업 2차 스펙(2026-08-04):
            padding-top 40px + 가운데 정렬로 갱신. 게스트(2026-08-16, Tapas 공개
            브라우징 요청): 로그인한 회원 전용 인사말 대신 둘러보기 안내로 대체. */}
        <h1 className="font-serif text-3xl text-charcoal mb-2 leading-[2.5em] pt-[40px] text-center">
          {role === 'guest'
            ? 'Explore the Video Library.'
            : firstName ? <>Welcome to Your Calm Space, {firstName}.</> : 'Welcome to Your Calm Space.'}
        </h1>
        <p className="text-base text-charcoal/65 text-center leading-[40px] mb-[30px]">
          {role === 'guest'
            ? 'Browse every session by topic. Join to watch — cancel anytime.'
            : 'Watch and learn. Practice TAT anytime. Stay tuned for upcoming live webinars. All in one place.'}
        </p>

        {/* 탭 */}
        <div role="tablist" aria-label="Video Library sections" className="flex gap-1 p-1 bg-charcoal/6 rounded-2xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm transition-all min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-white text-green font-semibold shadow-sm'
                  : 'text-charcoal/60 font-medium hover:text-charcoal'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.id === 'animals' ? 'Library' : 'Upcoming'}
              </span>
              {tab.locked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}
                  className="text-charcoal/60 shrink-0">
                  <rect x="2" y="5" width="8" height="6" rx="1" />
                  <path strokeLinecap="round" d="M4 5V3.5a2 2 0 0 1 4 0V5" />
                </svg>
              )}
            </button>
          ))}
        </div>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'animals' && (
          <div role="tabpanel" id="panel-animals" aria-labelledby="tab-animals" tabIndex={0}>
            <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <label htmlFor="library-search" className="sr-only">
                Search videos by topic, keyword, or year
              </label>
              <input
                id="library-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by topic, keyword, or year"
                className="w-full min-h-[44px] rounded-2xl border border-charcoal/15 bg-white px-5 py-3 text-base text-charcoal placeholder:text-charcoal/60 focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>

            {/* Category filters — stacked full-width rather than a horizontal
                scroller. A row would overflow on mobile with names this long
                ("Calm Circle Webinars 2025"), and a horizontal scroll hides
                categories off-screen with no clear sign there's more —
                exactly the kind of hidden UI this project avoids. Stacked,
                all four shelves (plus "All") are visible at once. "All" is a
                real, always-visible tab rather than a "click the active one
                again to clear it" toggle — recognition over recall. Hidden
                while searching, since a result can span every category. */}
            {!isSearching && categoryTabs.length > 1 && (
              <div role="tablist" aria-label="Video categories" aria-orientation="vertical" className="flex flex-col gap-2 mb-6">
                {categoryTabs.map((cat) => (
                  <button
                    key={cat}
                    id={`category-tab-${slugify(cat)}`}
                    role="tab"
                    aria-selected={activeCategory === cat}
                    aria-controls="panel-category"
                    tabIndex={activeCategory === cat || (activeCategory === null && cat === categoryTabs[0]) ? 0 : -1}
                    onClick={() => setActiveCategory(cat)}
                    onKeyDown={(e) => handleCategoryKeyDown(e, cat)}
                    className={`w-full text-left px-5 py-3 rounded-xl text-base transition-all min-h-[44px] ${
                      activeCategory === cat
                        ? 'bg-white text-green font-semibold shadow-sm border border-charcoal/10'
                        : 'text-charcoal/60 font-medium hover:text-charcoal bg-charcoal/6'
                    }`}
                  >
                    {cat}
                    <span className="font-normal"> ({categoryCounts[cat] ?? 0})</span>
                  </button>
                ))}
              </div>
            )}

            {isSearching && search.trim() && filteredAnimalsVideos.length === 0 && (
              <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
                <p className="text-charcoal/65 text-base">
                  No videos found for &ldquo;{search.trim()}&rdquo;. Try a different word.
                </p>
              </div>
            )}
            {!isSearching && activeCategory === null && (
              <div role="tabpanel" id="panel-category" aria-label="No category selected" tabIndex={0} className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
                <p className="text-charcoal/65 text-base">
                  Choose a category above to see its videos — or select All to browse everything.
                </p>
              </div>
            )}
            </div>

            {/* VideoTab intentionally sits outside the max-w-3xl wrapper above —
                the grid gets the full max-w-6xl width from the page container. */}
            {!(isSearching && search.trim() && filteredAnimalsVideos.length === 0) &&
              !(!isSearching && activeCategory === null) && (
              <div role="tabpanel" id="panel-category" aria-label={isSearching ? 'Search results' : activeCategory ?? ''} tabIndex={0}>
                <VideoTab videos={displayedAnimalsVideos} progressMap={progressMap} onOpen={handleOpenVideo} />
              </div>
            )}

            {/* Quiet "share your story" entry, members only (Tapas asked,
                2026-08-14, for this to appear "fairly prominently" in the
                library; approved copy, 2026-08-15). Placed after the shelves so
                it doesn't compete with browsing, mirroring AskTapasForm's
                placement on the Live tab. */}
            {role !== 'guest' && (
              <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
                <p className="font-serif text-xl text-charcoal leading-snug">Share your story</p>
                <p className="text-base text-charcoal/65 leading-relaxed mt-1.5 mb-4">
                  How has TAT helped your animal, and you? We&rsquo;d love to hear it, and with your
                  okay, share it to encourage others.
                </p>
                <Link
                  href="/share-story"
                  className="inline-flex items-center min-h-[44px] text-base font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity"
                  style={{ color: '#467826' }}
                >
                  Share your story →
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'live' && (
          <div role="tabpanel" id="panel-live" aria-labelledby="tab-live" tabIndex={0} className="max-w-3xl mx-auto">
          {role === 'pro_subscriber' ? (
            <div className="space-y-8">
              {upcoming.length > 0 && (
                <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-green">
                    Mark Your Calendar
                  </h2>
                  <div className="divide-y divide-charcoal/8">
                    {upcoming.map((session) => (
                      <div key={session._id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                        {session.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element -- admin-pasted external URL, not a static/optimizable local asset
                          <img
                            src={session.imageUrl}
                            alt=""
                            className="w-20 h-20 rounded-xl object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-charcoal/65 mb-0.5">{formatDateTime(session.date)}</p>
                          <p className="font-semibold text-charcoal text-base">{session.title}</p>
                          {session.description && (
                            <p className="text-sm text-charcoal/65 mt-1 leading-relaxed">{session.description}</p>
                          )}
                          {session.meetingUrl && (
                            <a
                              href={session.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-3 min-h-[44px] px-5 py-2.5 rounded-full bg-brand text-white text-[19px] font-bold hover:opacity-90 transition-all whitespace-nowrap"
                            >
                              Join on Zoom →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 웨비나용 질문 보내기 — Upcoming 바로 아래(질문이 향하는 대상 옆).
                  Circle 전용 탭 안이지만 API가 역할을 서버에서 재검증한다. */}
              <AskTapasForm />

              <div className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-green">
                  Most Recent Recordings
                </h2>
                {recordings.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
                    <p className="text-charcoal/65 text-base">
                      Recordings will appear here after each live webinar.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {(showAllRecordings ? recordings : recordings.slice(0, 3)).map((rec) => (
                        <RecordingCard key={rec._id} recording={rec} scrollIntoViewOnMount={rec._id === highlightedRecordingId} />
                      ))}
                    </div>
                    {/* Full archive stays reachable for every Pro member — this just
                        keeps the default view short (Jez, 2026-07-01). A plain button,
                        not a tab or accordion, so nothing is hidden, only collapsed. */}
                    {recordings.length > 3 && (
                      <button
                        onClick={() => setShowAllRecordings((v) => !v)}
                        className="inline-flex items-center min-h-[44px] text-sm font-medium text-green hover:text-green transition-colors"
                      >
                        {showAllRecordings ? 'Show fewer' : `Show all ${recordings.length} recordings`}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 다가오는 세션 — 실제 일정을 히어로로 (있을 때만). 잠금 뱃지를
                  카드 위에 둬, Library 회원이 "참여 가능한 콘텐츠"로 오해하지 않게.
                  뱃지 표현은 대시보드 ContentCard의 잠금 뱃지와 통일. */}
              {upcoming[0] && (
                <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-green">
                      Next live webinar
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-charcoal/10 text-charcoal/65 shrink-0">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <rect x="2" y="5" width="8" height="6" rx="1" />
                        <path strokeLinecap="round" d="M4 5V3.5a2 2 0 0 1 4 0V5" />
                      </svg>
                      The Calm Circle
                    </span>
                  </div>
                  <p className="font-serif text-xl text-charcoal leading-snug">{upcoming[0].title}</p>
                  <p className="text-sm text-charcoal/65 mt-1.5">{formatDateTime(upcoming[0].date)}</p>
                  {upcoming[0].description && (
                    <p className="text-base text-charcoal/65 mt-3 leading-relaxed">{upcoming[0].description}</p>
                  )}
                </div>
              )}

              {/* 잠긴 녹화 아카이브 미리보기 + 업그레이드 — 한 카드에 묶음 */}
              <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
                {lockedRecordings.length > 0 && (
                  <>
                    {/* Calm Circle banner — Tapas asked (2026-08-16) for a way to mark
                        that the recordings below need the Circle tier. Soft tint (not a
                        saturated fill) so it reads as a calm label, not an ad — matches
                        the same green-light treatment as the search-result tier badges. */}
                    <div className="px-6 py-3 bg-green-light flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-green shrink-0" aria-hidden="true">
                        <rect x="2" y="5" width="8" height="6" rx="1" />
                        <path strokeLinecap="round" d="M4 5V3.5a2 2 0 0 1 4 0V5" />
                      </svg>
                      <p className="text-sm font-medium text-green">
                        The recordings below are included with The Calm Circle
                      </p>
                    </div>
                    <div className="px-6">
                      {lockedRecordings.map((rec) => (
                        <div
                          key={rec._id}
                          className="flex items-center gap-4 py-4 border-b border-charcoal/8 last:border-0"
                        >
                          <span className="w-9 h-9 rounded-full bg-charcoal/8 flex items-center justify-center shrink-0">
                            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}
                              className="text-charcoal/60">
                              <rect x="2" y="5" width="8" height="6" rx="1" />
                              <path strokeLinecap="round" d="M4 5V3.5a2 2 0 0 1 4 0V5" />
                            </svg>
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base text-charcoal/80 leading-snug">{rec.title}</p>
                            <p className="text-sm text-charcoal/65 mt-0.5">{formatDate(rec.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="p-7 space-y-5">
                  {confirmingUpgrade ? (
                    !isPayPal && previewLoading ? (
                      /* Work out the amount first, then reveal the full card — no
                         placeholder price, no shift as the number lands. */
                      <div role="status" className="flex items-center gap-3">
                        <svg className="w-5 h-5 animate-spin text-brand shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <p className="text-base text-charcoal/65">One moment…</p>
                      </div>
                    ) : (
                    // Confirm step — today's prorated charge + the ongoing price,
                    // shown only once computed (parity with the dashboard).
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="font-serif text-xl text-charcoal leading-snug">Move up to The Calm Circle</p>
                        <p className="text-charcoal/65 text-base leading-relaxed">
                          {isPayPal
                            ? 'Live webinars with Tapas. You’ll confirm the new price with PayPal on the next screen.'
                            : 'Live webinars with Tapas, starting today.'}
                        </p>
                      </div>
                      <dl className="text-sm space-y-1.5">
                        {/* Today's prorated charge — shown only once computed. PayPal
                            can't be previewed; only the ongoing price is shown. */}
                        {!isPayPal && previewAmount && (
                          <div className="flex gap-4">
                            <dt className="w-16 shrink-0 text-charcoal/60">Today</dt>
                            <dd className="font-medium text-charcoal">{previewAmount}</dd>
                          </div>
                        )}
                        <div className="flex gap-4">
                          <dt className="w-16 shrink-0 text-charcoal/60">Monthly</dt>
                          <dd className="font-medium text-charcoal">$47</dd>
                        </div>
                      </dl>
                      {upgradeError && (
                        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-md">
                          <p className="text-sm text-red-700 leading-relaxed">{upgradeError}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-5 pt-2 border-t border-charcoal/8">
                        <button
                          onClick={handleUpgrade}
                          disabled={upgrading}
                          className="inline-flex items-center min-h-[44px] text-[19px] font-bold text-brand underline underline-offset-[5px] decoration-2 hover:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {upgrading ? 'Upgrading…' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmingUpgrade(false)}
                          disabled={upgrading}
                          className="min-h-[44px] flex items-center text-sm text-charcoal/60 hover:text-charcoal/90 transition-colors disabled:opacity-50"
                        >
                          Not now
                        </button>
                      </div>
                    </div>
                    )
                  ) : (
                    <>
                      <div>
                        <p className="font-serif text-xl text-charcoal mb-1.5">Join Tapas live every month.</p>
                        <p className="text-charcoal/65 text-base leading-relaxed">
                          The Calm Circle adds monthly live webinars with Tapas — for your animal and for you — plus the
                          full archive of past recordings{lockedRecordings.length > 0 ? ' above' : ''}.
                        </p>
                      </div>
                      {/* Quiet green text link — same as the dashboard's locked Live
                          Sessions card. Green (#467826, ~5.3:1) is the AA-safe color
                          for small text links; orange would fail (globals.css:27). The
                          price isn't shown here — it appears in the confirm step. */}
                      {role === 'guest' ? (
                        // A guest has no plan to change — this is a join, not an
                        // upgrade, so it goes straight to the membership page
                        // rather than the change-plan flow below (which assumes
                        // an existing subscriber session).
                        <Link
                          href="/membership"
                          className="inline-flex items-center min-h-[44px] text-sm font-medium text-green hover:text-green transition-colors"
                        >
                          Join The Calm Circle →
                        </Link>
                      ) : isAnnual ? (
                        <Link
                          href="/contact"
                          className="inline-flex items-center min-h-[44px] text-sm font-medium text-green hover:text-green transition-colors"
                        >
                          On an annual plan? Contact us to upgrade →
                        </Link>
                      ) : (
                        <button
                          onClick={openUpgrade}
                          className="inline-flex items-center min-h-[44px] text-sm font-medium text-green hover:text-green transition-colors"
                        >
                          Upgrade →
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>
        )}

      </div>

      {openVideo && (
        <VideoPlayerModal
          // Key on the video id so reopening (or switching) a recording always
          // mounts a fresh player in a clean container — never reuses a stale
          // instance, which is what made replay intermittently blank.
          key={openVideo._id}
          video={openVideo}
          progress={progressMap[openVideo._id]}
          onClose={() => setOpenVideo(null)}
          onProgressUpdate={handleProgressUpdate}
        />
      )}

      {showJoinPrompt && <JoinPromptModal onClose={() => setShowJoinPrompt(false)} />}

      <BackToTopButton />
    </main>
  )
}
