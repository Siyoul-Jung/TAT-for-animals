'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Oregon, USA',
    animal: 'Bowie — Golden Retriever',
    quote: 'Bowie had been anxious for years. Within a few sessions of TAT®, he started sleeping through the night. But what surprised me most was how much calmer I felt too. I didn\'t expect that.',
    image: '/images/testimonial.jpg',
  },
  {
    name: 'Claire T.',
    location: 'London, UK',
    animal: 'Misty — Rescue Dog',
    quote: 'Misty was terrified of everything when we adopted her. TAT® helped her come out of her shell — slowly, gently. Watching her relax, I felt something release in me too. It\'s hard to explain but impossible to ignore.',
    image: '/images/testimonial2.jpg',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-cream py-20 lg:py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 lg:mb-20"
        >
          <p className="text-xs tracking-[0.2em] uppercase font-medium mb-5"
            style={{ color: 'rgba(212,112,58,0.7)' }}>
            Real Stories
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-charcoal font-medium leading-tight">
            They felt it too.
          </h2>
        </motion.div>

        <div className="flex flex-col gap-16 lg:gap-24">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className={`grid lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-20 items-center ${
                i % 2 === 1 ? 'lg:[direction:rtl]' : ''
              }`}
            >
              {/* 사진 */}
              <div
                className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/5] lg:[direction:ltr]"
                style={{ boxShadow: '0 24px 64px rgba(28,16,7,0.10)' }}
              >
                <img
                  src={t.image}
                  alt={t.name}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>

              {/* 텍스트 */}
              <div className="lg:[direction:ltr] flex flex-col justify-center">
                <p className="text-xs tracking-[0.15em] uppercase font-medium mb-6"
                  style={{ color: 'rgba(212,112,58,0.6)' }}>
                  {t.animal}
                </p>
                <blockquote className="font-serif text-lg sm:text-xl lg:text-2xl text-charcoal leading-[1.6] mb-8">
                  "{t.quote}"
                </blockquote>
                <div>
                  <p className="font-medium text-charcoal">{t.name}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(28,16,7,0.4)' }}>
                    {t.location}
                  </p>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mt-16 lg:mt-24"
        >
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-wide transition-opacity duration-200 hover:opacity-70"
            style={{ color: 'rgba(212,112,58,0.9)' }}
          >
            Read more stories →
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
