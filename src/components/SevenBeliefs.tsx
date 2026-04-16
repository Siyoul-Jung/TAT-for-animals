// src/components/SevenBeliefs.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const beliefs = [
  { text: "I'm unlovable.",                        size: 'lg', rotate: -1   },
  { text: "I'm unwanted.",                         size: 'sm', rotate: 0.8  },
  { text: "I always have to be on guard.",         size: 'md', rotate: -0.5 },
  { text: "No one values me or listens to me.",    size: 'lg', rotate: 0.6  },
  { text: "I always feel like a victim.",          size: 'md', rotate: -0.8 },
  { text: "I'll never be safe.",                   size: 'sm', rotate: 0.4  },
  { text: "I don't deserve good things.",          size: 'lg', rotate: -0.6 },
];

const sizeMap = {
  sm: 'text-sm px-4 py-2.5',
  md: 'text-base px-5 py-3',
  lg: 'text-lg px-6 py-3.5',
};

export default function SevenBeliefs() {
  const [released, setReleased] = useState<Set<number>>(new Set());
  const [whisper, setWhisper] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const releasedCount = released.size;
  const showCTA = releasedCount >= 3;
  const allReleased = releasedCount === beliefs.length;

  const release = (i: number) => {
    if (released.has(i)) return;
    setReleased((prev) => new Set([...prev, i]));
    setHasInteracted(true);
    setWhisper(true);
    setTimeout(() => setWhisper(false), 1400);
  };

  return (
    <section className="bg-cream py-28 px-6 overflow-hidden">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <p className="text-xs tracking-[0.2em] uppercase font-medium text-brand mb-5">
            Recognise yourself?
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-charcoal font-medium leading-tight mb-4">
            Do any of these<br />feel familiar?
          </h2>

          {/* Instruction — fades after first interaction */}
          <AnimatePresence>
            {!hasInteracted && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-sm text-muted mt-3"
              >
                Touch the ones that feel true.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pills area */}
        <div className="relative">

          {/* ✦ released whisper */}
          <div className="h-8 flex items-center justify-center mb-4">
            <AnimatePresence>
              {whisper && (
                <motion.span
                  key="whisper"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs tracking-[0.25em] font-light pointer-events-none select-none"
                  style={{ color: 'rgba(212,112,58,0.55)' }}
                >
                  ✦ released
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Floating pills */}
          <motion.div layout className="flex flex-wrap gap-3 justify-center min-h-[80px]">
            <AnimatePresence mode="popLayout">
              {beliefs.map((belief, i) => {
                if (released.has(i)) return null;
                return (
                  <motion.button
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: belief.rotate,
                    }}
                    exit={{
                      opacity: 0,
                      y: -48,
                      scale: 0.75,
                      filter: 'blur(6px)',
                      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                    }}
                    transition={{
                      layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.5, delay: i * 0.06 },
                      scale: { duration: 0.5, delay: i * 0.06 },
                    }}
                    whileHover={{ scale: 1.04, rotate: 0, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => release(i)}
                    className={[
                      'font-serif italic rounded-full border cursor-pointer select-none',
                      'text-charcoal/65 border-charcoal/12 bg-white/50',
                      'hover:border-brand/35 hover:text-charcoal/85 hover:bg-brand/5',
                      'transition-colors duration-200',
                      sizeMap[belief.size as keyof typeof sizeMap],
                    ].join(' ')}
                  >
                    &ldquo;{belief.text}&rdquo;
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* All released — quiet ✦ cluster */}
          <AnimatePresence>
            {allReleased && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="flex justify-center gap-3 pt-10"
              >
                {[0, 1, 2].map((j) => (
                  <motion.span
                    key={j}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + j * 0.15, duration: 0.6 }}
                    className="text-brand/40 text-sm"
                  >
                    ✦
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transition — appears after 3 released */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              key="cta-block"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mt-14"
            >
              <div
                className="h-px mx-auto mb-10 max-w-[120px]"
                style={{ backgroundColor: 'rgba(212,112,58,0.2)' }}
              />
              <p className="font-serif text-2xl sm:text-3xl text-charcoal font-medium leading-relaxed mb-3">
                These beliefs are born from experience.
              </p>
              <p className="text-base text-charcoal/50 font-light mb-10 max-w-md mx-auto">
                And they can be dissolved — gently,<br className="hidden sm:block" /> without reliving anything.
              </p>
              <Link
                href="#experience"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-brand font-medium text-sm tracking-wide hover:gap-3 transition-all group border-b border-brand/30 pb-0.5 hover:border-brand"
              >
                See how TAT works
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
