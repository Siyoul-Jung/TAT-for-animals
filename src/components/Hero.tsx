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
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: '#2B4019' }}
    >
      {/* Radial glow — warm orange/gold emanating from center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,112,58,0.18) 0%, rgba(212,160,67,0.08) 40%, transparent 70%)',
            'radial-gradient(ellipse 40% 40% at 30% 60%, rgba(212,112,58,0.10) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Mobile background image — 이미지를 배경으로 깔고 overlay로 어둡게 */}
      {shuffled.length > 0 && (
        <div className="lg:hidden absolute inset-0 z-0">
          <Image
            src={shuffled[currentIndex]?.src ?? '/images/hero/tat_animal_calm.jpg'}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* 다크 그린 오버레이 — 텍스트 가독성 + 브랜드 컬러 유지 */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(43,64,25,0.68)' }}
          />
        </div>
      )}

      {/* 2단 그리드 — 텍스트 40% / 이미지 60%, 이미지는 오른쪽 끝까지 블리드 */}
      <div className="relative z-10 w-full min-h-screen grid lg:grid-cols-[2fr_3fr]">

        {/* Left — Text */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center px-6 lg:px-14 xl:px-20 pt-28 pb-16 lg:pt-32 lg:pb-20"
        >
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] leading-[1.1] text-cream mb-5 font-semibold">
            Help your animal<br />
            feel calm and at ease.
          </h1>

          <p className="font-serif italic text-xl sm:text-2xl mb-8 font-normal"
            style={{ color: 'rgba(250,246,241,0.65)' }}>
            And notice what happens in you.
          </p>

          <p className="text-base sm:text-lg leading-relaxed mb-12"
            style={{ color: 'rgba(250,246,241,0.55)' }}>
            No special training. No reliving anything painful.
            Just a few quiet minutes with your animal — and something shifts.
          </p>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 items-start">
            <Link
              href="/membership"
              className="w-full sm:w-auto lg:w-full xl:w-auto px-8 py-4 rounded-full text-cream font-semibold text-base text-center whitespace-nowrap transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              style={{
                backgroundColor: '#D4703A',
                boxShadow: '0 8px 32px rgba(212,112,58,0.30)',
              }}
            >
              Start with Your Animal
            </Link>
            <button
              onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto lg:w-full xl:w-auto flex items-center justify-center sm:justify-start gap-3 px-6 py-4 rounded-full border font-medium text-base whitespace-nowrap transition-all hover:border-cream/40 hover:text-cream group"
              style={{
                borderColor: 'rgba(250,246,241,0.25)',
                color: 'rgba(250,246,241,0.70)',
              }}
            >
              <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center border transition-all group-hover:border-cream/40"
                style={{ borderColor: 'rgba(250,246,241,0.25)' }}>
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
              {/* 흐린 배경 — 어떤 비율이든 컨테이너를 채움 */}
              <Image
                src={img.src}
                alt=""
                aria-hidden="true"
                fill
                priority={i === 0}
                sizes="60vw"
                className="object-cover object-center scale-110"
                style={{ filter: 'blur(24px)', opacity: 0.6 }}
              />
              {/* 선명한 원본 — 항상 전체가 보임 */}
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
          {/* 왼쪽 경계 — 배경색과 자연스럽게 연결 */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(to right, rgba(43,64,25,1) 0%, rgba(43,64,25,0.2) 25%, transparent 55%)',
            }}
          />
          {/* 하단 페이드 */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(to top, rgba(43,64,25,0.6) 0%, transparent 35%)',
            }}
          />
        </motion.div>

      </div>
    </section>
  );
}
