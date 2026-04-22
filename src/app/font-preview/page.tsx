// Temporary page — for font comparison only. Delete before launch.

const SAMPLE_HEADING = 'Help your animal feel calm and at ease.';
const SAMPLE_SUB = 'TAT for Animals helps you and your animal find peace — gently, without force.';
const SAMPLE_BODY = 'Join thousands of animal owners who have discovered a simpler, kinder way to help their animals feel safe, relaxed, and at ease.';
const SAMPLE_LABEL = 'TAT FOR ANIMALS';
const SAMPLE_CTA = 'Join Now';

type Option = {
  id: string;
  label: string;
  headingVar: string;
  headingWeight: string;
  description: string;
};

const OPTIONS: Option[] = [
  {
    id: 'A',
    label: 'Option A — Plus Jakarta Sans',
    headingVar: 'var(--font-plus-jakarta)',
    headingWeight: '700',
    description: 'Warm and approachable. Clean but with a human touch.',
  },
  {
    id: 'B',
    label: 'Option B — Manrope',
    headingVar: 'var(--font-manrope)',
    headingWeight: '700',
    description: 'Refined and polished. Geometric but soft — slightly more premium.',
  },
  {
    id: 'C',
    label: 'Option C — Outfit',
    headingVar: 'var(--font-outfit)',
    headingWeight: '600',
    description: 'Most minimal and modern. Clean but more neutral in character.',
  },
];

export default function FontPreview() {
  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-xs uppercase tracking-widest text-muted mb-2">Internal — Font Comparison</p>
        <h1 className="font-sans text-2xl font-semibold text-charcoal mb-1">TAT for Animals — Font Options</h1>
        <p className="font-sans text-sm text-muted mb-12">All options use DM Sans for body text. Heading font varies.</p>

        <div className="flex flex-col gap-16">
          {OPTIONS.map((opt) => (
            <div key={opt.id} className="border border-charcoal/10 rounded-2xl overflow-hidden">

              {/* Label bar */}
              <div className="bg-surface px-6 py-3 flex items-center justify-between">
                <span className="font-sans text-sm font-semibold text-charcoal">{opt.label}</span>
                <span className="font-sans text-xs text-muted">{opt.description}</span>
              </div>

              {/* Dark hero preview */}
              <div className="px-10 py-12" style={{ backgroundColor: '#2B4019' }}>
                <p
                  className="text-xs tracking-widest mb-4"
                  style={{ fontFamily: 'var(--font-dm-sans)', color: 'rgba(250,246,241,0.5)' }}
                >
                  {SAMPLE_LABEL}
                </p>
                <h2
                  className="mb-4 leading-tight"
                  style={{
                    fontFamily: opt.headingVar,
                    fontWeight: opt.headingWeight,
                    fontSize: '2.75rem',
                    color: '#FAF6F1',
                  }}
                >
                  {SAMPLE_HEADING}
                </h2>
                <p
                  className="mb-8 max-w-xl leading-relaxed"
                  style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1.05rem', color: 'rgba(250,246,241,0.75)' }}
                >
                  {SAMPLE_SUB}
                </p>
                <div className="flex gap-3">
                  <button
                    className="px-6 py-3 rounded-full text-sm font-semibold"
                    style={{ fontFamily: 'var(--font-dm-sans)', backgroundColor: '#D4703A', color: '#FAF6F1' }}
                  >
                    {SAMPLE_CTA}
                  </button>
                  <button
                    className="px-6 py-3 rounded-full text-sm font-semibold border"
                    style={{ fontFamily: 'var(--font-dm-sans)', borderColor: 'rgba(250,246,241,0.3)', color: '#FAF6F1' }}
                  >
                    Watch How It Works
                  </button>
                </div>
              </div>

              {/* Light section preview */}
              <div className="px-10 py-12 bg-cream">
                <p
                  className="text-xs tracking-widest mb-3"
                  style={{ fontFamily: 'var(--font-dm-sans)', color: '#D4703A' }}
                >
                  HOW IT WORKS
                </p>
                <h3
                  className="mb-4 leading-snug"
                  style={{
                    fontFamily: opt.headingVar,
                    fontWeight: opt.headingWeight,
                    fontSize: '2rem',
                    color: '#1C1007',
                  }}
                >
                  Simple. Gentle. Effective.
                </h3>
                <p
                  className="max-w-2xl leading-relaxed"
                  style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1rem', color: '#8B6F5E' }}
                >
                  {SAMPLE_BODY}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
