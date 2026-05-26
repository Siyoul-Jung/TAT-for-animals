'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Video, WebinarRecording, WebinarSession } from './page'

const CATEGORY_ORDER = ['Foundational', 'Main Content', 'Bonus 2025', 'Bonus 2026']

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ?? null
}

function formatDuration(minutes: number | null): string | null {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return `${h}h${m > 0 ? ` ${m}m` : ''}`
}

function VideoRow({ video }: { video: Video }) {
  const [open, setOpen] = useState(false)
  const vimeoId = getVimeoId(video.videoUrl)
  const duration = formatDuration(video.duration)

  return (
    <div className="border-b border-charcoal/8 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 py-4 text-left group min-h-[64px]"
      >
        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          open ? 'bg-brand' : 'bg-charcoal/8 group-hover:bg-brand/10'
        }`}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"
            className={`ml-0.5 transition-colors ${open ? 'text-cream' : 'text-charcoal/50'}`}>
            <path d="M2 1.5l9 5-9 5V1.5z" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-base leading-snug transition-colors ${
            open ? 'text-brand' : 'text-charcoal group-hover:text-brand'
          }`}>
            {video.title}
          </p>
          {duration && (
            <p className="text-sm text-charcoal/40 mt-0.5">{duration}</p>
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
          {vimeoId ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-charcoal">
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
                title={video.title}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="text-sm text-charcoal/40 py-2">Video link not available.</p>
          )}
          {video.summary && (
            <p className="text-sm text-charcoal/60 leading-relaxed mt-3">{video.summary}</p>
          )}
        </div>
      )}
    </div>
  )
}

function VideoTab({ videos }: { videos: Video[] }) {
  const categorized = CATEGORY_ORDER.filter((cat) => videos.some((v) => v.category === cat))
  const uncategorized = videos.filter((v) => !CATEGORY_ORDER.includes(v.category))

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
        <p className="text-charcoal/50 text-base">Videos are being prepared. Check back soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {categorized.map((cat) => (
        <div key={cat} className="bg-white rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3 border-b border-charcoal/6">
            <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/35">{cat}</p>
          </div>
          <div className="px-6">
            {videos.filter((v) => v.category === cat).map((video) => (
              <VideoRow key={video._id} video={video} />
            ))}
          </div>
        </div>
      ))}
      {uncategorized.length > 0 && (
        <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3 border-b border-charcoal/6">
            <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/35">Videos</p>
          </div>
          <div className="px-6">
            {uncategorized.map((video) => (
              <VideoRow key={video._id} video={video} />
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
        <p className="text-sm text-charcoal/40 mb-1">{formatDate(recording.date)}</p>
        <p className="font-semibold text-charcoal text-base leading-snug mb-2">{recording.title}</p>
        {recording.summary && (
          <p className="text-sm text-charcoal/60 leading-relaxed">{recording.summary}</p>
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
  defaultTab,
}: {
  animalsVideos: Video[]
  acesVideos: Video[]
  recordings: WebinarRecording[]
  upcoming: WebinarSession[]
  role: string
  defaultTab: string
}) {
  const [activeTab, setActiveTab] = useState<Tab>(
    defaultTab === 'live' ? 'live' : defaultTab === 'aces' ? 'aces' : 'animals'
  )

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
          className="inline-flex items-center gap-2 text-sm text-charcoal/40 hover:text-charcoal/70 transition-colors min-h-[44px] mb-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 12L6 8l4-4" />
          </svg>
          My Membership
        </Link>

        <h1 className="font-serif text-3xl text-charcoal mb-6">Library</h1>

        {/* 탭 */}
        <div className="flex gap-1 p-1 bg-charcoal/6 rounded-2xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-charcoal/50 hover:text-charcoal/70'
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
        {activeTab === 'animals' && <VideoTab videos={animalsVideos} />}

        {activeTab === 'aces' && <VideoTab videos={acesVideos} />}

        {activeTab === 'live' && (
          role === 'pro_subscriber' ? (
            <div className="space-y-6">
              {upcoming.length > 0 && (
                <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/40">
                    Upcoming
                  </h2>
                  <div className="divide-y divide-charcoal/8">
                    {upcoming.map((session) => (
                      <div key={session._id} className="py-4 first:pt-0 last:pb-0">
                        <p className="text-sm text-charcoal/40 mb-0.5">{formatDateTime(session.date)}</p>
                        <p className="font-semibold text-charcoal text-base">{session.title}</p>
                        {session.description && (
                          <p className="text-sm text-charcoal/60 mt-1 leading-relaxed">{session.description}</p>
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
                <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/40">
                  Past Recordings
                </h2>
                {recordings.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
                    <p className="text-charcoal/60 text-base">
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
            <div className="p-7 bg-white rounded-2xl border border-charcoal/10 shadow-sm space-y-4">
              <div>
                <p className="font-serif text-xl text-charcoal mb-1">Monthly sessions with Tapas</p>
                <p className="text-charcoal/55 text-base leading-relaxed">
                  The Calm Circle includes live webinars with Tapas and the full archive of past recordings.
                </p>
              </div>
              <Link
                href="/membership"
                className="inline-flex items-center min-h-[44px] px-6 py-2.5 rounded-full bg-brand text-cream text-sm font-semibold hover:bg-brand-dark transition-all"
              >
                Upgrade to The Calm Circle →
              </Link>
              <p className="text-sm text-charcoal/40">Cancel anytime</p>
            </div>
          )
        )}

      </div>
    </main>
  )
}
