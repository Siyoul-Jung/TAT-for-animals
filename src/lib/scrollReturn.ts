// Shared contract for "return the visitor to where they were" scroll restoration.
//
// Pricing (the only place that navigates away from a scrolled-down plan view)
// records the scroll position when a plan is tapped. ScrollToTop — the single
// owner of scroll-on-navigation — reads it on return and restores it instead of
// forcing the top. Keeping the key + freshness rule here means both sides can
// never drift apart.

// How long a saved position stays valid. Long enough to survive a slow
// checkout/sign-up detour (including email confirmation), short enough that a
// much later, unrelated forward visit to the same page still lands at the top.
export const RETURN_SCROLL_MAX_AGE_MS = 30 * 60 * 1000;

export function returnScrollKey(pathname: string): string {
  return `pricingReturn:${pathname}`;
}
