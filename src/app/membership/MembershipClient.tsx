'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, PawPrint, HeartHandshake, Video } from 'lucide-react';
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
        <div className="lg:hidden flex flex-col" style={{ minHeight: '100dvh' }}>
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
          <div className="flex-1 flex flex-col justify-center px-6 -mt-0.5 bg-cream relative z-20">
            <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: '#467826' }}>
              Membership
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl leading-[1.2] text-charcoal mb-2 font-semibold">
              Heal together.
            </h1>
            <p className="font-sans text-sm mb-5 font-normal text-charcoal/65">
              For your animal and you. At your own pace.
            </p>
            <a
              href="#membership"
              className="inline-flex min-h-[48px] w-fit items-center px-7 py-3.5 rounded-full text-cream font-bold text-[19px] transition-all active:scale-95"
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
            <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5" style={{ color: '#467826' }}>
              Membership
            </p>
            <h1 className="font-serif text-4xl xl:text-5xl 2xl:text-6xl leading-[1.2] text-charcoal font-semibold mb-5">
              Heal together.
            </h1>
            <p className="font-sans text-xl mb-10 font-normal text-charcoal/65">
              For your animal and you.<br />At your own pace.
            </p>
            <a
              href="#membership"
              className="inline-flex w-fit px-9 py-4 rounded-full text-cream font-bold text-[19px] transition-all hover:scale-105 hover:shadow-lg active:scale-95"
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
      <section id="whats-included" className="bg-cream py-14 lg:py-20 px-6">
        <div className="max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-4" style={{ color: '#467826' }}>
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
            <div className="rounded-3xl bg-white border border-charcoal/8 p-6 sm:p-9 lg:p-10 mb-6">
              <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-6" style={{ color: '#467826' }}>
                The Calm Library — $27 / mo
              </p>
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
                {/* TAT for Animals */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,112,58,0.12)' }}>
                      <PawPrint size={20} strokeWidth={1.75} style={{ color: '#D4703A' }} />
                    </div>
                    <p className="text-[13px] tracking-[0.15em] uppercase font-medium" style={{ color: '#467826' }}>
                      TAT for Animals
                    </p>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal font-medium mb-4 leading-snug">
                    Help your animal feel calm and safe.
                  </h3>
                  <ul className="flex flex-col gap-2.5">
                    {[
                      'Full video library of TAT® sessions for animals',
                      'Fear, anxiety, and past trauma, gently released',
                      'As your animal settles, something in you shifts too',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(70,120,38,0.12)' }}>
                          <Check size={10} strokeWidth={3} style={{ color: '#467826' }} />
                        </span>
                        <span className="text-base text-charcoal/80 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Healing ACEs Plus — 모바일에서는 위 항목과 연한 선으로 구분 */}
                <div className="pt-8 border-t border-charcoal/8 lg:pt-0 lg:border-t-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,112,58,0.12)' }}>
                      <HeartHandshake size={20} strokeWidth={1.75} style={{ color: '#D4703A' }} />
                    </div>
                    <p className="text-[13px] tracking-[0.15em] uppercase font-medium" style={{ color: '#467826' }}>
                      Healing ACEs Plus
                    </p>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal font-medium mb-4 leading-snug">
                    Release what you've been carrying.
                  </h3>
                  <ul className="flex flex-col gap-2.5">
                    {[
                      'A video library for your own healing',
                      'Old beliefs gently dissolved — without reliving them',
                      'Entirely at your own pace',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(70,120,38,0.12)' }}>
                          <Check size={10} strokeWidth={3} style={{ color: '#467826' }} />
                        </span>
                        <span className="text-base text-charcoal/80 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* The Calm Circle */}
            <div className="rounded-3xl bg-white border border-charcoal/8 p-6 sm:p-9 lg:p-10">
              <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-6" style={{ color: '#467826' }}>
                The Calm Circle — $47 / mo
              </p>
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,112,58,0.12)' }}>
                    <Video size={20} strokeWidth={1.75} style={{ color: '#D4703A' }} />
                  </div>
                  <p className="text-[13px] tracking-[0.15em] uppercase font-medium" style={{ color: '#467826' }}>
                    Live with Tapas
                  </p>
                </div>
                <h3 className="font-serif text-xl text-charcoal font-medium mb-4 leading-snug">
                  Everything in The Calm Library, plus live time with Tapas.
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {[
                    'Monthly live webinars — TAT for Animals & Healing ACEs Plus',
                    'Real-time guidance — your questions answered',
                    'Full archive of all past recordings',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(70,120,38,0.12)' }}>
                        <Check size={10} strokeWidth={3} style={{ color: '#467826' }} />
                      </span>
                      <span className="text-base text-charcoal/80 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
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
            <p className="text-xs tracking-[0.25em] uppercase text-charcoal/65">
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
            <p className="text-base sm:text-lg text-charcoal/65 font-light leading-relaxed">
              Still wondering if this is right for you?
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center min-h-[44px] text-base font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
              style={{ color: '#467826' }}
            >
              Read the FAQ →
            </Link>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
