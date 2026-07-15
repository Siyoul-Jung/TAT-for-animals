import { isWithinRefundWindow, annualStartFromPeriodEnd, REFUND_WINDOW_DAYS } from '@/lib/refundWindow'

const DAY = 24 * 60 * 60 * 1000

describe('14-day annual refund window', () => {
  const start = Date.UTC(2026, 6, 1) // 2026-07-01

  it('is open the moment the subscription starts', () => {
    expect(isWithinRefundWindow(start, start)).toBe(true)
  })

  it('is open on the last day of the window', () => {
    expect(isWithinRefundWindow(start, start + REFUND_WINDOW_DAYS * DAY)).toBe(true)
  })

  it('closes right after the window ends', () => {
    expect(isWithinRefundWindow(start, start + REFUND_WINDOW_DAYS * DAY + 1)).toBe(false)
  })

  it('is closed months later', () => {
    expect(isWithinRefundWindow(start, start + 200 * DAY)).toBe(false)
  })
})

describe('estimating the annual start from the stored period end', () => {
  it('subtracts exactly one calendar year', () => {
    const start = annualStartFromPeriodEnd('2027-07-15T10:00:00.000Z')
    expect(new Date(start).toISOString()).toBe('2026-07-15T10:00:00.000Z')
  })

  it('keeps a fresh annual member inside the window', () => {
    // Joined 3 days ago → period ends 1 year after that.
    const now = Date.UTC(2026, 6, 15)
    const periodEnd = new Date(now - 3 * DAY)
    periodEnd.setUTCFullYear(periodEnd.getUTCFullYear() + 1)
    expect(isWithinRefundWindow(annualStartFromPeriodEnd(periodEnd.toISOString()), now)).toBe(true)
  })

  it('keeps an old annual member outside the window', () => {
    const now = Date.UTC(2026, 6, 15)
    const periodEnd = new Date(now - 60 * DAY)
    periodEnd.setUTCFullYear(periodEnd.getUTCFullYear() + 1)
    expect(isWithinRefundWindow(annualStartFromPeriodEnd(periodEnd.toISOString()), now)).toBe(false)
  })
})
