/**
 * @jest-environment node
 */
// Regression coverage for the PayPal webhook — previously untested (Jez's
// function review left the PayPal path unverified). Mirrors the Stripe webhook
// test's structure. Only PayPal's network calls are mocked; PLAN_ROLE_MAP /
// getPlanInterval use the real env IDs set in jest.setup.ts.
import { NextRequest } from 'next/server'

process.env.PAYPAL_WEBHOOK_ID = 'wh-test'

// ── Supabase admin mock (supports update().eq() and select().eq().single()) ──
jest.mock('@/lib/supabase/admin', () => {
  const single = jest.fn().mockResolvedValue({ data: null })
  const selectEq = jest.fn(() => ({ single }))
  const select = jest.fn(() => ({ eq: selectEq }))
  const updateEq = jest.fn().mockResolvedValue({ error: null })
  const update = jest.fn(() => ({ eq: updateEq }))
  const from = jest.fn(() => ({ select, update }))
  return { supabaseAdmin: { from }, __m: { from, select, selectEq, single, update, updateEq } }
})

jest.mock('@/lib/onceGuard', () => ({
  claimOnce: jest.fn().mockResolvedValue({ alreadyProcessed: false }),
  releaseOnce: jest.fn().mockResolvedValue(undefined),
  hasClaim: jest.fn().mockResolvedValue(false),
}))

// Keep the real PLAN_ROLE_MAP / getPlanInterval / estimatePaidThrough; mock only
// the two functions that hit PayPal's API.
jest.mock('@/lib/paypal', () => {
  const actual = jest.requireActual('@/lib/paypal')
  return { ...actual, paypalRequest: jest.fn(), getPayPalSubscription: jest.fn() }
})

jest.mock('@/lib/sendWelcomeOnce', () => ({ sendWelcomeOnce: jest.fn().mockResolvedValue(undefined) }))
jest.mock('@/lib/resend', () => ({
  resend: { emails: { send: jest.fn().mockResolvedValue({}) } },
  FROM_EMAIL: 'hello@tatforanimals.com',
}))
jest.mock('@/lib/emails/plan-change', () => ({
  planChangeEmail: jest.fn().mockReturnValue({ subject: 's', html: 'h' }),
}))

import { POST } from '@/app/api/webhooks/paypal/route'
import { paypalRequest, getPayPalSubscription } from '@/lib/paypal'
import { claimOnce, releaseOnce, hasClaim } from '@/lib/onceGuard'

const mockPaypalRequest = paypalRequest as jest.Mock
const mockGetSub = getPayPalSubscription as jest.Mock
const mockClaimOnce = claimOnce as jest.Mock
const mockReleaseOnce = releaseOnce as jest.Mock
const mockHasClaim = hasClaim as jest.Mock
const { __m } = jest.requireMock('@/lib/supabase/admin')
const mockUpdate = __m.update as jest.Mock
const mockUpdateEq = __m.updateEq as jest.Mock
const mockSingle = __m.single as jest.Mock

function makeReq(event: object) {
  return new NextRequest('http://localhost/api/webhooks/paypal', {
    method: 'POST',
    body: JSON.stringify(event),
    headers: { 'paypal-transmission-id': 'x' },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
  // Defaults (re-applied each test since clearAllMocks wipes call state)
  mockPaypalRequest.mockResolvedValue({ json: async () => ({ verification_status: 'SUCCESS' }) })
  mockClaimOnce.mockResolvedValue({ alreadyProcessed: false })
  mockHasClaim.mockResolvedValue(false)
  mockSingle.mockResolvedValue({ data: null })
  mockUpdateEq.mockResolvedValue({ error: null })
})

describe('PayPal webhook — signature & idempotency', () => {
  it('returns 400 when the signature does not verify', async () => {
    mockPaypalRequest.mockResolvedValueOnce({ json: async () => ({ verification_status: 'FAILURE' }) })
    const res = await POST(makeReq({ id: 'e', event_type: 'BILLING.SUBSCRIPTION.ACTIVATED', resource: {} }))
    expect(res.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('short-circuits a duplicate event without touching the DB', async () => {
    mockClaimOnce.mockResolvedValueOnce({ alreadyProcessed: true })
    const res = await POST(makeReq({
      id: 'dup', event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: { id: 'I-1', custom_id: 'u1', plan_id: 'P-circle-monthly' },
    }))
    expect((await res.json()).received).toBe(true)
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('PayPal webhook — activation', () => {
  it('activates the pro tier for the Calm Circle plan (monthly)', async () => {
    await POST(makeReq({
      id: 'e1', event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: { id: 'I-1', custom_id: 'u1', plan_id: 'P-circle-monthly' },
    }))
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'pro_subscriber', subscription_status: 'active', billing_interval: 'month' })
    )
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'u1')
  })

  it('records the yearly cadence for an annual plan', async () => {
    await POST(makeReq({
      id: 'e2', event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: { id: 'I-2', custom_id: 'u2', plan_id: 'P-circle-annual' },
    }))
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'pro_subscriber', billing_interval: 'year' })
    )
  })
})

describe('PayPal webhook — payment failure & termination', () => {
  it('marks past_due on a failed payment', async () => {
    await POST(makeReq({
      id: 'e3', event_type: 'BILLING.SUBSCRIPTION.PAYMENT.FAILED',
      resource: { custom_id: 'u3' },
    }))
    expect(mockUpdate).toHaveBeenCalledWith({ subscription_status: 'past_due' })
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'u3')
  })

  it('revokes access to guest on EXPIRED', async () => {
    await POST(makeReq({
      id: 'e4', event_type: 'BILLING.SUBSCRIPTION.EXPIRED',
      resource: { custom_id: 'u4' },
    }))
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'guest', subscription_status: 'inactive', paypal_subscription_id: null })
    )
  })

  it('keeps access until period end on CANCELLED (never revokes on the spot)', async () => {
    mockSingle.mockResolvedValueOnce({ data: { current_period_end: '2026-09-01T00:00:00Z', cancel_at: null, billing_interval: 'month' } })
    await POST(makeReq({
      id: 'e5', event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
      resource: { id: 'I-5', custom_id: 'u5' },
    }))
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ cancel_at: '2026-09-01T00:00:00Z' })
    )
    // role is NOT dropped here — access persists until the lazy cutoff
    expect(mockUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ role: 'guest' }))
  })

  it('CANCELLED with a refund claim: revokes NOW, no grace period (route-death backstop)', async () => {
    mockHasClaim.mockResolvedValueOnce(true)
    // stored sub matches the event → this cancel is the refunded one
    mockSingle.mockResolvedValueOnce({ data: { paypal_subscription_id: 'I-8' } })
    await POST(makeReq({
      id: 'e8', event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
      resource: { id: 'I-8', custom_id: 'u8' },
    }))
    expect(mockHasClaim).toHaveBeenCalledWith('refund-cancel-I-8')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'guest', subscription_status: 'inactive', paypal_subscription_id: null })
    )
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'u8')
    // and no grace-period path
    expect(mockUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ cancel_at: expect.any(String) }))
  })

  it('CANCELLED with a refund claim but a NEWER stored sub: does not touch the new membership', async () => {
    mockHasClaim.mockResolvedValueOnce(true)
    // the member re-subscribed after the refund — profile points at I-NEW
    mockSingle.mockResolvedValueOnce({ data: { paypal_subscription_id: 'I-NEW' } })
    await POST(makeReq({
      id: 'e9', event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
      resource: { id: 'I-OLD', custom_id: 'u9' },
    }))
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('PayPal webhook — renewal role sync (deferred downgrade lands here)', () => {
  it('re-syncs role from the current plan on PAYMENT.SALE.COMPLETED', async () => {
    mockGetSub.mockResolvedValueOnce({ plan_id: 'P-lib-monthly', billing_info: { next_billing_time: '2026-10-01T00:00:00Z' } })
    await POST(makeReq({
      id: 'e6', event_type: 'PAYMENT.SALE.COMPLETED',
      resource: { billing_agreement_id: 'I-6' },
    }))
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ subscription_status: 'active', role: 'subscriber', billing_interval: 'month' })
    )
  })
})

describe('PayPal webhook — failure rollback', () => {
  it('releases the idempotency marker and 500s when the handler throws', async () => {
    mockUpdateEq.mockRejectedValueOnce(new Error('db down'))
    const res = await POST(makeReq({
      id: 'boom', event_type: 'BILLING.SUBSCRIPTION.PAYMENT.FAILED',
      resource: { custom_id: 'u7' },
    }))
    expect(res.status).toBe(500)
    expect(mockReleaseOnce).toHaveBeenCalledWith('boom')
  })
})
