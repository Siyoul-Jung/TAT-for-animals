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

export default async function LibraryPage() {
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

  const [animalsVideos, acesVideos] = await Promise.all([
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
  ])

  return <LibraryClient animalsVideos={animalsVideos} acesVideos={acesVideos} role={role} />
}
