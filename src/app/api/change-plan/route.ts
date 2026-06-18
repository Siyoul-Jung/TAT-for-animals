import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest } from '@/lib/paypal'
import { NextRequest, NextResponse } from 'next/server'

// Unified plan change (upgrade OR downgrade) for both providers, in place — no
// cancel-and-rejoin, so the member never forfeits the time they've paid for.
//   Stripe upgrade   → subscriptions.update now, prorated charge for the rest of
//                      the period (immediate access to the higher tier).
//   Stripe downgrade → a subscription schedule that swaps to the lower price at
//                      period end; the member keeps the higher tier until then.
//   PayPal           → `revise` the subscription (requires the buyer's
//                      re-approval; BILLING.SUBSCRIPTION.UPDATED syncs the role).
//
// We change Stripe plans directly via the API rather than the hosted Customer
// Portal `subscription_update_confirm` flow: this (shared, legacy-API) account
// will not persist a portal configuration's `subscription_update.products`
// allow-list, which that flow requires. Our own dashboard confirmation replaces
// the portal's confirm screen, and the customer.subscription.updated webhook
// remains the source of truth for role / pending_tier.

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

  const { targetTier, preview } = await request.json()
  if (targetTier !== 'subscriber' && targetTier !== 'pro_subscriber') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id, paypal_subscription_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === targetTier) {
    return NextResponse.json({ error: 'You are already on this plan.' }, { status: 400 })
  }

  // Downgrades (→ the smaller plan) are handled by support, not self-service.
  // They're rare, and a scheduled period-end downgrade adds fragile state
  // (schedule ↔ cancel interactions, a switch that only fires a month later)
  // for little benefit. The dashboard points members to /contact instead;
  // Jez changes the plan in Stripe and the webhook syncs the role. This guard
  // is belt-and-suspenders in case the route is called directly.
  if (targetTier === 'subscriber') {
    return NextResponse.json(
      { error: 'To switch to a smaller plan, please contact us and we’ll take care of it.' },
      { status: 400 }
    )
  }

  // Proration preview is only computable for Stripe; PayPal members (and anyone
  // without a Stripe subscription) get the generic copy instead of a number.
  if (preview && !profile?.stripe_subscription_id) {
    return NextResponse.json({ amountDue: null })
  }

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

      // Preview mode — return the amount due today for the change, without
      // applying it, so the dashboard can show "you'll be charged about $X".
      if (preview) {
        const previewInvoice = await stripe.invoices.createPreview({
          subscription: subscription.id,
          subscription_details: {
            items: [{ id: currentItem.id, price: targetPrice }],
            proration_behavior: 'always_invoice',
          },
        })
        return NextResponse.json({
          amountDue: previewInvoice.amount_due,
          currency: previewInvoice.currency,
        })
      }

      // Only upgrades reach here (downgrades are handled by support above).
      // A leftover schedule (e.g. a downgrade Jez set manually) would leave the
      // subscription "managed by a schedule" and block a direct price change —
      // release it first so the upgrade always applies immediately.
      if (subscription.schedule) {
        const scheduleId =
          typeof subscription.schedule === 'string' ? subscription.schedule : subscription.schedule.id
        await stripe.subscriptionSchedules.release(scheduleId)
      }

      // Switch now and invoice the prorated difference for the rest of the
      // period — the member gets Pro access immediately.
      await stripe.subscriptions.update(subscription.id, {
        items: [{ id: currentItem.id, price: targetPrice }],
        proration_behavior: 'always_invoice',
      })

      // Optimistic sync so the dashboard shows Pro at once. The
      // customer.subscription.updated webhook confirms the same value; access
      // stays gated on subscription_status (past_due) if the charge fails.
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'pro_subscriber', pending_tier: null, pending_tier_at: null })
        .eq('id', user.id)

      return NextResponse.json({ ok: true })
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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
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
