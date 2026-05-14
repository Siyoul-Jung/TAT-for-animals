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
    setShuffled(shuffle(images));
  }, []);

  useEffect(() => {
    if (shuffled.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffled.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [shuffled.length]);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-cream"
    >
      {/* Subtle warm glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 30% 60%, rgba(212,112,58,0.07) 0%, transparent 65%)',
        }}
      />

      {/* 2단 그리드 */}
      <div className="relative z-10 w-full min-h-screen grid lg:grid-cols-[2fr_3fr]">

        {/* Left — Text */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center px-6 lg:px-14 xl:px-20 pt-28 pb-16 lg:pt-32 lg:pb-20"
        >
          <p
            className="text-xs tracking-[0.2em] uppercase font-semibold mb-5"
            style={{ color: '#5E9635' }}
          >
            TAT for Animals
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[2.5rem] xl:text-[3rem] leading-[1.15] text-charcoal mb-5 font-semibold">
            Help your animal<br />
            feel calm and at ease.
          </h1>

          <p
            className="font-sans text-lg sm:text-xl mb-8 font-normal"
            style={{ color: '#5E9635' }}
          >
            And notice what happens in you.
          </p>

          <p
            className="text-base sm:text-lg leading-relaxed mb-12"
            style={{ color: 'rgba(28,16,7,0.55)' }}
          >
            No special training. No reliving anything painful.
            Just a few quiet minutes with your animal — and something shifts.
          </p>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 items-start">
            <Link
              href="/membership"
              className="w-full sm:w-auto lg:w-full xl:w-auto px-8 py-4 rounded-full text-cream font-semibold text-base text-center whitespace-nowrap transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              style={{
                backgroundColor: '#D4703A',
                boxShadow: '0 8px 32px rgba(212,112,58,0.25)',
              }}
            >
              Start with Your Animal
            </Link>
            <button
              onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto lg:w-full xl:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-full border font-medium text-base whitespace-nowrap transition-all group"
              style={{
                borderColor: 'rgba(28,16,7,0.15)',
                color: 'rgba(28,16,7,0.60)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#5E9635';
                (e.currentTarget as HTMLElement).style.color = '#5E9635';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,16,7,0.15)';
                (e.currentTarget as HTMLElement).style.color = 'rgba(28,16,7,0.60)';
              }}
            >
              <div
                className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center border transition-all"
                style={{ borderColor: 'rgba(28,16,7,0.15)' }}
              >
                <Play size={12} fill="currentColor" />
              </div>
              Watch How It Works
            </button>
          </div>

        </motion.div>

        {/* Right — 이미지 crossfade 슬라이드쇼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.15 }}
          className="relative hidden lg:block overflow-hidden"
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
                style={{ filter: 'blur(24px)', opacity: 0.5 }}
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
  );
}
