'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const tiers = [
  {
    plan: 'calm_library',
    name: 'The Calm Library',
    price: '27',
    description: 'Everything you need to begin — at your own pace, in your own time.',
    features: [
      'TAT for Animals full video library',
      'Healing ACEs Plus full video library',
      'Self-guided practice materials',
      'Community access',
    ],
    cta: 'Join The Calm Library',
    popular: false,
  },
  {
    plan: 'calm_circle',
    name: 'The Calm Circle',
    price: '47',
    description: 'Live connection with Tapas, plus everything in The Calm Library.',
    features: [
      'Everything in The Calm Library',
      'Monthly live webinars with Tapas',
      'TAT for Animals live sessions',
      'Healing ACEs Plus live sessions',
      'Full archive of all past recordings',
    ],
    cta: 'Join The Calm Circle',
    popular: true,
  },
];

export default function MembershipClient() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  function handleCheckout(plan: string) {
    setLoadingPlan(plan);
    router.push(`/checkout?plan=${plan}`);
  }

  return (
    <div className="min-h-screen">

      {/* 1. Hero — bg-cream, 2컬럼 (홈페이지 스타일) */}
      <section className="relative overflow-hidden bg-cream">
        {/* Subtle warm glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 30% 60%, rgba(212,112,58,0.07) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 w-full grid lg:grid-cols-[2fr_3fr]">

          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center px-6 lg:px-14 xl:px-20 pt-28 pb-12 lg:pt-32 lg:pb-14"
          >
            <p
              className="text-xs tracking-[0.2em] uppercase font-semibold mb-5"
              style={{ color: '#5E9635' }}
            >
              Membership
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] leading-[1.1] text-charcoal font-semibold mb-5 text-balance">
              Choose your path to calm.
            </h1>
            <p
              className="font-sans text-lg sm:text-xl font-normal"
              style={{ color: '#5E9635' }}
            >
              For your animal and you.<br />At your own pace.
            </p>
          </motion.div>

          {/* Right — Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.15 }}
            className="relative hidden lg:block overflow-hidden"
          >
            <Image
              src="/images/membership_img.jpg"
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="60vw"
              className="object-cover object-center"
            />
            {/* 크림 배경과 자연스럽게 blend */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: 'linear-gradient(to right, rgba(250,246,241,1) 0%, rgba(250,246,241,0.15) 20%, transparent 50%)',
              }}
            />
            <div
              className="absolute inset-0 z-10"
              style={{
                background: 'linear-gradient(to top, rgba(250,246,241,0.5) 0%, transparent 30%)',
              }}
            />
          </motion.div>

        </div>
      </section>

      {/* 2. 가격 — 크림 */}
      <section id="pricing" className="bg-white py-20 lg:py-28 px-6">
        <div className="max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-5" style={{ color: '#5E9635' }}>
              Plans
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-medium leading-tight">
              Two paths. One destination.
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.plan}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="relative flex flex-col rounded-2xl p-8 lg:p-10"
                style={{
                  backgroundColor: 'white',
                  border: tier.popular ? '2px solid #5E9635' : '1px solid rgba(28,16,7,0.08)',
                  boxShadow: tier.popular
                    ? '0 16px 48px rgba(94,150,53,0.12)'
                    : '0 8px 32px rgba(28,16,7,0.04)',
                }}
              >
                {tier.popular && (
                  <div className="mb-5">
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase text-cream"
                      style={{ backgroundColor: '#5E9635' }}
                    >
                      ★ Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="font-serif text-xl sm:text-2xl font-medium mb-3 text-charcoal">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-sans text-2xl font-medium text-charcoal/50">$</span>
                    <span className="font-serif text-5xl font-medium text-charcoal">
                      {tier.price}
                    </span>
                    <span className="text-sm font-light text-charcoal/35">/ month</span>
                  </div>
                </div>

                <p className="font-light leading-relaxed mb-8 text-sm text-charcoal/55">
                  {tier.description}
                </p>

                <div className="flex flex-col gap-3.5 mb-10 flex-grow">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(94,150,53,0.12)' }}
                      >
                        <Check size={10} style={{ color: '#5E9635' }} />
                      </span>
                      <span className="text-sm font-light leading-relaxed text-charcoal/70">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(tier.plan)}
                  disabled={loadingPlan !== null}
                  className="w-full py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  style={{
                    backgroundColor: '#D4703A',
                    color: '#FAF6F1',
                    boxShadow: '0 8px 32px rgba(212,112,58,0.25)',
                  }}
                >
                  {loadingPlan === tier.plan ? 'Connecting...' : tier.cta}
                </button>
                <p className="text-center text-sm mt-3 flex items-center justify-center gap-1.5 text-charcoal/35">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cancel anytime
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. 포함 내용 — 크림 */}
      <section className="bg-cream py-20 lg:py-28 px-6">
        <div className="max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16"
          >
            <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-5" style={{ color: '#5E9635' }}>
              What&apos;s included
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-medium leading-tight">
              Everything you need,<br />in one place.
            </h2>
          </motion.div>

          {/* The Calm Library */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-14"
          >
            <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-6" style={{ color: '#5E9635' }}>
              The Calm Library
            </p>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
              <div>
                <p
                  className="text-xs tracking-[0.15em] uppercase font-medium mb-4"
                  style={{ color: 'rgba(212,112,58,0.6)' }}
                >
                  TAT for Animals
                </p>
                <h3 className="font-serif text-2xl text-charcoal font-medium mb-4 leading-snug">
                  Help your animal feel calm and safe.
                </h3>
                <p className="text-charcoal/60 font-light leading-relaxed">
                  A complete video library of TAT® sessions designed for animals.
                  Fear, anxiety, the echoes of past experience — gently released.
                  And as your animal settles, something in you shifts too.
                </p>
              </div>
              <div>
                <p
                  className="text-xs tracking-[0.15em] uppercase font-medium mb-4"
                  style={{ color: 'rgba(212,112,58,0.6)' }}
                >
                  Healing ACEs Plus
                </p>
                <h3 className="font-serif text-2xl text-charcoal font-medium mb-4 leading-snug">
                  Release what you&apos;ve been carrying.
                </h3>
                <p className="text-charcoal/60 font-light leading-relaxed">
                  A video library for your own healing. Gently dissolving the beliefs
                  formed from past experiences — without reliving them.
                  At your own pace, in your own time.
                </p>
              </div>
            </div>
          </motion.div>

          {/* The Calm Circle */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="pt-14 border-t border-charcoal/8"
          >
            <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-6" style={{ color: '#5E9635' }}>
              The Calm Circle
            </p>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <h3 className="font-serif text-2xl text-charcoal font-medium mb-4 leading-snug">
                  Everything in The Calm Library — plus live sessions with Tapas, every month.
                </h3>
                <p className="text-charcoal/60 font-light leading-relaxed">
                  Monthly live webinars for both TAT for Animals and Healing ACEs Plus,
                  hosted by Tapas. Direct guidance, real-time questions,
                  and access to the full archive of all past recordings.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 4. Tapas 인용구 — 다크 */}
      <section className="py-20 lg:py-28 px-6" style={{ backgroundColor: '#1C1007' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto mb-6" style={{ boxShadow: '0 0 0 2px rgba(250,246,241,0.12)' }}>
              <Image src="/images/tmp_profile.jpg" alt="Tapas Fleming" fill sizes="64px" className="object-cover object-center" />
            </div>
            <div className="w-12 h-0.5 mx-auto mb-8" style={{ backgroundColor: '#5E9635' }} />
            <blockquote className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-cream leading-[1.5] mb-8">
              &ldquo;Help people find peace. One person —<br className="hidden sm:block" />
              and one animal — at a time.&rdquo;
            </blockquote>
            <p
              className="text-xs tracking-[0.25em] uppercase"
              style={{ color: 'rgba(250,246,241,0.35)' }}
            >
              — Tapas Fleming, Founder of TAT®
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="bg-cream pb-20 lg:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="h-px bg-charcoal/8 mb-16" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl text-charcoal font-medium mb-2">
                Have questions?
              </h3>
              <p className="text-charcoal/50 font-light">
                We&apos;re here to help you find the right path.
              </p>
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-medium tracking-wide transition-opacity duration-200 hover:opacity-70 whitespace-nowrap"
              style={{ color: 'rgba(212,112,58,0.9)' }}
            >
              Read FAQs →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
