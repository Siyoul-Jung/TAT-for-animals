// src/components/Hero.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Play } from 'lucide-react';
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

  const slideshow = (sizes: string) =>
    shuffled.map((img, i) => (
      <div
        key={img.src}
        className="absolute inset-0"
        style={{ opacity: i === currentIndex ? 1 : 0, transition: 'opacity 2s ease-in-out' }}
      >
        <Image src={img.src} alt={img.alt} fill sizes={sizes} className="object-cover object-center" priority={i === 0} />
      </div>
    ));

  return (
    <section className="relative overflow-hidden bg-cream">

      {/* ── Mobile: 한 화면 안에 황금비 레이아웃 ── */}
      <div className="lg:hidden flex min-h-[100svh] flex-col pt-16">

        {/* 이미지 — 61.8% */}
        <div className="relative min-h-[280px] flex-[1.35]">
          {slideshow('(max-width: 1024px) 100vw, 60vw')}
        </div>

        {/* 텍스트 — 38.2% */}
        <div
          className="flex flex-col justify-center px-6 pt-5 sm:py-7"
          style={{ paddingBottom: 'calc(1.25rem + var(--cookie-banner-offset, 0px) + env(safe-area-inset-bottom))' }}
        >
          <p className="text-[10px] tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: '#5E9635' }}>
            TAT for Animals
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-[1.2] text-charcoal mb-2 font-semibold">
            Help your animal<br />feel calm and at&nbsp;ease.
          </h1>
          <p className="font-sans text-sm mb-4 font-normal" style={{ color: '#5E9635' }}>
            And notice what happens in you.
          </p>
          <div className="flex flex-col items-start gap-3">
            <Link
              href="#experience"
              className="inline-flex min-h-[44px] items-center px-6 py-3 rounded-full text-cream font-semibold text-sm transition-all active:scale-95"
              style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.25)' }}
            >
              Try a session
            </Link>
            <Link
              href="/membership"
              className="inline-flex min-h-[44px] items-center text-sm font-medium transition-all hover:opacity-70"
              style={{ color: 'rgba(28,16,7,0.50)' }}
            >
              Join the members →
            </Link>
          </div>
        </div>

      </div>

      {/* ── Desktop: 2단 그리드 ── */}
      <div className="hidden lg:grid lg:grid-cols-[2fr_3fr] lg:min-h-screen relative">

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 30% 60%, rgba(212,112,58,0.07) 0%, transparent 65%)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col justify-center px-14 xl:px-20 pt-32 pb-20"
        >
          <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-5" style={{ color: '#5E9635' }}>
            TAT for Animals
          </p>
          <h1 className="font-serif text-4xl xl:text-5xl 2xl:text-6xl leading-[1.2] text-charcoal mb-5 font-semibold">
            Help your animal<br />feel calm and at&nbsp;ease.
          </h1>
          <p className="font-sans text-xl mb-8 font-normal" style={{ color: '#5E9635' }}>
            And notice what happens in you.
          </p>
          <p className="text-lg leading-relaxed mb-12" style={{ color: 'rgba(28,16,7,0.55)' }}>
            No special training. No reliving anything painful.
            Just a few quiet minutes with your animal — and something shifts.
          </p>
          <div className="flex flex-col gap-3 items-start">
            <Link
              href="#experience"
              className="px-8 py-4 rounded-full text-cream font-semibold text-base text-center whitespace-nowrap transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              style={{ backgroundColor: '#D4703A', boxShadow: '0 8px 32px rgba(212,112,58,0.25)' }}
            >
              Try a session
            </Link>
            <Link
              href="/membership"
              className="flex items-center gap-1 font-medium text-base whitespace-nowrap transition-all hover:opacity-70"
              style={{ color: 'rgba(28,16,7,0.50)' }}
            >
              Join the members →
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.15 }}
          className="relative overflow-hidden"
        >
          {shuffled.map((img, i) => (
            <div
              key={img.src}
              className="absolute inset-0"
              style={{
                opacity: i === currentIndex ? 1 : 0,
                transition: 'opacity 2s ease-in-out',
                willChange: 'opacity',
              }}
            >
              <Image
                src={img.src}
                alt=""
                aria-hidden="true"
                fill
                priority={i === 0}
                sizes="60vw"
                className="object-cover object-center scale-110"
                style={{ filter: 'blur(8px)', opacity: 0.25 }}
              />
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={i === 0}
                sizes="60vw"
                className="object-contain object-center"
              />
            </div>
          ))}
          <div className="absolute inset-0 z-10" style={{ background: 'rgba(250,246,241,0.15)' }} />
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, rgba(250,246,241,1) 0%, rgba(250,246,241,0.6) 25%, rgba(250,246,241,0.1) 55%, transparent 70%)' }} />
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(250,246,241,0.5) 0%, transparent 30%)' }} />
        </motion.div>

      </div>
    </section>
  );
}
