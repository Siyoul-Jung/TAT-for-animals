import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PRO_PRICE_ID = process.env.STRIPE_PRICE_CALM_CIRCLE!

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, stripe_subscription_id, paypal_subscription_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_subscription_id) {
    // PayPal subscriptions can't be changed through Stripe's portal. Give a
    // clear, actionable message rather than a confusing "no subscription".
    if (profile?.paypal_subscription_id) {
      return NextResponse.json(
        { error: 'Your membership is billed through PayPal, which can’t switch plans automatically. To move to The Calm Circle, please cancel and rejoin on that plan.' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  }

  if (profile.role === 'pro_subscriber') {
    return NextResponse.json({ error: 'Already a pro subscriber' }, { status: 400 })
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
    const currentItem = subscription.items.data[0]

    if (!currentItem) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    // If Stripe subscription is already on pro price but Supabase role is out of sync,
    // just return the portal URL without flow_data so the user can manage their plan
    const alreadyOnProPrice = currentItem.price.id === PRO_PRICE_ID
    if (alreadyOnProPrice) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      })
      return NextResponse.json({ url: portalSession.url })
    }

    // Redirect user to Stripe Portal upgrade confirmation screen
    // Stripe shows the exact pro-rata charge before the user confirms
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      flow_data: {
        type: 'subscription_update_confirm',
        subscription_update_confirm: {
          subscription: profile.stripe_subscription_id,
          items: [{
            id: currentItem.id,
            price: PRO_PRICE_ID,
            quantity: 1,
          }],
        },
      },
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    const stripeError = error as { message?: string; code?: string; type?: string }
    console.error('Upgrade error:', JSON.stringify({
      message: stripeError.message,
      code: stripeError.code,
      type: stripeError.type,
    }))
    return NextResponse.json(
      { error: stripeError.message || 'Failed to create upgrade session' },
      { status: 500 }
    )
  }
}
