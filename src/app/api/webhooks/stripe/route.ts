import { stripe } from '@/lib/stripe'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { cancellationEmail } from '@/lib/emails/cancellation'
import { cancellationScheduledEmail } from '@/lib/emails/cancellation-scheduled'
import { sendWelcomeOnce } from '@/lib/sendWelcomeOnce'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { claimOnce, releaseOnce } from '@/lib/onceGuard'
import { PRICE_ROLE_MAP, getBillingInterval, getPeriodEndISO } from '@/lib/subscriptionAccess'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Stripe API 2025-03-31 (basil) and later removed `Invoice.subscription`; it now lives under
// `invoice.parent.subscription_details.subscription`. Fall back to the legacy
// field so older in-flight events are still handled.
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const fromParent = invoice.parent?.subscription_details?.subscription
  if (typeof fromParent === 'string') return fromParent
  if (fromParent && typeof fromParent === 'object') return fromParent.id

  const legacy = (invoice as unknown as { subscription?: string | { id: string } }).subscription
  if (typeof legacy === 'string') return legacy
  if (legacy && typeof legacy === 'object') return legacy.id
  return null
}

// Stripe reports many subscription statuses; the app stores only three.
// Map them so the column stays a known set (enforced by a CHECK constraint) —
// otherwise a status like 'unpaid' would bypass the past_due access block.
function domainStatus(status: Stripe.Subscription.Status): 'active' | 'past_due' | 'inactive' {
  if (status === 'active' || status === 'trialing') return 'active'
  if (status === 'past_due' || status === 'unpaid') return 'past_due'
  return 'inactive' // canceled, incomplete, incomplete_expired, paused
}

// If a subscription schedule has a future phase whose price maps to a different
// role than the current one, that's a pending (period-end) plan change. Returns
// the target tier + when it takes effect, or nulls when nothing is scheduled.
async function getScheduledChange(
  subscription: Stripe.Subscription,
  currentRole: string,
): Promise<{ tier: string | null; at: string | null }> {
  if (!subscription.schedule) return { tier: null, at: null }
  try {
    const scheduleId =
      typeof subscription.schedule === 'string' ? subscription.schedule : subscription.schedule.id
    const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId)
    const nowSec = Math.floor(Date.now() / 1000)
    const upcoming = schedule.phases.find((p) => p.start_date > nowSec)
    if (!upcoming) return { tier: null, at: null }

    const priceRef = upcoming.items[0]?.price
    const upcomingPriceId = typeof priceRef === 'string' ? priceRef : priceRef?.id
    const upcomingRole = upcomingPriceId ? PRICE_ROLE_MAP[upcomingPriceId] : undefined
    if (!upcomingRole || upcomingRole === currentRole) return { tier: null, at: null }

    return { tier: upcomingRole, at: new Date(upcoming.start_date * 1000).toISOString() }
  } catch (e) {
    console.error('Stripe schedule fetch failed:', e)
    return { tier: null, at: null }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  // Verify webhook signature — prevents tampering
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency — claim the event id; a duplicate was already handled.
  const { alreadyProcessed } = await claimOnce(event.id)
  if (alreadyProcessed) return NextResponse.json({ received: true })

  try {
    switch (event.type) {

      // Payment completed → activate subscription
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price?.id
        const role = priceId ? (PRICE_ROLE_MAP[priceId] ?? 'subscriber') : 'subscriber'

        // Fallback: session metadata → subscription metadata
        const userId = session.metadata?.supabase_user_id
          ?? subscription.metadata?.supabase_user_id
        if (!userId) {
          console.error('Webhook checkout.session.completed: userId missing', { subscriptionId })
          break
        }

        // Name/email normally come from the Checkout Session, but the shared
        // account's legacy (2016) event shape can omit `customer_details`. Fall
        // back to the Customer object so full_name capture and the welcome email
        // survive regardless of the endpoint's render version.
        let customerName = session.customer_details?.name ?? null
        let customerEmail = session.customer_details?.email ?? null
        if (!customerEmail) {
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          if (!customer.deleted) {
            customerEmail = customer.email ?? null
            customerName = customerName ?? customer.name ?? null
          }
        }

        const billingInterval = getBillingInterval(subscription)
        const updatePayload: Record<string, unknown> = {
          role,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          current_period_end: getPeriodEndISO(subscription),
          billing_interval: billingInterval,
          cancel_at: null,
        }
        if (customerName) updatePayload.full_name = customerName
        if (customerEmail) updatePayload.email = customerEmail

        await supabaseAdmin
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId)

        // Welcome email — sent exactly once across every activation path
        // (webhook / verify / self-heal) via the shared guard. Failure does not
        // affect the webhook response.
        await sendWelcomeOnce({
          subscriptionId,
          email: customerEmail,
          name: customerName,
          role: role as 'subscriber' | 'pro_subscriber',
          interval: billingInterval,
        })

        break
      }

      // Subscription renewal succeeded
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = getInvoiceSubscriptionId(invoice)
        if (!subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break

        const periodEndISO = getPeriodEndISO(subscription)
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'active',
            ...(periodEndISO ? { current_period_end: periodEndISO } : {}),
          })
          .eq('id', userId)

        break
      }

      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = getInvoiceSubscriptionId(invoice)
        if (!subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) {
          console.error('Webhook invoice.payment_failed: userId missing', { subscriptionId })
          break
        }

        await supabaseAdmin
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', userId)

        break
      }

      // Subscription upgraded/downgraded via Stripe Portal → sync role
      case 'customer.subscription.updated': {
        const eventSubscription = event.data.object as Stripe.Subscription
        const userId = eventSubscription.metadata?.supabase_user_id
        if (!userId) {
          // Shared Stripe account: subscription events for other products
          // (e.g. tatlife) are delivered here too. Without our metadata they
          // aren't ours — ignore them quietly rather than logging an error.
          break
        }

        // Re-fetch through the SDK (pinned to our API version) so we never read
        // price / current_period_end off the raw event payload. This endpoint
        // inherited the shared account's legacy default API version, whose
        // payload shape omits `price` (it's under `plan`) and the item-level
        // period end — reading those directly would throw or silently drop data.
        const subscription = await stripe.subscriptions.retrieve(eventSubscription.id)

        const priceId = subscription.items.data[0]?.price?.id
        const role = priceId ? (PRICE_ROLE_MAP[priceId] ?? 'subscriber') : 'subscriber'

        // The portal schedules downgrades at period end (decreasing_item_amount):
        // the subscription keeps its current price/role until the schedule
        // executes. Surface that pending switch so the dashboard can tell the
        // member they keep their current tier until <date>. No schedule → clear.
        const pending = await getScheduledChange(subscription, role)

        // Surface a pending cancellation ("active until <date>, then ends").
        // Stripe sets `cancel_at` when the member schedules cancellation; it
        // clears when they resume. null → not cancelling.
        const cancelAt = subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000).toISOString()
          : null

        // Fetch the prior value so we can tell "just scheduled" apart from
        // "already scheduled, some other field changed" — this webhook fires
        // for other updates too, and a schedule confirmation email must only
        // go out once, on the null → set transition.
        const { data: priorProfile } = await supabaseAdmin
          .from('profiles')
          .select('cancel_at, full_name')
          .eq('id', userId)
          .single()
        const justScheduledCancellation = !priorProfile?.cancel_at && !!cancelAt

        const periodEndISO = getPeriodEndISO(subscription)
        await supabaseAdmin
          .from('profiles')
          .update({
            role,
            subscription_status: domainStatus(subscription.status),
            pending_tier: pending.tier,
            pending_tier_at: pending.at,
            cancel_at: cancelAt,
            billing_interval: getBillingInterval(subscription),
            ...(periodEndISO ? { current_period_end: periodEndISO } : {}),
          })
          .eq('id', userId)

        // Confirm the scheduled cancellation immediately — the "it's really
        // over" email (cancellationEmail, above) only fires weeks later when
        // Stripe deletes the subscription at period end, so without this a
        // member who cancels gets no email at all until then (Jez's QA
        // report, 2026-07-02).
        if (justScheduledCancellation && cancelAt) {
          try {
            const customerId = subscription.customer as string
            const customer = await stripe.customers.retrieve(customerId)
            if (!customer.deleted) {
              const toEmail = (customer as Stripe.Customer).email
              if (toEmail) {
                const accessUntil = new Date(cancelAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })
                const { subject, html } = cancellationScheduledEmail(priorProfile?.full_name ?? null, accessUntil)
                await resend.emails.send({ from: FROM_EMAIL, to: toEmail, subject, html })
              }
            }
          } catch (emailError) {
            console.error('Cancellation-scheduled email failed:', emailError)
          }
        }

        break
      }

      // Subscription cancelled → reset role
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break

        // Only reset if the cancelled subscription is the one the profile tracks.
        // Cancelling a stale/duplicate subscription must not revoke access that
        // a still-active subscription continues to grant.
        const { data: currentProfile } = await supabaseAdmin
          .from('profiles')
          .select('stripe_subscription_id')
          .eq('id', userId)
          .single()
        if (currentProfile?.stripe_subscription_id && currentProfile.stripe_subscription_id !== subscription.id) break

        await supabaseAdmin
          .from('profiles')
          .update({
            role: 'guest',
            stripe_subscription_id: null,
            subscription_status: 'inactive',
            current_period_end: null,
            pending_tier: null,
            pending_tier_at: null,
            cancel_at: null,
          })
          .eq('id', userId)

        // Send cancellation confirmation email
        try {
          const customerId = subscription.customer as string
          const customer = await stripe.customers.retrieve(customerId)
          if (customer.deleted) break

          const toEmail = (customer as Stripe.Customer).email
          const name = (customer as Stripe.Customer).name
          if (toEmail) {
            const { subject, html } = cancellationEmail(name ?? null)
            await resend.emails.send({ from: FROM_EMAIL, to: toEmail, subject, html })
          }
        } catch (emailError) {
          console.error('Cancellation email failed:', emailError)
        }

        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    // Roll back the idempotency marker so Stripe's automatic retry can
    // reprocess this event — otherwise a transient failure would be
    // permanently swallowed as "already processed".
    await releaseOnce(event.id)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

