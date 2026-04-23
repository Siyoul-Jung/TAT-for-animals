import LogoMark from '@/components/LogoMark';

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed top-0 left-0 z-50 px-6 py-4 flex items-center gap-2.5">
        <LogoMark size={34} orange="#D4703A" green="#9AAD84" />
        <span
          className="text-xl tracking-wide"
          style={{ fontFamily: 'var(--font-dm-sans)', color: '#FAF6F1' }}
        >
          TAT for Animals<span style={{ color: '#D4703A' }}>®</span>
        </span>
      </div>
      {children}
    </>
  );
}
