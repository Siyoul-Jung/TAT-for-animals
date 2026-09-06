/**
 * @jest-environment node
 */
// The founding-member window is the only place on the site where a date decides
// whether someone can open a $10/month subscription, and it is driven entirely
// by one env var that nobody will look at again until launch day. These lock in
// the two behaviours that matter: an unset (or unusable) value must leave the
// page open exactly as it is today, and a set value must close it on the 30th
// day — not the 29th, and not silently never.

import { isWelcomeBackExpired } from '@/lib/welcomeBack'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-10-01T12:00:00Z').getTime()

// Announced N days before "now", so the window's age is exactly N days.
function announcedDaysAgo(days: number): string {
  return new Date(NOW - days * DAY).toISOString()
}

describe('isWelcomeBackExpired', () => {
  const original = process.env.WELCOME_BACK_ANNOUNCED_AT

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW)
  })

  afterEach(() => {
    jest.useRealTimers()
    if (original === undefined) delete process.env.WELCOME_BACK_ANNOUNCED_AT
    else process.env.WELCOME_BACK_ANNOUNCED_AT = original
  })

  // Today's production state: the announcement hasn't happened, so nothing
  // should close. A regression here would take the page down early.
  it('stays open while no announcement date is set', () => {
    delete process.env.WELCOME_BACK_ANNOUNCED_AT
    expect(isWelcomeBackExpired()).toBe(false)
  })

  it('stays open when the date is blank', () => {
    process.env.WELCOME_BACK_ANNOUNCED_AT = ''
    expect(isWelcomeBackExpired()).toBe(false)
  })

  // A typo must not close the offer without warning — erring toward the member.
  it('stays open when the date cannot be read', () => {
    process.env.WELCOME_BACK_ANNOUNCED_AT = 'next tuesday'
    expect(isWelcomeBackExpired()).toBe(false)
  })

  it('stays open on the day of the announcement', () => {
    process.env.WELCOME_BACK_ANNOUNCED_AT = announcedDaysAgo(0)
    expect(isWelcomeBackExpired()).toBe(false)
  })

  it('stays open on day 29, the last day of the window', () => {
    process.env.WELCOME_BACK_ANNOUNCED_AT = announcedDaysAgo(29)
    expect(isWelcomeBackExpired()).toBe(false)
  })

  it('closes on day 30', () => {
    process.env.WELCOME_BACK_ANNOUNCED_AT = announcedDaysAgo(30)
    expect(isWelcomeBackExpired()).toBe(true)
  })

  it('stays closed well past the window', () => {
    process.env.WELCOME_BACK_ANNOUNCED_AT = announcedDaysAgo(365)
    expect(isWelcomeBackExpired()).toBe(true)
  })

  // Jez will most likely type a plain date rather than a full timestamp.
  it('accepts a plain date, not just a full timestamp', () => {
    process.env.WELCOME_BACK_ANNOUNCED_AT = '2026-08-01'
    expect(isWelcomeBackExpired()).toBe(true)
    process.env.WELCOME_BACK_ANNOUNCED_AT = '2026-09-25'
    expect(isWelcomeBackExpired()).toBe(false)
  })

  // The date is read on every call, not captured at import time — otherwise a
  // long-lived serverless instance would keep serving the offer after it ended.
  it('re-reads the date on every call', () => {
    process.env.WELCOME_BACK_ANNOUNCED_AT = announcedDaysAgo(1)
    expect(isWelcomeBackExpired()).toBe(false)
    process.env.WELCOME_BACK_ANNOUNCED_AT = announcedDaysAgo(31)
    expect(isWelcomeBackExpired()).toBe(true)
  })
})
