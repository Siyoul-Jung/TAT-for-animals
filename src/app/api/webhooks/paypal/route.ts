import { supabaseAdmin } from '@/lib/supabase/admin'
import { claimOnce, releaseOnce, hasClaim } from '@/lib/onceGuard'
import { reportOpsError } from '@/lib/alertOps'
import { paypalRequest, PLAN_ROLE_MAP, getPayPalSubscription, getPlanInterval, estimatePaidThrough, type PayPalWebhookEvent } from '@/lib/paypal'
import { sendWelcomeOnce } from '@/lib/sendWelcomeOnce'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { planChangeEmail } from '@/lib/emails/plan-change'
import { NextRequest, NextResponse } from 'next/server'

// Rank roles so we can tell an upgrade from a downgrade. A plan change that
// *raises* access applies immediately; one that *lowers* it is deferred to the
// end of the period the member already paid for (they keep the higher tier
// until then). Downgrade role-sync happens on the next PAYMENT.SALE.COMPLETED.
const ROLE_RANK: Record<string, number> = {
  guest: 0,
  subscriber: 1,
  pro_subscriber: 2,
}

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

  // Verification calls PayPal's verify-webhook API, so it can itself fail on a
  // network blip. Guard it: a thrown verify shouldn't bypass this handler's
  // ops-alerting (the try below) and return a silent 500. Alert and 503 so PayPal
  // retries. An actually-invalid signature is a clean 400 (no retry — it's junk).
  let isValid: boolean
  try {
    isValid = await verifyWebhook(request, body)
  } catch (error) {
    await reportOpsError('paypal-webhook-verify', error)
    return NextResponse.json({ error: 'Verification temporarily unavailable' }, { status: 503 })
  }
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body) as PayPalWebhookEvent
  const resource = event.resource

  // Idempotency — claim the event id; a duplicate was already handled.
  const { alreadyProcessed } = await claimOnce(event.id)
  if (alreadyProcessed) return NextResponse.json({ received: true })

  try {
    switch (event.event_type) {

      // Subscription activated (PayPal approval complete)
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const userId = resource.custom_id
        const role = resource.plan_id ? (PLAN_ROLE_MAP[resource.plan_id] ?? 'subscriber') : 'subscriber'
        if (!userId) break

        await supabaseAdmin
          .from('profiles')
          .update({
            role,
            paypal_subscription_id: resource.id,
            // Now active — clear the "pending approval" marker used to block duplicates.
            paypal_pending_subscription_id: null,
            subscription_status: 'active',
            billing_interval: getPlanInterval(resource.plan_id),
            pending_tier: null,
            pending_tier_at: null,
            // A fresh activation is, by definition, not cancelling — clear any
            // stale cancel_at so a cancel-then-rejoin member (e.g. a PayPal
            // downgrade) isn't lapsed by the previous subscription's end date.
            cancel_at: null,
            // Store the paid-through date at activation so the cancel flow has a
            // reliable fallback even before the first PAYMENT.SALE.COMPLETED.
            ...(resource.billing_info?.next_billing_time
              ? { current_period_end: resource.billing_info.next_billing_time }
              : {}),
          })
          .eq('id', userId)

        // Welcome email — sent exactly once across every activation path
        // (this webhook / PayPal return handler / self-heal) via the shared
        // guard. Failure must not affect the webhook response.
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('email, full_name')
          .eq('id', userId)
          .single()
        await sendWelcomeOnce({
          subscriptionId: resource.id,
          email: profile?.email,
          name: profile?.full_name,
          role: role as 'subscriber' | 'pro_subscriber',
          interval: getPlanInterval(resource.plan_id),
        })
        break
      }

      // Plan changed in place via `revise` (upgrade OR downgrade).
      //   Upgrade  → apply the higher role immediately (member paid the prorated
      //              difference and wants the extra access now).
      //   Downgrade→ keep the current (higher) role; record the pending change so
      //              the dashboard can show "switches on <date>". The role itself
      //              drops at the next renewal (PAYMENT.SALE.COMPLETED), i.e. when
      //              the already-paid period actually ends.
      case 'BILLING.SUBSCRIPTION.UPDATED': {
        const userId = resource.custom_id
        if (!userId) break

        const newRole = resource.plan_id ? (PLAN_ROLE_MAP[resource.plan_id] ?? 'subscriber') : 'subscriber'

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role, email, full_name')
          .eq('id', userId)
          .single()
        const currentRole = profile?.role ?? 'guest'

        if ((ROLE_RANK[newRole] ?? 0) < (ROLE_RANK[currentRole] ?? 0)) {
          // Downgrade — defer. Read the authoritative next billing date.
          let nextBilling: string | null = null
          if (resource.id) {
            try {
              const sub = await getPayPalSubscription(resource.id)
              nextBilling = sub.billing_info?.next_billing_time ?? null
            } catch (e) {
              console.error('PayPal getSubscription (downgrade) failed:', e)
            }
          }
          await supabaseAdmin
            .from('profiles')
            .update({ pending_tier: newRole, pending_tier_at: nextBilling })
            .eq('id', userId)
        } else {
          // Upgrade (or revert to same tier) — apply now, clear any pending change.
          await supabaseAdmin
            .from('profiles')
            .update({ role: newRole, pending_tier: null, pending_tier_at: null })
            .eq('id', userId)

          // Upgrade confirmation — parity with the Stripe path, where
          // /api/change-plan sends this directly. PayPal upgrades finalize
          // here (after the buyer approves on PayPal's site), so this is the
          // first moment the change is real. Strict rank increase only — a
          // same-tier revise shouldn't congratulate anyone.
          const isRealUpgrade = (ROLE_RANK[newRole] ?? 0) > (ROLE_RANK[currentRole] ?? 0)
          if (isRealUpgrade && profile?.email && (newRole === 'subscriber' || newRole === 'pro_subscriber')) {
            try {
              const { subject, html } = planChangeEmail(profile.full_name ?? null, newRole)
              await resend.emails.send({ from: FROM_EMAIL, to: profile.email, subject, html })
            } catch (emailError) {
              console.error('Plan change email (PayPal) failed:', emailError)
            }
          }
        }
        break
      }

      // Payment completed (initial or renewal) → re-sync role from the
      // subscription's *current* plan. This is where a deferred downgrade lands:
      // at renewal the plan is the lower one, so the role drops now — exactly
      // when the previously-paid period ends. Also refreshes the next billing date.
      case 'PAYMENT.SALE.COMPLETED': {
        const subscriptionId = resource.billing_agreement_id
        if (!subscriptionId) break

        const update: Record<string, unknown> = { subscription_status: 'active' }
        try {
          const sub = await getPayPalSubscription(subscriptionId)
          if (sub.plan_id && PLAN_ROLE_MAP[sub.plan_id]) {
            update.role = PLAN_ROLE_MAP[sub.plan_id]
            // Keep the cadence in sync with the plan actually billed (covers an
            // admin-driven month↔year switch landing at renewal).
            update.billing_interval = getPlanInterval(sub.plan_id)
          }
          if (sub.billing_info?.next_billing_time) {
            update.current_period_end = sub.billing_info.next_billing_time
          }
          // Only clear the pending marker once we've actually applied the
          // current plan — otherwise a transient fetch failure would hide a
          // still-pending downgrade from the dashboard.
          update.pending_tier = null
          update.pending_tier_at = null
        } catch (e) {
          // Couldn't read the plan — still mark active, but don't guess the role
          // or clear a pending change we can't confirm has landed.
          console.error('PayPal getSubscription (sale) failed:', e)
        }

        await supabaseAdmin
          .from('profiles')
          .update(update)
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

      // Member cancelled → keep access until the paid period ends (parity with
      // Stripe). The role lapses via the lazy cutoff in lib/access, since PayPal
      // sends no period-end event for a cancelled subscription.
      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const userId = resource.custom_id
        if (!userId) break

        // A cancel issued by the annual-refund route: no grace period — the
        // member was refunded, so access ends now, not at period end. Repeat
        // the route's revoke idempotently instead of skipping outright: if the
        // route died between its refund and its own revoke (serverless
        // timeout), this webhook is the backstop that still pulls access.
        if (resource.id && (await hasClaim(`refund-cancel-${resource.id}`))) {
          // Stale-event guard (parity with the Stripe deleted handler): if the
          // member already re-subscribed, the profile points at a NEWER
          // subscription — this late CANCELLED for the refunded one must not
          // wipe the new membership. A null stored id just means the route's
          // own revoke already ran; repeating it below is harmless.
          const { data: current } = await supabaseAdmin
            .from('profiles')
            .select('paypal_subscription_id')
            .eq('id', userId)
            .single()
          if (current?.paypal_subscription_id && current.paypal_subscription_id !== resource.id) break

          await supabaseAdmin
            .from('profiles')
            .update({
              role: 'guest',
              paypal_subscription_id: null,
              paypal_pending_subscription_id: null,
              subscription_status: 'inactive',
              current_period_end: null,
              pending_tier: null,
              pending_tier_at: null,
              cancel_at: null,
            })
            .eq('id', userId)
          break
        }

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('current_period_end, cancel_at, billing_interval')
          .eq('id', userId)
          .single()

        // Keep access until the paid period ends (parity with Stripe). Prefer a
        // date already set by /api/paypal/cancel, else the stored renewal date,
        // else a bounded interval estimate — never revoke a paying member on the
        // spot just because we couldn't read the exact end date.
        const interval = profile?.billing_interval === 'year' ? 'year' : 'month'
        const paidThrough = profile?.cancel_at ?? profile?.current_period_end ?? estimatePaidThrough(interval)
        await supabaseAdmin
          .from('profiles')
          .update({ cancel_at: paidThrough, pending_tier: null, pending_tier_at: null })
          .eq('id', userId)
        break
      }

      // Authorization revoked, or the term ended naturally → access ends now.
      case 'BILLING.SUBSCRIPTION.CONSENT.REVOKED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const userId = resource.custom_id
        if (!userId) break

        await supabaseAdmin
          .from('profiles')
          .update({
            role: 'guest',
            paypal_subscription_id: null,
            paypal_pending_subscription_id: null,
            subscription_status: 'inactive',
            pending_tier: null,
            pending_tier_at: null,
            cancel_at: null,
          })
          .eq('id', userId)
        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    // Alert the team — a failed subscription webhook that nobody sees can leave
    // a paid member without access, or over-granted after a cancel. (Also logs.)
    await reportOpsError('paypal-webhook', error, { eventType: event.event_type, eventId: event.id })
    // Roll back the idempotency marker so PayPal's retry can reprocess this
    // event instead of it being permanently swallowed as "already processed".
    await releaseOnce(event.id)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
