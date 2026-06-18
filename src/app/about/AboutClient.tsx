'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

export default function AboutClient() {
  return (
    <main className="bg-cream">

      {/* 1. 헤더 */}
      <section className="pt-28 sm:pt-32 pb-4 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp}>
            <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5"
              style={{ color: '#467826' }}>
              The Founder
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-charcoal font-medium leading-tight mb-4">
              Tapas Fleming
            </h1>
            <p className="font-sans text-lg text-muted">
              Creator and Founder of TATLife®
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. 사진 + 초기 스토리 */}
      <section className="pt-4 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* 사진 */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 24px 64px rgba(28,16,7,0.12), 0 0 0 1px rgba(28,16,7,0.06)',
              }}
            >
              <Image
                src="/images/Tapas-Thanks.jpg"
                alt="Tapas Fleming — Creator of TAT®"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(28,16,7,0.20) 0%, transparent 50%)' }}
              />
            </div>

            {/* Founded badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-7 right-3 sm:-bottom-5 sm:-right-5 bg-cream rounded-2xl px-5 py-3 sm:px-6 sm:py-4 flex flex-col gap-0.5"
              style={{ boxShadow: '0 8px 32px rgba(28,16,7,0.10), 0 0 0 1px rgba(28,16,7,0.07)' }}
            >
              <span className="font-serif text-2xl font-semibold text-charcoal">1993</span>
              <span className="text-xs text-charcoal/65 font-light tracking-wide">TATLife® Founded</span>
            </motion.div>
          </motion.div>

          {/* 텍스트 */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 text-charcoal/65 font-light leading-relaxed text-base sm:text-lg pt-6"
          >
            <p>
              After years of searching for a simpler, gentler way to help people heal —
              without reliving their pain — Tapas developed TAT® in 1993.
            </p>
            <p>
              What began as a quiet discovery in her acupuncture practice grew into something
              she could not have imagined: a technique that has since reached people
              around the world.
            </p>
            <p>
              TAT® works by allowing the nervous system to gently release what it has been
              holding — beliefs, fears, memories — not by forcing them back into awareness,
              but by creating the conditions for something new to take their place.
            </p>

            <div className="h-px bg-charcoal/8 my-2" />

            <blockquote className="font-serif text-xl sm:text-2xl text-charcoal/80 leading-snug">
              &ldquo;Help people find peace. One person —
              and one animal — at a time.&rdquo;
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* 3. TAT for Animals 스토리 */}
      <section className="py-20 lg:py-28 px-6">
        <div className="max-w-3xl mx-auto">

          <motion.div {...fadeUp} className="mb-12">
            <div className="w-12 h-0.5 mb-8" style={{ backgroundColor: '#467826' }} />
            <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5"
              style={{ color: '#467826' }}>
              TAT for Animals
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-medium leading-tight">
              How it began with animals.
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="flex flex-col gap-6 text-charcoal/65 font-light leading-relaxed text-base sm:text-lg"
          >
            <p>
              Tapas has always believed that healing is not separate from love —
              and that love is not separate from the animals who share our lives.
            </p>
            <p>
              TAT for Animals grew from watching what happens when the technique is
              offered to animals directly: the way a dog's body softens, the way a cat
              that has been withdrawn slowly begins to re-engage with the world.
            </p>
            <p>
              And then noticing what happens in the person holding the intention —
              how something in them shifts too. That reflection became the heart of
              this program.
            </p>
            <p>
              <span className="text-charcoal/85 font-normal">
                TAT for Animals is not just about your animal.
              </span>{' '}
              It is an invitation to heal together — gently, without force,
              at whatever pace feels right.
            </p>
          </motion.div>

        </div>
      </section>

      {/* 4. CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-px bg-charcoal/8 mb-14" />

          <motion.div {...fadeUp}>
            <p className="font-sans text-lg text-charcoal/65 font-light leading-relaxed mb-6">
              Whenever you feel ready, Tapas is here.
            </p>
            <Link
              href="/membership"
              className="inline-flex items-center min-h-[44px] text-base font-medium underline underline-offset-2 transition-colors hover:opacity-70"
              style={{ color: '#467826' }}
            >
              See membership options →
            </Link>
          </motion.div>
        </div>
      </section>

    </main>
  )
}
