'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

// User-facing "Back to top" button for long pages (Jez's content-review request:
// video pages grow longer as recordings are added, so members need an easy way up).
// Distinct from ScrollToTop.tsx, which silently resets scroll on route changes —
// this is a visible control the visitor taps. Hidden until they've scrolled well
// down, so it never clutters a short view.
export default function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll() // set initial state (e.g. restored scroll position)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function toTop() {
    // Honour reduced-motion: jump instantly instead of an animated scroll.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={toTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1C1007]"
      style={{ backgroundColor: '#D4703A' }}
    >
      <ArrowUp size={22} strokeWidth={2.5} aria-hidden="true" />
    </button>
  )
}
