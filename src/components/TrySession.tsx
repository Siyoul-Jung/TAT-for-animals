'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Play, Check } from 'lucide-react';
import Link from 'next/link';

// TAT for Animals homepage demo (Vimeo, unlisted — h= is the privacy hash from Jez's link).
// dnt=1 = do-not-track; title/byline/portrait hidden for a clean frame.
const EMBED_SRC = 'https://player.vimeo.com/video/1198312189?h=a5438c1c2f&autoplay=1&title=0&byline=0&portrait=0&dnt=1';
const THUMBNAIL = 'https://i.vimeocdn.com/video/2164871332-82ad71535420021c251d59b77f1996fd26e6d47d3a901de5ea6000007a0570a5-d_1280?region=us';

// The seven signs, in Tapas's own words (verbatim from his content review) — rendered as
// a quiet left-aligned list, no bullets, so it reads as recognition rather than a checklist.
const SIGNS = [
  'Does your dog panic during thunderstorms, fireworks, or loud noises?',
  'Does your cat hide, freeze, or seem on edge when guests come over?',
  'Does your cat cry out, meow endlessly, or seem impossible to soothe?',
  'Does your animal get distressed when you leave the house?',
  'Does fear sometimes show up as barking, lunging, hiding, or aggression?',
  'Is your rescue animal still anxious months after coming home?',
  'Does your animal seem tense, vigilant, or unable to fully relax?',
];

export default function TrySession() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const isInView = useInView(videoRef, { once: true, margin: '-15% 0px' });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (pathname !== '/' && iframeRef.current) {
      iframeRef.current.src = '';
      setIsPlaying(false);
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (iframeRef.current) iframeRef.current.src = '';
    };
  }, []);

  return (
    <section id="experience" className="bg-white py-20 lg:py-28 px-6 overflow-hidden">
      <div className="max-w-3xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <p className="text-[13px] tracking-[0.2em] uppercase font-medium mb-5"
            style={{ color: '#38601E' }}>
            TAT for Animals
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl text-charcoal font-medium leading-tight">
            Feel calm, together.
          </h2>
        </motion.div>

        {/* Recognition hook — one flowing question, the signs emphasised inline so it
            stays a single short paragraph and the video keeps the focus. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 max-w-2xl mx-auto text-center"
        >
          <p className="text-xl sm:text-2xl font-serif text-charcoal font-medium mb-1">
            Does this sound familiar?
          </p>
          <p className="text-base text-charcoal/65 mb-7">
            Is your animal showing signs of stress or fear?
          </p>

          {/* Recognition panel — a soft green-tinted aside holding Tapas's signs verbatim,
              two columns on desktop so it reads as a calm grouping, not a long checklist. */}
          <div
            className="rounded-2xl px-6 py-7 sm:px-9 sm:py-8 mb-8 text-left"
            style={{ backgroundColor: 'rgba(70,120,38,0.05)', border: '1px solid rgba(70,120,38,0.14)' }}
          >
            <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
              {SIGNS.map((q) => (
                <li key={q} className="flex gap-2.5 text-base sm:text-lg leading-relaxed text-charcoal/80">
                  <Check size={20} strokeWidth={2.5} aria-hidden="true" className="mt-1 shrink-0" style={{ color: '#38601E' }} />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-base sm:text-lg leading-relaxed text-charcoal/80 max-w-xl mx-auto mb-5">
            If you recognized your animal in even one of these situations, <span className="whitespace-nowrap">you&rsquo;re not alone.</span>
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-charcoal/80 max-w-xl mx-auto mb-5">
            For more than 30 years, I&rsquo;ve used TAT to help animals move through fear,
            anxiety, and stress by helping the nervous system feel safe enough to let go.
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-charcoal/80 max-w-xl mx-auto">
            When animals feel safe, they often become calmer, more connected, and more able to
            be themselves.
          </p>
        </motion.div>

        {/* Experience TAT Together — lead-in to the video, verbatim.
            The separate "I'm Tapas Fleming" intro that used to sit here was removed to get
            visitors to the video sooner (Tapas approved, 2026-06-25): it duplicated the credit
            line under the video, and his full story lives on the About page. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 max-w-2xl mx-auto text-center"
        >
          <h3 className="text-xl sm:text-2xl font-serif text-charcoal font-medium mb-4">
            Experience TAT Together
          </h3>
          <p className="text-base sm:text-lg leading-relaxed text-charcoal/80 max-w-xl mx-auto mb-3">
            You don&rsquo;t have to wonder whether TAT is right for your animal. In the short video
            below, I&rsquo;ll guide you through a simple TAT process you can try with your own animal
            as you watch.
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-charcoal/80 max-w-xl mx-auto mb-3">
            Find a comfortable place to sit, press play, and simply follow along.
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-charcoal/80 max-w-xl mx-auto">
            Many people notice their animals becoming more relaxed during their very first experience.
          </p>
        </motion.div>

        {/* Video player — the centerpiece */}
        <motion.div
          ref={videoRef}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Warm glow */}
          <div
            className="absolute -inset-4 rounded-[2.5rem] blur-2xl opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(212,112,58,0.4) 0%, transparent 70%)',
            }}
          />

          {/* Frame */}
          <div
            className="relative aspect-video rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 0 0 1.5px rgba(212,112,58,0.35), 0 24px 64px rgba(28,15,7,0.18)',
            }}
          >
            {!isPlaying && (
              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    animate={{ scale: isInView ? 1.06 : 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <img
                      src={THUMBNAIL}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
                {/* Dim — gentle even warm overlay so the centered play button reads as
                    "video to play" (the familiar YouTube/Vimeo look), not a sticker on the photo. */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(28,15,7,0.40) 0%, rgba(28,15,7,0.28) 100%)',
                  }}
                />
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 w-full h-full flex items-center justify-center"
                  aria-label="Play TAT for Animals video"
                >
                  <div className="relative">
                    {/* Pulse ring — skip the infinite animation under reduced-motion */}
                    {isInView && !prefersReducedMotion && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: 'rgba(212,112,58,0.3)' }}
                        animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: '#D4703A',
                        boxShadow: '0 0 0 14px rgba(212,112,58,0.15)',
                      }}
                    >
                      <Play size={28} fill="white" className="text-white ml-1" />
                    </motion.div>
                  </div>
                </button>
              </div>
            )}

            {isPlaying && (
              <iframe
                ref={iframeRef}
                className="absolute inset-0 w-full h-full"
                src={EMBED_SRC}
                title="TAT for Animals"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </motion.div>

        {/* Signature under the video */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-7"
        >
          <p className="text-sm sm:text-base text-charcoal font-medium">
            Tapas Fleming, Founder and Creator of TAT
          </p>
          <Link
            href="/about"
            className="inline-flex items-center min-h-[44px] gap-1 mt-1 text-base font-medium transition-opacity hover:opacity-70"
            style={{ color: '#38601E' }}
          >
            Read Tapas&rsquo;s story &rarr;
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
