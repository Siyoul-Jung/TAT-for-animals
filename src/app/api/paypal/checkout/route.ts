import { createClient } from '@/lib/supabase/server'
import { paypalRequest, PLAN_IDS } from '@/lib/paypal'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    return NextResponse.json({ error: 'PayPal subscription creation failed' }, { status: 500 })
  }

  return NextResponse.json({ url: approveLink })
}
