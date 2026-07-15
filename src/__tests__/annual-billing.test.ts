/**
 * @jest-environment node
 */
// Regression coverage for the annual (yearly) billing paths — the flow Jez's
// function review left untested ("[-]"). These are pure-function checks over the
// price/plan -> role and -> billing-interval maps that every annual checkout
// depends on. The specific risk they guard: an annual price silently mapping to
// the wrong tier (e.g. an annual Calm Circle member landing on the lower
// 'subscriber' role via the `?? 'subscriber'` fallback). The ID strings come
// from jest.setup.ts, which sets them before these modules load.
import { PRICE_ROLE_MAP, roleForSubscription, getBillingInterval } from '@/lib/subscriptionAccess'
import { PLAN_IDS, PLAN_ROLE_MAP, getPlanInterval } from '@/lib/paypal'
import type Stripe from 'stripe'

// Minimal Subscription stub carrying only the fields the helpers read.
function stripeSub(priceId: string, interval: 'month' | 'year'): Stripe.Subscription {
  return {
    items: { data: [{ price: { id: priceId, recurring: { interval } } }] },
  } as unknown as Stripe.Subscription
}

describe('Stripe — annual price maps to the right tier', () => {
  it('annual Calm Circle grants pro_subscriber, not the lower tier', () => {
    expect(PRICE_ROLE_MAP['price_circle_annual']).toBe('pro_subscriber')
    expect(roleForSubscription(stripeSub('price_circle_annual', 'year'))).toBe('pro_subscriber')
  })

  it('annual Calm Connection grants subscriber', () => {
    expect(PRICE_ROLE_MAP['price_library_annual']).toBe('subscriber')
    expect(roleForSubscription(stripeSub('price_library_annual', 'year'))).toBe('subscriber')
  })

  it('a tier grants the same role whether billed monthly or annually', () => {
    expect(roleForSubscription(stripeSub('price_circle', 'month')))
      .toBe(roleForSubscription(stripeSub('price_circle_annual', 'year')))
  })

  it('reports the yearly interval for an annual price and monthly otherwise', () => {
    expect(getBillingInterval(stripeSub('price_circle_annual', 'year'))).toBe('year')
    expect(getBillingInterval(stripeSub('price_circle', 'month'))).toBe('month')
  })
})

describe('PayPal — annual plan maps to role, checkout key, and interval', () => {
  it('maps both annual plan ids to the correct tier role', () => {
    expect(PLAN_ROLE_MAP['P-circle-annual']).toBe('pro_subscriber')
    expect(PLAN_ROLE_MAP['P-lib-annual']).toBe('subscriber')
  })

  it('exposes annual plans under the "_annual" checkout keys the UI sends', () => {
    expect(PLAN_IDS['calm_circle_annual']).toBe('P-circle-annual')
    expect(PLAN_IDS['calm_library_annual']).toBe('P-lib-annual')
  })

  it('detects the yearly cadence from the plan id, else month', () => {
    expect(getPlanInterval('P-circle-annual')).toBe('year')
    expect(getPlanInterval('P-lib-annual')).toBe('year')
    expect(getPlanInterval('P-circle-monthly')).toBe('month')
    expect(getPlanInterval(undefined)).toBe('month')
  })
})
