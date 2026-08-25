import type { Metadata } from 'next';
import TermageddonPolicy from '@/components/TermageddonPolicy';

export const metadata: Metadata = {
  title: 'Disclaimer — TAT for Animals',
};

export default function Disclaimer() {
  return (
    <main
      className="min-h-screen pt-28 pb-24 px-6"
      style={{ backgroundColor: 'oklch(98% 0.016 73.684)' }}
    >
      <div className="max-w-2xl mx-auto">

        <p
          className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5"
          style={{ color: '#38601E' }}
        >
          Legal
        </p>

        <h1
          className="font-serif text-3xl sm:text-4xl font-medium mb-8 leading-tight"
          style={{ color: '#1C1007' }}
        >
          Disclaimer
        </h1>

        <TermageddonPolicy policyId="WTJaSmJrcHpkV2RYTDNwQlQxRTlQUT09" />

      </div>
    </main>
  );
}
