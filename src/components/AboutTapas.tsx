// src/components/AboutTapas.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';


export default function AboutTapas() {
  return (
    <section className="bg-cream py-20 lg:py-28 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-24 items-center">

        {/* Left — Photo */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex lg:flex-col"
        >
          {/* Photo + badge wrapper */}
          <div className="relative mb-8">
            <div
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 24px 64px rgba(31,46,20,0.12), 0 0 0 1px rgba(31,46,20,0.06)',
              }}
            >
              <Image
                src="/images/Tapas-Thanks.jpg"
                alt="Tapas Fleming — Creator of TAT®"
                fill
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover object-center"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(31,46,20,0.25) 0%, transparent 50%)' }}
              />
            </div>

            {/* Founded badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-5 -right-5 bg-cream rounded-2xl px-6 py-4 flex flex-col gap-0.5"
              style={{ boxShadow: '0 8px 32px rgba(31,46,20,0.10), 0 0 0 1px rgba(31,46,20,0.07)' }}
            >
              <span className="font-serif text-2xl font-semibold text-charcoal">1993</span>
              <span className="text-xs text-charcoal/65 font-light tracking-wide">TAT® created</span>
            </motion.div>
          </div>

          {/* Ghost link — 데스크탑 전용, 뱃지 아래 */}
          <Link
            href="/about"
            className="inline-flex items-center min-h-[44px] text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: '#467826' }}
          >
            Learn more about Tapas →
          </Link>
        </motion.div>

        {/* Right — Text */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          <p className="text-[13px] tracking-[0.2em] uppercase font-medium text-green mb-6">
            The founder
          </p>

          <h2 className="font-serif text-3xl lg:text-4xl text-charcoal font-medium leading-tight mb-2">
            Tapas Fleming
          </h2>
          <p className="font-sans text-base sm:text-lg text-muted mb-6 lg:mb-10">
            Creator and Founder of TATLife®
          </p>

          {/* Divider */}
          <div className="h-px bg-charcoal/8 mb-6 lg:mb-10" />

          <div className="flex flex-col gap-4 lg:gap-6 text-base sm:text-lg text-charcoal/65 font-light leading-relaxed mb-8 lg:mb-12">
            <p>
              After years of searching for a simpler, gentler way to help people heal —
              without reliving their pain — Tapas developed TAT® in 1993.
            </p>
            <p>
              Today, TAT® has reached people around the world.
              Her mission remains the same:
            </p>
            <p className="font-sans text-lg sm:text-xl lg:text-2xl text-charcoal/80 leading-snug">
              &ldquo;Help people find peace. One person —<br className="hidden sm:block" />
              and one animal — at a time.&rdquo;
            </p>
          </div>

          {/* Mobile: 사진 + ghost + 버튼 — 중앙 정렬 */}
          <div className="lg:hidden flex flex-col items-start gap-4">
            <div
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 24px 64px rgba(31,46,20,0.12), 0 0 0 1px rgba(31,46,20,0.06)' }}
            >
              <Image
                src="/images/Tapas-Thanks.jpg"
                alt="Tapas Fleming — Creator of TAT®"
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,46,20,0.25) 0%, transparent 50%)' }} />
            </div>
            <Link
              href="/about"
              className="inline-flex items-center min-h-[44px] text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: '#467826' }}
            >
              Learn more about Tapas →
            </Link>
            <Link
              href="/membership"
              className="inline-flex w-fit min-h-[44px] items-center px-7 py-3 rounded-full text-cream font-bold text-[19px] transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#D4703A', boxShadow: '0 4px 16px rgba(212,112,58,0.22)' }}
            >
              Begin with Tapas
            </Link>
          </div>

          {/* Desktop CTA only */}
          <Link
            href="/membership"
            className="hidden lg:inline-flex w-fit min-h-[44px] items-center px-7 py-3 rounded-full text-cream font-bold text-[19px] transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#D4703A', boxShadow: '0 4px 16px rgba(212,112,58,0.22)' }}
          >
            Begin with Tapas
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
