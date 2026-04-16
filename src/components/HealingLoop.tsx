'use client';

import { motion } from 'framer-motion';

export default function HealingLoop() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#2B4019' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 60% at 80% 50%, rgba(212,112,58,0.09) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-10 lg:gap-24 py-20 lg:py-28">

        {/* Left — 짧고 강하게 (모바일에서는 이미지 아래에 표시) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center order-2 lg:order-1"
        >
          <p className="text-xs tracking-[0.2em] uppercase font-medium mb-8"
            style={{ color: 'rgba(212,168,67,0.6)' }}>
            The Mirror of Calm
          </p>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.2rem] leading-[1.15] text-cream font-medium mb-8">
            Your animal reflects<br />what you carry.
          </h2>

          <p className="font-serif italic text-xl sm:text-2xl"
            style={{ color: 'rgba(212,168,67,1)' }}>
            When they find peace —<br />so do you.
          </p>
        </motion.div>

        {/* Right — image (모바일에서는 텍스트 위에 표시) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[4/5] order-1 lg:order-2"
        >
          <img
            src="/images/Mirror2.jpg"
            alt="A person and their animal reflecting calm together"
            className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
          />
          {/* Subtle dark vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(43,64,25,0.5) 0%, transparent 40%)',
            }}
          />
        </motion.div>

      </div>
    </section>
  );
}
