// The self-service refund window for annual plans (Tapas, 2026-07-15): a
// member who subscribed within this many days can cancel with an automatic
// full refund, no emails needed. Mirrors the policy stated in the FAQ and the
// welcome email — change all together.
export const REFUND_WINDOW_DAYS = 14

const WINDOW_MS = REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000

// The authoritative check the API route runs against the *provider's* start
// date (Stripe start_date / PayPal start_time) — the payment ledger is the
// source of truth, not our DB, which webhook lag or manual edits can skew.
export function isWithinRefundWindow(startedAtMs: number, nowMs: number = Date.now()): boolean {
  return nowMs - startedAtMs <= WINDOW_MS
}

// The dashboard's cheap UI gate: we don't store the subscription start, but an
// annual period ends one year after it started, so period_end − 1 year ≈ start.
// Only decides whether to SHOW the offer — the route re-checks for real, so a
// slightly-off estimate can never issue a wrong refund.
export function annualStartFromPeriodEnd(periodEndISO: string): number {
  const d = new Date(periodEndISO)
  d.setFullYear(d.getFullYear() - 1)
  return d.getTime()
}
