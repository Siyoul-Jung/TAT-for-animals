import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest } from '@/lib/paypal'
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
    .select('paypal_subscription_id')
    .eq('id', user.id)
    .single()

  if (!profile?.paypal_subscription_id) {
    return NextResponse.json({ error: 'No PayPal subscription found.' }, { status: 400 })
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

  // Reflect immediately (the webhook will also sync this — the update is idempotent)
  await supabaseAdmin
    .from('profiles')
    .update({ role: 'guest', paypal_subscription_id: null, subscription_status: 'inactive' })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}
