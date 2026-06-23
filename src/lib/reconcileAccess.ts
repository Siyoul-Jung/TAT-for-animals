import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { roleForSubscription, getBillingInterval, getPeriodEndISO } from '@/lib/subscriptionAccess'
import { paypalRequest, PLAN_ROLE_MAP, getPlanInterval } from '@/lib/paypal'
import { sendWelcomeOnce } from '@/lib/sendWelcomeOnce'

type ProfileLike = {
  id: string
  role: string | null
  stripe_customer_id: string | null
  paypal_subscription_id: string | null
}

export type ReconcileResult = {
  role: string
  subscription_status: string
  billing_interval: 'month' | 'year'
  stripe_subscription_id?: string
  current_period_end?: string | null
  cancel_at?: string | null
} | null

// Self-heal access from the payment provider.
//
// The webhook (and the thank-you verify call) are the normal activation paths,
// but if both are missed, a member who actually paid would otherwise see a
// dashboard inviting them to "choose a plan" — i.e. pay again. That's never
// acceptable. So whenever a profile shows no active membership, we ask the
// provider directly: does this customer have an active subscription? If so, we
// grant the role that matches what they're paying for — automatically, with no
// action required from the member.
//
// Returns the values it applied, or null if there was nothing to heal. It never
// throws: a provider hiccup (or a stale cross-mode customer id) must not break
// the page that calls it.
export async function reconcileAccess(profile: ProfileLike): Promise<ReconcileResult> {
  // Already has access — nothing to do.
  if (profile.role === 'subscriber' || profile.role === 'pro_subscriber') return null

  // Stripe — find the customer's active subscription and grant its tier.
  if (profile.stripe_customer_id) {
    try {
      const subs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
        limit: 1,
      })
      const sub = subs.data[0]
      if (sub) {
        const update: ReconcileResult = {
          role: roleForSubscription(sub),
          stripe_subscription_id: sub.id,
          subscription_status: 'active',
          current_period_end: getPeriodEndISO(sub),
          billing_interval: getBillingInterval(sub),
          cancel_at: null,
        }
        await supabaseAdmin.from('profiles').update(update).eq('id', profile.id)
        await sendWelcome(profile.id, sub.id, update.role)
        return update
      }
    } catch (e) {
      console.error('reconcileAccess (stripe) failed:', e)
    }
  }

  // PayPal — confirm the recorded subscription is active and grant its tier.
  if (profile.paypal_subscription_id) {
    try {
      const res = await paypalRequest(`/v1/billing/subscriptions/${profile.paypal_subscription_id}`)
      const sub = await res.json()
      if (sub?.status === 'ACTIVE' && sub.plan_id) {
        const update: ReconcileResult = {
          role: PLAN_ROLE_MAP[sub.plan_id] ?? 'subscriber',
          subscription_status: 'active',
          billing_interval: getPlanInterval(sub.plan_id),
        }
        await supabaseAdmin.from('profiles').update(update).eq('id', profile.id)
        await sendWelcome(profile.id, profile.paypal_subscription_id, update.role)
        return update
      }
    } catch (e) {
      console.error('reconcileAccess (paypal) failed:', e)
    }
  }

  return null
}

// Look up the member's contact details and send the welcome (once) after a
// self-heal — so a member activated by the fallback still gets the same welcome
// as one activated by the webhook.
async function sendWelcome(userId: string, subscriptionId: string | null, role: string) {
  const { data: contact } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single()
  await sendWelcomeOnce({
    subscriptionId,
    email: contact?.email,
    name: contact?.full_name,
    role: role as 'subscriber' | 'pro_subscriber',
  })
}
