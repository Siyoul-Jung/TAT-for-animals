// src/components/Pricing.tsx
'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BOOKING_URL } from '@/lib/links';

// Annual = monthly × 10 (two months free), per Tapas's request.
const tiers = [
  {
    plan: 'calm_library',
    name: 'The Calm Library',
    monthly: '27',
    annual: '270',
    description: 'Everything you need to begin — at your own pace, in your own time.',
    features: [
      'TAT for Animals full video library',
      'Self-guided practice materials',
    ],
    cta: 'Join The Calm Library',
    popular: false,
  },
  {
    plan: 'calm_circle',
    name: 'The Calm Circle',
    monthly: '47',
    annual: '470',
    description: 'Live connection with Tapas, plus everything in The Calm Library.',
    features: [
      'Everything in The Calm Library',
      'Monthly live webinars with Tapas',
      'TAT for Animals live sessions',
      'Full archive of all past recordings',
    ],
    cta: 'Join The Calm Circle',
    popular: true,
  },
];

export default function Pricing({ showHeader = true, bg = 'bg-white', showBooking = true }: { showHeader?: boolean; bg?: string; showBooking?: boolean }) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  // Default to monthly: for an unproven, pre-launch brand with no free trial, the
  // first priority is the easier "first yes" — so the first price a cold visitor
  // sees stays low ($27). Annual is still made attractive (savings + per-month
  // equivalent below) for those ready to commit; revisit the default once there's
  // traffic data or a trial. See the A/B reasoning discussed at build time.
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const isAnnual = billing === 'annual';

  // Returning via the back button restores this page from the bfcache with its old
  // state — which would leave the button stuck on "Loading…" forever. Reset it.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoadingPlan(null);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  async function handleCheckout(basePlan: string) {
    setLoadingPlan(basePlan);
    // Monthly and annual are distinct checkout plans (separate Stripe prices /
    // PayPal plans); the suffix routes to the right one. The spinner stays keyed
    // to the base plan so the toggle choice doesn't change which button shows it.
    const plan = isAnnual ? `${basePlan}_annual` : basePlan;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      // Logged in → straight to payment. New visitor → sign up first, then checkout.
      router.push(
        user
          ? `/checkout?plan=${plan}`
          : `/signup?next=${encodeURIComponent(`/checkout?plan=${plan}`)}`
      );
    } catch {
      // Don't strand the button if the auth check fails — proceed; the checkout
      // and signup pages re-verify auth on their own.
      router.push(`/signup?next=${encodeURIComponent(`/checkout?plan=${plan}`)}`);
      setLoadingPlan(null);
    }
  }

  return (
    <section
      id="membership"
      className={`relative py-20 lg:py-28 px-6 overflow-hidden ${bg}`}
    >
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10 lg:mb-16"
          >
            <p
              className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5"
              style={{ color: '#467826' }}
            >
              Membership
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl text-charcoal font-medium leading-tight text-balance">
              Give your animal the gift of calm.
            </h2>
          </motion.div>
        )}

        {/* Billing toggle — monthly vs yearly (yearly = two months free).
            Large segments (≥44px) with a clear filled active state so the choice
            is obvious; the savings hint sits below so the buttons stay short. */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="inline-flex items-center rounded-full p-1 bg-white"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(28,16,7,0.12)' }}
            role="group"
            aria-label="Choose billing period"
          >
            {([['monthly', 'Monthly'], ['annual', 'Yearly']] as const).map(([value, label]) => {
              const active = billing === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBilling(value)}
                  aria-pressed={active}
                  className="min-h-[44px] px-6 sm:px-8 rounded-full text-base font-semibold transition-colors"
                  style={active ? { backgroundColor: '#467826', color: '#FAF6F1' } : { color: '#1C1007' }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p
            className="mt-3 text-sm font-medium h-5"
            style={{ color: isAnnual ? '#467826' : 'transparent' }}
            aria-hidden={!isAnnual}
          >
            ✓ Two months free
          </p>
        </div>

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
              className="relative flex flex-col rounded-2xl p-5 sm:p-7 lg:p-8 bg-white"
              style={
                tier.popular
                  ? {
                      border: '2px solid #467826',
                      boxShadow: '0 16px 48px rgba(70,120,38,0.12)',
                    }
                  : {
                      border: '1px solid rgba(28,16,7,0.08)',
                      boxShadow: '0 4px 24px rgba(28,16,7,0.04)',
                    }
              }
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase text-cream"
                    style={{ backgroundColor: '#467826' }}
                  >
                    ★ Most Popular
                  </span>
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-4">
                <h3 className="font-serif text-xl sm:text-2xl font-medium mb-2 text-charcoal">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-sans text-2xl font-medium text-charcoal/65">$</span>
                  <span className="font-serif text-4xl sm:text-5xl font-semibold text-charcoal">
                    {isAnnual ? tier.annual : tier.monthly}
                  </span>
                  <span className="text-sm font-light ml-0.5 text-charcoal/65">/ {isAnnual ? 'yr' : 'mo'}</span>
                </div>

                {/* Annual reframe — the big yearly number shown as a per-month
                    equivalent (defuses sticker shock) plus the concrete saving
                    (makes the discount tangible). Reserves its own height so the
                    card doesn't jump when toggling. */}
                {isAnnual && (
                  <p className="mt-1.5 text-sm" style={{ color: '#467826' }}>
                    ≈ ${(Number(tier.annual) / 12).toFixed(2)} / mo
                    <span className="font-semibold"> · Save ${Number(tier.monthly) * 12 - Number(tier.annual)}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="hidden sm:block text-sm leading-relaxed mb-4 text-charcoal/65">
                {tier.description}
              </p>

              {/* Features */}
              <ul className="flex flex-col gap-2 mb-5 grow">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(70,120,38,0.12)' }}
                    >
                      <Check size={10} style={{ color: '#467826' }} />
                    </span>
                    <span className="text-sm sm:text-base leading-snug text-charcoal/80">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleCheckout(tier.plan)}
                disabled={loadingPlan !== null}
                className="block w-full text-center py-4 rounded-xl text-[19px] font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: '#D4703A',
                  color: '#FAF6F1',
                  boxShadow: '0 8px 24px rgba(212,112,58,0.20)',
                }}
              >
                {loadingPlan === tier.plan ? 'Taking you to checkout…' : tier.cta}
              </button>

              {/* Cancel note */}
              <p className="text-center text-sm mt-4 flex items-center justify-center gap-1.5 text-charcoal/65">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cancel anytime
              </p>

              {/* Billing disclosure — recurring terms at point of purchase.
                  Refund policy lives in Terms (not shouted on the card — see industry norm). */}
              <p className="text-center text-xs mt-2 text-charcoal/65 leading-relaxed">
                Billed {isAnnual ? 'yearly' : 'monthly'} until you cancel.{' '}
                <Link href="/terms" className="underline hover:text-green transition-colors">
                  See Terms
                </Link>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quiet third path — a 1:1 private session with Tapas (booked via TATLife/Amelia).
            A low-key link set off by generous spacing so it reads as "another way" rather than
            competing with the subscription CTAs. Tapas is named in the lead-in so the link itself
            stays short and on one line (no awkward wrap). Distinct from the Hero's "Try a session".
            Hidden on the About page (showBooking=false), which uses Tapas's own longer "Book a
            session for your animal's calm and well-being" wording right after the story + Kai video. */}
        {showBooking && (
          <div className="mt-12 max-w-sm mx-auto text-center">
            <p className="text-sm sm:text-base text-charcoal/65 leading-relaxed">
              Prefer to work one-on-one with Tapas?
            </p>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-[44px] gap-1.5 mt-2 text-base font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity whitespace-nowrap"
              style={{ color: '#467826' }}
            >
              Book a private session →
            </a>
          </div>
        )}

      </div>
    </section>
  );
}
