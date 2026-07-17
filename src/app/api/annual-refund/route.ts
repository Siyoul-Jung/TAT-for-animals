import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest, getPayPalSubscription, getPlanInterval } from '@/lib/paypal'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { refundConfirmationEmail } from '@/lib/emails/refund-confirmation'
import { claimOnce, releaseOnce } from '@/lib/onceGuard'
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'
import { reportOpsError } from '@/lib/alertOps'
import { isWithinRefundWindow, REFUND_WINDOW_DAYS } from '@/lib/refundWindow'
import { NextResponse } from 'next/server'

// Self-service cancel-with-full-refund for ANNUAL members inside the 14-day
// window (Tapas, 2026-07-15 — "so we don't have to write emails back and
// authorize refunds by hand"). Monthly members already cancel themselves and
// have nothing to refund, so this route only serves annual subscriptions.
//
// Order of operations is deliberate: REFUND FIRST, THEN CANCEL. If the refund
// fails, nothing has changed and the member can retry. If the cancel fails
// after the refund, the member has their money (the part that matters to
// them) — we alert ops to finish the cancel by hand rather than leave a
// refunded member unrefundable.
//
// Eligibility is checked against the PROVIDER's start date, not our DB —
// for money decisions the payment ledger is the source of truth.

const WINDOW_CLOSED =
  `The ${REFUND_WINDOW_DAYS}-day refund window for your membership has passed. ` +
  `You can still cancel anytime and keep access until the end of your paid year — ` +
  `or email us if something isn't right and we'll take a look together.`

const REFUND_FAILED =
  "We couldn't process your refund just now. Nothing has been changed — please try again in a moment, or email us and we'll take care of it."

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id, paypal_subscription_id, billing_interval, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.billing_interval !== 'year') {
    return NextResponse.json(
      { error: 'This option is for annual memberships. Monthly memberships can simply be cancelled — no refund needed.' },
      { status: 400 },
    )
  }

  const stripeSubId = profile.stripe_subscription_id
  const paypalSubId = profile.paypal_subscription_id
  if (!stripeSubId && !paypalSubId) {
    return NextResponse.json({ error: 'No active membership found.' }, { status: 400 })
  }

  if (!(await checkRateLimit('annual-refund', user.id, 3, 3600))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const subId = (stripeSubId ?? paypalSubId)!
  const refundClaimKey = `refund-cancel-${subId}`

  try {
    // ---- 1. Verify eligibility + locate the payment at the provider --------
    let refundAmount: string | null
    let doRefund: () => Promise<void>
    let doCancel: () => Promise<void>

    if (stripeSubId) {
      const sub = await stripe.subscriptions.retrieve(stripeSubId, {
        expand: ['latest_invoice.payments'],
      })
      if (sub.status !== 'active') {
        return NextResponse.json({ error: 'No active membership found.' }, { status: 400 })
      }
      if (sub.items.data[0]?.price?.recurring?.interval !== 'year') {
        return NextResponse.json(
          { error: 'This option is for annual memberships.' },
          { status: 400 },
        )
      }

      const invoice = sub.latest_invoice as Stripe.Invoice | null
      if (!invoice) {
        await reportOpsError('annual-refund', new Error('Active annual subscription has no latest invoice'), {
          userId: user.id, subscriptionId: stripeSubId,
        })
        return NextResponse.json({ error: REFUND_FAILED }, { status: 502 })
      }

      // Only refund a real annual charge. After an admin plan change the
      // latest invoice can be a proration adjustment — refunding it would
      // return the wrong amount (and call it "full") while cancelling the
      // whole membership. Those cases go to the manual path instead.
      if (invoice.billing_reason !== 'subscription_create' && invoice.billing_reason !== 'subscription_cycle') {
        await reportOpsError('annual-refund', new Error(`Latest invoice is not an annual charge (billing_reason: ${invoice.billing_reason})`), {
          userId: user.id, subscriptionId: stripeSubId, invoiceId: invoice.id,
        })
        return NextResponse.json({ error: REFUND_FAILED }, { status: 502 })
      }

      // The window is anchored to the LATEST annual charge (this invoice), not
      // the subscription's original start: each yearly charge is a "purchase"
      // with its own 14 days (matches the FAQ wording, and covers the most
      // common refund case — a member who forgot to cancel before renewal).
      // This also keeps the dashboard's period_end−1year estimate truthful
      // after renewals, where start_date would drift a year+ behind.
      if (!isWithinRefundWindow(invoice.created * 1000)) {
        return NextResponse.json({ error: WINDOW_CLOSED }, { status: 403 })
      }

      // On this API version an invoice's money movement lives in
      // invoice.payments (invoice.payment_intent no longer exists).
      const paidPayment = invoice.payments?.data.find((p) => p.status === 'paid')
      const pi = paidPayment?.payment.payment_intent
      const paymentIntentId = typeof pi === 'string' ? pi : pi?.id
      if (!paymentIntentId || !invoice.amount_paid) {
        // Shouldn't happen for an active annual sub — surface to ops, keep the
        // member unblocked with the manual path.
        await reportOpsError('annual-refund', new Error('No refundable payment found on latest invoice'), {
          userId: user.id, subscriptionId: stripeSubId, invoiceId: invoice.id,
        })
        return NextResponse.json({ error: REFUND_FAILED }, { status: 502 })
      }

      refundAmount = formatUsd(invoice.amount_paid / 100)
      doRefund = async () => {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'requested_by_customer',
        })
      }
      doCancel = async () => {
        await stripe.subscriptions.cancel(stripeSubId)
      }
    } else {
      const sub = await getPayPalSubscription(paypalSubId!)
      if (sub.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'No active membership found.' }, { status: 400 })
      }
      if (getPlanInterval(sub.plan_id) !== 'year') {
        return NextResponse.json(
          { error: 'This option is for annual memberships.' },
          { status: 400 },
        )
      }

      // Find the completed capture for the annual charge so we can refund it.
      const rangeStart = sub.start_time ?? new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString()
      const txRes = await paypalRequest(
        `/v1/billing/subscriptions/${paypalSubId}/transactions` +
          `?start_time=${encodeURIComponent(rangeStart)}&end_time=${encodeURIComponent(new Date().toISOString())}`,
        { method: 'GET' },
      )
      if (!txRes.ok) throw new Error(`PayPal transactions fetch failed: ${txRes.status}`)
      const txData: {
        transactions?: {
          id: string
          status: string
          time: string
          amount_with_breakdown?: { gross_amount?: { value?: string; currency_code?: string } }
        }[]
      } = await txRes.json()
      const capture = (txData.transactions ?? [])
        .filter((t) => t.status === 'COMPLETED')
        .sort((a, b) => (a.time < b.time ? 1 : -1))[0]
      if (!capture) {
        await reportOpsError('annual-refund', new Error('No completed PayPal capture found'), {
          userId: user.id, subscriptionId: paypalSubId,
        })
        return NextResponse.json({ error: REFUND_FAILED }, { status: 502 })
      }

      // Window anchored to the latest annual charge, not the subscription
      // start — same policy as the Stripe branch (each renewal is a purchase
      // with its own 14 days).
      if (!isWithinRefundWindow(new Date(capture.time).getTime())) {
        return NextResponse.json({ error: WINDOW_CLOSED }, { status: 403 })
      }

      const gross = capture.amount_with_breakdown?.gross_amount?.value
      refundAmount = gross ? `$${gross}` : null
      doRefund = async () => {
        // Empty body = full refund of the capture.
        const res = await paypalRequest(`/v2/payments/captures/${capture.id}/refund`, {
          method: 'POST',
          body: '{}',
        })
        if (res.status !== 201 && res.status !== 200) {
          throw new Error(`PayPal refund failed: ${res.status} ${await res.text()}`)
        }
      }
      doCancel = async () => {
        const res = await paypalRequest(`/v1/billing/subscriptions/${paypalSubId}/cancel`, {
          method: 'POST',
          body: JSON.stringify({ reason: 'Cancelled with 14-day refund from account page' }),
        })
        // 422 = already cancelled — fine, the refund is what mattered.
        if (res.status !== 204 && res.status !== 422) {
          throw new Error(`PayPal cancel failed: ${res.status} ${await res.text()}`)
        }
      }
    }

    // ---- 2. Claim ownership of this cancel's member comms ------------------
    // Claimed BEFORE the refund: the cancellation webhooks check this key and
    // skip their own email / grace-period handling (their "access until period
    // end" copy would be wrong for a refunded cancel).
    const { alreadyProcessed } = await claimOnce(refundClaimKey)
    if (alreadyProcessed) {
      // The provider just told us this subscription is still active (checked
      // above), yet the refund-cancel is already claimed: a previous attempt
      // died mid-flight (or a parallel request is racing us). Echoing success
      // here could tell the member "refunded" when nothing actually moved —
      // hand it to ops and keep the member on the manual path instead.
      await reportOpsError('annual-refund', new Error('Refund claim exists but the subscription is still active at the provider'), {
        userId: user.id, subscriptionId: subId, step: 'stuck-claim',
        note: 'Check the provider: if the refund/cancel never completed, finish it manually or release the refund-cancel claim.',
      })
      return NextResponse.json({ error: REFUND_FAILED }, { status: 502 })
    }

    // ---- 3. Refund first --------------------------------------------------
    try {
      await doRefund()
    } catch (refundError) {
      // Nothing moved — release the claim so a retry can run, tell the member.
      await releaseOnce(refundClaimKey)
      await reportOpsError('annual-refund', refundError, { userId: user.id, subscriptionId: subId, step: 'refund' })
      return NextResponse.json({ error: REFUND_FAILED }, { status: 502 })
    }

    // ---- 4. Then cancel ----------------------------------------------------
    try {
      await doCancel()
    } catch (cancelError) {
      // Money is already back with the member — that part is done. Ops must
      // finish the provider-side cancel by hand; the member shouldn't be
      // blocked or alarmed. Access is revoked below either way.
      await reportOpsError('annual-refund', cancelError, {
        userId: user.id, subscriptionId: subId, step: 'cancel',
        note: 'REFUND ALREADY ISSUED — cancel the subscription manually at the provider.',
      })
    }

    // ---- 5. Revoke access now (refunded = not paid) ------------------------
    // The webhooks will repeat this idempotently when they arrive.
    const { error: revokeError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'guest',
        stripe_subscription_id: null,
        paypal_subscription_id: null,
        paypal_pending_subscription_id: null,
        subscription_status: 'inactive',
        current_period_end: null,
        pending_tier: null,
        pending_tier_at: null,
        cancel_at: null,
      })
      .eq('id', user.id)
    if (revokeError) {
      // Money is back but access wasn't revoked — the webhooks are the
      // backstop, but ops should know in case they don't arrive either.
      await reportOpsError('annual-refund', revokeError, {
        userId: user.id, subscriptionId: subId, step: 'revoke',
        note: 'Refund issued and provider cancel attempted, but the profile revoke failed.',
      })
    }

    // ---- 6. Confirm by email (once) ----------------------------------------
    if (user.email) {
      const emailKey = `refund-email-${subId}`
      const { alreadyProcessed: emailSent } = await claimOnce(emailKey)
      if (!emailSent) {
        try {
          const { subject, html } = refundConfirmationEmail(profile.full_name ?? null, refundAmount)
          const { error: sendError } = await resend.emails.send({ from: FROM_EMAIL, to: user.email, subject, html })
          // resend reports failures in the returned `error` — it doesn't
          // throw. Without this check a failed send would be silent.
          if (sendError) throw new Error(`Resend: ${sendError.message}`)
        } catch (emailError) {
          // The member was told a confirmation is coming — if it can't be
          // sent, ops follows up by hand rather than leaving them wondering.
          await reportOpsError('annual-refund', emailError, {
            userId: user.id, subscriptionId: subId, step: 'email',
            note: 'Refund processed but the confirmation email failed — send one manually.',
          })
          await releaseOnce(emailKey)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // A read failed before anything moved (provider fetch etc.).
    await reportOpsError('annual-refund', error, { userId: user.id, subscriptionId: subId, step: 'verify' })
    return NextResponse.json({ error: REFUND_FAILED }, { status: 502 })
  }
}
