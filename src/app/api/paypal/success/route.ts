import { supabaseAdmin } from '@/lib/supabase/admin'
import { paypalRequest, PLAN_ROLE_MAP } from '@/lib/paypal'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subscriptionId = searchParams.get('subscription_id')

  if (!subscriptionId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/membership?error=paypal_failed`)
  }

  const res = await paypalRequest(`/v1/billing/subscriptions/${subscriptionId}`)
  const subscription = await res.json()

  const userId = subscription.custom_id
  const planId = subscription.plan_id
  const role = PLAN_ROLE_MAP[planId] ?? 'subscriber'

  if (!userId || subscription.status !== 'ACTIVE') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/membership?error=paypal_failed`)
  }

  // Idempotency — prevent duplicate processing on page refresh
  const { error: idempotencyError } = await supabaseAdmin
    .from('processed_webhook_events')
    .insert({ id: `paypal-success-${subscriptionId}` })

  if (!idempotencyError || idempotencyError.code !== '23505') {
    await supabaseAdmin
      .from('profiles')
      .update({
        role,
        paypal_subscription_id: subscriptionId,
        subscription_status: 'active',
      })
      .eq('id', userId)
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/thank-you`)
}
