/**
 * @jest-environment node
 */
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

jest.mock('@/lib/supabase/admin', () => {
  const rpc = jest.fn()
  return { supabaseAdmin: { rpc }, __rpc: rpc }
})

const { __rpc } = jest.requireMock('@/lib/supabase/admin')
const mockRpc = __rpc as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

describe('checkRateLimit', () => {
  it('allows when the DB function returns true', async () => {
    mockRpc.mockResolvedValueOnce({ data: true, error: null })
    expect(await checkRateLimit('checkout', 'user-1', 10, 300)).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('check_rate_limit', {
      p_key: 'checkout:user-1',
      p_limit: 10,
      p_window_seconds: 300,
    })
  })

  it('blocks when the DB function returns false', async () => {
    mockRpc.mockResolvedValueOnce({ data: false, error: null })
    expect(await checkRateLimit('checkout', 'user-1', 10, 300)).toBe(false)
  })

  it('fails OPEN (allows) when the limiter errors', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'db down' } })
    expect(await checkRateLimit('checkout', 'user-1', 10, 300)).toBe(true)
  })

  it('fails OPEN (allows) when the call throws', async () => {
    mockRpc.mockRejectedValueOnce(new Error('boom'))
    expect(await checkRateLimit('checkout', 'user-1', 10, 300)).toBe(true)
  })
})

describe('getClientIp', () => {
  it('takes the first entry of x-forwarded-for', () => {
    const req = new Request('http://x', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip, then "unknown"', () => {
    expect(getClientIp(new Request('http://x', { headers: { 'x-real-ip': '9.9.9.9' } }))).toBe('9.9.9.9')
    expect(getClientIp(new Request('http://x'))).toBe('unknown')
  })
})
