import { stripe } from '@/lib/stripe'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { welcomeEmail } from '@/lib/emails/welcome'
import { cancellationEmail } from '@/lib/emails/cancellation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Subscription plan → role mapping
// Manage Price IDs and roles here after pricing is confirmed
const PRICE_ROLE_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_CALM_LIBRARY!]: 'subscriber',
  [process.env.STRIPE_PRICE_CALM_CIRCLE!]:  'pro_subscriber',
}

// Stripe API 2025-03-31 (basil) and later moved `current_period_end` off the
// Subscription object onto each Subscription Item. Read it from there.
function getPeriodEndISO(subscription: Stripe.Subscription): string | null {
  const periodEnd = subscription.items.data[0]?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null
}

// The same release removed `Invoice.subscription`; it now lives under
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
  const signature = request.headers.get('stripe-signature')!

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

  // Idempotency — INSERT first; conflict means already processed
  const { error: idempotencyError } = await supabaseAdmin
    .from('processed_webhook_events')
    .insert({ id: event.id })
  if (idempotencyError?.code === '23505') return NextResponse.json({ received: true })

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

        const updatePayload: Record<string, unknown> = {
          role,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          current_period_end: getPeriodEndISO(subscription),
        }
        if (customerName) updatePayload.full_name = customerName
        if (customerEmail) updatePayload.email = customerEmail

        await supabaseAdmin
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId)

        // Send welcome email — failure does not affect webhook response
        if (customerEmail) {
          try {
            const { subject, html } = welcomeEmail(customerName, role as 'subscriber' | 'pro_subscriber')
            await resend.emails.send({ from: FROM_EMAIL, to: customerEmail, subject, html })
          } catch (emailError) {
            console.error('Welcome email failed:', emailError)
          }
        }

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

        const periodEndISO = getPeriodEndISO(subscription)
        await supabaseAdmin
          .from('profiles')
          .update({
            role,
            subscription_status: domainStatus(subscription.status),
            pending_tier: pending.tier,
            pending_tier_at: pending.at,
            ...(periodEndISO ? { current_period_end: periodEndISO } : {}),
          })
          .eq('id', userId)

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
    await supabaseAdmin
      .from('processed_webhook_events')
      .delete()
      .eq('id', event.id)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

