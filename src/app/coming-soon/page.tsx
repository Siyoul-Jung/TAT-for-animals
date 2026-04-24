export default function ComingSoon() {
  return (
    <main
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'oklch(98% 0.016 73.684)' }}
    >
      {/* Image + text — stacked inside one container */}
      <div className="relative pt-16" style={{ height: '80vh', aspectRatio: '3/4' }}>

        <img
          src="/images/hero/nataliia-kvitovska-usf9JldTW_Y-unsplash.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover rounded-3xl"
          style={{ opacity: 1 }}
        />

        {/* Bottom fade — fades to warm cream */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(to top, oklch(98% 0.016 73.684) 0%, transparent 45%)',
          }}
        />

        {/* Text — anchored to bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 pb-10 text-center flex flex-col items-center gap-3">
          <p
            className="text-xs tracking-[0.2em] uppercase font-light"
            style={{ color: 'rgba(28,16,7,0.45)' }}
          >
            Tapas Fleming · TATLife®
          </p>
          <h1
            className="text-2xl sm:text-3xl font-medium leading-tight"
            style={{ fontFamily: 'var(--font-dm-sans)', color: '#1C1007' }}
          >
            Help your animal feel<br />calm and at ease.
          </h1>
          <style>{`
            @keyframes breathe {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
          `}</style>
          <p
            className="text-sm font-light tracking-[0.25em] uppercase"
            style={{
              color: 'rgba(28,16,7,0.85)',
              animation: 'breathe 3.5s ease-in-out infinite',
            }}
          >
            On its way
          </p>
        </div>

      </div>
    </main>
  );
}
