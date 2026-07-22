# How a payment becomes access — in plain language

> Written for Tapas and Jez, July 2026. One page, no technical terms.
> This is the "plain-language explanation of how a payment becomes access"
> promised in the launch-planning email thread.

## The short version

A member pays → the payment company (Stripe for cards, PayPal for PayPal)
confirms the money is real → it sends our site a signal → the site unlocks
that member's library. No person touches any step.

## When someone joins

1. The member picks a plan and pays on Stripe's or PayPal's own secure page.
   Card numbers never touch our site.
2. The payment company checks the card, takes the payment, and only then
   sends our site a signed message: "this person has paid for this plan."
3. The site marks the member as active, unlocks their library, and sends
   the welcome email. This takes seconds.

## When a renewal payment fails

The payment company retries the card on its own schedule. While the payment
is unresolved, the site pauses the member's library access and shows them a
gentle notice with a link to fix their payment method. The moment a retry
succeeds, access comes back — again, automatically.

## When someone cancels

- **Monthly, or annual after 14 days**: they cancel from their account page.
  No refund is issued; their access simply runs to the end of what they
  already paid for, then stops.
- **Annual, within 14 days of a charge**: their account page offers
  "cancel with a full refund." One click sends the money back and ends
  access right away. The refund is only ever issued against a payment the
  payment company has already confirmed as collected — the system checks
  the payment company's own records first, every time. (This is the
  safeguard you asked about, and we watched it hold in live tests on both
  Stripe and PayPal.)

## The safety nets underneath

- **The payment company's records are the source of truth.** Before any
  money moves or any access changes, the site asks Stripe or PayPal what is
  actually true — it never acts on a guess.
- **Everything happens exactly once.** Every payment event is recorded, so
  a duplicate signal can't cause a second refund or a second email.
- **Failures don't hide.** If any automatic step ever fails — an email, a
  refund, an access change — the site immediately emails the team with what
  happened and what to do. Silence means everything worked.

## What this means day to day

Nothing needs to be done by hand for a normal join, renewal, cancellation,
or 14-day refund. If a member writes in confused, the first place to look
is their account page — it shows the same truth the system acts on.
