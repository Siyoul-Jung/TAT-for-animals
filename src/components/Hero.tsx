// src/components/Hero.tsx
'use client';

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
  const [mountRest, setMountRest] = useState(false);

  useEffect(() => {
    // Only slide 0 (the LCP image) is in the initial paint. The remaining slides
    // mount after first paint so they don't share bandwidth with the LCP download.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setMountRest(true), { timeout: 1500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setMountRest(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

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

  return (
    <section className="relative overflow-hidden bg-cream">

      {/* Desktop ambient glow */}
      <div
        className="hidden lg:block absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 30% 60%, rgba(212,112,58,0.07) 0%, transparent 65%)' }}
      />

      {/* One layout for both breakpoints: stacked on mobile, 2-column on desktop.
          The slideshow is rendered ONCE so next/image emits a single, correctly
          sized preload (no duplicate mobile/desktop preloads). */}
      <div className="relative flex flex-col min-h-[100dvh] lg:grid lg:grid-cols-[5fr_6fr] lg:min-h-screen">

        {/* ── Image — mobile: top band; desktop: right column ── */}
        <div className="relative shrink-0 overflow-hidden h-[61.8dvh] lg:h-auto lg:col-start-2 lg:row-start-1">
          {(mountRest ? shuffled : shuffled.slice(0, 1)).map((img, i) => {
            const first = i === 0;
            return (
              <div
                key={img.src}
                className="absolute inset-0"
                style={{ opacity: i === currentIndex ? 1 : 0, transition: 'opacity 2s ease-in-out', willChange: 'opacity' }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover object-top"
                  priority={first}
                  fetchPriority={first ? 'high' : undefined}
                />
              </div>
            );
          })}

          {/* Mobile gradient — fade into the cream text band below */}
          <div className="lg:hidden absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(251,245,243,0.6) 78%, rgba(251,245,243,1) 94%)' }} />
          {/* Desktop gradients — blend the image into the left text column */}
          <div className="hidden lg:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, rgba(251,245,243,1) 0%, rgba(251,245,243,0.6) 8%, rgba(251,245,243,0.1) 25%, transparent 45%)' }} />
          <div className="hidden lg:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(251,245,243,0.7) 0%, rgba(251,245,243,0.2) 15%, transparent 35%)' }} />
          <div className="hidden lg:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(251,245,243,0.7) 0%, rgba(251,245,243,0.2) 10%, transparent 25%)' }} />
        </div>

        {/* ── Text — mobile: below image; desktop: left column ── */}
        <div className="flex flex-1 flex-col justify-center px-6 py-8 lg:px-14 xl:px-20 2xl:px-28 lg:py-0 lg:col-start-1 lg:row-start-1 -mt-0.5 lg:mt-0 bg-cream lg:bg-transparent relative z-20">
          <div
            className="lg:!pb-0"
            style={{ paddingBottom: 'calc(var(--cookie-banner-offset, 0px) + env(safe-area-inset-bottom))' }}
          >
            <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-2 lg:mb-5" style={{ color: '#467826' }}>
              TAT for Animals
            </p>
            <h1 className="font-serif text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl leading-[1.2] text-charcoal mb-2 lg:mb-5 font-semibold">
              Your animal feels<br />everything you carry.
            </h1>
            <p className="font-sans text-sm lg:text-xl mb-5 lg:mb-8 font-normal text-charcoal/65">
              A few quiet minutes together — and something releases in you both.
            </p>
            <p className="hidden lg:block text-lg leading-relaxed mb-12" style={{ color: 'rgba(28,16,7,0.65)' }}>
              No special training. No reliving anything painful.
              Just you, your animal, and a gentle process that works.
            </p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:gap-6">
              <Link
                href="#experience"
                className="inline-flex shrink-0 whitespace-nowrap w-full sm:w-[240px] min-h-[48px] items-center justify-center px-7 py-3.5 lg:py-4 rounded-full text-cream font-bold text-[19px] transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.25)' }}
              >
                Try a session
              </Link>
              <Link
                href="/membership"
                className="inline-flex shrink-0 whitespace-nowrap w-full sm:w-[240px] min-h-[48px] items-center justify-center px-7 py-3.5 lg:py-4 rounded-full border-2 text-[19px] font-bold transition-all hover:bg-brand hover:text-cream active:scale-95"
                style={{ borderColor: '#D4703A', color: '#D4703A' }}
              >
                Join the members
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
