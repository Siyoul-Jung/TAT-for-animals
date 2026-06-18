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
    // A hash link (e.g. /membership#membership) means the visitor asked to land
    // on a specific section — don't override it with scroll-to-top. Scroll to the
    // target instead, retrying briefly in case it mounts after this effect.
    const hash = window.location.hash;
    if (hash) {
      let tries = 0;
      const goToAnchor = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (el) {
          el.scrollIntoView();
        } else if (tries++ < 10) {
          requestAnimationFrame(goToAnchor);
        }
      };
      goToAnchor();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
