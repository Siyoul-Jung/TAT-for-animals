import { createClient } from '@/lib/supabase/server'
import { membershipHasLapsed } from '@/lib/access'
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error: errorParam } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, subscription_status, stripe_subscription_id, paypal_subscription_id, current_period_end, pending_tier, pending_tier_at, cancel_at')
    .eq('id', user.id)
    .single()

  const upcoming = await sanityClient.fetch<WebinarSession[]>(
    `*[_type == "webinarSchedule" && date > now()] | order(date asc) [0..0] {
      _id, title, date, description, meetingUrl
    }`
  )

  // Once a cancelled membership's paid period ends, present it as lapsed
  // (guest) even if no webhook has flipped the role yet — see lib/access.
  const lapsed = membershipHasLapsed(profile?.cancel_at)
  const effectiveRole = lapsed ? 'guest' : (profile?.role ?? 'guest')

  return (
    <DashboardClient
      email={user.email ?? ''}
      fullName={profile?.full_name ?? ''}
      role={effectiveRole}
      subscriptionStatus={profile?.subscription_status ?? 'inactive'}
      hasSubscription={!lapsed && !!(profile?.stripe_subscription_id || profile?.paypal_subscription_id)}
      isPayPal={!!profile?.paypal_subscription_id}
      currentPeriodEnd={profile?.current_period_end ?? null}
      pendingTier={lapsed ? null : (profile?.pending_tier ?? null)}
      pendingTierAt={lapsed ? null : (profile?.pending_tier_at ?? null)}
      cancelAt={lapsed ? null : (profile?.cancel_at ?? null)}
      errorParam={errorParam ?? null}
      upcoming={upcoming}
    />
  )
}
