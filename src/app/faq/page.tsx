'use client';

import { useState } from 'react';

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
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b cursor-pointer"
      style={{ borderColor: 'rgba(28,16,7,0.1)' }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-4 py-5">
        <h2
          className="text-lg font-medium leading-snug"
          style={{ fontFamily: 'var(--font-dm-sans)', color: '#1C1007' }}
        >
          {q}
        </h2>
        <span
          className="text-xl flex-shrink-0 transition-transform duration-300"
          style={{
            color: '#D4703A',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          +
        </span>
      </div>

      {open && (
        <p
          className="text-base leading-relaxed pb-6"
          style={{ color: 'rgba(28,16,7,0.65)', fontFamily: 'var(--font-dm-sans)' }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <main
      className="min-h-screen pt-28 pb-24 px-6"
      style={{ backgroundColor: 'oklch(98% 0.016 73.684)' }}
    >
      <div className="max-w-2xl mx-auto">

        <h1
          className="text-3xl sm:text-4xl font-medium mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-dm-sans)', color: '#1C1007' }}
        >
          Questions & Answers
        </h1>
        <p
          className="text-base mb-12 leading-relaxed"
          style={{ color: 'rgba(28,16,7,0.55)', fontFamily: 'var(--font-dm-sans)' }}
        >
          Everything you're wondering about TAT for Animals — answered simply.
        </p>

        <div>
          {faqs.map(({ q, a }, i) => (
            <FAQItem key={i} q={q} a={a} />
          ))}
        </div>

        <div className="mt-16">
          <p
            className="text-base leading-relaxed"
            style={{ color: 'rgba(28,16,7,0.55)', fontFamily: 'var(--font-dm-sans)' }}
          >
            Still have questions?{' '}
            <a href="mailto:tapas@tatlife.com" style={{ color: '#D4703A' }}>
              Email us
            </a>
            {' '}— we'd love to hear from you.
          </p>
        </div>

      </div>
    </main>
  );
}
