import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { paypalRequest } from '@/lib/paypal'
import { NextRequest, NextResponse } from 'next/server'

// Unified plan change (upgrade OR downgrade) for both providers, in place — no
// cancel-and-rejoin, so the member never forfeits the time they've paid for.
//   Stripe → Customer Portal `subscription_update_confirm` (shows the prorated
//            amount/credit, member confirms; webhook syncs the role).
//   PayPal → `revise` the subscription to the target plan (requires the buyer's
//            re-approval; the BILLING.SUBSCRIPTION.UPDATED webhook syncs the role).

const STRIPE_PRICE: Record<string, string | undefined> = {
  subscriber:     process.env.STRIPE_PRICE_CALM_LIBRARY,
  pro_subscriber: process.env.STRIPE_PRICE_CALM_CIRCLE,
}

const PAYPAL_PLAN: Record<string, string | undefined> = {
  subscriber:     process.env.PAYPAL_PLAN_CALM_LIBRARY,
  pro_subscriber: process.env.PAYPAL_PLAN_CALM_CIRCLE,
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { targetTier } = await request.json()
  if (targetTier !== 'subscriber' && targetTier !== 'pro_subscriber') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, stripe_subscription_id, paypal_subscription_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === targetTier) {
    return NextResponse.json({ error: 'You are already on this plan.' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  // ── Stripe ────────────────────────────────────────────────────
  if (profile?.stripe_subscription_id) {
    const targetPrice = STRIPE_PRICE[targetTier]
    if (!targetPrice) {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 500 })
    }
    try {
      const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
      const currentItem = subscription.items.data[0]
      if (!currentItem) {
        return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id!,
        return_url: `${siteUrl}/dashboard`,
        flow_data: {
          type: 'subscription_update_confirm',
          subscription_update_confirm: {
            subscription: profile.stripe_subscription_id,
            items: [{ id: currentItem.id, price: targetPrice, quantity: 1 }],
          },
        },
      })
      return NextResponse.json({ url: portalSession.url })
    } catch (error) {
      const stripeError = error as { message?: string }
      console.error('Stripe change-plan error:', stripeError.message)
      return NextResponse.json(
        { error: stripeError.message || 'Failed to change plan' },
        { status: 500 }
      )
    }
  }

  // ── PayPal ────────────────────────────────────────────────────
  if (profile?.paypal_subscription_id) {
    const targetPlan = PAYPAL_PLAN[targetTier]
    if (!targetPlan) {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 500 })
    }
    try {
      const res = await paypalRequest(
        `/v1/billing/subscriptions/${profile.paypal_subscription_id}/revise`,
        {
          method: 'POST',
          body: JSON.stringify({
            plan_id: targetPlan,
            application_context: {
              brand_name: 'TAT for Animals',
              return_url: `${siteUrl}/dashboard?plan=changed`,
              cancel_url: `${siteUrl}/dashboard`,
            },
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        console.error('PayPal revise failed:', res.status, JSON.stringify(data))
        return NextResponse.json(
          { error: 'We couldn’t change your plan just now. Please try again, or email us and we’ll help.' },
          { status: 502 }
        )
      }
      // PayPal returns an approval link the buyer must confirm.
      const approve = (data.links ?? []).find(
        (l: { rel: string; href: string }) => l.rel === 'approve'
      )
      // If PayPal applied the change without requiring approval, just go back.
      return NextResponse.json({ url: approve?.href ?? `${siteUrl}/dashboard?plan=changed` })
    } catch (error) {
      console.error('PayPal change-plan error:', error)
      return NextResponse.json(
        { error: 'We couldn’t change your plan just now. Please try again, or email us and we’ll help.' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ error: 'No active subscription to change.' }, { status: 400 })
}
