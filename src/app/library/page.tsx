import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
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

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/library')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'guest'
  if (role === 'guest') redirect('/membership')

  const { tab } = await searchParams
  const defaultTab = tab === 'live' ? 'live' : tab === 'aces' ? 'aces' : 'animals'

  const [animalsVideos, acesVideos, recordings, upcoming] = await Promise.all([
    sanityClient.fetch<Video[]>(
      `*[_type == "video" && status == "published" && library == "TAT for Animals"] | order(category asc, title asc) {
        _id, title, category, duration, summary, videoUrl
      }`
    ),
    sanityClient.fetch<Video[]>(
      `*[_type == "video" && status == "published" && library == "Healing ACEs Plus"] | order(category asc, title asc) {
        _id, title, category, duration, summary, videoUrl
      }`
    ),
    role === 'pro_subscriber'
      ? sanityClient.fetch<WebinarRecording[]>(
          `*[_type == "webinarRecording" && status == "published"] | order(date desc) {
            _id, title, date, videoUrl, summary
          }`
        )
      : Promise.resolve([]),
    role === 'pro_subscriber'
      ? sanityClient.fetch<WebinarSession[]>(
          `*[_type == "webinarSchedule" && date > now()] | order(date asc) {
            _id, title, date, description, meetingUrl
          }`
        )
      : Promise.resolve([]),
  ])

  return (
    <LibraryClient
      animalsVideos={animalsVideos}
      acesVideos={acesVideos}
      recordings={recordings}
      upcoming={upcoming}
      role={role}
      defaultTab={defaultTab}
    />
  )
}
