import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { sanityClient } from '@/lib/sanity'
import DashboardClient from './DashboardClient'

type WebinarSession = {
  _id: string
  title: string
  date: string
  description: string | null
  meetingUrl: string | null
}

export const metadata: Metadata = {
  title: 'My Account | TAT for Animals®',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, subscription_status, stripe_subscription_id, paypal_subscription_id, current_period_end')
    .eq('id', user.id)
    .single()

  const upcoming = await sanityClient.fetch<WebinarSession[]>(
    `*[_type == "webinarSchedule" && date > now()] | order(date asc) [0..0] {
      _id, title, date, description, meetingUrl
    }`
  )

  return (
    <DashboardClient
      email={user.email ?? ''}
      fullName={profile?.full_name ?? ''}
      role={profile?.role ?? 'guest'}
      subscriptionStatus={profile?.subscription_status ?? 'inactive'}
      hasSubscription={!!(profile?.stripe_subscription_id || profile?.paypal_subscription_id)}
      currentPeriodEnd={profile?.current_period_end ?? null}
      upcoming={upcoming}
    />
  )
}
