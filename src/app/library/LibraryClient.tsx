'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Player from '@vimeo/player'
import type { Video, WebinarRecording, WebinarSession } from './page'
import { loadAllProgress, saveProgress, type ProgressMap } from '@/lib/videoProgress'

const CATEGORY_ORDER = ['Foundational', 'Main Content', 'Bonus 2025', 'Bonus 2026']

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ?? null
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function VideoRow({ video, progress, onProgressUpdate }: {
  video: Video
  progress: { lastPosition: number; completed: boolean } | undefined
  onProgressUpdate: (contentId: string, lastPosition: number, completed: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [completed, setCompleted] = useState(progress?.completed ?? false)
  const [playerError, setPlayerError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentPositionRef = useRef(0)
  const vimeoId = getVimeoId(video.videoUrl)
  const duration = formatDuration(video.duration)

  const cleanup = useCallback(() => {
    if (saveTimerRef.current) clearInterval(saveTimerRef.current)
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!open || !vimeoId || !containerRef.current) return

    setPlayerError(false)

    const player = new Player(containerRef.current, {
      id: parseInt(vimeoId),
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
      setCompleted(true)
      onProgressUpdate(video._id, currentPositionRef.current, true)
      saveProgress(video._id, currentPositionRef.current, true)
    })

    saveTimerRef.current = setInterval(() => {
      const pos = currentPositionRef.current
      if (pos > 0) {
        onProgressUpdate(video._id, pos, false)
        saveProgress(video._id, pos, false)
      }
    }, 30000)

    return cleanup
  }, [open, vimeoId])

  const handleToggle = () => {
    if (open) {
      const pos = currentPositionRef.current
      if (pos > 0) {
        saveProgress(video._id, pos, completed)
        onProgressUpdate(video._id, pos, completed)
      }
      cleanup()
    }
    setOpen((o) => !o)
  }

  return (
    <div className="border-b border-charcoal/8 last:border-0">
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-4 py-4 text-left group min-h-[64px]"
      >
        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          open ? 'bg-brand' : completed ? 'bg-brand/15' : 'bg-charcoal/8 group-hover:bg-brand/10'
        }`}>
          {completed ? (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth={2}
              className={open ? 'text-cream' : 'text-brand'}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 7l3.5 3.5L11 3" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"
              className={`ml-0.5 transition-colors ${open ? 'text-cream' : 'text-charcoal/65'}`}>
              <path d="M2 1.5l9 5-9 5V1.5z" />
            </svg>
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-base leading-snug transition-colors ${
            open ? 'text-brand' : 'text-charcoal group-hover:text-brand'
          }`}>
            {video.title}
          </p>
          <p className="text-sm text-charcoal/65 mt-0.5">
            {completed
              ? <span style={{ color: '#5E9635' }}>Watched</span>
              : progress?.lastPosition && progress.lastPosition > 5 && video.duration
              ? formatDuration(Math.max(video.duration - progress.lastPosition, 0))
              : duration}
          </p>
          {/* 진행도 바 */}
          {(completed || (progress?.lastPosition && progress.lastPosition > 5 && video.duration)) && (
            <div className="mt-2 h-1 rounded-full bg-charcoal/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: completed
                    ? '100%'
                    : `${Math.min((progress!.lastPosition / (video.duration! * 60)) * 100, 100)}%`,
                  backgroundColor: completed ? '#5E9635' : '#D4703A',
                }}
              />
            </div>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          stroke="currentColor" strokeWidth={1.5}
          className={`text-charcoal/30 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <div className="pb-5">
          {vimeoId && !playerError ? (
            <div className="rounded-xl overflow-hidden" style={{ background: '#000', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
            </div>
          ) : (
            <div className="rounded-xl bg-charcoal/6 aspect-video flex items-center justify-center">
              <p className="text-sm text-charcoal/65">Video not available.</p>
            </div>
          )}
          {video.summary && (
            <p className="text-sm text-charcoal/65 leading-relaxed mt-3">{video.summary}</p>
          )}
        </div>
      )}
    </div>
  )
}

function VideoTab({ videos, progressMap, onProgressUpdate }: {
  videos: Video[]
  progressMap: ProgressMap
  onProgressUpdate: (contentId: string, lastPosition: number, completed: boolean) => void
}) {
  const categorized = CATEGORY_ORDER.filter((cat) => videos.some((v) => v.category === cat))
  const uncategorized = videos.filter((v) => !CATEGORY_ORDER.includes(v.category))

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
        <p className="text-charcoal/65 text-base">Videos are being prepared. Check back soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {categorized.map((cat) => (
        <div key={cat} className="bg-white rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3 border-b border-charcoal/6">
            <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/65">{cat}</p>
          </div>
          <div className="px-6">
            {videos.filter((v) => v.category === cat).map((video) => (
              <VideoRow key={video._id} video={video} progress={progressMap[video._id]} onProgressUpdate={onProgressUpdate} />
            ))}
          </div>
        </div>
      ))}
      {uncategorized.length > 0 && (
        <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3 border-b border-charcoal/6">
            <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/65">Videos</p>
          </div>
          <div className="px-6">
            {uncategorized.map((video) => (
              <VideoRow key={video._id} video={video} progress={progressMap[video._id]} onProgressUpdate={onProgressUpdate} />
            ))}
          </div>
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
  return new Date(iso).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })
}

function RecordingCard({ recording }: { recording: WebinarRecording }) {
  const [playing, setPlaying] = useState(false)
  const vimeoId = getVimeoId(recording.videoUrl)

  return (
    <div className="bg-white rounded-2xl border border-charcoal/10 overflow-hidden shadow-sm">
      <div className="relative aspect-video bg-charcoal">
        {playing && vimeoId ? (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
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

type Tab = 'animals' | 'aces' | 'live'

export default function LibraryClient({
  animalsVideos,
  acesVideos,
  recordings,
  upcoming,
  role,
}: {
  animalsVideos: Video[]
  acesVideos: Video[]
  recordings: WebinarRecording[]
  upcoming: WebinarSession[]
  role: string
}) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  function resolveTab(p: string | null): Tab {
    if (p === 'live') return 'live'
    if (p === 'aces') return 'aces'
    return 'animals'
  }

  const [activeTab, setActiveTab] = useState<Tab>(() => resolveTab(tabParam))
  const [progressMap, setProgressMap] = useState<ProgressMap>({})
  const [upgrading, setUpgrading] = useState(false)

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier: 'pro_subscriber' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upgrade failed')
      window.location.href = data.url
    } catch (err) {
      console.error('Upgrade error:', err)
      // Surface the server's message (e.g. PayPal members are told to cancel
      // and rejoin) instead of a generic, confusing fallback.
      alert(err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.')
      setUpgrading(false)
    }
  }

  useEffect(() => {
    setActiveTab(resolveTab(tabParam))
  }, [tabParam])

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
    { id: 'aces', label: 'Healing ACEs Plus' },
    { id: 'live', label: 'Live Sessions', locked: role !== 'pro_subscriber' },
  ]

  return (
    <main className="min-h-screen bg-cream pt-20 pb-16 px-6">
      <div className="max-w-3xl mx-auto">

        {/* 뒤로가기 */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-charcoal/65 hover:text-charcoal transition-colors min-h-[44px] mb-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 12L6 8l4-4" />
          </svg>
          Dashboard
        </Link>

        <h1 className="font-serif text-3xl text-charcoal mb-6">Library</h1>

        {/* 탭 */}
        <div className="flex gap-1 p-1 bg-charcoal/6 rounded-2xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-charcoal/65 hover:text-charcoal'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.id === 'animals' ? 'Animals' : tab.id === 'aces' ? 'ACEs' : 'Live'}
              </span>
              {tab.locked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}
                  className="text-charcoal/30 shrink-0">
                  <rect x="2" y="5" width="8" height="6" rx="1" />
                  <path strokeLinecap="round" d="M4 5V3.5a2 2 0 0 1 4 0V5" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'animals' && <VideoTab videos={animalsVideos} progressMap={progressMap} onProgressUpdate={handleProgressUpdate} />}

        {activeTab === 'aces' && <VideoTab videos={acesVideos} progressMap={progressMap} onProgressUpdate={handleProgressUpdate} />}

        {activeTab === 'live' && (
          role === 'pro_subscriber' ? (
            <div className="space-y-6">
              {upcoming.length > 0 && (
                <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/65">
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
                            className="inline-flex items-center gap-1.5 mt-3 min-h-[44px] px-5 py-2.5 rounded-full bg-brand text-cream text-sm font-semibold hover:bg-brand-dark transition-all"
                          >
                            Join on Zoom →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/65">
                  Past Recordings
                </h2>
                {recordings.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
                    <p className="text-charcoal/65 text-base">
                      Recordings will appear here after each live session.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recordings.map((rec) => (
                      <RecordingCard key={rec._id} recording={rec} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-7 bg-white rounded-2xl border border-charcoal/10 shadow-sm space-y-5">
              {upcoming[0] && (
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(94,150,53,0.06)', border: '1px solid rgba(94,150,53,0.15)' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: '#5E9635' }} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#5E9635' }}>
                      Next live session
                    </p>
                    <p className="text-base text-charcoal font-medium">{upcoming[0].title}</p>
                    <p className="text-sm text-charcoal/65 mt-0.5">{formatDateTime(upcoming[0].date)}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="font-serif text-xl text-charcoal mb-1.5">Join Tapas live every month.</p>
                <p className="text-charcoal/65 text-base leading-relaxed">
                  The Calm Circle includes monthly live webinars with Tapas — for your animal and for you — plus the full archive of past recordings.
                </p>
              </div>
              <div className="space-y-2.5">
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="inline-flex items-center min-h-[44px] px-6 py-2.5 rounded-full bg-brand text-cream text-sm font-semibold hover:bg-brand-dark transition-all disabled:opacity-60"
                >
                  {upgrading ? 'Connecting…' : 'Upgrade to The Calm Circle →'}
                </button>
                <p className="text-sm text-charcoal/65">Cancel anytime</p>
              </div>
            </div>
          )
        )}

      </div>
    </main>
  )
}
