import Stripe from 'stripe'

// Subscription price → role mapping. Shared by the Stripe webhook (the primary
// activation path) and the verify-on-return endpoint (the fallback when the
// webhook is delayed or missed) so the two can never grant different access for
// the same price. Manage Price IDs and roles here after pricing is confirmed.
//
// Annual prices grant the same role as their monthly twin — role is the tier,
// not the billing cadence.
export const PRICE_ROLE_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_CALM_LIBRARY!]:        'subscriber',
  [process.env.STRIPE_PRICE_CALM_CIRCLE!]:         'pro_subscriber',
  [process.env.STRIPE_PRICE_CALM_LIBRARY_ANNUAL!]: 'subscriber',
  [process.env.STRIPE_PRICE_CALM_CIRCLE_ANNUAL!]:  'pro_subscriber',
  // Grandfathered $10/mo rate for tatlife subscribers moving over — same
  // access as Calm Circle, per Jez (2026-08-28: "Calm Circle, since they
  // are current subscribers to both recordings and live sessions").
  [process.env.STRIPE_PRICE_FOUNDING_MEMBER!]:     'pro_subscriber',
}

// The role a subscription's current price maps to. Unknown price → 'subscriber'
// (the lower tier) rather than failing, matching the webhook's long-standing
// default.
export function roleForSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price?.id
  return priceId ? (PRICE_ROLE_MAP[priceId] ?? 'subscriber') : 'subscriber'
}

// Billing cadence drives only what the dashboard shows ("$27 / month" vs
// "$270 / year"); access is the role. Read it from the price so the label can't
// drift from what Stripe actually charges. Unknown → 'month' (the historical
// default, so pre-annual rows render exactly as before).
export function getBillingInterval(subscription: Stripe.Subscription): 'month' | 'year' {
  return subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'year' : 'month'
}

// Stripe API 2025-03-31 (basil) and later moved `current_period_end` off the
// Subscription object onto each Subscription Item. Read it from there.
export function getPeriodEndISO(subscription: Stripe.Subscription): string | null {
  const periodEnd = subscription.items.data[0]?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null
}
