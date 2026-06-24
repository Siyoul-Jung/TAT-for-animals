import { createClient } from '@/lib/supabase/server'
import { paypalRequest, PLAN_IDS } from '@/lib/paypal'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id, paypal_subscription_id')
    .eq('id', user.id)
    .single()

  if (profile?.stripe_subscription_id || profile?.paypal_subscription_id) {
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

  const res = await paypalRequest('/v1/billing/subscriptions', {
    method: 'POST',
    headers: { 'PayPal-Request-Id': requestId },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: user.id,
      subscriber: { email_address: user.email },
      application_context: {
        return_url: `${siteUrl}/api/paypal/success`,
        cancel_url: `${siteUrl}/membership`,
        user_action: 'SUBSCRIBE_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    }),
  })

  const data = await res.json()
  const approveLink = data.links?.find((l: { rel: string }) => l.rel === 'approve')?.href

  if (!approveLink) {
    return NextResponse.json(
      { error: "We couldn't start your PayPal checkout — nothing was charged. Please try again in a moment, or pay with a card." },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: approveLink })
}
