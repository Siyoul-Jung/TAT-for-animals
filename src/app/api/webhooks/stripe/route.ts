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
        const priceId = subscription.items.data[0]?.price.id
        const role = PRICE_ROLE_MAP[priceId] ?? 'subscriber'

        // Fallback: session metadata → subscription metadata
        const userId = session.metadata?.supabase_user_id
          ?? subscription.metadata?.supabase_user_id
        if (!userId) {
          console.error('Webhook checkout.session.completed: userId missing', { subscriptionId })
          break
        }

        const updatePayload: Record<string, unknown> = {
          role,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          current_period_end: getPeriodEndISO(subscription),
        }

        const customerName = session.customer_details?.name
        if (customerName) updatePayload.full_name = customerName

        const customerEmail = session.customer_details?.email
        if (customerEmail) updatePayload.email = customerEmail

        await supabaseAdmin
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId)

        // Send welcome email — failure does not affect webhook response
        const toEmail = session.customer_details?.email
        if (toEmail) {
          try {
            const { subject, html } = welcomeEmail(
              session.customer_details?.name ?? null,
              role as 'subscriber' | 'pro_subscriber'
            )
            await resend.emails.send({ from: FROM_EMAIL, to: toEmail, subject, html })
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
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) {
          console.error('Webhook customer.subscription.updated: userId missing', { subscriptionId: subscription.id })
          break
        }

        const priceId = subscription.items.data[0]?.price.id
        const role = PRICE_ROLE_MAP[priceId] ?? 'subscriber'

        const periodEndISO = getPeriodEndISO(subscription)
        await supabaseAdmin
          .from('profiles')
          .update({
            role,
            subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
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

        await supabaseAdmin
          .from('profiles')
          .update({
            role: 'guest',
            stripe_subscription_id: null,
            subscription_status: 'inactive',
            current_period_end: null,
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

