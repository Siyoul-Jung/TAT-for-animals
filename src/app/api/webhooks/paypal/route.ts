import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest, PLAN_ROLE_MAP } from '@/lib/paypal'
import { NextRequest, NextResponse } from 'next/server'

async function verifyWebhook(request: NextRequest, body: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.error('PAYPAL_WEBHOOK_ID not set — rejecting webhook')
    return false
  }

  const res = await paypalRequest('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: JSON.stringify({
      auth_algo:         request.headers.get('paypal-auth-algo'),
      cert_url:          request.headers.get('paypal-cert-url'),
      transmission_id:   request.headers.get('paypal-transmission-id'),
      transmission_sig:  request.headers.get('paypal-transmission-sig'),
      transmission_time: request.headers.get('paypal-transmission-time'),
      webhook_id:        webhookId,
      webhook_event:     JSON.parse(body),
    }),
  })

  const data = await res.json()
  return data.verification_status === 'SUCCESS'
}

export async function POST(request: NextRequest) {
  const body = await request.text()

  const isValid = await verifyWebhook(request, body)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const resource = event.resource

  // Idempotency — INSERT first; conflict means already processed
  const { error: idempotencyError } = await supabaseAdmin
    .from('processed_webhook_events')
    .insert({ id: event.id })
  if (idempotencyError?.code === '23505') return NextResponse.json({ received: true })

  try {
    switch (event.event_type) {

      // Subscription activated (PayPal approval complete)
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const userId = resource.custom_id
        const role = PLAN_ROLE_MAP[resource.plan_id] ?? 'subscriber'
        if (!userId) break

        await supabaseAdmin
          .from('profiles')
          .update({
            role,
            paypal_subscription_id: resource.id,
            subscription_status: 'active',
          })
          .eq('id', userId)
        break
      }

      // Plan changed in place via `revise` (upgrade/downgrade) → re-sync role
      // from the subscription's (possibly new) plan. Idempotent: if the plan is
      // unchanged the role just stays the same.
      case 'BILLING.SUBSCRIPTION.UPDATED': {
        const userId = resource.custom_id
        if (!userId) break

        const role = PLAN_ROLE_MAP[resource.plan_id] ?? 'subscriber'
        await supabaseAdmin
          .from('profiles')
          .update({ role })
          .eq('id', userId)
        break
      }

      // Payment completed → update renewal period
      case 'PAYMENT.SALE.COMPLETED': {
        const subscriptionId = resource.billing_agreement_id
        if (!subscriptionId) break

        await supabaseAdmin
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('paypal_subscription_id', subscriptionId)
        break
      }

      // Payment failed
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        const userId = resource.custom_id
        if (!userId) break

        await supabaseAdmin
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', userId)
        break
      }

      // User revoked PayPal authorization
      case 'BILLING.SUBSCRIPTION.CONSENT.REVOKED':
      // Subscription cancelled or expired
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const userId = resource.custom_id
        if (!userId) break

        await supabaseAdmin
          .from('profiles')
          .update({
            role: 'guest',
            paypal_subscription_id: null,
            subscription_status: 'inactive',
          })
          .eq('id', userId)
        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    // Roll back the idempotency marker so PayPal's retry can reprocess this
    // event instead of it being permanently swallowed as "already processed".
    await supabaseAdmin
      .from('processed_webhook_events')
      .delete()
      .eq('id', event.id)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
