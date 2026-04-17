'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const tiers = [
  {
    plan: 'self',
    name: 'Help Yourself',
    price: '24',
    description: 'Everything you need to begin — at your own pace, in your own time.',
    features: [
      'TAT for Animals full video library',
      'Healing ACEs Plus full video library',
      'Self-guided practice materials',
      'Community access',
    ],
    cta: 'Start with Help Yourself',
    popular: false,
  },
  {
    plan: 'pro',
    name: 'Professional Support',
    price: '47',
    description: 'Live connection with Tapas, plus everything in Help Yourself.',
    features: [
      'Everything in Help Yourself',
      'Monthly live webinars with Tapas',
      'TAT for Animals live sessions',
      'Healing ACEs Plus live sessions',
      'Full archive of all past recordings',
    ],
    cta: 'Join Professional Support',
    popular: true,
  },
];

export default function MembershipClient() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleCheckout(plan: string) {
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        router.push('/login?next=/membership');
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Please try again.');
        setLoadingPlan(null);
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen">

      {/* 1. Hero — 배경 이미지 + 다크 오버레이 */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ backgroundColor: '#2B4019' }}
      >
        {/* 배경 이미지 */}
        <Image
          src="/images/membership_img.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* 다크 그린 오버레이 */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(43,64,25,0.68)' }}
        />

        {/* 웜 래디얼 글로우 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,112,58,0.14) 0%, transparent 70%)',
          }}
        />

        {/* 하단 페이드 — 다음 섹션으로 자연스럽게 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(43,64,25,0.5))' }}
        />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 text-center py-40">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="text-xs tracking-[0.2em] uppercase font-medium mb-6"
              style={{ color: 'rgba(212,168,67,0.7)' }}
            >
              Membership
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4rem] leading-[1.1] text-cream font-medium mb-6">
              Choose your path<br />to calm.
            </h1>
            <p
              className="font-serif italic text-xl sm:text-2xl mb-10"
              style={{ color: 'rgba(250,246,241,0.60)' }}
            >
              For your animal and you. At your own pace.
            </p>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-full text-cream font-semibold text-base transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              style={{
                backgroundColor: '#D4703A',
                boxShadow: '0 8px 32px rgba(212,112,58,0.35)',
              }}
            >
              See Membership Options
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. 포함 내용 — 크림 */}
      <section className="bg-cream py-20 lg:py-28 px-6">
        <div className="max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16"
          >
            <p className="text-xs tracking-[0.2em] uppercase font-medium text-brand mb-5">
              What&apos;s included
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-medium leading-tight">
              Everything you need,<br />in one place.
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
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
            </motion.div>

          </div>

          {/* Professional Support 추가 혜택 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14 pt-14 border-t border-charcoal/8"
          >
            <p
              className="text-xs tracking-[0.15em] uppercase font-medium mb-4"
              style={{ color: 'rgba(212,112,58,0.6)' }}
            >
              Professional Support — additional
            </p>
            <h3 className="font-serif text-2xl text-charcoal font-medium mb-4 leading-snug">
              Live sessions with Tapas, every month.
            </h3>
            <p className="text-charcoal/60 font-light leading-relaxed max-w-2xl">
              Monthly live webinars for both TAT for Animals and Healing ACEs Plus,
              hosted by Tapas. Direct guidance, real-time questions,
              and access to the full archive of all past recordings.
            </p>
          </motion.div>

        </div>
      </section>

      {/* 3. Tapas 인용구 — 다크 */}
      <section className="py-20 lg:py-28 px-6" style={{ backgroundColor: '#2B4019' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <blockquote className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-cream leading-[1.5] mb-8">
              &ldquo;Help people find peace. One person —<br className="hidden sm:block" />
              and one animal — at a time.&rdquo;
            </blockquote>
            <p
              className="text-xs tracking-[0.25em] uppercase"
              style={{ color: 'rgba(212,168,67,0.6)' }}
            >
              — Tapas Fleming, Founder of TAT®
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4. 가격 — 크림 */}
      <section id="pricing" className="bg-cream py-20 lg:py-28 px-6">
        <div className="max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-[0.2em] uppercase font-medium text-brand mb-5">
              Plans
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-medium leading-tight">
              Two paths. One destination.
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.plan}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col rounded-2xl p-8 lg:p-10"
                style={{
                  backgroundColor: tier.popular ? '#2B4019' : 'white',
                  boxShadow: tier.popular
                    ? '0 24px 64px rgba(43,64,25,0.15)'
                    : '0 0 0 1px rgba(28,16,7,0.08), 0 8px 32px rgba(28,16,7,0.04)',
                }}
              >
                {tier.popular && (
                  <p
                    className="text-xs tracking-[0.2em] uppercase font-medium mb-6"
                    style={{ color: 'rgba(212,168,67,0.7)' }}
                  >
                    Most Popular
                  </p>
                )}

                <p
                  className="text-xs tracking-[0.15em] uppercase font-medium mb-3"
                  style={{
                    color: tier.popular ? 'rgba(250,246,241,0.4)' : 'rgba(28,16,7,0.35)',
                  }}
                >
                  {tier.name}
                </p>

                <div className="flex items-baseline gap-1.5 mb-3">
                  <span
                    className="font-sans text-2xl font-medium"
                    style={{ color: tier.popular ? 'rgba(250,246,241,0.7)' : 'rgba(28,16,7,0.5)' }}
                  >
                    $
                  </span>
                  <span
                    className="font-serif text-5xl font-medium"
                    style={{ color: tier.popular ? '#FAF6F1' : '#1C1007' }}
                  >
                    {tier.price}
                  </span>
                  <span
                    className="text-sm font-light"
                    style={{ color: tier.popular ? 'rgba(250,246,241,0.35)' : 'rgba(28,16,7,0.35)' }}
                  >
                    / month
                  </span>
                </div>

                <p
                  className="font-light leading-relaxed mb-8 text-sm"
                  style={{ color: tier.popular ? 'rgba(250,246,241,0.55)' : 'rgba(28,16,7,0.55)' }}
                >
                  {tier.description}
                </p>

                <div className="flex flex-col gap-3.5 mb-10 flex-grow">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <Check
                        size={13}
                        className="mt-0.5 shrink-0"
                        style={{ color: '#D4703A' }}
                      />
                      <span
                        className="text-sm font-light leading-relaxed"
                        style={{
                          color: tier.popular ? 'rgba(250,246,241,0.7)' : 'rgba(28,16,7,0.65)',
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(tier.plan)}
                  disabled={loadingPlan !== null}
                  className="w-full py-4 rounded-full font-semibold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  style={{
                    backgroundColor: '#D4703A',
                    color: '#FAF6F1',
                    boxShadow: '0 8px 32px rgba(212,112,58,0.25)',
                  }}
                >
                  {loadingPlan === tier.plan ? 'Connecting...' : tier.cta}
                </button>
                <p
                  className="text-center text-xs mt-3"
                  style={{
                    color: tier.popular ? 'rgba(250,246,241,0.25)' : 'rgba(28,16,7,0.25)',
                  }}
                >
                  Cancel anytime
                </p>
              </motion.div>
            ))}
          </div>

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
