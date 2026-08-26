import { createClient } from '@/lib/supabase/server'
import { membershipHasLapsed } from '@/lib/access'
import { isWithinRefundWindow, annualStartFromPeriodEnd } from '@/lib/refundWindow'
import { reconcileAccess } from '@/lib/reconcileAccess'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { sanityClient } from '@/lib/sanity'
import type { WebinarRecording } from '@/app/library/page'
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
  searchParams: Promise<{ error?: string; plan?: string; refunded?: string }>
}) {
  const { error: errorParam, plan: planParam, refunded } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const qs = new URLSearchParams(
      Object.entries({ error: errorParam, plan: planParam, refunded }).filter(
        (entry): entry is [string, string] => entry[1] !== undefined
      )
    ).toString()
    redirect(`/login?next=${encodeURIComponent(qs ? `/dashboard?${qs}` : '/dashboard')}`)
  }

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

  // Once a cancelled membership's paid period ends, present it as lapsed
  // (guest) even if no webhook has flipped the role yet — see lib/access.
  const lapsed = membershipHasLapsed(profile?.cancel_at)
  const effectiveRole = lapsed ? 'guest' : (profile?.role ?? 'guest')

  // Degrade gracefully if Sanity is slow/down — the member's account and
  // subscription data (from Supabase) must still render, not crash the page.
  let upcoming: WebinarSession[] = []
  let latestRecording: WebinarRecording | null = null
  try {
    const [upcomingResult, recordingResult] = await Promise.all([
      sanityClient.fetch<WebinarSession[]>(
        `*[_type == "webinarSchedule" && date > now()] | order(date asc) [0..0] {
          _id, title, date, description, meetingUrl
        }`
      ),
      // Pro only — same recordings as the Video Library's Live tab, just the
      // single newest one (Jez, 2026-08-26).
      effectiveRole === 'pro_subscriber'
        ? sanityClient.fetch<WebinarRecording[]>(
            `*[_type == "webinarRecording" && status == "published"] | order(date desc) [0..0] {
              _id, title, date, videoUrl, summary
            }`
          )
        : Promise.resolve([]),
    ])
    upcoming = upcomingResult
    latestRecording = recordingResult[0] ?? null
  } catch (e) {
    console.error('Dashboard: Sanity fetch failed, showing none:', e)
  }

  // Offer the 14-day cancel-with-refund only to annual members whose estimated
  // start (period end − 1 year) is still inside the window. UI gate only — the
  // API route re-verifies against the provider's real start date.
  const refundEligible =
    !lapsed &&
    profile?.billing_interval === 'year' &&
    profile?.subscription_status === 'active' &&
    !profile?.cancel_at &&
    !!(profile?.stripe_subscription_id || profile?.paypal_subscription_id) &&
    !!profile?.current_period_end &&
    isWithinRefundWindow(annualStartFromPeriodEnd(profile.current_period_end))

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
      planUnchanged={planParam === 'unchanged'}
      refundEligible={refundEligible}
      refunded={refunded === '1'}
      upcoming={upcoming}
      latestRecording={latestRecording}
    />
  )
}
