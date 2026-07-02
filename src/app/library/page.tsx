import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { membershipHasLapsed } from '@/lib/access'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { sanityClient } from '@/lib/sanity'
import LibraryClient from './LibraryClient'

export const metadata: Metadata = {
  title: 'Library | TAT for Animals',
}

export type Video = {
  _id: string
  title: string
  category: string
  duration: number | null
  summary: string | null
  videoUrl: string
  topicTags: string[] | null
  keywords: string | null
  dateRecorded: string | null
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
}

// A locked teaser of the recording archive for non-Pro members — real titles
// and dates so they can see what The Calm Circle unlocks, but deliberately NO
// videoUrl: the access boundary is the query itself, not the UI.
export type RecordingPreview = {
  _id: string
  title: string
  date: string
}

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/library')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, subscription_status, cancel_at, paypal_subscription_id')
    .eq('id', user.id)
    .single()

  // A cancelled membership lapses once the paid period ends (PayPal has no
  // period-end event, so enforce it here).
  const role = membershipHasLapsed(profile?.cancel_at) ? 'guest' : (profile?.role ?? 'none')
  if (role !== 'subscriber' && role !== 'pro_subscriber') redirect('/membership')
  // past_due members are bounced to the dashboard, where the payment-failed
  // notice renders from subscription_status (no query param needed).
  if (profile?.subscription_status === 'past_due') redirect('/dashboard')

  const isPro = role === 'pro_subscriber'

  const [animalsVideos, recordings, upcoming, lockedRecordings] = await Promise.all([
    // Only "TAT for Animals" videos surface here. "Healing ACEs Plus" is a separate
    // program that lives solely on tatlife.com (it's for healing people, not animals),
    // so it is intentionally NOT queried or shown on this site (Tapas, 2026-06-25).
    // The library option still exists in the Sanity schema to keep Jez's data intact.
    sanityClient.fetch<Video[]>(
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
        _id, title, date, description, meetingUrl
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

  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <LibraryClient
        animalsVideos={animalsVideos}
        recordings={recordings}
        upcoming={upcoming}
        lockedRecordings={lockedRecordings}
        role={role}
        isPayPal={!!profile?.paypal_subscription_id}
      />
    </Suspense>
  )
}
