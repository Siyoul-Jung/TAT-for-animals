import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Webhook은 RLS를 우회해야 하므로 service_role_key 사용
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 구독 플랜 → role 매핑
// 가격 확정 후 Price ID와 role을 여기서 관리
const PRICE_ROLE_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_HELP_YOURSELF!]: 'subscriber',
  [process.env.STRIPE_PRICE_PROFESSIONAL!]:  'pro_subscriber',
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  // Webhook 서명 검증 — 위변조 방지
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // 결제 완료 → 구독 활성화
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const role = PRICE_ROLE_MAP[priceId] ?? 'subscriber'

        // 세션 metadata → 구독 metadata 순서로 fallback
        const userId = session.metadata?.supabase_user_id
          ?? subscription.metadata?.supabase_user_id
        if (!userId) break

        await supabaseAdmin
          .from('profiles')
          .update({
            role,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', userId)

        break
      }

      // 구독 갱신 성공
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        if (!subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'active',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)

        break
      }

      // 결제 실패
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        if (!subscriptionId) break

        await supabaseAdmin
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId)

        break
      }

      // 구독 취소 → 역할 초기화
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break

        await supabaseAdmin
          .from('profiles')
          .update({
            role: 'guest',
            stripe_subscription_id: null,
            subscription_status: 'inactive',
            current_period_end: null,
          })
          .eq('id', userId)

        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

