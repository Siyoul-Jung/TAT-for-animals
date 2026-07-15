'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, PawPrint, Video } from 'lucide-react';
import Pricing from '@/components/Pricing';
import { LIBRARY_VIDEO_COUNT_LABEL } from '@/lib/plans';

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

      {/* ── Compact header ── a brief, warm intro that hands straight to the
          plans (Pricing's own header is turned off below to avoid duplication). */}
      <section className="bg-cream pt-28 sm:pt-32 lg:pt-36 pb-2 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto text-center"
        >
          <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5" style={{ color: '#467826' }}>
            Membership
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal font-semibold leading-tight mb-4">
            Heal together.
          </h1>
          <p className="font-sans text-base sm:text-lg text-charcoal/65 max-w-md mx-auto">
            For your animal and you. At your own pace.
          </p>
        </motion.div>
      </section>

      {/* ── Pricing (header off — the compact header above stands in for it) ── */}
      <Pricing showHeader={false} bg="bg-cream" />

      {/* ── What's included ── */}
      <section id="whats-included" className="bg-white py-14 lg:py-20 px-6">
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
            {/* The Calm Connection */}
            <div className="rounded-3xl bg-cream border border-charcoal/8 p-6 sm:p-9 lg:p-10 mb-6">
              <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-6" style={{ color: '#467826' }}>
                The Calm Connection — $27 / mo
              </p>
              <div className="max-w-xl">
                {/* TAT for Animals */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fff', boxShadow: '0 0 0 1px rgba(28,16,7,0.06)' }}>
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
                      `${LIBRARY_VIDEO_COUNT_LABEL} video recordings of TAT® sessions for animals`,
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
              </div>
            </div>

            {/* The Calm Circle */}
            <div className="rounded-3xl bg-cream border border-charcoal/8 p-6 sm:p-9 lg:p-10">
              <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-6" style={{ color: '#467826' }}>
                The Calm Circle — $47 / mo
              </p>
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fff', boxShadow: '0 0 0 1px rgba(28,16,7,0.06)' }}>
                    <Video size={20} strokeWidth={1.75} style={{ color: '#D4703A' }} />
                  </div>
                  <p className="text-[13px] tracking-[0.15em] uppercase font-medium" style={{ color: '#467826' }}>
                    Live with Tapas
                  </p>
                </div>
                <h3 className="font-serif text-xl text-charcoal font-medium mb-4 leading-snug">
                  Everything in Calm Connection, plus live time with Tapas.
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {[
                    'Monthly live webinars with Tapas',
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
      <section className="bg-cream py-20 lg:py-28 px-6">
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
            <blockquote className="font-serif text-2xl sm:text-3xl text-charcoal/80 leading-[1.6] mb-5 text-balance">
              &ldquo;I love to help people find peace — one person, and one animal at a time.&rdquo;
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
