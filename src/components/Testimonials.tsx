'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

type Testimonial = {
  name: string;
  location: string;
  animal: string;
  quote: string;
  image: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'Rachel M.',
    location: 'Portland, Oregon',
    animal: 'Bowie — From Fear to Fun',
    quote: 'Bowie was in so much pain — even touching him caused extreme distress. During TAT®, his friend Ziggy stayed right by his side. Immediately after, he got up on his own, became happier, and more playful. I still can\'t quite believe what I witnessed.',
    image: '/images/testimonials/testimonial.jpg',
  },
  {
    name: 'Diane H.',
    location: 'Bristol, UK',
    animal: 'Kai — From Crying to Comfort',
    quote: 'Kai used to cry, moan, and whine constantly — it broke my heart. Just moments after TAT®, the crying stopped completely and he became so much more relaxed. He\'s a much happier whippet now. Our whole family is so relieved.',
    image: '/images/testimonials/testimonial2.jpg',
  },
  {
    name: 'Tom & Lisa B.',
    location: 'Austin, Texas',
    animal: 'Curby — A New Beginning',
    quote: 'We adopted Curby not knowing what he\'d been through. He was shut down, barely responsive. TAT® opened something in him we didn\'t know was possible. Watching him come back to life — and feeling something shift in us too — was unlike anything we\'ve experienced.',
    image: '/images/testimonials/curby_story.jpg',
  },
];

const INTERVAL = 7000;

function SlideLayout({ t }: { t: Testimonial }) {
  return (
    <div className="grid lg:grid-cols-[2fr_3fr] gap-8 lg:gap-16 items-center">
      {/* 사진 */}
      <div
        className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[4/5]"
        style={{ boxShadow: '0 24px 64px rgba(28,16,7,0.10)' }}
      >
        <img
          src={t.image}
          alt={t.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col justify-center">
        <p
          className="text-xs tracking-[0.15em] uppercase font-medium mb-6"
          style={{ color: 'rgba(212,112,58,0.6)' }}
        >
          {t.animal}
        </p>
        <blockquote className="font-serif text-lg sm:text-xl lg:text-2xl text-charcoal leading-[1.6] mb-8">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <div>
          <p className="font-medium text-charcoal">{t.name}</p>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(28,16,7,0.4)' }}>
            {t.location}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || testimonials.length <= 1) return;
    const t = setInterval(
      () => setCurrent((p) => (p + 1) % testimonials.length),
      INTERVAL
    );
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section className="bg-cream py-20 lg:py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">

        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 lg:mb-16"
        >
          <p
            className="text-xs tracking-[0.2em] uppercase font-medium mb-5"
            style={{ color: 'rgba(212,112,58,0.7)' }}
          >
            Real Stories
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-charcoal font-medium leading-tight">
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
          <div className="relative">
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
          <div className="flex items-center justify-center gap-3 mt-10">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to story ${i + 1}`}
                className="flex items-center justify-center p-1"
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
