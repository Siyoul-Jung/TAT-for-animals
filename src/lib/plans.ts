// Single source of truth for the two membership tiers' display names.
// Previously each email template redeclared these — a plan rename had to be
// chased across three files (found in the 2026-07-02 maintainability review).
// DashboardClient keeps its own PLAN_INFO because it also carries prices.
export type Plan = 'subscriber' | 'pro_subscriber';

export const PLAN_NAMES: Record<Plan, string> = {
  subscriber: 'The Calm Library',
  pro_subscriber: 'The Calm Circle',
};
