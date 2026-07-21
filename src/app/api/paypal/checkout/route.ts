import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest, getPayPalSubscription, PLAN_IDS } from '@/lib/paypal'
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'
import { membershipHasLapsed } from '@/lib/access'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Bound repeated PayPal subscription creation.
  if (!(await checkRateLimit('paypal-checkout', user.id, 10, 300))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id, paypal_subscription_id, paypal_pending_subscription_id, cancel_at')
    .eq('id', user.id)
    .single()

  // A lapsed membership (cancelled + paid period ended) must not block a rejoin.
  // PayPal leaves paypal_subscription_id set with no period-end event, so without
  // this a lapsed PayPal member could never subscribe again.
  const hasLiveSubscription =
    !membershipHasLapsed(profile?.cancel_at) &&
    (profile?.stripe_subscription_id || profile?.paypal_subscription_id)
  if (hasLiveSubscription) {
    return NextResponse.json(
      { error: 'You already have an active subscription.' },
      { status: 400 }
    )
  }

  const { plan } = await request.json()
  const planId = PLAN_IDS[plan]

  if (!planId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // A PayPal subscription we already created but that isn't recorded active yet
  // (the approval + webhook-lag window). Rather than guess from a time bucket, ask
  // PayPal about THAT exact subscription — this closes the common double-charge
  // case Stripe's subscriptions.list closes on its side. (PayPal has no "list
  // subscriptions by subscriber", so we can only track one pending id; a rare
  // two-different-plans-approved-simultaneously case is the residual gap.)
  if (profile?.paypal_pending_subscription_id) {
    const pendingId = profile.paypal_pending_subscription_id
    let pending
    try {
      pending = await getPayPalSubscription(pendingId)
    } catch {
      // Couldn't confirm the prior subscription's state right now. Err toward not
      // opening a second one — the id stays put so the next attempt re-checks it.
      return NextResponse.json(
        { error: "We couldn't confirm your previous PayPal checkout just now. Please try again in a moment." },
        { status: 409 }
      )
    }
    if (pending.status === 'ACTIVE' || pending.status === 'APPROVED' || pending.status === 'SUSPENDED') {
      // Live, or approved and activating — never open a second one.
      return NextResponse.json(
        { error: 'You already have an active subscription.' },
        { status: 400 }
      )
    }
    if (pending.status === 'APPROVAL_PENDING' && pending.plan_id === planId) {
      // Re-attempting the SAME plan they started but didn't approve — send them
      // back to finish the SAME approval rather than creating a duplicate.
      const approve = pending.links?.find((l) => l.rel === 'approve')?.href
      if (approve) return NextResponse.json({ url: approve })
      return NextResponse.json(
        { error: 'Your previous PayPal checkout is still open. Please finish it, or try again in a few minutes.' },
        { status: 409 }
      )
    }
    // Anything else — terminal (CANCELLED / EXPIRED), or an unapproved subscription
    // for a DIFFERENT plan (the visitor changed their mind). Let them proceed: clear
    // the marker and fall through to create the plan they actually want now. The old
    // never-approved subscription is abandoned (PayPal expires it unused).
    await supabaseAdmin
      .from('profiles')
      .update({ paypal_pending_subscription_id: null })
      .eq('id', user.id)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  // Idempotent create. Unlike Stripe, PayPal has no "list subscriptions by
  // subscriber" we can re-check, so we lean on PayPal's own idempotency: the
  // same PayPal-Request-Id returns the original subscription instead of creating
  // a second one (keys are retained 72h). The local profiles check above only
  // sees what the webhook/return handler has already recorded — during the
  // approval + webhook-lag window it's blind, which is exactly when a
  // double-submit could open a second subscription (a real charge).
  //
  // The key is bucketed to ~15 min so near-simultaneous attempts for the same
  // plan dedupe, while a genuine re-subscribe later (different bucket) still
  // works and isn't blocked by the 72h retention.
  const bucket = Math.floor(Date.now() / (15 * 60 * 1000))
  const requestId = `tat-sub-${user.id}-${plan}-${bucket}`

  // Wrap the create + parse: if PayPal auth/network throws, return the same
  // friendly "nothing was charged" copy the no-approve-link path already uses,
  // rather than letting it bubble to an unhandled 500 with an HTML body (which
  // the client can only report as a vague connection error).
  let data
  try {
    const res = await paypalRequest('/v1/billing/subscriptions', {
      method: 'POST',
      headers: { 'PayPal-Request-Id': requestId },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: user.id,
        subscriber: { email_address: user.email },
        application_context: {
          // The PayPal Business account is shared with tatlife.com, so without
          // this override the approval page says "TATLife" — members should see
          // themselves subscribing to TAT for Animals.
          brand_name: 'TAT for Animals',
          return_url: `${siteUrl}/api/paypal/success`,
          cancel_url: `${siteUrl}/membership`,
          user_action: 'SUBSCRIBE_NOW',
          shipping_preference: 'NO_SHIPPING',
        },
      }),
    })
    data = await res.json()
  } catch (error) {
    console.error('PayPal subscription create failed:', error)
    return NextResponse.json(
      { error: "We couldn't start your PayPal checkout — nothing was charged. Please try again in a moment, or pay with a card." },
      { status: 502 }
    )
  }

  const approveLink = data.links?.find((l: { rel: string }) => l.rel === 'approve')?.href

  if (!approveLink) {
    return NextResponse.json(
      { error: "We couldn't start your PayPal checkout — nothing was charged. Please try again in a moment, or pay with a card." },
      { status: 500 }
    )
  }

  // Record the just-created (not-yet-active) subscription so a retry during the
  // approval/webhook-lag window re-checks THIS subscription instead of opening a
  // second one. Cleared on activation (success handler + ACTIVATED webhook), or by
  // the abandoned-check above on a later retry. This row is the ONLY thing blocking
  // a duplicate on the next attempt, so it must land before we hand back the link.
  if (data.id) {
    const store = () =>
      supabaseAdmin
        .from('profiles')
        .update({ paypal_pending_subscription_id: data.id })
        .eq('id', user.id)
    let result = await store()
    if (result.error) result = await store() // one retry for a transient blip
    if (result.error) {
      // We created a subscription at PayPal but couldn't record it. Do NOT return
      // the approval link — an unrecorded, approvable subscription is exactly the
      // double-charge window we're closing. Ask the user to retry: the 15-min
      // PayPal-Request-Id returns THIS same subscription, so retrying can't open a
      // second one, and we get another chance to record it.
      return NextResponse.json(
        { error: "We couldn't finish setting up your PayPal checkout. Please try again in a moment — you won't be charged twice." },
        { status: 503 }
      )
    }
  }

  return NextResponse.json({ url: approveLink })
}
