// Single source of truth for the two membership tiers' display names.
// Previously each email template redeclared these — a plan rename had to be
// chased across three files (found in the 2026-07-02 maintainability review).
// DashboardClient keeps its own PLAN_INFO because it also carries prices.
export type Plan = 'subscriber' | 'pro_subscriber';

// "The Calm Library" → "The Calm Connection" (Tapas, 2026-07-14 — "Library
// sounded too boring"). The content space itself went through several names:
// "Library" → "Your Calm Space" → "Calm Collection" (2026-07-28) → settled on
// "Video Library" (Tapas/Jez, 2026-07-30 — "Calm Collection" read too close to
// the tier name "The Calm Connection"). "Calm Space" survives only as the warm
// greeting on the library page and in the welcome email ("Welcome to your Calm
// Space, [name]"); everywhere the space itself is named it's "Video Library".
export const PLAN_NAMES: Record<Plan, string> = {
  subscriber: 'The Calm Connection',
  pro_subscriber: 'The Calm Circle',
};

// The published library size, surfaced in marketing copy on the pricing and
// membership cards (Jez's requested wording, 2026-07-06). Currently 41
// published videos → "40+"; bump this label when the count crosses the next
// ten (e.g. "50+"). Kept here so the two cards can't drift apart — the library
// page itself shows exact live counts from the data.
export const LIBRARY_VIDEO_COUNT_LABEL = '40+';

// Price label by the actual price/plan the member is on — keyed by Stripe
// price ID or PayPal plan ID (both are just strings, so one map covers both
// providers). Needed because role alone doesn't determine price: Founding
// Member ($10/mo, grandfathered) shares the pro_subscriber role with Calm
// Circle ($47/mo) but must show its own rate, not Calm Circle's.
// profiles.plan_price_id (set by the webhooks/success handlers) is looked up
// here; a row with no match (not yet backfilled, or an unrecognized id) falls
// back to the role-based label in DashboardClient's PLAN_INFO.
export const PRICE_ID_LABELS: Record<string, string> = {
  ...(process.env.STRIPE_PRICE_CALM_LIBRARY && { [process.env.STRIPE_PRICE_CALM_LIBRARY]: '$27 / month' }),
  ...(process.env.STRIPE_PRICE_CALM_CIRCLE && { [process.env.STRIPE_PRICE_CALM_CIRCLE]: '$47 / month' }),
  ...(process.env.STRIPE_PRICE_CALM_LIBRARY_ANNUAL && { [process.env.STRIPE_PRICE_CALM_LIBRARY_ANNUAL]: '$270 / year' }),
  ...(process.env.STRIPE_PRICE_CALM_CIRCLE_ANNUAL && { [process.env.STRIPE_PRICE_CALM_CIRCLE_ANNUAL]: '$470 / year' }),
  ...(process.env.STRIPE_PRICE_FOUNDING_MEMBER && { [process.env.STRIPE_PRICE_FOUNDING_MEMBER]: '$10 / month' }),
  ...(process.env.PAYPAL_PLAN_CALM_LIBRARY && { [process.env.PAYPAL_PLAN_CALM_LIBRARY]: '$27 / month' }),
  ...(process.env.PAYPAL_PLAN_CALM_CIRCLE && { [process.env.PAYPAL_PLAN_CALM_CIRCLE]: '$47 / month' }),
  ...(process.env.PAYPAL_PLAN_CALM_LIBRARY_ANNUAL && { [process.env.PAYPAL_PLAN_CALM_LIBRARY_ANNUAL]: '$270 / year' }),
  ...(process.env.PAYPAL_PLAN_CALM_CIRCLE_ANNUAL && { [process.env.PAYPAL_PLAN_CALM_CIRCLE_ANNUAL]: '$470 / year' }),
  ...(process.env.PAYPAL_PLAN_FOUNDING_MEMBER && { [process.env.PAYPAL_PLAN_FOUNDING_MEMBER]: '$10 / month' }),
};

