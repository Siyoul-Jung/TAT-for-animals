import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest, PLAN_ROLE_MAP, getPlanInterval, type PayPalSubscription } from '@/lib/paypal'
import { sendWelcomeOnce } from '@/lib/sendWelcomeOnce'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subscriptionId = searchParams.get('subscription_id')

  if (!subscriptionId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/membership?error=paypal_failed`)
  }

  const res = await paypalRequest(`/v1/billing/subscriptions/${subscriptionId}`)
  const subscription = (await res.json()) as PayPalSubscription

  const userId = subscription.custom_id
  const planId = subscription.plan_id
  const role = planId ? (PLAN_ROLE_MAP[planId] ?? 'subscriber') : 'subscriber'

  if (!userId || subscription.status !== 'ACTIVE') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/membership?error=paypal_failed`)
  }

  // Idempotency — prevent duplicate processing on page refresh
  const { error: idempotencyError } = await supabaseAdmin
    .from('processed_webhook_events')
    .insert({ id: `paypal-success-${subscriptionId}` })

  if (!idempotencyError || idempotencyError.code !== '23505') {
    await supabaseAdmin
      .from('profiles')
      .update({
        role,
        paypal_subscription_id: subscriptionId,
        subscription_status: 'active',
        // Set the cadence here too (not just in the webhook) so an annual PayPal
        // member shows "$470 / year" immediately, even if the webhook lags.
        billing_interval: getPlanInterval(planId),
        // Store the paid-through date at activation so a member who cancels right
        // away still has a reliable fallback (the cancel flow no longer depends
        // on re-reading PayPal at cancel time).
        ...(subscription.billing_info?.next_billing_time
          ? { current_period_end: subscription.billing_info.next_billing_time }
          : {}),
      })
      .eq('id', userId)
  }

  // Welcome email — exactly once across this handler, the webhook, and self-heal
  // (shared guard). This handler runs synchronously on return, so it usually
  // wins; the webhook then skips.
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single()
  await sendWelcomeOnce({
    subscriptionId,
    email: profile?.email,
    name: profile?.full_name,
    role: role as 'subscriber' | 'pro_subscriber',
    interval: getPlanInterval(planId),
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/thank-you?paypal=1`)
}
