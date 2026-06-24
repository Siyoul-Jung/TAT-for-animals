/**
 * @jest-environment node
 */
import { estimatePaidThrough } from '@/lib/paypal'

// Bounded fallback used so a PayPal cancel never strips a paying member's access
// immediately when the exact paid-through date can't be read.
describe('estimatePaidThrough', () => {
  it('grants ~one month out for a monthly plan', () => {
    const now = Date.now()
    const days = (new Date(estimatePaidThrough('month')).getTime() - now) / 86400000
    expect(days).toBeGreaterThan(30)
    expect(days).toBeLessThanOrEqual(31.1)
  })

  it('grants ~one year out for an annual plan', () => {
    const now = Date.now()
    const days = (new Date(estimatePaidThrough('year')).getTime() - now) / 86400000
    expect(days).toBeGreaterThan(365)
    expect(days).toBeLessThanOrEqual(366.1)
  })

  it('returns a valid ISO timestamp', () => {
    expect(estimatePaidThrough('month')).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
