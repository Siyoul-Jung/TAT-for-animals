'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Link from 'next/link';

const EMBED_SRC = 'https://www.youtube.com/embed/UpbujaNsKKA?rel=0&autoplay=1';
const THUMBNAIL = 'https://img.youtube.com/vi/UpbujaNsKKA/maxresdefault.jpg';


export default function ForAnimals() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);

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
    <section id="experience" className="bg-cream py-20 lg:py-28 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.2em] uppercase font-medium mb-5"
            style={{ color: 'rgba(212,112,58,0.7)' }}>
            TAT for Animals
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-medium leading-tight mb-6">
            Help your animal feel more<br className="hidden sm:block" /> joyful, relaxed, and at peace.
          </h2>
          <p className="text-base sm:text-lg text-charcoal/60 font-light leading-relaxed max-w-xl mx-auto">
            TAT helped Luna reconnect with the world around her
            in a way that felt safe and joyful.
            You can do the same for your cat, your dog, or any animal.
          </p>
        </motion.div>

        {/* Video player */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-14"
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
                <img
                  src={THUMBNAIL}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: 'rgba(43,64,25,0.50)' }}
                />
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 w-full h-full flex flex-col items-center justify-center"
                  aria-label="Play TAT for Animals video"
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
                    style={{ color: 'rgba(250,246,241,0.7)' }}
                  >
                    Watch how TAT works for animals
                  </p>
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
            href="/for-animals"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-wide transition-opacity duration-200 hover:opacity-70"
            style={{ color: 'rgba(212,112,58,0.9)' }}
          >
            Learn more about TAT for Animals →
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
