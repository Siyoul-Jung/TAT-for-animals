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

