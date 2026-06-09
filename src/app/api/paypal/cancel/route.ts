import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest, getPayPalSubscription } from '@/lib/paypal'
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
    .select('paypal_subscription_id, current_period_end')
    .eq('id', user.id)
    .single()

  if (!profile?.paypal_subscription_id) {
    return NextResponse.json({ error: 'No PayPal subscription found.' }, { status: 400 })
  }

  // Read the paid-through date BEFORE cancelling (PayPal nulls next_billing_time
  // once a subscription is cancelled). The member keeps access until then.
  let paidThrough: string | null = profile.current_period_end ?? null
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
  // via the lazy cutoff in lib/access. If we don't know the paid-through date,
  // fall back to ending access now rather than granting it indefinitely.
  await supabaseAdmin
    .from('profiles')
    .update(
      paidThrough
        ? { cancel_at: paidThrough }
        : { role: 'guest', paypal_subscription_id: null, subscription_status: 'inactive' }
    )
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}
