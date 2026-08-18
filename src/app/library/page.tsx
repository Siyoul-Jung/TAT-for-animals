import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { membershipHasLapsed } from '@/lib/access'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { sanityClient } from '@/lib/sanity'
import { fetchVimeoThumbnail } from '@/lib/video'
import LibraryClient from './LibraryClient'

export const metadata: Metadata = {
  title: 'Your Video Library | TAT for Animals',
}

export type Video = {
  _id: string
  title: string
  category: string
  duration: number | null
  summary: string | null
  // null for a visitor/tier that can't watch it yet — title/summary/duration/
  // thumbnail are public-safe browsing info, but the actual Vimeo link is the
  // access boundary and is withheld server-side (never gated client-only).
  videoUrl: string | null
  topicTags: string[] | null
  keywords: string | null
  dateRecorded: string | null
  thumbnailUrl: string | null
}

export type WebinarRecording = {
  _id: string
  title: string
  date: string
  videoUrl: string
  summary: string | null
}

export type WebinarSession = {
  _id: string
  title: string
  date: string
  description: string | null
  meetingUrl: string | null
  imageUrl: string | null
}

// A locked teaser of the recording archive for non-Pro members — real titles
// and dates so they can see what The Calm Circle unlocks, but deliberately NO
// videoUrl: the access boundary is the query itself, not the UI.
export type RecordingPreview = {
  _id: string
  title: string
  date: string
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Tapas (2026-08-16): visitors should be able to browse the whole library —
  // titles, descriptions, thumbnails — before joining, not just after. So
  // there's no redirect here anymore; an unauthenticated or non-member visitor
  // just becomes 'guest' and sees the same shelves with locked cards.
  let role: 'guest' | 'subscriber' | 'pro_subscriber' = 'guest'
  let fullName: string | null = null
  let isPayPal = false
  let billingInterval: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, subscription_status, cancel_at, paypal_subscription_id, billing_interval')
      .eq('id', user.id)
      .single()

    // A cancelled membership lapses once the paid period ends (PayPal has no
    // period-end event, so enforce it here).
    const resolvedRole = membershipHasLapsed(profile?.cancel_at) ? 'guest' : (profile?.role ?? 'guest')
    role = resolvedRole === 'subscriber' || resolvedRole === 'pro_subscriber' ? resolvedRole : 'guest'
    // past_due members are bounced to the dashboard, where the payment-failed
    // notice renders from subscription_status (no query param needed) — this is
    // the one case still worth redirecting for, since it's an account problem
    // that needs their attention, not just a browsing state.
    if (profile?.subscription_status === 'past_due') redirect('/dashboard')

    fullName = profile?.full_name ?? null
    isPayPal = !!profile?.paypal_subscription_id
    billingInterval = profile?.billing_interval ?? null
  }

  // Every current video (all categories) is included with either paid tier —
  // only Live Webinars are Calm Circle-exclusive. A guest can't watch anything
  // yet, so gets browsing info only.
  const canWatchVideos = role === 'subscriber' || role === 'pro_subscriber'
  const isPro = role === 'pro_subscriber'

  // Degrade gracefully if Sanity is slow/down: the member is already
  // authenticated and access-checked from Supabase above, so show an empty
  // library rather than crashing the whole page to the error boundary.
  let animalsVideos: Video[] = []
  let recordings: WebinarRecording[] = []
  let upcoming: WebinarSession[] = []
  let lockedRecordings: RecordingPreview[] = []
  try {
    // Always a real string straight from Sanity — the union with null on
    // Video.videoUrl only applies after the per-viewer gating below.
    let rawVideos: (Omit<Video, 'thumbnailUrl' | 'videoUrl'> & { videoUrl: string })[]
    // Only "TAT for Animals" videos surface here. "Healing ACEs Plus" is a separate
    // program that lives solely on tatlife.com (it's for healing people, not animals),
    // so it is intentionally NOT queried or shown on this site (Tapas, 2026-06-25).
    // The library option still exists in the Sanity schema to keep Jez's data intact.
    [rawVideos, recordings, upcoming, lockedRecordings] = await Promise.all([
      sanityClient.fetch<(Omit<Video, 'thumbnailUrl' | 'videoUrl'> & { videoUrl: string })[]>(
        `*[_type == "video" && status == "published" && library == "TAT for Animals"] | order(category asc, dateRecorded asc) {
          _id, title, category, duration, summary, videoUrl, topicTags, keywords, dateRecorded
        }`
      ),
      isPro
        ? sanityClient.fetch<WebinarRecording[]>(
            `*[_type == "webinarRecording" && status == "published"] | order(date desc) {
              _id, title, date, videoUrl, summary
            }`
          )
        : Promise.resolve([]),
      sanityClient.fetch<WebinarSession[]>(
        `*[_type == "webinarSchedule" && date > now()] | order(date asc) [0..1] {
          _id, title, date, description, meetingUrl, imageUrl
        }`
      ),
      // Locked archive teaser — only for non-Pro members, and only metadata
      // (never videoUrl), so the upgrade screen shows the real archive.
      !isPro
        ? sanityClient.fetch<RecordingPreview[]>(
            `*[_type == "webinarRecording" && status == "published"] | order(date desc) [0..3] {
              _id, title, date
            }`
          )
        : Promise.resolve([]),
    ])
    // Fetched separately (not blocked on the query above finishing render) —
    // a thumbnail fetch failing must never take the video list down with it;
    // fetchVimeoThumbnail already swallows its own errors and returns null.
    // Thumbnails are public-safe (just a preview image) and fetched for every
    // video regardless of tier, so a guest still sees what's on each shelf —
    // only the playable videoUrl is withheld below.
    const thumbnails = await Promise.all(rawVideos.map((v) => fetchVimeoThumbnail(v.videoUrl)))
    animalsVideos = rawVideos.map((v, i) => ({
      ...v,
      thumbnailUrl: thumbnails[i],
      videoUrl: canWatchVideos ? v.videoUrl : null,
    }))
  } catch (e) {
    console.error('Library: Sanity fetch failed, showing empty library:', e)
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <LibraryClient
        animalsVideos={animalsVideos}
        recordings={recordings}
        upcoming={upcoming}
        lockedRecordings={lockedRecordings}
        role={role}
        fullName={fullName}
        isPayPal={isPayPal}
        billingInterval={billingInterval}
      />
    </Suspense>
  )
}
