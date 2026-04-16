// src/components/VideoSection.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const EMBED_SRC = 'https://www.youtube.com/embed/UpbujaNsKKA?rel=0&autoplay=1';

export default function VideoSection() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);

  // Stop playback when navigating away
  useEffect(() => {
    if (pathname !== '/' && iframeRef.current) {
      iframeRef.current.src = '';
      setIsPlaying(false);
    }
  }, [pathname]);

  // Stop on unmount
  useEffect(() => {
    return () => {
      if (iframeRef.current) iframeRef.current.src = '';
    };
  }, []);

  return (
    <section id="experience" className="bg-cream py-28 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.2em] uppercase font-medium text-brand mb-5">
            Experience it now
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-charcoal font-medium leading-tight mb-6">
            Try it now —<br className="hidden sm:block" /> with your animal.
          </h2>
          <p className="text-base sm:text-lg text-charcoal/60 font-light leading-relaxed max-w-xl mx-auto">
            Play this video with your animal nearby.
            You don&apos;t need to do anything except watch and follow along.
          </p>
        </motion.div>

        {/* Video player */}
        <motion.div
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
              background:
                'radial-gradient(ellipse at center, rgba(212,112,58,0.4) 0%, transparent 70%)',
            }}
          />

          {/* Frame */}
          <div
            className="relative aspect-video rounded-2xl overflow-hidden"
            style={{
              boxShadow:
                '0 0 0 1.5px rgba(212,112,58,0.35), 0 24px 64px rgba(28,15,7,0.18)',
            }}
          >
            {/* Thumbnail — shown before play */}
            {!isPlaying && (
              <div className="absolute inset-0 z-10">
                {/* 배경 이미지 */}
                <img
                  src="/images/hero/tat_animal_calm9.jpg"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* 다크 오버레이 */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: 'rgba(43,64,25,0.50)' }}
                />
                {/* 플레이 버튼 */}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 w-full h-full flex flex-col items-center justify-center group"
                  aria-label="Play video"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                    style={{
                      backgroundColor: '#D4703A',
                      boxShadow: '0 0 0 14px rgba(212,112,58,0.15)',
                    }}
                  >
                    <Play size={28} fill="white" className="text-white ml-1" />
                  </motion.div>
                  <p
                    className="text-sm font-light tracking-wide"
                    style={{ color: 'rgba(250,246,241,0.6)' }}
                  >
                    Watch how TAT® works
                  </p>
                </button>
              </div>
            )}

            {/* iframe — only mounted after click */}
            {isPlaying && (
              <iframe
                ref={iframeRef}
                className="absolute inset-0 w-full h-full"
                src={EMBED_SRC}
                title="TAT® — Try it with your animal"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-charcoal/40 font-light mt-8"
        >
          Used by hundreds of thousands of people in over 80 countries.
        </motion.p>

      </div>
    </section>
  );
}
