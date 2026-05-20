import { createClient as createAdminClient } from '@supabase/supabase-js'
import { paypalRequest, PLAN_ROLE_MAP } from '@/lib/paypal'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subscriptionId = searchParams.get('subscription_id')

  if (!subscriptionId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/membership`)
  }

  const res = await paypalRequest(`/v1/billing/subscriptions/${subscriptionId}`)
  const subscription = await res.json()

  const userId = subscription.custom_id
  const planId = subscription.plan_id
  const role = PLAN_ROLE_MAP[planId] ?? 'subscriber'

  if (!userId || subscription.status !== 'ACTIVE') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/membership`)
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      role,
      paypal_subscription_id: subscriptionId,
      subscription_status: 'active',
    })
    .eq('id', userId)

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/thank-you`)
}
