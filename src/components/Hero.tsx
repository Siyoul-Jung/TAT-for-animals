// src/components/Hero.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

type HeroImage = { src: string; alt: string };

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function Hero({ images }: { images: HeroImage[] }) {
  const [shuffled, setShuffled] = useState(images);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Keep the first slide fixed — it's the priority-preloaded LCP image, painted
    // at SSR. Shuffling it after hydration would swap in an un-preloaded image and
    // wreck LCP. So we only shuffle the *rest* for per-visit variety.
    const [first, ...rest] = images;
    if (rest.length === 0) return;
    const id = window.setTimeout(() => setShuffled([first, ...shuffle(rest)]), 0);
    return () => window.clearTimeout(id);
  }, [images]);

  useEffect(() => {
    if (shuffled.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffled.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [shuffled.length]);

  const slides = (sizes: string) =>
    shuffled.map((img, i) => (
      <div
        key={img.src}
        className="absolute inset-0"
        style={{ opacity: i === currentIndex ? 1 : 0, transition: 'opacity 2s ease-in-out', willChange: 'opacity' }}
      >
        <Image src={img.src} alt={img.alt} fill sizes={sizes} className="object-cover object-top" priority={i === 0} />
      </div>
    ));

  return (
    <section className="relative overflow-hidden bg-cream">

      {/* ── Mobile: stacked layout (< 1024px) ── */}
      <div className="lg:hidden flex flex-col" style={{ minHeight: '100dvh' }}>
        <div className="relative shrink-0 overflow-hidden" style={{ height: '61.8dvh' }}>
          {slides('100vw')}
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(251,245,243,0.6) 78%, rgba(251,245,243,1) 94%)' }} />
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 py-8 -mt-0.5 bg-cream relative z-20">
          <div style={{ paddingBottom: 'calc(var(--cookie-banner-offset, 0px) + env(safe-area-inset-bottom))' }}>
            <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: '#467826' }}>
              TAT for Animals
            </p>
            <h1 className="font-serif text-3xl leading-[1.2] text-charcoal mb-2 font-semibold">
              Your animal feels<br />everything you carry.
            </h1>
            <p className="font-sans text-sm mb-5 font-normal text-charcoal/65">
              A few quiet minutes together — and something releases in you both.
            </p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="#experience"
                className="inline-flex min-h-[48px] items-center justify-center px-7 py-3.5 rounded-full text-cream font-bold text-[19px] transition-all active:scale-95"
                style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.25)' }}
              >
                Try a session
              </Link>
              <Link
                href="/membership"
                className="inline-flex min-h-[48px] items-center justify-center px-7 py-3.5 rounded-full border-2 text-[19px] font-bold transition-all hover:bg-brand hover:text-cream active:scale-95"
                style={{ borderColor: '#D4703A', color: '#D4703A' }}
              >
                Join the members
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop: 2-column (text 45% / image 55%) ── */}
      <div className="hidden lg:grid lg:grid-cols-[5fr_6fr] lg:min-h-screen relative">

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 30% 60%, rgba(212,112,58,0.07) 0%, transparent 65%)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col justify-center px-14 xl:px-20 2xl:px-28 pt-24 pb-20"
        >
          <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5" style={{ color: '#467826' }}>
            TAT for Animals
          </p>
          <h1 className="font-serif text-4xl xl:text-5xl 2xl:text-6xl leading-[1.2] text-charcoal mb-5 font-semibold">
            Your animal feels<br />everything you carry.
          </h1>
          <p className="font-sans text-xl mb-8 font-normal text-charcoal/65">
            A few quiet minutes together — and something releases in you both.
          </p>
          <p className="text-lg leading-relaxed mb-12" style={{ color: 'rgba(28,16,7,0.65)' }}>
            No special training. No reliving anything painful.
            Just you, your animal, and a gentle process that works.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#experience"
              className="px-9 py-4 rounded-full text-cream font-bold text-[19px] transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              style={{ backgroundColor: '#D4703A', boxShadow: '0 8px 32px rgba(212,112,58,0.25)' }}
            >
              Try a session
            </Link>
            <Link
              href="/membership"
              className="inline-flex min-h-[48px] items-center px-9 py-4 rounded-full border-2 text-[19px] font-bold transition-all hover:bg-brand hover:text-cream active:scale-95"
              style={{ borderColor: '#D4703A', color: '#D4703A' }}
            >
              Join the members
            </Link>
          </div>
        </motion.div>

        {/* No entrance fade on the image column: an initial opacity:0 wrapper would
            hold back the LCP paint until hydration. The per-slide crossfade below
            already supplies the motion. */}
        <div className="relative overflow-hidden">
          {slides('55vw')}
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, rgba(251,245,243,1) 0%, rgba(251,245,243,0.6) 8%, rgba(251,245,243,0.1) 25%, transparent 45%)' }} />
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(251,245,243,0.7) 0%, rgba(251,245,243,0.2) 15%, transparent 35%)' }} />
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(251,245,243,0.7) 0%, rgba(251,245,243,0.2) 10%, transparent 25%)' }} />
        </div>

      </div>
    </section>
  );
}
