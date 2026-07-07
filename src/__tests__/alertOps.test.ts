/**
 * @jest-environment node
 */
// Covers the ops-alert helper used in critical catch blocks (webhooks, payment,
// account deletion). Guarantees it (a) emails the ops inbox, (b) never throws
// even if Resend fails, and (c) throttles a burst so an outage can't spam.
jest.mock('@/lib/resend', () => ({
  resend: { emails: { send: jest.fn().mockResolvedValue({}) } },
  FROM_EMAIL: 'hello@tatforanimals.com',
}))

import { reportOpsError } from '@/lib/alertOps'
import { resend } from '@/lib/resend'

const mockSend = resend.emails.send as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

describe('reportOpsError', () => {
  it('emails the ops inbox with the scope in the subject', async () => {
    await reportOpsError('unit-scope-a', new Error('boom'))
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringContaining('unit-scope-a') })
    )
  })

  it('never throws even when the alert email fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('resend down'))
    await expect(reportOpsError('unit-scope-b', new Error('boom'))).resolves.toBeUndefined()
  })

  it('always logs to console.error (the guaranteed record)', async () => {
    const spy = jest.spyOn(console, 'error')
    await reportOpsError('unit-scope-c', new Error('boom'))
    expect(spy).toHaveBeenCalled()
  })

  it('throttles a burst of the same scope to a single email', async () => {
    await reportOpsError('unit-scope-burst', new Error('1'))
    await reportOpsError('unit-scope-burst', new Error('2'))
    await reportOpsError('unit-scope-burst', new Error('3'))
    expect(mockSend).toHaveBeenCalledTimes(1)
  })
})
