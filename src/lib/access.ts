// A cancelled membership keeps access until the already-paid period ends
// (`cancel_at`), then lapses. PayPal cancellations have no period-end webhook to
// flip the role, so we enforce the cutoff lazily wherever access is gated and
// where the dashboard renders. Stripe also fires `customer.subscription.deleted`
// at period end, so for Stripe this is just a safe net.
//
// Direction matters: this only ever REVOKES access after the cutoff — it never
// grants it — so an unset/future `cancel_at` is a no-op.
export function membershipHasLapsed(cancelAt: string | null | undefined): boolean {
  if (!cancelAt) return false
  return new Date(cancelAt).getTime() <= Date.now()
}
