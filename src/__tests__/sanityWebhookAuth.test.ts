/**
 * @jest-environment node
 */
import { isAuthorizedSanityWebhook } from '@/lib/sanityWebhookAuth'

const ORIGINAL = process.env.SANITY_WEBHOOK_SECRET

afterEach(() => {
  process.env.SANITY_WEBHOOK_SECRET = ORIGINAL
})

describe('isAuthorizedSanityWebhook', () => {
  it('fails closed when the secret is unset (no "Bearer undefined" bypass)', () => {
    delete process.env.SANITY_WEBHOOK_SECRET
    expect(isAuthorizedSanityWebhook('Bearer undefined')).toBe(false)
    expect(isAuthorizedSanityWebhook('Bearer ')).toBe(false)
    expect(isAuthorizedSanityWebhook(null)).toBe(false)
  })

  it('accepts the exact matching bearer token', () => {
    process.env.SANITY_WEBHOOK_SECRET = 'super-secret-value'
    expect(isAuthorizedSanityWebhook('Bearer super-secret-value')).toBe(true)
  })

  it('rejects a wrong or missing token when the secret is set', () => {
    process.env.SANITY_WEBHOOK_SECRET = 'super-secret-value'
    expect(isAuthorizedSanityWebhook('Bearer wrong')).toBe(false)
    expect(isAuthorizedSanityWebhook('super-secret-value')).toBe(false) // missing "Bearer "
    expect(isAuthorizedSanityWebhook(null)).toBe(false)
  })
})
