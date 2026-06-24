'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// FAQs grouped by topic so visitors can scan to the part they care about:
// the technique itself vs. the practical side of membership. Add a new question
// by dropping it into the right group's `items` — the headings render themselves.
// (A membership refund question is pending Tapas's policy decision before it's added.)
const faqSections = [
  {
    category: 'About TAT for Animals',
    items: [
      {
        q: 'What is TAT for Animals?',
        a: 'TAT (Tapas Acupressure Technique) is a simple, gentle approach to helping animals feel calmer, happier, and more at ease. You don\'t need any special training or skills. You just place your hands over your heart, listen to a recording, and the healing information is received by your animal — wherever they are.',
      },
      {
        q: 'How does it actually work?',
        a: 'TAT works by sending new information to your animal\'s whole body — every cell, every frequency. The message is simple: whatever happened before is over. It\'s safe to relax now. DNA is a frequency antenna. Your animal receives the supportive information — thoughts and feelings — communicated in all the TAT statements. Their whole system updates and they can relax and feel better immediately. You don\'t need to understand exactly how it works before it works. (Do you understand exactly how Wi-Fi works? Probably not — but you use it every day.)',
      },
      {
        q: 'Do I need to be an animal communicator or have special abilities?',
        a: 'Not at all. One of the most common worries is "I\'m not an animal communicator — can my animal really hear me?" The answer is yes. You\'re already connected with your animal through your heart. TAT works through that special bond of love. Nothing more is needed for the success of you helping your animal with TAT.',
      },
      {
        q: 'What if I\'m skeptical? What if I don\'t believe this can work?',
        a: 'That\'s completely fine — and actually, you can work with those kinds of thoughts. If you notice yourself thinking "this is too easy" or "this can\'t work for something this serious," just include that doubt in the session. Add it to what\'s being transformed. You don\'t have to believe anything for it to work (and neither does your animal!).',
      },
      {
        q: 'Does my animal need to be in the room with me?',
        a: 'No. You\'re connected with your animal in your heart, and that connection doesn\'t depend on physical distance. Whether they\'re next to you, across the house, or even miles away, they receive what you\'re sending.',
      },
      {
        q: 'What situations can TAT help with?',
        a: 'Fear of loud noises, strangers, or other animals. Anxiety and stress. Recovery from illness or surgery. Unknown trauma — especially in adopted animals who arrived with a difficult past. Unexplained crying or hiding. Behavioral changes you can\'t quite put your finger on. You don\'t need to know the exact cause. Just work with what you notice.',
      },
      {
        q: 'Do I need to know what\'s wrong with my animal?',
        a: 'No. You can simply set the intention: "whatever is causing this, let\'s work on that." TAT doesn\'t require a diagnosis. You just point it in the direction of what\'s bothering your animal, and the process does the rest.',
      },
      {
        q: 'What do I actually do in a session?',
        a: 'During the session, you\'ll place your hands in three easy positions (one over the chest, two lightly on the head). Choose the feeling or situation you want to help your animal with, start the recording, and follow the guidance. You don\'t need to try to make anything happen — just hold the touch and let the session help shift your animal\'s energy and nervous system.',
      },
      {
        q: 'Do I need to concentrate or feel something during a session?',
        a: 'No. You don\'t need to focus hard, feel anything specific, or be perfectly still. If your attention wanders, that\'s fine. You don\'t have to figure anything out. Just follow the recording and leave the healing to nature, the Divine (whatever you call That), or Whatever Makes Flowers Grow.',
      },
      {
        q: 'How will I know if it\'s working?',
        a: 'Your animal will seem more like themselves — calmer, more relaxed, more connected. Sometimes it\'s obvious quickly. Sometimes you notice it later, when a situation that used to trigger them comes around again and this time, they\'re fine. After a session, your animal may also sleep more than usual. This is a good sign — their body is integrating the change.',
      },
      {
        q: 'Can I do this alongside veterinary treatment?',
        a: 'Yes. TAT works alongside any other care your animal is receiving. If your animal is on medication, they may need less of it after doing a TAT session — stay in close contact with your veterinarian.',
      },
      {
        q: 'What about me — does this affect the owner too?',
        a: 'Often, yes. You often feel what your animal feels, and your animal feels what you feel. When you clear your own stress and tension, your animal relaxes too. Many people find that doing TAT for their animal brings them a surprising sense of calm as well.',
      },
    ],
  },
  {
    category: 'Membership and Billing',
    items: [
      {
        q: 'Can I change or cancel my membership?',
        a: 'Yes, anytime — there\'s no long-term commitment. You can cancel whenever you like, and your access continues until the end of the period you\'ve already paid for — the rest of the month, or the rest of the year on an annual plan. To move up from The Calm Library to The Calm Circle on a monthly plan, just use the upgrade option in your account; it takes effect right away, and you only pay the prorated difference — never twice. For a smaller plan, or to change an annual plan, send us a quick note and we\'ll take care of it. Annual memberships are billed once a year (two months free compared with paying monthly) and renew automatically until you cancel.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-charcoal/10">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-left min-h-[64px] group"
      >
        <span className={`text-base sm:text-lg font-medium leading-snug transition-colors ${
          open ? 'text-green' : 'text-charcoal group-hover:text-green'
        }`}>
          {q}
        </span>
        <ChevronDown
          size={18}
          className="text-green shrink-0 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-base sm:text-lg leading-relaxed pb-6 text-charcoal/65">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  // Collapse every item when the page is restored from the browser's bfcache
  // (back/forward), which would otherwise reopen whatever was expanded before
  // leaving. Bumping the key remounts the list so each item resets to closed.
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setResetKey((k) => k + 1);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  return (
    <main className="min-h-screen bg-cream pt-28 pb-24 px-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-12 lg:mb-16">
          <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5" style={{ color: '#467826' }}>
            FAQ
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-semibold leading-tight mb-4">
            Your questions, answered.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-charcoal/65">
            Everything you're wondering about TAT for Animals — answered simply.
          </p>
        </div>

        <div key={resetKey} className="space-y-12">
          {faqSections.map(({ category, items }) => (
            <section key={category}>
              <h2 className="font-serif text-2xl text-charcoal font-medium mb-2">
                {category}
              </h2>
              <div>
                {items.map(({ q, a }, i) => (
                  <FAQItem key={i} q={q} a={a} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14">
          <p className="text-base sm:text-lg leading-relaxed text-charcoal/65">
            Still have questions?{' '}
            <Link
              href="/contact"
              className="text-green underline underline-offset-2 hover:text-green transition-colors"
            >
              Get in touch
            </Link>
            {' '}— we'd love to hear from you.
          </p>
        </div>

      </div>
    </main>
  );
}
