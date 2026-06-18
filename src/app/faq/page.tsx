'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is TAT for Animals?',
    a: 'TAT (Tapas Acupressure Technique) is a simple, gentle approach to helping animals feel calmer, happier, and more at ease. You don\'t need any special training or skills. You just place your hands over your heart, listen to a recording, and the healing information transfers to your animal — wherever they are.',
  },
  {
    q: 'How does it actually work?',
    a: 'TAT works by sending new information to your animal\'s whole body — every cell, every frequency. The message is simple: whatever happened before is over. It\'s safe to relax now. You don\'t need to understand exactly how it works before it works. (Do you understand exactly how Wi-Fi works? Probably not — but you use it every day.)',
  },
  {
    q: 'Do I need to be an animal communicator or have special abilities?',
    a: 'Not at all. One of the most common worries is "I\'m not an animal communicator — can my animal really hear me?" The answer is yes. You\'re already connected with your animal through your heart. TAT works through that connection, not through any special skill.',
  },
  {
    q: 'What if I\'m skeptical? What if I don\'t believe this can work?',
    a: 'That\'s completely fine — and actually, you can work with that. If you catch yourself thinking "this is too easy" or "this can\'t work for something this serious," just include that doubt in the session. Add it to what\'s being transformed. You don\'t have to believe for it to work.',
  },
  {
    q: 'Does my animal need to be in the room with me?',
    a: 'No. You\'re connected with your animal in your heart, and that connection doesn\'t depend on physical distance. Whether they\'re next to you or across the house, they receive what you\'re sending.',
  },
  {
    q: 'What situations can TAT help with?',
    a: 'Fear of loud noises, strangers, or other animals. Anxiety and stress. Recovery from illness or surgery. Unknown trauma — especially in adopted animals who arrived with a difficult past. Unexplained crying or hiding. Behavioral changes you can\'t quite put your finger on. You don\'t need to know the exact cause. Just work with what you can see.',
  },
  {
    q: 'Do I need to know what\'s wrong with my animal?',
    a: 'No. You can simply set the intention: "whatever is causing this, let\'s work on that." TAT doesn\'t require a diagnosis. You just point it in the direction of what\'s bothering your animal, and the process does the rest.',
  },
  {
    q: 'What do I actually do in a session?',
    a: 'Two simple poses. The Heart Pose: place one palm over the other near the center of your chest. The TAT Pose: lightly touch the inner corners of your eyes with your thumb and ring finger, your middle finger just above the midline of your brow, and your other hand cradling the base of your skull. Then you listen to the recording and follow along. No pressure, no concentration required — just a light touch and an open heart.',
  },
  {
    q: 'Do I need to concentrate or feel something during a session?',
    a: 'No. You don\'t need to focus hard, feel anything specific, or be perfectly still. If your attention wanders, that\'s fine. You don\'t have to figure anything out. Just follow the recording and leave the healing to something larger than both of you.',
  },
  {
    q: 'How will I know if it\'s working?',
    a: 'Your animal will seem more like themselves — calmer, more relaxed, more connected. Sometimes it\'s obvious quickly. Sometimes you notice it later, when a situation that used to trigger them comes around again and this time, they\'re fine. After a session, your animal may also sleep more than usual. This is a good sign — their body is integrating the change.',
  },
  {
    q: 'Can I do this alongside veterinary treatment?',
    a: 'Yes. TAT works alongside any other care your animal is receiving. If your animal is on medication, they may need less of it over time — so stay in close contact with your veterinarian.',
  },
  {
    q: 'What about me — does this affect the owner too?',
    a: 'Often, yes. Your animal feels what you feel. When you clear your own stress and tension, your animal relaxes too. Many people find that doing TAT for their animal brings them a surprising sense of calm as well.',
  },
  {
    q: 'Can I change or cancel my membership?',
    a: 'Yes, anytime — there\'s no long-term commitment. To switch between The Calm Library and The Calm Circle, just use the change-plan option in your account. Your plan updates right away and the difference is prorated, so you\'re never charged twice. And you can cancel whenever you like — your access continues until the end of the period you\'ve already paid for.',
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

        <div>
          {faqs.map(({ q, a }, i) => (
            <FAQItem key={i} q={q} a={a} />
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
