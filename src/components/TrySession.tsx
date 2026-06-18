'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Play } from 'lucide-react';
import Link from 'next/link';

// TAT for Animals homepage demo (Vimeo, unlisted — h= is the privacy hash from Jez's link).
// dnt=1 = do-not-track; title/byline/portrait hidden for a clean frame.
const EMBED_SRC = 'https://player.vimeo.com/video/1198312189?h=a5438c1c2f&autoplay=1&title=0&byline=0&portrait=0&dnt=1';
const THUMBNAIL = 'https://i.vimeocdn.com/video/2164871332-82ad71535420021c251d59b77f1996fd26e6d47d3a901de5ea6000007a0570a5-d_1280?region=us';


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
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="text-[13px] tracking-[0.2em] uppercase font-medium mb-5"
            style={{ color: '#467826' }}>
            TAT for Animals
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-medium leading-tight mb-6">
            Help your animal feel more<br className="hidden sm:block" /> joyful, relaxed, and at peace.
          </h2>
          <p className="text-base sm:text-lg text-charcoal/65 font-light leading-relaxed max-w-xl mx-auto">
            In just a few quiet minutes, TAT can help your animal
            feel safer, softer, and more at ease.
            Watch a short intro with Tapas — then try it with your
            own cat, dog, or any animal you love.
          </p>
        </motion.div>

        {/* Video player */}
        <motion.div
          ref={videoRef}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-14 max-w-2xl mx-auto"
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <Link
            href="/membership"
            className="inline-flex items-center min-h-[44px] gap-1 text-base font-medium transition-opacity hover:opacity-70"
            style={{ color: '#467826' }}
          >
            Start helping your animal →
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
