'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Player from '@vimeo/player'
import type { Video, WebinarRecording, WebinarSession, RecordingPreview } from './page'
import { loadAllProgress, saveProgress, type ProgressMap } from '@/lib/videoProgress'
import { parseVimeo, formatDuration } from '@/lib/video'
import { displayFirstName } from '@/lib/utils'
import BackToTopButton from '@/components/BackToTopButton'
import AskTapasForm from './AskTapasForm'

// Display order for library shelves. Must stay identical to the category options
// in sanity/schemaTypes/video.ts — see the note there. (Jez's names, 2026-06-26.)
const CATEGORY_ORDER = ['Foundational Content', 'Main Content', 'Bonus Content 2025', 'Bonus Content 2026', 'Legacy Content']

// HTML ids can't contain spaces — category names can ("Bonus Content 2025").
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

function WatchedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#467826' }}>
      <svg width="11" height="11" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 7l3.5 3.5L11 3" />
      </svg>
      Watched
    </span>
  )
}

function VideoCard({ video, progress, onOpen }: {
  video: Video
  progress: { lastPosition: number; completed: boolean } | undefined
  onOpen: (v: Video) => void
}) {
  const duration = formatDuration(video.duration)
  // Boolean(...) matters here, not just style: without it, a lastPosition of
  // exactly 0 short-circuits the && chain to the number 0 — and {0 && <div/>}
  // renders the literal text "0" in JSX, unlike {false && <div/>} or {null && <div/>}.
  const hasProgress = Boolean(!progress?.completed && progress?.lastPosition && progress.lastPosition > 5 && video.duration)
  return (
    <button
      onClick={() => onOpen(video)}
      className="text-left rounded-2xl border border-charcoal/10 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-brand/30 transition-all focus-visible:[outline-offset:-2px]"
    >
      <div className="aspect-video bg-charcoal/10 relative">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Vimeo CDN thumbnail, not a static/optimizable local asset
          <img src={video.thumbnailUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal/30 text-sm">No preview</div>
        )}
        {hasProgress && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/20">
            <div
              className="h-full"
              style={{ width: `${Math.min((progress!.lastPosition / video.duration!) * 100, 100)}%`, backgroundColor: '#D4703A' }}
            />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-medium text-base text-charcoal leading-snug line-clamp-2">{video.title}</p>
        {video.summary && (
          <p className="text-sm text-charcoal/65 leading-relaxed mt-1 line-clamp-3">{video.summary}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {duration && <p className="text-xs text-charcoal/45">{duration}</p>}
          {progress?.completed && <WatchedBadge />}
        </div>
      </div>
    </button>
  )
}

// Mobile: a full-width grid card forces a huge 16:9 thumbnail at phone width
// (~390px → ~220px tall just for the image), so under sm: this small
// fixed-size thumbnail + text row keeps the "visual, not bare text" upgrade
// without the height cost (live-checked on a 390px viewport, 2026-07-30).
function MobileVideoRow({ video, progress, onOpen }: {
  video: Video
  progress: { lastPosition: number; completed: boolean } | undefined
  onOpen: (v: Video) => void
}) {
  return (
    <button
      onClick={() => onOpen(video)}
      className="w-full flex items-center gap-3 py-3 text-left border-b border-charcoal/8 last:border-0 min-h-[64px] focus-visible:[outline-offset:-2px]"
    >
      <div className="w-20 h-14 rounded-lg bg-charcoal/10 overflow-hidden shrink-0">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Vimeo CDN thumbnail
          <img src={video.thumbnailUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-base text-charcoal leading-snug line-clamp-1">{video.title}</p>
        {progress?.completed ? (
          <WatchedBadge />
        ) : video.summary ? (
          <p className="text-sm text-charcoal/65 leading-snug mt-0.5 line-clamp-1">{video.summary}</p>
        ) : null}
      </div>
    </button>
  )
}

function VideoPlayerModal({ video, progress, onClose, onProgressUpdate }: {
  video: Video
  progress: { lastPosition: number; completed: boolean } | undefined
  onClose: () => void
  onProgressUpdate: (contentId: string, lastPosition: number, completed: boolean) => void
}) {
  const vimeo = parseVimeo(video.videoUrl)
  const [playerError, setPlayerError] = useState(false)
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
    if (!vimeo?.id || !containerRef.current) return

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

    const lastPosition = progress?.lastPosition ?? 0

    player.ready()
      .then(() => {
        if (lastPosition > 30) player.setCurrentTime(lastPosition)
      })
      .catch(() => setPlayerError(true))

    player.on('error', () => setPlayerError(true))

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

    return cleanup
  }, [vimeo?.id, vimeo?.hash])

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
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button onClick={handleClose} className="text-white text-sm min-h-[44px] px-3">Close ✕</button>
        </div>
        {vimeo?.id && !playerError ? (
          <div className="rounded-xl overflow-hidden" style={{ background: '#000', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
          </div>
        ) : (
          <div className="rounded-xl bg-charcoal/6 aspect-video flex items-center justify-center">
            <p className="text-sm text-charcoal/65">Video not available.</p>
          </div>
        )}
        <p className="text-white mt-3 font-medium">{video.title}</p>
        {video.summary && <p className="text-white/70 text-sm mt-1 leading-relaxed">{video.summary}</p>}
      </div>
    </div>
  )
}

function VideoTab({ videos, progressMap, onOpen }: {
  videos: Video[]
  progressMap: ProgressMap
  onOpen: (v: Video) => void
}) {
  const categorized = CATEGORY_ORDER.filter((cat) => videos.some((v) => v.category === cat))
  const uncategorized = videos.filter((v) => !CATEGORY_ORDER.includes(v.category))
  // A category tab already labels the shelf being shown, so the header would
  // just repeat it — only show it when more than one group is present (e.g.
  // "All", or search results spanning categories).
  const showHeaders = categorized.length + (uncategorized.length > 0 ? 1 : 0) > 1

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
            <MobileVideoRow key={video._id} video={video} progress={progressMap[video._id]} onOpen={onOpen} />
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {groupVideos.map((video) => (
            <VideoCard key={video._id} video={video} progress={progressMap[video._id]} onOpen={onOpen} />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="space-y-6">
      {categorized.map((cat) => (
        <div key={cat}>
          {showHeaders && (
            <p className="text-xs font-semibold uppercase tracking-widest text-green mb-3">{cat}</p>
          )}
          {renderGroup(videos.filter((v) => v.category === cat))}
        </div>
      ))}
      {uncategorized.length > 0 && (
        <div>
          {showHeaders && (
            <p className="text-xs font-semibold uppercase tracking-widest text-green mb-3">Videos</p>
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

function RecordingCard({ recording }: { recording: WebinarRecording }) {
  const [playing, setPlaying] = useState(false)
  const vimeo = parseVimeo(recording.videoUrl)

  return (
    <div className="bg-white rounded-2xl border border-charcoal/10 overflow-hidden shadow-sm">
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

type Tab = 'animals' | 'live'

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

  function resolveTab(p: string | null): Tab {
    if (p === 'live') return 'live'
    return 'animals'
  }

  const [activeTab, setActiveTab] = useState<Tab>(() => resolveTab(tabParam))
  const [progressMap, setProgressMap] = useState<ProgressMap>({})
  const [openVideo, setOpenVideo] = useState<Video | null>(null)
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
    const present = CATEGORY_ORDER.filter((cat) => animalsVideos.some((v) => v.category === cat))
    return ['All', ...present, ...(hasUncategorized ? ['Other'] : [])]
  }, [animalsVideos, hasUncategorized])
  // Video count shown after each category name (Jez's request, 2026-07-06) —
  // tells the member how much is on a shelf before opening it.
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: animalsVideos.length }
    for (const cat of CATEGORY_ORDER) counts[cat] = animalsVideos.filter((v) => v.category === cat).length
    counts.Other = animalsVideos.filter((v) => !CATEGORY_ORDER.includes(v.category)).length
    return counts
  }, [animalsVideos])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  // A search spans every category — showing the tab row while its selection no
  // longer applies would be confusing, so results ignore the active tab and are
  // grouped by category automatically (VideoTab already does this).
  const isSearching = search.trim().length > 0
  const displayedAnimalsVideos = isSearching || activeCategory === 'All'
    ? filteredAnimalsVideos
    : activeCategory === null
    ? []
    : filteredAnimalsVideos.filter((v) =>
        activeCategory === 'Other' ? !CATEGORY_ORDER.includes(v.category) : v.category === activeCategory
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
    { id: 'animals', label: 'TAT for Animals' },
    { id: 'live', label: 'Live Webinars', locked: role !== 'pro_subscriber' },
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
      <div className="max-w-3xl mx-auto">

        {/* 인사말 — 이전 "< Dashboard" 뒤로가기 링크 자리, 같은 크기(text-sm)로
            교체 (Jez, 2026-07-30). 뒤로가기는 대시보드에서 넘어오지 않아도
            도착하는 첫 페이지라 필요 없다는 판단. */}
        <p className="text-sm text-charcoal/65 mb-2">
          {firstName ? <>Welcome to Your Calm Space, {firstName}.</> : 'Welcome to Your Calm Space.'}
        </p>

        <h1 className="font-serif text-3xl text-charcoal mb-2">Your Video Library</h1>
        <p className="text-base text-charcoal/65 leading-relaxed mb-6">
          Watch and practice anytime: your TAT videos, live webinars, and the full recording archive, all in one place.
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
                {tab.id === 'animals' ? 'Animals' : 'Live'}
              </span>
              {tab.locked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}
                  className="text-charcoal/45 shrink-0">
                  <rect x="2" y="5" width="8" height="6" rx="1" />
                  <path strokeLinecap="round" d="M4 5V3.5a2 2 0 0 1 4 0V5" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'animals' && (
          <div role="tabpanel" id="panel-animals" aria-labelledby="tab-animals" tabIndex={0}>
            <div className="mb-5">
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
                ("Foundational Content", "Bonus Content 2025"), and a horizontal
                scroll hides categories off-screen with no clear sign there's
                more — exactly the kind of hidden UI this project avoids.
                Stacked, all five (plus "All") are visible at once. "All" is a
                real, always-visible tab rather than a "click the active one
                again to clear it" toggle — recognition over recall. Hidden
                while searching, since a result can span every category. */}
            {!isSearching && categoryTabs.length > 1 && (
              <div role="tablist" aria-label="Video categories" aria-orientation="vertical" className="flex flex-col gap-2 mb-5">
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

            {isSearching && search.trim() && filteredAnimalsVideos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
                <p className="text-charcoal/65 text-base">
                  No videos found for &ldquo;{search.trim()}&rdquo;. Try a different word.
                </p>
              </div>
            ) : !isSearching && activeCategory === null ? (
              <div role="tabpanel" id="panel-category" aria-label="No category selected" tabIndex={0} className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
                <p className="text-charcoal/65 text-base">
                  Choose a category above to see its videos — or select All to browse everything.
                </p>
              </div>
            ) : (
              <div role="tabpanel" id="panel-category" aria-label={isSearching ? 'Search results' : activeCategory ?? ''} tabIndex={0}>
                <VideoTab videos={displayedAnimalsVideos} progressMap={progressMap} onOpen={setOpenVideo} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'live' && (
          <div role="tabpanel" id="panel-live" aria-labelledby="tab-live" tabIndex={0}>
          {role === 'pro_subscriber' ? (
            <div className="space-y-6">
              {upcoming.length > 0 && (
                <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-green">
                    Upcoming
                  </h2>
                  <div className="divide-y divide-charcoal/8">
                    {upcoming.map((session) => (
                      <div key={session._id} className="py-4 first:pt-0 last:pb-0">
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
                        <RecordingCard key={rec._id} recording={rec} />
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
            <div className="space-y-6">
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
                    <div className="px-6 pt-5 pb-3 border-b border-charcoal/6">
                      <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/65">
                        In the recording archive
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
                              className="text-charcoal/40">
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
                      {isAnnual ? (
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
          video={openVideo}
          progress={progressMap[openVideo._id]}
          onClose={() => setOpenVideo(null)}
          onProgressUpdate={handleProgressUpdate}
        />
      )}

      <BackToTopButton />
    </main>
  )
}
