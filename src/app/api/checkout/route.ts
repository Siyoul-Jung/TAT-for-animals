import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PRICE_IDS: Record<string, string | undefined> = {
  calm_library:        process.env.STRIPE_PRICE_CALM_LIBRARY,
  calm_circle:         process.env.STRIPE_PRICE_CALM_CIRCLE,
  calm_library_annual: process.env.STRIPE_PRICE_CALM_LIBRARY_ANNUAL,
  calm_circle_annual:  process.env.STRIPE_PRICE_CALM_CIRCLE_ANNUAL,
}

const ALREADY_SUBSCRIBED =
  'You already have an active subscription. To change your plan, use the upgrade option in your dashboard.'

// Subscription statuses that mean a live, access-granting (or recoverable)
// subscription — any of these should block opening a second one. Excludes
// incomplete / canceled (abandoned or finished, safe to start fresh).
const LIVE_SUB_STATUSES = new Set(['active', 'trialing', 'past_due', 'unpaid'])

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await request.json()
  const priceId = PRICE_IDS[plan]

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Look up existing Stripe customer ID or create a new one
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, stripe_subscription_id, paypal_subscription_id, full_name')
    .eq('id', user.id)
    .single()

  // Block duplicate subscriptions — existing subscribers change tiers via /api/change-plan
  if (profile?.stripe_subscription_id || profile?.paypal_subscription_id) {
    return NextResponse.json({ error: ALREADY_SUBSCRIBED }, { status: 400 })
  }

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    // Check if a Stripe customer already exists for this email before creating a new one
    const existing = await stripe.customers.list({ email: user.email!, limit: 1 })
    if (existing.data.length > 0) {
      customerId = existing.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
    }

    // Save to profiles
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Defense in depth: the profile check above only sees what the webhook has
  // recorded. Ask Stripe directly so a delayed or missed webhook can't let the
  // same customer open a second subscription. Check all non-terminal statuses
  // (not just 'active') so a trialing or past_due subscription also blocks.
  const existingSubs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 })
  if (existingSubs.data.some((s) => LIVE_SUB_STATUSES.has(s.status))) {
    return NextResponse.json({ error: ALREADY_SUBSCRIBED }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/membership`,
    // Session-level metadata — read directly in checkout.session.completed event
    metadata: { supabase_user_id: user.id },
    subscription_data: {
      // Subscription-level metadata — read in invoice events
      metadata: { supabase_user_id: user.id },
    },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
