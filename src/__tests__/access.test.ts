/**
 * @jest-environment node
 */
// membershipHasLapsed is the signal that lets a cancelled-and-expired member
// (esp. PayPal, whose subscription id is never cleared) rejoin: checkout treats
// a lapsed membership as NOT a live subscription, so it no longer blocks them.
import { membershipHasLapsed } from '@/lib/access'

describe('membershipHasLapsed', () => {
  it('is false with no cancel date (active / no cancellation)', () => {
    expect(membershipHasLapsed(null)).toBe(false)
    expect(membershipHasLapsed(undefined)).toBe(false)
  })

  it('is false while the paid period is still in the future (pending cancel — keep access)', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    expect(membershipHasLapsed(future)).toBe(false)
  })

  it('is true once the paid period has passed (lapsed → checkout lets them rejoin)', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    expect(membershipHasLapsed(past)).toBe(true)
  })
})
