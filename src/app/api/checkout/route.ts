import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 플랜별 Stripe Price ID — 가격 확정 후 .env에서 관리
const PRICE_IDS: Record<string, string> = {
  self: process.env.STRIPE_PRICE_HELP_YOURSELF!,
  pro:  process.env.STRIPE_PRICE_PROFESSIONAL!,
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await request.json()
  const priceId = PRICE_IDS[plan]

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // 기존 Stripe 고객 ID 조회 또는 신규 생성
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, full_name')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    // profiles에 저장
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/membership`,
    // 세션 레벨 metadata — checkout.session.completed 이벤트에서 직접 읽힘
    metadata: { supabase_user_id: user.id },
    subscription_data: {
      // 구독 레벨 metadata — invoice 이벤트에서 읽힘
      metadata: { supabase_user_id: user.id },
    },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
