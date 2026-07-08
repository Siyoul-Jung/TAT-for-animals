/**
 * @jest-environment node
 */
// Covers the (now POST-only) account-deletion confirm endpoint: token/state
// validation, the re-check that blocks deleting an account with a live
// subscription, the happy path, and the revert-on-failure + alert path.
import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase/admin', () => {
  const single = jest.fn()
  const selectEq = jest.fn(() => ({ single }))
  const select = jest.fn(() => ({ eq: selectEq }))
  // update().eq() is used two ways in the route: awaited directly (the
  // revert-to-pending path) and chained .eq('status','pending').select() (the
  // atomic claim) — so it must be BOTH thenable and chainable.
  const updateSelect = jest.fn().mockResolvedValue({ data: [{ user_id: 'u1' }] })
  const updateEq2 = jest.fn(() => ({ select: updateSelect }))
  const updateEq = jest.fn(() => ({
    eq: updateEq2,
    then: (resolve: (v: unknown) => void) => resolve({ error: null }),
  }))
  const update = jest.fn(() => ({ eq: updateEq }))
  const deleteUser = jest.fn().mockResolvedValue({ error: null })
  const from = jest.fn(() => ({ select, update }))
  return {
    supabaseAdmin: { from, auth: { admin: { deleteUser } } },
    __m: { single, update, updateEq, updateSelect, deleteUser },
  }
})
jest.mock('@/lib/alertOps', () => ({ reportOpsError: jest.fn().mockResolvedValue(undefined) }))

import { POST } from '@/app/api/confirm-account-deletion/route'
import { reportOpsError } from '@/lib/alertOps'

const { __m } = jest.requireMock('@/lib/supabase/admin')
const mockSingle = __m.single as jest.Mock
const mockUpdate = __m.update as jest.Mock
const mockUpdateSelect = __m.updateSelect as jest.Mock
const mockDeleteUser = __m.deleteUser as jest.Mock
const mockAlert = reportOpsError as jest.Mock

const FUTURE = '2999-01-01T00:00:00Z'
const PAST = '2000-01-01T00:00:00Z'

function makeReq(body: object | null) {
  return new NextRequest('http://localhost/api/confirm-account-deletion', {
    method: 'POST',
    body: body === null ? undefined : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

// deletionRequest is the 1st `.single()`, profile is the 2nd.
function primeRequest(reqRow: object | null, profileRow: object | null = {}) {
  mockSingle.mockResolvedValueOnce({ data: reqRow })
  if (reqRow) mockSingle.mockResolvedValueOnce({ data: profileRow })
}

beforeEach(() => {
  jest.clearAllMocks()
  // clearAllMocks keeps queued mockResolvedValueOnce values, so an early-return
  // test would leak its unused profile row into the next test — reset the queue.
  mockSingle.mockReset()
  jest.spyOn(console, 'error').mockImplementation(() => {})
  mockDeleteUser.mockResolvedValue({ error: null })
})

describe('confirm-account-deletion (POST)', () => {
  it('400 invalid-link when no token is provided', async () => {
    const res = await POST(makeReq({}))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('invalid-link')
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('400 invalid-link when the token matches no request', async () => {
    primeRequest(null)
    const res = await POST(makeReq({ token: 'nope' }))
    expect(res.status).toBe(400)
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('409 already-processed when the request is not pending', async () => {
    primeRequest({ user_id: 'u1', expires_at: FUTURE, status: 'completed' })
    const res = await POST(makeReq({ token: 't' }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('already-processed')
  })

  it('410 link-expired past the expiry', async () => {
    primeRequest({ user_id: 'u1', expires_at: PAST, status: 'pending' })
    const res = await POST(makeReq({ token: 't' }))
    expect(res.status).toBe(410)
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('blocks deletion when a live subscription still exists', async () => {
    primeRequest(
      { user_id: 'u1', expires_at: FUTURE, status: 'pending' },
      { stripe_subscription_id: 'sub_1', paypal_subscription_id: null }
    )
    const res = await POST(makeReq({ token: 't' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('cancel-subscription-first')
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('deletes the user on the happy path', async () => {
    primeRequest(
      { user_id: 'u1', expires_at: FUTURE, status: 'pending' },
      { stripe_subscription_id: null, paypal_subscription_id: null }
    )
    const res = await POST(makeReq({ token: 't' }))
    expect(res.status).toBe(200)
    expect((await res.json()).ok).toBe(true)
    expect(mockDeleteUser).toHaveBeenCalledWith('u1')
  })

  it('409 already-processed when a concurrent submit wins the claim (double-submit race)', async () => {
    primeRequest(
      { user_id: 'u1', expires_at: FUTURE, status: 'pending' },
      { stripe_subscription_id: null, paypal_subscription_id: null }
    )
    // The other tab flipped pending→completed between our pending check and our
    // claim — the conditional update matches zero rows.
    mockUpdateSelect.mockResolvedValueOnce({ data: [] })
    const res = await POST(makeReq({ token: 't' }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('already-processed')
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('reverts to pending and alerts when the delete fails', async () => {
    primeRequest(
      { user_id: 'u1', expires_at: FUTURE, status: 'pending' },
      { stripe_subscription_id: null, paypal_subscription_id: null }
    )
    mockDeleteUser.mockResolvedValueOnce({ error: { message: 'boom' } })
    const res = await POST(makeReq({ token: 't' }))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe('deletion-failed')
    expect(mockAlert).toHaveBeenCalled()
    // reverted: an update({ status: 'pending' }) happened after the delete failed
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'pending' })
  })
})
