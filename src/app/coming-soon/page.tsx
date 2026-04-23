export default function ComingSoon() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ backgroundColor: '#2B4019' }}
    >
      {/* Image — natural ratio, centered, fades into background */}
      <div className="absolute inset-0 flex items-center justify-center pt-16">
        <div className="relative" style={{ height: '80vh', aspectRatio: '3/4' }}>
          <img
            src="/images/hero/nataliia-kvitovska-usf9JldTW_Y-unsplash.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover rounded-3xl"
            style={{ opacity: 0.5 }}
          />
          {/* Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 90% 90% at 50% 50%,
                transparent 20%,
                rgba(43,64,25,0.5) 60%,
                rgba(43,64,25,1) 100%
              )`,
            }}
          />
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 text-center flex flex-col items-center gap-3">
        <h1
          className="text-3xl sm:text-4xl font-medium leading-tight"
          style={{
            fontFamily: 'var(--font-dm-serif)',
            color: '#FAF6F1',
          }}
        >
          Help your animal feel<br />calm and at ease.
        </h1>
        <style>{`
          @keyframes breathe {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 1; }
          }
        `}</style>
        <p
          className="text-sm font-light tracking-[0.25em] uppercase"
          style={{
            color: 'rgba(250,246,241,0.85)',
            animation: 'breathe 3.5s ease-in-out infinite',
          }}
        >
          On its way
        </p>
      </div>
    </main>
  );
}
