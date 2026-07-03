import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest, getPayPalSubscription, estimatePaidThrough } from '@/lib/paypal'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { cancellationScheduledEmail } from '@/lib/emails/cancellation-scheduled'
import { claimOnce, releaseOnce } from '@/lib/onceGuard'
import { NextResponse } from 'next/server'

// Self-service cancellation for PayPal members. Stripe members cancel through
// the Stripe Customer Portal (/api/portal); PayPal has no equivalent hosted
// portal, so we call PayPal's cancel API directly. PayPal then fires
// BILLING.SUBSCRIPTION.CANCELLED, which the webhook also handles — we update the
// profile here too so the dashboard reflects the change immediately.
export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('paypal_subscription_id, current_period_end, billing_interval, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.paypal_subscription_id) {
    return NextResponse.json({ error: 'No PayPal subscription found.' }, { status: 400 })
  }

  // Read the paid-through date BEFORE cancelling (PayPal nulls next_billing_time
  // once a subscription is cancelled). The member keeps access until then.
  // Resolve in order of accuracy: live PayPal read → the date stored at
  // activation → a bounded interval estimate. The estimate guarantees we never
  // strip a paying member's access immediately on a transient read failure.
  const interval = profile.billing_interval === 'year' ? 'year' : 'month'
  let paidThrough: string = profile.current_period_end ?? estimatePaidThrough(interval)
  try {
    const sub = await getPayPalSubscription(profile.paypal_subscription_id)
    paidThrough = sub.billing_info?.next_billing_time ?? paidThrough
  } catch (e) {
    console.error('PayPal getSubscription (cancel) failed:', e)
  }

  const res = await paypalRequest(
    `/v1/billing/subscriptions/${profile.paypal_subscription_id}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({ reason: 'Cancelled by member from account page' }),
    }
  )

  // PayPal returns 204 No Content on success. Treat an already-cancelled
  // subscription (422) as success so the button is idempotent.
  if (res.status !== 204 && res.status !== 422) {
    const detail = await res.text()
    console.error('PayPal cancel failed:', res.status, detail)
    return NextResponse.json(
      { error: 'We couldn’t cancel your membership just now. Please try again, or email us and we’ll take care of it.' },
      { status: 502 }
    )
  }

  // Keep access until the paid period ends (parity with Stripe), then it lapses
  // via the lazy cutoff in lib/access. paidThrough is always set (estimate is the
  // last resort), so a cancel never revokes a paying member's access on the spot.
  await supabaseAdmin
    .from('profiles')
    .update({ cancel_at: paidThrough })
    .eq('id', user.id)

  // Confirm the scheduled cancellation by email — parity with the Stripe path
  // (the Stripe webhook sends this on the cancel_at transition; PayPal's
  // CANCELLED webhook sends nothing, so this route is where PayPal members get
  // theirs). claimOnce keyed on the subscription id: the cancel button is
  // idempotent (a 422 re-click still lands here), and a PayPal subscription
  // can only ever be cancelled once, so one email per subscription is right.
  if (user.email) {
    const emailKey = `cancel-scheduled-${profile.paypal_subscription_id}`
    const { alreadyProcessed } = await claimOnce(emailKey)
    if (!alreadyProcessed) {
      try {
        const accessUntil = new Date(paidThrough).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })
        const { subject, html } = cancellationScheduledEmail(profile.full_name ?? null, accessUntil)
        await resend.emails.send({ from: FROM_EMAIL, to: user.email, subject, html })
      } catch (emailError) {
        // Release so a retry (member re-clicks) can re-attempt the send.
        console.error('Cancellation-scheduled email (PayPal) failed:', emailError)
        await releaseOnce(emailKey)
      }
    }
  }

  return NextResponse.json({ success: true })
}
