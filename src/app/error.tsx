'use client'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[70vh] bg-cream flex items-center justify-center px-6 pt-32 pb-20">
      <div className="w-full max-w-md text-center space-y-6">
        <p className="text-[13px] tracking-[0.2em] uppercase font-semibold" style={{ color: '#467826' }}>
          TAT for Animals
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal leading-[1.2]">
          Something went wrong.
        </h1>
        <p className="text-charcoal/65 text-base leading-relaxed">
          We hit an unexpected problem. Please try again — if it keeps happening,
          email us at{' '}
          <a href="mailto:hello@tatforanimals.com" className="text-green hover:underline">
            hello@tatforanimals.com
          </a>
          .
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-bold text-[19px] text-cream transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.20)' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
