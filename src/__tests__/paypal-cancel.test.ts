/**
 * @jest-environment node
 */
// Regression coverage for the self-service PayPal cancel route (previously
// untested). Verifies auth, the "no PayPal sub" guard, that a successful cancel
// schedules access-until-period-end (cancel_at) rather than revoking on the
// spot, idempotency on an already-cancelled subscription (422), and a clean 502
// when PayPal's cancel call fails.

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
jest.mock('@/lib/paypal', () => ({
  paypalRequest: jest.fn(),
  getPayPalSubscription: jest.fn().mockResolvedValue({ billing_info: { next_billing_time: '2027-01-01T00:00:00Z' } }),
  estimatePaidThrough: jest.fn(() => '2027-01-01T00:00:00Z'),
}))
jest.mock('@/lib/resend', () => ({ resend: { emails: { send: jest.fn().mockResolvedValue({}) } }, FROM_EMAIL: 'x' }))
jest.mock('@/lib/emails/cancellation-scheduled', () => ({
  cancellationScheduledEmail: jest.fn().mockReturnValue({ subject: 's', html: 'h' }),
}))
jest.mock('@/lib/onceGuard', () => ({
  claimOnce: jest.fn().mockResolvedValue({ alreadyProcessed: false }),
  releaseOnce: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue(true),
  RATE_LIMIT_MESSAGE: 'too many',
}))

import { POST } from '@/app/api/paypal/cancel/route'
import { paypalRequest } from '@/lib/paypal'
import { checkRateLimit } from '@/lib/rateLimit'

const { __m } = jest.requireMock('@/lib/supabase/server')
const { __a } = jest.requireMock('@/lib/supabase/admin')
const mockGetUser = __m.getUser as jest.Mock
const mockSingle = __m.single as jest.Mock
const mockAdminUpdate = __a.update as jest.Mock
const mockPaypalRequest = paypalRequest as jest.Mock
const mockRateLimit = checkRateLimit as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u@test.com' } } })
  mockSingle.mockResolvedValue({
    data: { paypal_subscription_id: 'I-1', current_period_end: '2027-01-01T00:00:00Z', billing_interval: 'year', full_name: 'Test' },
  })
  mockPaypalRequest.mockResolvedValue({ status: 204, text: async () => '' })
  mockRateLimit.mockResolvedValue(true)
})

describe('paypal/cancel', () => {
  it('401 when not signed in', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    expect((await POST()).status).toBe(401)
  })

  it('429 when rate limited — never calls PayPal', async () => {
    mockRateLimit.mockResolvedValueOnce(false)
    const res = await POST()
    expect(res.status).toBe(429)
    expect(mockPaypalRequest).not.toHaveBeenCalled()
    expect(mockAdminUpdate).not.toHaveBeenCalled()
  })

  it('400 when the member has no PayPal subscription', async () => {
    mockSingle.mockResolvedValueOnce({ data: { paypal_subscription_id: null } })
    const res = await POST()
    expect(res.status).toBe(400)
    expect(mockPaypalRequest).not.toHaveBeenCalled()
  })

  it('cancels and schedules access-until-period-end (cancel_at), never revokes on the spot', async () => {
    const res = await POST()
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(mockPaypalRequest).toHaveBeenCalledWith(
      expect.stringContaining('/v1/billing/subscriptions/I-1/cancel'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(mockAdminUpdate).toHaveBeenCalledWith({ cancel_at: '2027-01-01T00:00:00Z' })
    // access is NOT revoked immediately (no role:'guest' write here)
    expect(mockAdminUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ role: 'guest' }))
  })

  it('treats an already-cancelled subscription (422) as success', async () => {
    mockPaypalRequest.mockResolvedValueOnce({ status: 422, text: async () => 'already cancelled' })
    const res = await POST()
    expect(res.status).toBe(200)
    expect(mockAdminUpdate).toHaveBeenCalled()
  })

  it('502 and no profile change when PayPal cancel fails', async () => {
    mockPaypalRequest.mockResolvedValueOnce({ status: 500, text: async () => 'error' })
    const res = await POST()
    expect(res.status).toBe(502)
    expect(mockAdminUpdate).not.toHaveBeenCalled()
  })
})
