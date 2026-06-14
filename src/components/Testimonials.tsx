'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

type Testimonial = {
  name: string;
  location: string;
  animal: string;
  quote: string;
  image: string;
  isQuote?: boolean;
};

const testimonials: Testimonial[] = [
  {
    name: 'Rosalind and Philip',
    location: '',
    animal: 'Kai — From Crying to Comfort',
    quote: 'Before TAT®, Kai used to cry, moan, and whine very frequently. A few moments after TAT®, the crying stopped — and he became so much more relaxed. He\'s a much happier whippet now.',
    image: '/images/testimonials/kai.png',
    isQuote: false,
  },
  {
    name: 'Bowie\'s family',
    location: '',
    animal: 'Bowie — From Fear to Fun',
    quote: 'Before TAT®, Bowie was in pain — touching him caused extreme distress. During TAT®, his friend Ziggy stayed by his side, offering comfort and closeness. Immediately after TAT®, he got up, became happier, and more playful.',
    image: '/images/testimonials/bowie.png',
    isQuote: false,
  },
  {
    name: 'Marion O.',
    location: '',
    animal: 'Misty — A Gentle Shift',
    quote: 'We are so pleased to witness Misty\'s new-found peace! She now begs less for food, engages lovingly through eye contact and spontaneous cuddles, and waits patiently instead of whining. These changes are without doubt due to your valuable input.',
    image: '/images/testimonials/misty.jpg',
    isQuote: true,
  },
];

const INTERVAL = 7000;

function SlideLayout({ t }: { t: Testimonial }) {
  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-5 lg:gap-12 items-center">
      {/* 사진 — next/image: WebP/AVIF 변환 + 리사이즈 + 기본 lazy 로딩.
          후기는 스크롤 아래라 priority 없음(Hero LCP에 대역폭 양보). */}
      <div className="relative aspect-square">
        <Image
          src={t.image}
          alt={t.animal.split('—')[0].trim()}
          fill
          sizes="(min-width: 1024px) 512px, 100vw"
          className="object-contain object-center"
        />
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col justify-center">
        <p
          className="text-[13px] tracking-[0.15em] uppercase font-medium mb-3 lg:mb-5"
          style={{ color: '#467826' }}
        >
          {t.animal}
        </p>
        {t.isQuote ? (
          <blockquote className="font-serif text-lg sm:text-xl lg:text-2xl text-charcoal leading-[1.6] mb-5 lg:mb-8">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
        ) : (
          <p className="font-serif text-lg sm:text-xl lg:text-2xl text-charcoal/80 leading-[1.6] mb-5 lg:mb-8">
            {t.quote}
          </p>
        )}
        <div>
          <p className="font-medium text-charcoal">{t.name}</p>
          {t.location && (
            <p className="text-sm mt-0.5" style={{ color: 'rgba(28,16,7,0.65)' }}>
              {t.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReduced = useReducedMotion();
  const touchStartX = useRef<number>(0);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      setCurrent((p) =>
        diff > 0
          ? (p + 1) % testimonials.length
          : (p - 1 + testimonials.length) % testimonials.length
      );
    }
  }

  useEffect(() => {
    // Don't auto-advance if the visitor prefers reduced motion.
    if (paused || prefersReduced || testimonials.length <= 1) return;
    const t = setInterval(
      () => setCurrent((p) => (p + 1) % testimonials.length),
      INTERVAL
    );
    return () => clearInterval(t);
  }, [paused, prefersReduced]);

  return (
    <section className="bg-cream py-20 lg:py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">

        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 lg:mb-10"
        >
          <p
            className="text-[13px] tracking-[0.2em] uppercase font-medium mb-5"
            style={{ color: '#467826' }}
          >
            Real Stories
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-medium leading-tight">
            They felt it too.
          </h2>
        </motion.div>

        {/* 캐러셀 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* 슬라이드 영역 */}
          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Invisible spacer — 컨테이너 높이를 자연스럽게 잡아줌 */}
            <div className="invisible pointer-events-none" aria-hidden="true">
              <SlideLayout t={testimonials[0]} />
            </div>

            {/* 실제 슬라이드 — absolute crossfade */}
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  opacity: i === current ? 1 : 0,
                  transition: 'opacity 1.2s ease-in-out',
                  willChange: 'opacity',
                  pointerEvents: i === current ? 'auto' : 'none',
                }}
              >
                <SlideLayout t={t} />
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-3 mt-6 lg:mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to story ${i + 1}`}
                className="flex items-center justify-center min-h-[44px] min-w-[44px]"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span
                  style={{
                    display: 'block',
                    width: i === current ? 12 : 8,
                    height: i === current ? 12 : 8,
                    borderRadius: '50%',
                    backgroundColor: i === current ? '#D4703A' : 'transparent',
                    boxShadow: i === current ? 'none' : 'inset 0 0 0 1.5px rgba(28,16,7,0.3)',
                    transition: 'all 0.4s ease',
                    flexShrink: 0,
                  }}
                />
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
