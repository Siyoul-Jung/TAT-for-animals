// The self-service refund window for annual plans (Tapas, 2026-07-15): within
// this many days of an annual CHARGE — the first purchase or any renewal, each
// is a "purchase" with its own window — the member can cancel with an
// automatic full refund, no emails needed. (Renewals included on purpose: the
// most common refund request is someone who forgot to cancel before renewing.)
// Mirrors the policy stated in the FAQ and the welcome email — change all
// together.
export const REFUND_WINDOW_DAYS = 14

const WINDOW_MS = REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000

// The authoritative check the API route runs against the *provider's* latest
// charge date (Stripe invoice.created / PayPal capture time) — the payment
// ledger is the source of truth, not our DB, which webhook lag or manual
// edits can skew.
export function isWithinRefundWindow(startedAtMs: number, nowMs: number = Date.now()): boolean {
  return nowMs - startedAtMs <= WINDOW_MS
}

// The dashboard's cheap UI gate: an annual period ends one year after it was
// paid for, so period_end − 1 year = the latest annual charge — for renewals
// too, which is exactly the anchor the route checks. Still only decides
// whether to SHOW the offer — the route re-checks against the ledger, so a
// skewed period_end can never issue a wrong refund.
export function annualStartFromPeriodEnd(periodEndISO: string): number {
  const d = new Date(periodEndISO)
  d.setFullYear(d.getFullYear() - 1)
  return d.getTime()
}
