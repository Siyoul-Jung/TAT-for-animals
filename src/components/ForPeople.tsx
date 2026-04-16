'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Play } from 'lucide-react';
import Link from 'next/link';

const EMBED_SRC = 'https://www.youtube.com/embed/zLc3k4v-hrU?rel=0&autoplay=1';
const THUMBNAIL = 'https://img.youtube.com/vi/zLc3k4v-hrU/maxresdefault.jpg';

export default function ForPeople() {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pathname = usePathname();

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
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#2B4019' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(212,112,58,0.08) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 60% at 80% 70%, rgba(212,112,58,0.07) 0%, transparent 65%)',
          ].join(', '),
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 lg:py-28">

        {/* Bridge — Mirror of Calm */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-cream font-medium leading-[1.2] mb-5">
            Your animal reflects<br />what you carry.
          </h2>
          <p
            className="font-serif italic text-xl sm:text-2xl"
            style={{ color: 'rgba(212,168,67,0.9)' }}
          >
            When they find peace — so do you.
          </p>
        </motion.div>

        {/* Divider */}
        <div
          className="w-16 h-px mx-auto mb-16 lg:mb-20"
          style={{ background: 'rgba(212,168,67,0.3)' }}
        />

        {/* Healing ACEs Plus */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p
            className="text-xs tracking-[0.2em] uppercase font-medium mb-5"
            style={{ color: 'rgba(212,168,67,0.6)' }}
          >
            Healing ACEs Plus
          </p>
          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-cream font-medium leading-tight mb-6">
            Your past doesn&apos;t have to<br />define your present.
          </h3>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10"
            style={{ color: 'rgba(250,246,241,0.6)' }}
          >
            Those painful beliefs were never your fault. With Healing ACEs Plus,
            you can gently dissolve the roots of suffering — without reliving anything. Ever.
          </p>

          {/* Tapas quote */}
          <blockquote
            className="max-w-2xl mx-auto font-serif italic text-lg sm:text-xl leading-relaxed mb-14"
            style={{ color: 'rgba(212,168,67,0.85)' }}
          >
            &ldquo;Healing ACEs Plus helps you gently release the pain of old wounds,
            reconnect with your true self, and open to the life of love and wholeness
            that&apos;s always been waiting for you.&rdquo;
            <footer
              className="mt-4 text-sm not-italic font-sans tracking-wide"
              style={{ color: 'rgba(212,168,67,0.5)' }}
            >
              — Tapas Fleming
            </footer>
          </blockquote>

          {/* Video player */}
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[2.5rem] blur-2xl opacity-20 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(212,112,58,0.5) 0%, transparent 70%)',
              }}
            />

            <div
              className="relative aspect-video rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 0 0 1.5px rgba(212,168,67,0.2), 0 24px 64px rgba(0,0,0,0.3)',
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
                    style={{ backgroundColor: 'rgba(43,64,25,0.55)' }}
                  />
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center"
                    aria-label="Play Healing ACEs video"
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
                      Watch how Healing ACEs works
                    </p>
                  </button>
                </div>
              )}

              {isPlaying && (
                <iframe
                  ref={iframeRef}
                  className="absolute inset-0 w-full h-full"
                  src={EMBED_SRC}
                  title="Healing ACEs Plus — TAT® for People"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <Link
              href="/for-people"
              className="inline-flex items-center gap-2 text-sm font-medium tracking-wide transition-opacity duration-200 hover:opacity-70"
              style={{ color: 'rgba(212,168,67,0.9)' }}
            >
              Learn more about Healing ACEs Plus →
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
