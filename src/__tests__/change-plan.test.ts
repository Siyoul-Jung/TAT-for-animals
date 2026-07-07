/**
 * @jest-environment node
 */
// Regression coverage for /api/change-plan (upgrade/downgrade). Focus on the
// money-safety GUARDS — the checks that stop a member being mis-billed — plus
// the Stripe and PayPal upgrade happy paths. Price/plan env IDs come from
// jest.setup.ts.
import { NextRequest } from 'next/server'

process.env.NEXT_PUBLIC_SITE_URL = 'https://tatforanimals.com'

jest.mock('@/lib/supabase/server', () => {
  const getUser = jest.fn()
  const single = jest.fn()
  const selEq = jest.fn(() => ({ single }))
  const select = jest.fn(() => ({ eq: selEq }))
  const from = jest.fn(() => ({ select }))
  const client = { auth: { getUser }, from }
  return { createClient: jest.fn(async () => client), __m: { getUser, single } }
})

jest.mock('@/lib/supabase/admin', () => {
  const updateEq = jest.fn().mockResolvedValue({ error: null })
  const update = jest.fn(() => ({ eq: updateEq }))
  const from = jest.fn(() => ({ update }))
  // rate limiter calls supabaseAdmin.rpc — allow by default in these tests
  const rpc = jest.fn().mockResolvedValue({ data: true, error: null })
  return { supabaseAdmin: { from, rpc }, __a: { update, updateEq } }
})

jest.mock('@/lib/stripe', () => ({
  stripe: {
    subscriptions: { retrieve: jest.fn(), update: jest.fn().mockResolvedValue({}) },
    subscriptionSchedules: { release: jest.fn().mockResolvedValue({}) },
    invoices: { createPreview: jest.fn() },
  },
}))

jest.mock('@/lib/paypal', () => ({ paypalRequest: jest.fn() }))

import { POST } from '@/app/api/change-plan/route'
import { stripe } from '@/lib/stripe'
import { paypalRequest } from '@/lib/paypal'

const { __m } = jest.requireMock('@/lib/supabase/server')
const { __a } = jest.requireMock('@/lib/supabase/admin')
const mockGetUser = __m.getUser as jest.Mock
const mockSingle = __m.single as jest.Mock
const mockAdminUpdate = __a.update as jest.Mock
const mockStripeRetrieve = stripe.subscriptions.retrieve as jest.Mock
const mockStripeUpdate = stripe.subscriptions.update as jest.Mock
const mockPaypalRequest = paypalRequest as jest.Mock

function makeReq(bodyObj: object) {
  return new NextRequest('http://localhost/api/change-plan', {
    method: 'POST',
    body: JSON.stringify(bodyObj),
    headers: { 'content-type': 'application/json' },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
  mockSingle.mockResolvedValue({ data: null })
})

describe('change-plan — guards (money safety)', () => {
  it('401 when not signed in', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await POST(makeReq({ targetTier: 'pro_subscriber' }))
    expect(res.status).toBe(401)
  })

  it('400 on an invalid target tier', async () => {
    const res = await POST(makeReq({ targetTier: 'enterprise' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Invalid plan/)
  })

  it('rejects a no-op change to the tier the member already has', async () => {
    mockSingle.mockResolvedValueOnce({ data: { role: 'pro_subscriber', billing_interval: 'month' } })
    const res = await POST(makeReq({ targetTier: 'pro_subscriber' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/already on this plan/)
  })

  it('blocks self-serve changes for ANNUAL members (would flip them to monthly)', async () => {
    mockSingle.mockResolvedValueOnce({ data: { role: 'subscriber', billing_interval: 'year', stripe_subscription_id: 'sub_1' } })
    const res = await POST(makeReq({ targetTier: 'pro_subscriber' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/team/i)
    expect(mockStripeUpdate).not.toHaveBeenCalled()
  })

  it('blocks self-serve DOWNGRADES (support-only)', async () => {
    mockSingle.mockResolvedValueOnce({ data: { role: 'pro_subscriber', billing_interval: 'month', stripe_subscription_id: 'sub_1' } })
    const res = await POST(makeReq({ targetTier: 'subscriber' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/contact us/i)
    expect(mockStripeUpdate).not.toHaveBeenCalled()
  })
})

describe('change-plan — Stripe upgrade', () => {
  it('switches the Stripe subscription to the pro price and syncs role to pro', async () => {
    mockSingle.mockResolvedValueOnce({ data: { role: 'subscriber', billing_interval: 'month', stripe_subscription_id: 'sub_1' } })
    mockStripeRetrieve.mockResolvedValueOnce({ id: 'sub_1', items: { data: [{ id: 'si_1' }] }, schedule: null, cancel_at: null })

    const res = await POST(makeReq({ targetTier: 'pro_subscriber' }))

    expect(res.status).toBe(200)
    expect(mockStripeUpdate).toHaveBeenCalledWith(
      'sub_1',
      expect.objectContaining({ items: [{ id: 'si_1', price: 'price_circle' }] })
    )
    expect(mockAdminUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'pro_subscriber' })
    )
  })
})

describe('change-plan — PayPal upgrade', () => {
  it('revises the PayPal subscription and returns the approval url', async () => {
    mockSingle.mockResolvedValueOnce({ data: { role: 'subscriber', billing_interval: 'month', paypal_subscription_id: 'I-1' } })
    mockPaypalRequest.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ links: [{ rel: 'approve', href: 'https://paypal.test/approve' }] }),
    })

    const res = await POST(makeReq({ targetTier: 'pro_subscriber' }))

    expect(res.status).toBe(200)
    expect((await res.json()).url).toBe('https://paypal.test/approve')
    expect(mockPaypalRequest).toHaveBeenCalledWith(
      expect.stringContaining('/v1/billing/subscriptions/I-1/revise'),
      expect.objectContaining({ method: 'POST' })
    )
  })
})
