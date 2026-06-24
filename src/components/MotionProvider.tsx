'use client';

import { MotionConfig } from 'framer-motion';

// Make every Framer Motion animation respect the OS "reduce motion" setting.
// reducedMotion="user" disables transform/layout animations (the y-slide, scale,
// pulse) for those users while keeping opacity fades — so scroll-in content
// still appears gently instead of moving. The global CSS clamp in globals.css
// only covers CSS transitions, not JS-driven Framer transforms, so this fills
// that gap in one place rather than gating every component by hand.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
