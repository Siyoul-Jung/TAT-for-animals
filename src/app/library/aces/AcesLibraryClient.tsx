'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Video } from './page'

const CATEGORY_ORDER = ['foundational', 'main', 'bonus-2025', 'bonus-2026']
const CATEGORY_LABELS: Record<string, string> = {
  foundational: 'Foundational',
  main: 'Main Content',
  'bonus-2025': 'Bonus 2025',
  'bonus-2026': 'Bonus 2026',
}

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

export default function AcesLibraryClient({
  videos,
  role,
}: {
  videos: Video[]
  role: string
}) {
  const activeCats = CATEGORY_ORDER.filter((cat) => videos.some((v) => v.category === cat))
  const uncategorized = videos.filter((v) => !v.category || !CATEGORY_ORDER.includes(v.category))

  const defaultCat = activeCats[0] ?? (uncategorized.length > 0 ? 'other' : null)
  const [selected, setSelected] = useState<string | null>(defaultCat)

  const visibleVideos = selected === 'other'
    ? uncategorized
    : videos.filter((v) => v.category === selected)

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <p className="text-sm font-medium text-charcoal/40 uppercase tracking-widest mb-1">
            Video Library
          </p>
          <h1 className="font-serif text-3xl text-charcoal">Healing ACEs Plus</h1>
          <p className="text-charcoal/50 mt-1 text-base">
            Gently release what no longer serves you.
          </p>
        </div>

        {videos.length === 0 ? (
          <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm text-center">
            <p className="text-charcoal/60 text-base">
              Videos are being prepared. Check back soon.
            </p>
          </section>
        ) : (
          <>
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2">
              {activeCats.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelected(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                    selected === cat
                      ? 'bg-charcoal text-cream'
                      : 'bg-white border border-charcoal/12 text-charcoal/60 hover:border-charcoal/25 hover:text-charcoal'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
              {uncategorized.length > 0 && (
                <button
                  onClick={() => setSelected('other')}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                    selected === 'other'
                      ? 'bg-charcoal text-cream'
                      : 'bg-white border border-charcoal/12 text-charcoal/60 hover:border-charcoal/25 hover:text-charcoal'
                  }`}
                >
                  Videos
                </button>
              )}
            </div>

            {/* 영상 리스트 */}
            <section className="bg-white rounded-2xl border border-charcoal/10 px-6 shadow-sm">
              {visibleVideos.length === 0 ? (
                <p className="py-8 text-center text-charcoal/50 text-base">
                  No videos in this category yet.
                </p>
              ) : (
                visibleVideos.map((video) => (
                  <VideoRow key={video._id} video={video} />
                ))
              )}
            </section>
          </>
        )}

        {role === 'subscriber' && (
          <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <p className="font-serif text-xl text-charcoal mb-1">
                  Want live sessions with Tapas?
                </p>
                <p className="text-charcoal/55 text-base">
                  The Calm Circle includes monthly live webinars and the full recordings archive.
                </p>
              </div>
              <Link
                href="/membership"
                className="inline-flex items-center min-h-[44px] px-6 py-3 rounded-full bg-brand text-cream text-base font-semibold hover:bg-brand-dark transition-all whitespace-nowrap shrink-0"
              >
                Upgrade →
              </Link>
            </div>
          </section>
        )}

        <Link
          href="/dashboard"
          className="inline-block text-sm text-charcoal/40 hover:text-charcoal/70 transition-colors min-h-[44px] leading-[44px]"
        >
          ← Back to My Account
        </Link>

      </div>
    </main>
  )
}
