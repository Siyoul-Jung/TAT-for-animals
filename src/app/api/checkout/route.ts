import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PRICE_IDS: Record<string, string | undefined> = {
  calm_library: process.env.STRIPE_PRICE_CALM_LIBRARY,
  calm_circle:  process.env.STRIPE_PRICE_CALM_CIRCLE,
}

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

  // Block duplicate subscriptions — existing subscribers should use /api/upgrade
  if (profile?.stripe_subscription_id || profile?.paypal_subscription_id) {
    return NextResponse.json(
      { error: 'You already have an active subscription. To change your plan, use the upgrade option in your dashboard.' },
      { status: 400 }
    )
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
