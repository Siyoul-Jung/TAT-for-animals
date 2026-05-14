import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { sanityClient } from '@/lib/sanity'
import Link from 'next/link'
import WebinarsClient from './WebinarsClient'

export const metadata: Metadata = {
  title: 'Live Sessions | TAT for Animals',
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
}

export default async function WebinarsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/library/webinars')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'guest'
  if (role === 'guest') redirect('/membership')

  if (role === 'subscriber') {
    return (
      <main className="min-h-screen bg-cream pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto space-y-8">

          <div>
            <p className="text-sm font-medium text-charcoal/40 uppercase tracking-widest mb-1">
              Live Sessions
            </p>
            <h1 className="font-serif text-3xl text-charcoal">The Calm Circle</h1>
          </div>

          <section className="bg-white rounded-2xl border border-charcoal/10 p-8 shadow-sm space-y-5">
            <p className="font-serif text-xl text-charcoal leading-snug">
              Monthly live sessions with Tapas, plus the full archive of past recordings.
            </p>
            <p className="text-charcoal/60 text-base leading-relaxed">
              This is included in The Calm Circle — upgrade to join the next live session
              and access all past recordings.
            </p>
            <div className="pt-1">
              <Link
                href="/membership"
                className="inline-flex items-center min-h-[44px] px-7 py-3 rounded-full bg-brand text-cream text-base font-semibold hover:bg-brand-dark transition-all"
              >
                Upgrade to The Calm Circle →
              </Link>
            </div>
            <p className="text-sm text-charcoal/40">Cancel anytime</p>
          </section>

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

  const [recordings, upcoming] = await Promise.all([
    sanityClient.fetch<WebinarRecording[]>(
      `*[_type == "webinarRecording" && status == "published"] | order(date desc) {
        _id, title, date, videoUrl, summary
      }`
    ),
    sanityClient.fetch<WebinarSession[]>(
      `*[_type == "webinarSchedule" && date > now()] | order(date asc) {
        _id, title, date, description
      }`
    ),
  ])

  return <WebinarsClient recordings={recordings} upcoming={upcoming} />
}
