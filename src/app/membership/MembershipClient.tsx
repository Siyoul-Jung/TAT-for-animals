'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Pricing from '@/components/Pricing';

function PayPalErrorBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get('error') !== 'paypal_failed') return null;
  return (
    <div className="bg-red-50 border-b border-red-200 px-6 py-4">
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-red-700 leading-relaxed">
          Your PayPal payment didn&apos;t go through, so your membership wasn&apos;t started.
          Nothing was charged — you can try again below.
        </p>
      </div>
    </div>
  );
}

export default function MembershipClient() {
  return (
    <div className="min-h-screen">

      <Suspense fallback={null}>
        <PayPalErrorBanner />
      </Suspense>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-cream">

        {/* Mobile: 스택형 (홈페이지 Hero 동일 패턴) */}
        <div className="lg:hidden flex flex-col" style={{ height: '100dvh' }}>
          <div className="relative shrink-0 overflow-hidden" style={{ height: '61.8dvh' }}>
            <Image
              src="/images/membership_img.jpg"
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div
              className="absolute inset-0 z-10"
              style={{ background: 'linear-gradient(to bottom, transparent 55%, rgba(251,245,243,0.5) 80%, rgba(251,245,243,1) 100%)' }}
            />
          </div>
          <div className="flex-1 flex flex-col justify-center px-6">
            <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: '#5E9635' }}>
              Membership
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl leading-[1.2] text-charcoal mb-2 font-semibold">
              Heal together.
            </h1>
            <p className="font-sans text-sm mb-5 font-normal" style={{ color: '#5E9635' }}>
              For your animal and you. At your own pace.
            </p>
            <a
              href="#membership"
              className="inline-flex min-h-[44px] w-fit items-center px-6 py-3 rounded-full text-cream font-semibold text-sm transition-all active:scale-95"
              style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.25)' }}
            >
              See plans
            </a>
          </div>
        </div>

        {/* Desktop: 2컬럼 */}
        <div
          className="hidden lg:grid lg:grid-cols-[5fr_6fr] lg:min-h-screen relative"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 30% 60%, rgba(212,112,58,0.07) 0%, transparent 65%)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="relative z-10 flex flex-col justify-center px-14 xl:px-20 2xl:px-28 pt-24 pb-20"
          >
            <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-5" style={{ color: '#5E9635' }}>
              Membership
            </p>
            <h1 className="font-serif text-4xl xl:text-5xl 2xl:text-6xl leading-[1.2] text-charcoal font-semibold mb-5">
              Heal together.
            </h1>
            <p className="font-sans text-xl mb-10 font-normal" style={{ color: '#5E9635' }}>
              For your animal and you.<br />At your own pace.
            </p>
            <a
              href="#membership"
              className="inline-flex w-fit px-8 py-4 rounded-full text-cream font-semibold text-base transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              style={{ backgroundColor: '#D4703A', boxShadow: '0 8px 32px rgba(212,112,58,0.25)' }}
            >
              See plans
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.15 }}
            className="relative overflow-hidden"
          >
            <Image
              src="/images/membership_img.jpg"
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="55vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, rgba(251,245,243,1) 0%, rgba(251,245,243,0.85) 12%, rgba(251,245,243,0.2) 35%, transparent 55%)' }} />
            <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(251,245,243,0.9) 0%, rgba(251,245,243,0.3) 20%, transparent 45%)' }} />
            <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(251,245,243,0.9) 0%, rgba(251,245,243,0.3) 15%, transparent 35%)' }} />
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <Pricing />

      {/* ── What's included ── */}
      <section id="membership" className="bg-cream py-14 lg:py-20 px-6">
        <div className="max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-4" style={{ color: '#5E9635' }}>
              What's included
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-medium leading-tight">
              Everything you need, in one place.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* The Calm Library */}
            <div className="mb-8 pb-8 border-b border-charcoal/8">
              <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-5" style={{ color: '#5E9635' }}>
                The Calm Library — $27 / mo
              </p>
              <div className="grid lg:grid-cols-2 gap-7 lg:gap-14">
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase font-medium mb-2" style={{ color: 'rgba(212,112,58,0.6)' }}>
                    TAT for Animals
                  </p>
                  <h3 className="font-serif text-xl text-charcoal font-medium mb-2 leading-snug">
                    Help your animal feel calm and safe.
                  </h3>
                  <p className="text-base text-charcoal/55 font-light leading-relaxed">
                    Video library of TAT® sessions for animals — fear, anxiety, past trauma gently released. As your animal settles, something in you shifts too.
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase font-medium mb-2" style={{ color: 'rgba(212,112,58,0.6)' }}>
                    Healing ACEs Plus
                  </p>
                  <h3 className="font-serif text-xl text-charcoal font-medium mb-2 leading-snug">
                    Release what you've been carrying.
                  </h3>
                  <p className="text-base text-charcoal/55 font-light leading-relaxed">
                    Video library for your own healing. Gently dissolving beliefs from past experience — without reliving them. At your own pace.
                  </p>
                </div>
              </div>
            </div>

            {/* The Calm Circle */}
            <div>
              <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-5" style={{ color: '#5E9635' }}>
                The Calm Circle — $47 / mo
              </p>
              <div className="grid lg:grid-cols-2 gap-7 lg:gap-14">
                <div>
                  <h3 className="font-serif text-xl text-charcoal font-medium mb-2 leading-snug">
                    Everything in The Calm Library, plus live sessions with Tapas every month.
                  </h3>
                  <p className="text-base text-charcoal/55 font-light leading-relaxed">
                    Monthly live webinars for TAT for Animals and Healing ACEs Plus. Real-time guidance, your questions answered, and the full archive of past recordings.
                  </p>
                </div>
              </div>
            </div>

          </motion.div>

        </div>
      </section>

      {/* ── Tapas 인용구 + FAQ ── */}
      <section className="bg-white py-20 lg:py-28 px-6">
        <div className="max-w-3xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <div
              className="relative w-28 h-28 rounded-full overflow-hidden mx-auto mb-8"
              style={{ boxShadow: '0 0 0 2px rgba(28,16,7,0.08)' }}
            >
              <Image
                src="/images/Tapas-Thanks.jpg"
                alt="Tapas Fleming"
                fill
                sizes="112px"
                className="object-cover object-[50%_15%]"
              />
            </div>
            <blockquote className="font-serif italic text-2xl sm:text-3xl text-charcoal/80 leading-[1.6] mb-5 text-balance">
              &ldquo;Help people find peace. One person — and one animal — at a time.&rdquo;
            </blockquote>
            <p className="text-xs tracking-[0.25em] uppercase text-charcoal/35">
              — Tapas Fleming, Founder of TAT®
            </p>
          </motion.div>

          <div className="h-px bg-charcoal/8 mb-12" />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <p className="text-base sm:text-lg text-charcoal/55 font-light leading-relaxed">
              Still wondering if this is right for you?
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center min-h-[44px] text-base font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
              style={{ color: 'rgba(212,112,58,0.9)' }}
            >
              Read the FAQ →
            </Link>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
