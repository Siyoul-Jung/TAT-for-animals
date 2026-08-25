'use client'

import { motion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

// Two recording reviews — about how animals respond to the recorded TAT sessions.
// Placed just below the membership offer on the homepage (Tapas, 2026-06-27): a
// light, headline-less reassurance that the recordings work for their animal, right
// where someone is deciding to join. Michele = a calm observation, Betsey = the warm
// closing note. Quotes verbatim from TATLife (emojis/brackets tidied).
const michele = {
  name: 'Michele',
  context: 'On the TAT® recording for pets',
  quote:
    'My pets love TAT in general and usually wander over when there is some going on, but they have a notable reaction to the tape specifically for pets. I was surprised the first time because I hadn’t thought there was anything out of sorts with them when I put it on, and yet they were noticeably calmer, more peaceful and more cheerful for at least 2 days after.',
}
const betsey = {
  name: 'Betsey',
  context: 'After watching TAT® for Dogs',
  quote:
    'I just watched the video for TAT for Dogs. That was amazing! I’m still crying with joy! Thank you, what a gift! You’re always an inspiration!',
}

export default function RecordingTestimonials() {
  return (
    <section className="py-16 lg:py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div
          {...fadeUp}
          className="rounded-3xl px-7 py-12 sm:px-14 sm:py-16 flex flex-col items-center gap-10 text-center"
          style={{ backgroundColor: 'rgba(70,120,38,0.05)' }}
        >
          {/* Michele — a calm observation (quiet evidence) */}
          <figure className="flex flex-col items-center gap-4">
            <blockquote className="font-serif text-lg sm:text-xl text-charcoal/80 leading-relaxed">
              &ldquo;{michele.quote}&rdquo;
            </blockquote>
            <figcaption className="text-[12px] uppercase tracking-[0.12em]" style={{ color: '#38601E' }}>
              {michele.name} &middot; {michele.context}
            </figcaption>
          </figure>

          {/* short divider — joins the two as a pair */}
          <span aria-hidden="true" className="w-10 h-px" style={{ backgroundColor: 'rgba(70,120,38,0.25)' }} />

          {/* Betsey — the warm closing note */}
          <figure className="flex flex-col items-center gap-4">
            <blockquote className="font-serif text-lg sm:text-xl text-charcoal/80 leading-relaxed">
              &ldquo;{betsey.quote}&rdquo;
            </blockquote>
            <figcaption className="text-[12px] uppercase tracking-[0.12em]" style={{ color: '#38601E' }}>
              {betsey.name} &middot; {betsey.context}
            </figcaption>
          </figure>
        </motion.div>
      </div>
    </section>
  )
}
