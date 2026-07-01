'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { returnScrollKey, RETURN_SCROLL_MAX_AGE_MS } from '@/lib/scrollReturn';

// The single owner of scroll behaviour on navigation. We take scroll handling away
// from the browser (manual restoration) so every route change is predictable, and
// then decide, in priority order, where to land:
//   1. A #hash  → the section the visitor explicitly asked for.
//   2. A saved return position → they hit Back from checkout/sign-up, so bring them
//      back to the plans they were looking at (recorded by Pricing) rather than the
//      hero. Without this, the home page's lazy content made native restore drift,
//      which is why this component used to force the top instead.
//   3. Otherwise → the top (the hero), matching the site's single-purpose pages.
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // 1. Hash link (e.g. /membership#membership) — scroll to the target, retrying
    // briefly in case it mounts after this effect.
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

    // 2. Return position saved when a plan was tapped on this path — restore it.
    const y = readReturnPosition(pathname);
    if (y !== null) {
      // Re-assert the target for a short window: on a fresh render the page isn't
      // tall enough yet (Hero slideshow + images still settling), so a single
      // scrollTo would clamp short. Stop the moment the visitor scrolls themselves.
      let cancelled = false;
      const deadline = Date.now() + 1000;
      const stop = () => { cancelled = true; };
      const tick = () => {
        if (cancelled) return;
        window.scrollTo(0, y);
        if (Date.now() < deadline) requestAnimationFrame(tick);
      };
      window.addEventListener('wheel', stop, { passive: true, once: true });
      window.addEventListener('touchstart', stop, { passive: true, once: true });
      window.addEventListener('keydown', stop, { once: true });
      tick();
      return () => {
        cancelled = true;
        window.removeEventListener('wheel', stop);
        window.removeEventListener('touchstart', stop);
        window.removeEventListener('keydown', stop);
      };
    }

    // 3. Default — land at the top.
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Reads (and consumes — one-shot) the saved return position for a path. Returns the
// y offset, or null if there's none, it's malformed, or it's gone stale.
function readReturnPosition(pathname: string): number | null {
  let saved: string | null = null;
  try {
    const key = returnScrollKey(pathname);
    saved = sessionStorage.getItem(key);
    if (saved !== null) sessionStorage.removeItem(key);
  } catch {
    return null;
  }
  if (saved === null) return null;
  const [yRaw, tRaw] = saved.split(':');
  const y = Number(yRaw);
  const savedAt = Number(tRaw);
  if (!Number.isFinite(y)) return null;
  if (Number.isFinite(savedAt) && Date.now() - savedAt > RETURN_SCROLL_MAX_AGE_MS) return null;
  return y;
}
