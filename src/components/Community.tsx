// src/components/Community.tsx
'use client';

import { motion } from 'framer-motion';

const pillars = [
  {
    icon: '🌿',
    title: 'Weekly Live Sessions',
    body: 'Join Tapas and a small group every week — guided, intimate, and deeply restorative.',
  },
  {
    icon: '🌍',
    title: 'Global Community',
    body: 'Thousands of people healing together worldwide. Each person\'s intention strengthens everyone else\'s.',
  },
  {
    icon: '📹',
    title: 'Full Video Library',
    body: 'Hundreds of sessions available anytime. Your pace, your animal, your moment.',
  },
];

const stats = [
  { value: '80+', label: 'Countries' },
  { value: '500K+', label: 'People reached' },
  { value: '30+', label: 'Years of practice' },
];

export default function Community() {
  return (
    <section className="bg-surface py-28 px-6 overflow-hidden relative">

      {/* Subtle warm glow top-right */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(212,112,58,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-2 gap-12 items-end mb-20"
        >
          <div>
            <p className="text-xs tracking-[0.2em] uppercase font-medium text-brand mb-5">
              You're not alone
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-charcoal font-medium leading-tight">
              Healing is stronger<br />together.
            </h2>
          </div>
          <p className="text-base sm:text-lg text-charcoal/60 font-light leading-relaxed self-end">
            TAT® works in groups the same way it works between you and your animal —
            each person&apos;s healing intention{' '}
            <span className="text-charcoal/80 font-normal">strengthens everyone else&apos;s.</span>
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex flex-wrap gap-px mb-20 rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(28,16,7,0.08)' }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex-1 min-w-[120px] bg-cream px-8 py-7 flex flex-col gap-1"
              style={{ borderRight: i < stats.length - 1 ? '1px solid rgba(28,16,7,0.08)' : 'none' }}
            >
              <span className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
                {s.value}
              </span>
              <span className="text-sm text-charcoal/50 font-light">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Pillar cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -4 }}
              className="group bg-cream rounded-2xl p-8 flex flex-col gap-5 transition-shadow"
              style={{
                border: '1px solid rgba(28,16,7,0.07)',
                boxShadow: '0 2px 12px rgba(28,16,7,0.04)',
              }}
            >
              <span className="text-3xl">{p.icon}</span>
              <div>
                <h3 className="font-serif text-xl text-charcoal font-medium mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-charcoal/55 leading-relaxed font-light">
                  {p.body}
                </p>
              </div>

              {/* Hover accent line */}
              <div className="mt-auto pt-4">
                <motion.div
                  className="h-px rounded-full origin-left"
                  style={{ backgroundColor: '#D4703A' }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
