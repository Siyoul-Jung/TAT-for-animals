import { createClient } from '@/lib/supabase/server'
import { paypalRequest, PLAN_IDS } from '@/lib/paypal'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id, paypal_subscription_id')
    .eq('id', user.id)
    .single()

  if (profile?.stripe_subscription_id || profile?.paypal_subscription_id) {
    return NextResponse.json(
      { error: 'You already have an active subscription.' },
      { status: 400 }
    )
  }

  const { plan } = await request.json()
  const planId = PLAN_IDS[plan]

  if (!planId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const res = await paypalRequest('/v1/billing/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: planId,
      custom_id: user.id,
      subscriber: { email_address: user.email },
      application_context: {
        return_url: `${siteUrl}/api/paypal/success`,
        cancel_url: `${siteUrl}/membership`,
        user_action: 'SUBSCRIBE_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    }),
  })

  const data = await res.json()
  const approveLink = data.links?.find((l: { rel: string }) => l.rel === 'approve')?.href

  if (!approveLink) {
    return NextResponse.json(
      { error: "We couldn't start your PayPal checkout — nothing was charged. Please try again in a moment, or pay with a card." },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: approveLink })
}
