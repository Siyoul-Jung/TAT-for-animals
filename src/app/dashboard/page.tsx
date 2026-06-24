import { createClient } from '@/lib/supabase/server'
import { membershipHasLapsed } from '@/lib/access'
import { reconcileAccess } from '@/lib/reconcileAccess'
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
  title: 'My Account | TAT® for Animals',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; plan?: string }>
}) {
  const { error: errorParam, plan: planParam } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('full_name, role, subscription_status, stripe_customer_id, stripe_subscription_id, paypal_subscription_id, current_period_end, billing_interval, pending_tier, pending_tier_at, cancel_at')
    .eq('id', user.id)
    .single()

  // Self-heal: if the member has no active role but actually has an active
  // subscription at the provider (a missed webhook), grant it now from the
  // payment record — so a paid member is never shown the "choose a plan" state.
  let profile = profileRow
  if (profileRow && profileRow.role !== 'subscriber' && profileRow.role !== 'pro_subscriber') {
    const healed = await reconcileAccess({
      id: user.id,
      role: profileRow.role,
      stripe_customer_id: profileRow.stripe_customer_id,
      paypal_subscription_id: profileRow.paypal_subscription_id,
    })
    if (healed) profile = { ...profileRow, ...healed }
  }

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
      billingInterval={profile?.billing_interval ?? null}
      pendingTier={lapsed ? null : (profile?.pending_tier ?? null)}
      pendingTierAt={lapsed ? null : (profile?.pending_tier_at ?? null)}
      cancelAt={lapsed ? null : (profile?.cancel_at ?? null)}
      errorParam={errorParam ?? null}
      planChanged={planParam === 'changed'}
      upcoming={upcoming}
    />
  )
}
