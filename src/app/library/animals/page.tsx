import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { sanityClient } from '@/lib/sanity'
import AnimalsLibraryClient from './AnimalsLibraryClient'

export const metadata: Metadata = {
  title: 'TAT for Animals Library | TAT for Animals',
}

export type Video = {
  _id: string
  title: string
  category: string
  duration: number | null
  summary: string | null
  videoUrl: string
}

export default async function AnimalsLibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/library/animals')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'guest'
  if (role === 'guest') redirect('/membership')

  const videos: Video[] = await sanityClient.fetch(
    `*[_type == "video" && status == "published"] | order(category asc, title asc) {
      _id, title, category, duration, summary, videoUrl
    }`
  )

  return <AnimalsLibraryClient videos={videos} role={role} />
}
