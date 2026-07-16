/**
 * @jest-environment node
 */
// Regression coverage for the self-service annual refund flow (money code, added
// 2026-07-15, previously untested). Guards the invariants the security audit
// verified: ownership from the session, server-enforced 14-day window, no
// double-refund, refund-BEFORE-cancel ordering, and access revoked on success.
// The Stripe branch is exercised (PayPal shares the same guards). refundWindow
// is kept REAL and driven by the invoice timestamp.

jest.mock('@/lib/supabase/server', () => {
  const getUser = jest.fn()
  const single = jest.fn()
  const selEq = jest.fn(() => ({ single }))
  const select = jest.fn(() => ({ eq: selEq }))
  const from = jest.fn(() => ({ select }))
  return { createClient: jest.fn(async () => ({ auth: { getUser }, from })), __m: { getUser, single } }
})
jest.mock('@/lib/supabase/admin', () => {
  const updateEq = jest.fn().mockResolvedValue({ error: null })
  const update = jest.fn(() => ({ eq: updateEq }))
  const from = jest.fn(() => ({ update }))
  return { supabaseAdmin: { from }, __a: { update, updateEq } }
})
jest.mock('@/lib/stripe', () => ({
  stripe: {
    subscriptions: { retrieve: jest.fn(), cancel: jest.fn().mockResolvedValue({}) },
    refunds: { create: jest.fn().mockResolvedValue({}) },
  },
}))
jest.mock('@/lib/paypal', () => ({
  paypalRequest: jest.fn(),
  getPayPalSubscription: jest.fn(),
  getPlanInterval: jest.fn(() => 'year'),
}))
jest.mock('@/lib/resend', () => ({ resend: { emails: { send: jest.fn().mockResolvedValue({}) } }, FROM_EMAIL: 'x' }))
jest.mock('@/lib/emails/refund-confirmation', () => ({
  refundConfirmationEmail: jest.fn().mockReturnValue({ subject: 's', html: 'h' }),
}))
jest.mock('@/lib/onceGuard', () => ({
  claimOnce: jest.fn().mockResolvedValue({ alreadyProcessed: false }),
  releaseOnce: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue(true),
  RATE_LIMIT_MESSAGE: 'too many',
}))
jest.mock('@/lib/alertOps', () => ({ reportOpsError: jest.fn().mockResolvedValue(undefined) }))

import { POST } from '@/app/api/annual-refund/route'
import { stripe } from '@/lib/stripe'
import { claimOnce, releaseOnce } from '@/lib/onceGuard'
import { checkRateLimit } from '@/lib/rateLimit'

const { __m } = jest.requireMock('@/lib/supabase/server')
const { __a } = jest.requireMock('@/lib/supabase/admin')
const mockGetUser = __m.getUser as jest.Mock
const mockSingle = __m.single as jest.Mock
const mockAdminUpdate = __a.update as jest.Mock
const mockRetrieve = stripe.subscriptions.retrieve as jest.Mock
const mockCancel = stripe.subscriptions.cancel as jest.Mock
const mockRefund = stripe.refunds.create as jest.Mock
const mockClaimOnce = claimOnce as jest.Mock
const mockReleaseOnce = releaseOnce as jest.Mock
const mockRateLimit = checkRateLimit as jest.Mock

const nowSec = () => Math.floor(Date.now() / 1000)

// An active annual Stripe sub whose latest invoice is within the refund window.
function stripeSub(createdSec: number) {
  return {
    status: 'active',
    items: { data: [{ price: { recurring: { interval: 'year' } } }] },
    latest_invoice: {
      id: 'in_1',
      created: createdSec,
      amount_paid: 27000,
      payments: { data: [{ status: 'paid', payment: { payment_intent: 'pi_1' } }] },
    },
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u@test.com' } } })
  mockSingle.mockResolvedValue({
    data: { stripe_subscription_id: 'sub_1', paypal_subscription_id: null, billing_interval: 'year', full_name: 'Test' },
  })
  mockClaimOnce.mockResolvedValue({ alreadyProcessed: false })
  mockRateLimit.mockResolvedValue(true)
  mockRetrieve.mockResolvedValue(stripeSub(nowSec()))
})

describe('annual-refund — guards', () => {
  it('401 when not signed in', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    expect((await POST()).status).toBe(401)
  })

  it('400 for a non-annual membership', async () => {
    mockSingle.mockResolvedValueOnce({ data: { stripe_subscription_id: 'sub_1', billing_interval: 'month' } })
    expect((await POST()).status).toBe(400)
    expect(mockRefund).not.toHaveBeenCalled()
  })

  it('429 when rate limited', async () => {
    mockRateLimit.mockResolvedValueOnce(false)
    expect((await POST()).status).toBe(429)
    expect(mockRefund).not.toHaveBeenCalled()
  })

  it('403 and NO refund when the 14-day window has passed', async () => {
    mockRetrieve.mockResolvedValueOnce(stripeSub(nowSec() - 20 * 86400)) // 20 days ago
    const res = await POST()
    expect(res.status).toBe(403)
    expect(mockRefund).not.toHaveBeenCalled()
    expect(mockCancel).not.toHaveBeenCalled()
  })
})

describe('annual-refund — money flow', () => {
  it('refunds, then cancels, then revokes access, on the happy path', async () => {
    const res = await POST()

    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    // refund the exact payment intent from the ledger
    expect(mockRefund).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: 'pi_1', reason: 'requested_by_customer' })
    )
    // then cancel the subscription
    expect(mockCancel).toHaveBeenCalledWith('sub_1')
    // then revoke access
    expect(mockAdminUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'guest', subscription_status: 'inactive' })
    )
  })

  it('does NOT refund twice — a claimed key short-circuits to success', async () => {
    mockClaimOnce.mockResolvedValueOnce({ alreadyProcessed: true })
    const res = await POST()
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(mockRefund).not.toHaveBeenCalled()
    expect(mockCancel).not.toHaveBeenCalled()
  })

  it('on refund failure: releases the claim, 502s, and does NOT cancel', async () => {
    mockRefund.mockRejectedValueOnce(new Error('stripe down'))
    const res = await POST()
    expect(res.status).toBe(502)
    expect(mockReleaseOnce).toHaveBeenCalledWith('refund-cancel-sub_1')
    expect(mockCancel).not.toHaveBeenCalled()
    expect(mockAdminUpdate).not.toHaveBeenCalled()
  })
})
