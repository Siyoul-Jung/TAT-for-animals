// src/components/ComparisonTable.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';

// Tier comparison — sits directly below the pricing cards on the homepage
// (Tapas's copy spec, 2026-07-14). Framed as "additional detail for undecided
// visitors", so it repeats the cards' wording exactly (the spec's own rule:
// table labels must match card copy) rather than introducing new claims.
// Shared rows first; Circle-only rows last so the upgrade value reads at a glance.
const ROWS: { label: string; connection: boolean; circle: boolean }[] = [
  { label: 'Simple, essential TAT® tools to calm your animal — and yourself', connection: true, circle: true },
  { label: 'A growing library of monthly Calm Tips', connection: true, circle: true },
  { label: 'Live monthly webinars with Tapas', connection: false, circle: true },
  { label: 'Recordings of past live webinars', connection: false, circle: true },
  { label: 'Submit questions for live webinars', connection: false, circle: true },
];

const CHECK = (
  <span
    className="inline-flex w-6 h-6 rounded-full items-center justify-center"
    style={{ backgroundColor: 'rgba(70,120,38,0.12)' }}
  >
    <Check size={13} strokeWidth={3} style={{ color: '#467826' }} aria-hidden />
  </span>
);

function ColumnHeader({ name, monthly, yearly, highlighted }: {
  name: string;
  monthly: number;
  yearly: number;
  highlighted?: boolean;
}) {
  return (
    <div className="text-center px-2 sm:px-4 pt-7 pb-6">
      {highlighted && (
        <p className="text-[12px] tracking-[0.18em] uppercase font-semibold mb-2" style={{ color: '#467826' }}>
          ★ Most popular
        </p>
      )}
      <p className="font-serif text-xl sm:text-2xl text-charcoal font-medium leading-snug">{name}</p>
      <p className="mt-2 text-charcoal">
        <span className="text-lg align-top">$</span>
        <span className="font-serif text-3xl sm:text-4xl font-semibold">{monthly}</span>
        <span className="text-base text-charcoal/65"> / month</span>
      </p>
      {/* Annual stays visible here too (Tapas, 2026-07-15 — "keep the annual
          plan info on both cards and add to the comparison table"). */}
      <p className="mt-1 text-sm text-charcoal/65">
        or ${yearly} / year — two months free
      </p>
    </div>
  );
}

// Same shape as the pricing-card CTAs (full-width, rounded-xl, 19px bold)
// so the table's buttons read as the same action, not a new element.
function JoinButton({ plan, label }: { plan: string; label: string }) {
  return (
    <Link
      href={`/checkout?plan=${plan}`}
      className="flex w-full items-center justify-center min-h-[56px] px-3 py-3 rounded-xl font-bold text-base sm:text-[19px] text-cream text-center leading-snug transition-all hover:opacity-90 active:scale-95"
      style={{ backgroundColor: '#D4703A', boxShadow: '0 8px 24px rgba(212,112,58,0.20)' }}
    >
      {label}
    </Link>
  );
}

export default function ComparisonTable() {
  return (
    <section className="bg-white px-6 pb-20 lg:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto"
      >
        <div
          className="rounded-3xl bg-white overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(28,16,7,0.08), 0 0 0 1px rgba(28,16,7,0.06)' }}
        >
          {/* Header row — feature column is empty; the two tier columns carry
              name + price. The Circle column is tinted the same green wash used
              for checkmarks so "highlighted" never needs a loud border. */}
          {/* Every tier-column cell carries a left border — without it the label
              column and the (untinted) Connection column read as one block. */}
          <div className="grid grid-cols-[1.6fr_1fr_1fr] sm:grid-cols-[2fr_1fr_1fr]">
            {/* Top-left cell — carries the section heading itself ("additional
                detail for undecided visitors", per the spec). Putting the title
                inside the table fills the tall corner the pricing headers create
                and reads as the table's name, not a floating label. */}
            <div className="flex flex-col justify-center gap-2 px-5 sm:px-7 py-6">
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-medium leading-tight">
                Compare the Details
              </h2>
              <p className="text-sm sm:text-base text-charcoal/65 leading-relaxed">
                What&rsquo;s included in each plan
              </p>
            </div>
            {/* Both tier columns carry a background (Connection a faint neutral,
                Circle the green wash) so "label = plain, tier = tinted" reads
                at a glance. */}
            <div style={{ backgroundColor: 'rgba(28,16,7,0.02)', borderLeft: '1px solid rgba(28,16,7,0.06)' }}>
              <ColumnHeader name="The Calm Connection" monthly={27} yearly={270} />
            </div>
            <div style={{ backgroundColor: 'rgba(70,120,38,0.05)', borderLeft: '1px solid rgba(28,16,7,0.06)' }}>
              <ColumnHeader name="The Calm Circle" monthly={47} yearly={470} highlighted />
            </div>

            {ROWS.map((row) => (
              <div key={row.label} className="contents">
                <div
                  className="px-5 sm:px-7 py-4 text-base text-charcoal/80 leading-snug flex items-center"
                  style={{ borderTop: '1px solid rgba(28,16,7,0.06)' }}
                >
                  {row.label}
                </div>
                <div
                  className="flex items-center justify-center py-4"
                  style={{ borderTop: '1px solid rgba(28,16,7,0.06)', borderLeft: '1px solid rgba(28,16,7,0.06)', backgroundColor: 'rgba(28,16,7,0.02)' }}
                  aria-label={row.connection ? 'Included' : 'Not included'}
                >
                  {row.connection ? CHECK : <span className="text-charcoal/25" aria-hidden>—</span>}
                </div>
                <div
                  className="flex items-center justify-center py-4"
                  style={{ borderTop: '1px solid rgba(28,16,7,0.06)', borderLeft: '1px solid rgba(28,16,7,0.06)', backgroundColor: 'rgba(70,120,38,0.05)' }}
                  aria-label={row.circle ? 'Included' : 'Not included'}
                >
                  {row.circle ? CHECK : <span className="text-charcoal/25" aria-hidden>—</span>}
                </div>
              </div>
            ))}

            {/* CTA row — same labels as the cards above (spec). The left cell
                carries the cancel note so it sits right beside the Join
                buttons instead of floating under the table. */}
            <div
              className="px-5 sm:px-7 py-6 flex items-center text-sm sm:text-base text-charcoal/65 leading-relaxed"
              style={{ borderTop: '1px solid rgba(28,16,7,0.06)' }}
            >
              <span>
                Cancel anytime.{' '}
                <Link href="/terms" className="underline hover:text-green transition-colors">See&nbsp;Terms</Link>
              </span>
            </div>
            <div
              className="px-2 sm:px-4 py-6 flex justify-center"
              style={{ borderTop: '1px solid rgba(28,16,7,0.06)', borderLeft: '1px solid rgba(28,16,7,0.06)', backgroundColor: 'rgba(28,16,7,0.02)' }}
            >
              <JoinButton plan="calm_library" label="Join Calm Connection" />
            </div>
            <div
              className="px-2 sm:px-4 py-6 flex justify-center"
              style={{ borderTop: '1px solid rgba(28,16,7,0.06)', borderLeft: '1px solid rgba(28,16,7,0.06)', backgroundColor: 'rgba(70,120,38,0.05)' }}
            >
              <JoinButton plan="calm_circle" label="Join the Calm Circle" />
            </div>
          </div>
        </div>

      </motion.div>
    </section>
  );
}
