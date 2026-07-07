import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest } from '@/lib/paypal'
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'
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

  // Bound repeated plan-change attempts (each hits Stripe/PayPal).
  if (!(await checkRateLimit('change-plan', user.id, 10, 300))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const { targetTier, preview } = await request.json()
  if (targetTier !== 'subscriber' && targetTier !== 'pro_subscriber') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id, paypal_subscription_id, role, billing_interval')
    .eq('id', user.id)
    .single()

  // Advisory fast-path on the locally-cached role to reject an obvious no-op.
  // The provider (re-fetched below) and the webhook remain authoritative.
  if (profile?.role === targetTier) {
    return NextResponse.json({ error: 'You are already on this plan.' }, { status: 400 })
  }

  // Annual plans have no self-serve change path. The price maps below are the
  // *monthly* prices only, so applying a change to a yearly subscription would
  // also flip the member to monthly billing. The dashboard already hides the
  // upgrade for annual members; this is the server-side guard so a direct call
  // can't trigger that mis-switch. Annual changes are handled manually.
  if (profile?.billing_interval === 'year') {
    return NextResponse.json(
      { error: 'Annual plans are changed by our team — please contact us and we’ll help.' },
      { status: 400 }
    )
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
      // period — the member gets Pro access immediately. Also clear any
      // pending cancellation: a member paying more to upgrade clearly wants
      // to keep the subscription, not have it lapse next period on the new
      // price (Jez's QA report, 2026-07-02 — found "$1/mo Circle" showing
      // alongside "Cancels August 2" after cancel-then-upgrade).
      // `cancel_at: ''` (Emptyable in the pinned SDK) also clears a
      // CUSTOM-dated cancel_at (e.g. set manually by Jez in the Stripe
      // dashboard), which `cancel_at_period_end: false` alone would not;
      // Stripe rejects sending both params together, so pick by shape.
      await stripe.subscriptions.update(subscription.id, {
        items: [{ id: currentItem.id, price: targetPrice }],
        proration_behavior: 'always_invoice',
        ...(subscription.cancel_at
          ? { cancel_at: '' as const }
          : { cancel_at_period_end: false }),
      })

      // Optimistic sync so the dashboard shows Pro at once. The
      // customer.subscription.updated webhook confirms the same value; access
      // stays gated on subscription_status (past_due) if the charge fails.
      // The upgrade confirmation email is NOT sent here — the webhook sends it
      // on invoice.payment_succeeded (billing_reason 'subscription_update'),
      // i.e. only once the prorated charge has actually gone through.
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'pro_subscriber', pending_tier: null, pending_tier_at: null, cancel_at: null })
        .eq('id', user.id)

      return NextResponse.json({ ok: true })
    } catch (error) {
      // Log the real error server-side; return fixed friendly copy to the client
      // (don't leak Stripe internals) — mirrors the PayPal branch below.
      console.error('Stripe change-plan error:', error instanceof Error ? error.message : error)
      return NextResponse.json(
        { error: 'We couldn’t change your plan just now. Please try again, or email us and we’ll help.' },
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
              // Abandoned approval returns here — flag it so the dashboard can
              // say "nothing changed" instead of a silent, unexplained return.
              cancel_url: `${siteUrl}/dashboard?plan=unchanged`,
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
