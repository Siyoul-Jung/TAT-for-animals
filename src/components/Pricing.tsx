// src/components/Pricing.tsx
'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Help Yourself',
    price: '24',
    description: 'A quiet, self-guided space to begin healing — for you and your animal.',
    features: [
      'Healing ACEs video library',
      'TAT for Animals videos',
      'Self-guided practice',
      'Community access',
    ],
    cta: 'Join Help Yourself',
    popular: false,
  },
  {
    name: 'Professional Support',
    price: '47',
    description: 'Live guidance, deeper sessions, and direct access to Tapas herself.',
    features: [
      'Everything in Help Yourself',
      'Monthly live webinars',
      'Animals + People sessions',
      'All past recordings',
      'Direct support from Tapas',
    ],
    cta: 'Join Professional Support',
    popular: true,
  },
];

export default function Pricing() {
  return (
    <section
      id="membership"
      className="relative py-20 lg:py-28 px-6 overflow-hidden"
      style={{ backgroundColor: '#2B4019' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 20% 60%, rgba(212,112,58,0.12) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 lg:mb-16"
        >
          <p className="text-xs tracking-[0.2em] uppercase font-medium mb-5"
            style={{ color: 'rgba(212,168,67,0.7)' }}>
            Membership
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-cream font-medium leading-tight">
            Choose your path to calm.
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="relative flex flex-col rounded-2xl p-6 sm:p-8 lg:p-10"
              style={
                tier.popular
                  ? {
                      background: 'rgba(250,246,241,0.07)',
                      border: '1px solid rgba(212,112,58,0.45)',
                      boxShadow: '0 24px 64px rgba(212,112,58,0.12)',
                    }
                  : {
                      background: 'rgba(250,246,241,0.04)',
                      border: '1px solid rgba(250,246,241,0.10)',
                    }
              }
            >
              {/* Popular badge — 카드 내부 상단 인라인 배치 (모바일 안전) */}
              {tier.popular && (
                <div className="mb-5">
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase text-cream"
                    style={{ backgroundColor: '#D4703A' }}
                  >
                    ★ Most Popular
                  </span>
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-5">
                <h3
                  className="font-serif text-xl sm:text-2xl font-medium mb-3"
                  style={{ color: tier.popular ? '#FAF6F1' : 'rgba(250,246,241,0.75)' }}
                >
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  {/* $ — sans-serif로 분리해 Playfair의 이중선 달러 기호 회피 */}
                  <span className="font-sans text-2xl font-medium text-cream/70">$</span>
                  <span className="font-serif text-4xl sm:text-5xl font-semibold text-cream">
                    {tier.price}
                  </span>
                  <span
                    className="text-sm font-light ml-0.5"
                    style={{ color: 'rgba(250,246,241,0.55)' }}
                  >
                    / mo
                  </span>
                </div>
              </div>

              {/* Description — 모바일에서 숨김 (카드 길이 단축) */}
              <p
                className="hidden sm:block text-sm leading-relaxed mb-5"
                style={{ color: 'rgba(250,246,241,0.70)' }}
              >
                {tier.description}
              </p>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 mb-6 grow">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: tier.popular
                          ? 'rgba(212,112,58,0.25)'
                          : 'rgba(250,246,241,0.08)',
                      }}
                    >
                      <Check
                        size={10}
                        style={{
                          color: tier.popular ? '#D4703A' : 'rgba(250,246,241,0.5)',
                        }}
                      />
                    </span>
                    <span
                      className="text-sm sm:text-base leading-snug"
                      style={{ color: 'rgba(250,246,241,0.90)' }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/membership"
                className="block text-center py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-all"
                style={
                  tier.popular
                    ? {
                        backgroundColor: '#D4703A',
                        color: '#FAF6F1',
                        boxShadow: '0 8px 24px rgba(212,112,58,0.25)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: 'rgba(250,246,241,0.70)',
                        border: '1px solid rgba(250,246,241,0.18)',
                      }
                }
                onMouseEnter={(e) => {
                  if (!tier.popular) {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      'rgba(250,246,241,0.40)';
                    (e.currentTarget as HTMLElement).style.color = '#FAF6F1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!tier.popular) {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      'rgba(250,246,241,0.18)';
                    (e.currentTarget as HTMLElement).style.color =
                      'rgba(250,246,241,0.70)';
                  }
                }}
              >
                {tier.cta}
              </Link>

              {/* Cancel note */}
              <p
                className="text-center text-sm mt-4 flex items-center justify-center gap-1.5"
                style={{ color: 'rgba(250,246,241,0.60)' }}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cancel anytime — no questions asked
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
