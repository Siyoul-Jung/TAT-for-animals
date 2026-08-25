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
//
// Responsive shape: ≥sm is a classic 3-column table (label | tier | tier).
// On phones the label spans the full width and the two check cells drop
// underneath it — nothing is hidden or collapsed, the row just wraps. The
// column tints (Connection faint neutral, Circle green wash) run the full
// height in both layouts, so the eye can track which column is which.
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
    <div className="text-center px-2 sm:px-4 pt-6 sm:pt-7 pb-5 sm:pb-6">
      {/* The badge line is always reserved so the two headers stay the same
          height and their prices align across columns. */}
      <p
        className="text-[12px] tracking-[0.18em] uppercase font-semibold mb-2"
        style={{ color: highlighted ? '#467826' : 'transparent' }}
        aria-hidden={!highlighted}
      >
        ★ Most popular
      </p>
      <p className="font-serif text-lg sm:text-2xl text-charcoal font-medium leading-snug">{name}</p>
      <p className="mt-2 text-charcoal">
        <span className="text-base sm:text-lg align-top">$</span>
        <span className="font-serif text-2xl sm:text-4xl font-semibold">{monthly}</span>
        <span className="text-sm sm:text-base text-charcoal/65"> / month</span>
      </p>
      {/* Annual stays visible here too (Tapas, 2026-07-15 — "keep the annual
          plan info on both cards and add to the comparison table"). */}
      <p className="mt-1 text-sm text-charcoal/65 leading-snug">
        or ${yearly} / year — two months free
      </p>
    </div>
  );
}

// Same shape as the pricing-card CTAs (full-width, rounded-xl, bold) so the
// table's buttons read as the same action, not a new element.
function JoinButton({ plan, label }: { plan: string; label: string }) {
  return (
    <Link
      href={`/checkout?plan=${plan}`}
      className="flex w-full items-center justify-center min-h-[56px] px-2 sm:px-3 py-3 rounded-xl font-bold text-base sm:text-[19px] text-cream text-center leading-snug transition-all hover:opacity-90 active:scale-95"
      style={{ backgroundColor: '#D4703A', boxShadow: '0 8px 24px rgba(212,112,58,0.20)' }}
    >
      {label}
    </Link>
  );
}

export default function ComparisonTable() {
  return (
    <section className="bg-white px-4 sm:px-6 pb-20 lg:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto"
      >
        <div
          className="rounded-3xl bg-white overflow-hidden border border-charcoal/15"
          // Real border (in the class above), not a 1px shadow ring — hairline
          // shadows can vanish after the reveal animation when the browser
          // re-rasterizes the layer.
          style={{ boxShadow: '0 8px 40px rgba(28,16,7,0.08)' }}
        >
          {/* Phones: 2 columns (the label cells span both). ≥sm: 3 columns. */}
          <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr]">

            {/* Title cell — carries the section heading itself ("additional
                detail for undecided visitors", per the spec). Desktop: fills
                the tall corner the pricing headers create. Phones: its own
                full-width row above the two tier headers. */}
            <div className="col-span-2 sm:col-span-1 flex flex-col justify-center gap-1.5 sm:gap-2 px-5 sm:px-7 py-5 sm:py-6 text-center sm:text-left border-b border-charcoal/6 sm:border-b-0">
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-medium leading-tight">
                Compare the Details
              </h2>
              <p className="text-sm sm:text-base text-charcoal/65 leading-relaxed">
                What&rsquo;s included in each plan
              </p>
            </div>
            <div className="bg-charcoal/2 sm:border-l border-charcoal/6">
              <ColumnHeader name="The Calm Connection" monthly={27} yearly={270} />
            </div>
            <div className="bg-green/5 border-l border-charcoal/6">
              <ColumnHeader name="The Calm Circle" monthly={47} yearly={470} highlighted />
            </div>

            {ROWS.map((row) => (
              <div key={row.label} className="contents">
                {/* Label: full-width on phones (checks drop underneath), first
                    column on desktop. */}
                <div className="col-span-2 sm:col-span-1 px-5 sm:px-7 pt-4 pb-2 sm:py-4 text-base text-charcoal/80 leading-snug flex items-center border-t border-charcoal/6">
                  {row.label}
                </div>
                {/* Screen readers get the answer as sr-only text INSIDE each
                    cell (with the plan name, since the visual column position
                    is lost linearly) — not aria-label, which ARIA ignores on
                    plain divs (role=generic can't be named). */}
                <div className="flex items-center justify-center py-3 sm:py-4 bg-charcoal/2 sm:border-t sm:border-l border-charcoal/6">
                  <span className="sr-only">
                    {row.connection ? 'Included in The Calm Connection' : 'Not included in The Calm Connection'}
                  </span>
                  {row.connection ? CHECK : <span className="text-charcoal/25" aria-hidden>—</span>}
                </div>
                <div className="flex items-center justify-center py-3 sm:py-4 bg-green/5 border-l sm:border-t border-charcoal/6">
                  <span className="sr-only">
                    {row.circle ? 'Included in The Calm Circle' : 'Not included in The Calm Circle'}
                  </span>
                  {row.circle ? CHECK : <span className="text-charcoal/25" aria-hidden>—</span>}
                </div>
              </div>
            ))}

            {/* CTA row — same labels as the cards above (spec). The note cell
                carries the cancel line so it sits beside the Join buttons on
                desktop, and as its own row above them on phones. */}
            <div className="col-span-2 sm:col-span-1 px-5 sm:px-7 py-4 sm:py-6 flex items-center justify-center sm:justify-start text-sm sm:text-base text-charcoal/65 leading-relaxed border-t border-charcoal/6">
              <span>
                Cancel anytime.{' '}
                <Link href="/terms" className="underline hover:text-green transition-colors">See&nbsp;Terms</Link>
              </span>
            </div>
            <div className="px-2 sm:px-4 py-5 sm:py-6 flex justify-center items-center bg-charcoal/2 border-t sm:border-l border-charcoal/6">
              <JoinButton plan="calm_library" label="Join the Calm Connection" />
            </div>
            <div className="px-2 sm:px-4 py-5 sm:py-6 flex justify-center items-center bg-green/5 border-t border-l border-charcoal/6">
              <JoinButton plan="calm_circle" label="Join the Calm Circle" />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
