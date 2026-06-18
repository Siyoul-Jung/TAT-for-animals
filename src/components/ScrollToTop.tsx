'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Take scroll handling away from the browser so every navigation — including the
// Back button — lands at the top (the hero). The default behaviour restores a
// saved scroll position on Back, but the home page's lazy content (Hero
// slideshow, images) reflows on remount, so the restore drifts to a wrong spot.
// Forcing top on each route change is predictable and matches the site's
// single-purpose marketing pages.
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
