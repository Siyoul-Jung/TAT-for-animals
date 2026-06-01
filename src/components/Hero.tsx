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
    const id = window.setTimeout(() => setShuffled(shuffle(images)), 0);
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

      {/* ── Mobile: stacked layout (< 768px) ── */}
      <div className="md:hidden flex flex-col" style={{ height: '100dvh' }}>
        <div className="relative shrink-0 overflow-hidden" style={{ height: '61.8dvh' }}>
          {slides('100vw')}
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, transparent 55%, rgba(251,245,243,0.5) 80%, rgba(251,245,243,1) 100%)' }} />
        </div>
        <div className="flex-1 flex flex-col justify-center px-6">
          <div style={{ paddingBottom: 'calc(var(--cookie-banner-offset, 0px) + env(safe-area-inset-bottom))' }}>
            <p className="text-[10px] tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: '#5E9635' }}>
              TAT for Animals
            </p>
            <h1 className="font-serif text-3xl leading-[1.2] text-charcoal mb-2 font-semibold">
              Your animal feels<br />everything you carry.
            </h1>
            <p className="font-sans text-sm mb-5 font-normal" style={{ color: '#5E9635' }}>
              A few quiet minutes together — and something releases in you both.
            </p>
            <div className="flex items-center gap-5">
              <Link
                href="#experience"
                className="inline-flex min-h-[44px] items-center px-6 py-3 rounded-full text-cream font-semibold text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.25)' }}
              >
                Try a session
              </Link>
              <Link
                href="/membership"
                className="inline-flex min-h-[44px] items-center text-sm font-medium transition-colors hover:text-brand"
                style={{ color: 'rgba(28,16,7,0.50)' }}
              >
                Join the members
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tablet + Desktop: 2-column (text 45% / image 55%) ── */}
      <div className="hidden md:grid md:grid-cols-[5fr_6fr] md:min-h-screen relative">

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 30% 60%, rgba(212,112,58,0.07) 0%, transparent 65%)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col justify-center px-8 md:px-10 lg:px-14 xl:px-20 2xl:px-28 pt-24 pb-20"
        >
          <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-4" style={{ color: '#5E9635' }}>
            TAT for Animals
          </p>
          <h1 className="font-serif text-3xl md:text-4xl xl:text-5xl 2xl:text-6xl leading-[1.2] text-charcoal mb-4 font-semibold">
            Your animal feels<br />everything you carry.
          </h1>
          <p className="font-sans text-base md:text-lg xl:text-xl mb-6 font-normal" style={{ color: '#5E9635' }}>
            A few quiet minutes together — and something releases in you both.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8 md:mb-10" style={{ color: 'rgba(28,16,7,0.55)' }}>
            No special training. No reliving anything painful.
            Just you, your animal, and a gentle process that works.
          </p>
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="#experience"
              className="px-6 md:px-8 py-3 md:py-4 rounded-full text-cream font-semibold text-sm md:text-base transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              style={{ backgroundColor: '#D4703A', boxShadow: '0 8px 32px rgba(212,112,58,0.25)' }}
            >
              Try a session
            </Link>
            <Link
              href="/membership"
              className="text-sm md:text-base font-medium transition-colors hover:text-brand"
              style={{ color: 'rgba(28,16,7,0.50)' }}
            >
              Join the members
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.15 }}
          className="relative overflow-hidden"
        >
          {slides('(min-width: 768px) 55vw, 100vw')}
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, rgba(251,245,243,1) 0%, rgba(251,245,243,0.85) 12%, rgba(251,245,243,0.2) 35%, transparent 55%)' }} />
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(251,245,243,0.9) 0%, rgba(251,245,243,0.3) 20%, transparent 45%)' }} />
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(251,245,243,0.9) 0%, rgba(251,245,243,0.3) 15%, transparent 35%)' }} />
        </motion.div>

      </div>
    </section>
  );
}
