import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Stripe Customer Portal — cancel subscription + manage payment method.
// Called when the member clicks "Manage Subscription" on the dashboard.
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  // "Manage Subscription" is for cancel + payment method only — use the
  // manage-only config (no plan switching; plan changes go through the dedicated
  // dashboard buttons → /api/change-plan). Both configs are isolated from the
  // shared account default that tatlife.com relies on. Falls back gracefully.
  const manageConfig =
    process.env.STRIPE_PORTAL_MANAGE_CONFIG_ID || process.env.STRIPE_PORTAL_CONFIG_ID

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    ...(manageConfig ? { configuration: manageConfig } : {}),
  })

  return NextResponse.json({ url: portalSession.url })
}
