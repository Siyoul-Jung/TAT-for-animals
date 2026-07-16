import { createClient } from '@/lib/supabase/server'
import { reconcileAccess } from '@/lib/reconcileAccess'
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'
import { NextResponse } from 'next/server'

// Verify-on-return for the /thank-you page.
//
// The webhook is the normal activation path, but it's asynchronous — if it's
// delayed or missed, a member who just paid would be stranded on the thank-you
// screen. This confirms access for the signed-in member directly from the
// payment provider (via reconcileAccess) and grants it if needed, so the page
// can send them straight to the library instead of waiting on a webhook.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // The thank-you page calls this once per visit (then polls Supabase directly),
  // so a generous per-user cap can't hit a legitimate member but stops a spammer
  // from driving repeated reconcileAccess calls (each hits Stripe/PayPal).
  if (!(await checkRateLimit('checkout-verify', user.id, 20, 300))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, stripe_customer_id, paypal_subscription_id')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ active: false })

  if (profile.role === 'subscriber' || profile.role === 'pro_subscriber') {
    return NextResponse.json({ active: true, role: profile.role })
  }

  const healed = await reconcileAccess({ id: user.id, ...profile })
  return NextResponse.json({ active: !!healed, role: healed?.role ?? null })
}
