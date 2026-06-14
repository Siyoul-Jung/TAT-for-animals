import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-cream flex items-center justify-center px-6 pt-32 pb-20">
      <div className="w-full max-w-md text-center space-y-6">
        <p className="text-[13px] tracking-[0.2em] uppercase font-semibold" style={{ color: '#467826' }}>
          TAT for Animals
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal leading-[1.2]">
          We couldn&apos;t find that page.
        </h1>
        <p className="text-charcoal/65 text-base leading-relaxed">
          The page you&apos;re looking for may have moved, or the link might be broken.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-bold text-[19px] text-cream transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.20)' }}
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
