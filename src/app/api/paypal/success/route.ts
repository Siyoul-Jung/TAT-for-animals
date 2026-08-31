import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest, PLAN_ROLE_MAP, getPlanInterval, type PayPalSubscription } from '@/lib/paypal'
import { sendWelcomeOnce } from '@/lib/sendWelcomeOnce'
import { reportOpsError } from '@/lib/alertOps'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subscriptionId = searchParams.get('subscription_id')

  if (!subscriptionId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/membership?error=paypal_failed`)
  }

  // Past this point the member has approved the payment on PayPal's side, so no
  // failure here may surface as an error screen: on anything unexpected we land
  // them on /thank-you, whose verify + poll completes activation once the
  // webhook arrives (and self-heals if it doesn't).
  try {
    const res = await paypalRequest(`/v1/billing/subscriptions/${subscriptionId}`)
    const subscription = (await res.json()) as PayPalSubscription

    const userId = subscription.custom_id
    const planId = subscription.plan_id
    const role = planId ? (PLAN_ROLE_MAP[planId] ?? 'subscriber') : 'subscriber'

    // APPROVED = payment approved, PayPal hasn't flipped the subscription to
    // ACTIVE yet. That's activation-in-progress, not failure — sending it to the
    // error banner created a contradiction loop: "payment didn't go through" →
    // retry → checkout counts the APPROVED sub as live → "already subscribed".
    if (userId && subscription.status === 'APPROVED') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/thank-you?paypal=1`)
    }

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
          // Now active — clear the "pending approval" marker used to block duplicates.
          paypal_pending_subscription_id: null,
          subscription_status: 'active',
          // Set the cadence here too (not just in the webhook) so an annual PayPal
          // member shows "$470 / year" immediately, even if the webhook lags.
          billing_interval: getPlanInterval(planId),
          plan_price_id: planId ?? null,
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
  } catch (error) {
    // A PayPal/DB blip after an approved payment: the webhook (or /api/checkout/
    // verify's self-heal) still activates access, so the member sees the normal
    // thank-you screen — but ops needs to know activation ran degraded.
    await reportOpsError('paypal-success', error, { subscriptionId })
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/thank-you?paypal=1`)
}
