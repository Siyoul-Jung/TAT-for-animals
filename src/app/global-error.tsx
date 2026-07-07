'use client'

// global-error.tsx catches errors thrown in the ROOT layout itself — the one
// place app/error.tsx cannot reach. It replaces the entire document, so it must
// render its own <html>/<body> and can't rely on the app's CSS/providers being
// intact; hence inline styles only.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#FBF5F3', fontFamily: 'Georgia, serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 420 }}>
            <p
              style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: 13,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: '#467826',
                margin: '0 0 20px',
              }}
            >
              TAT for Animals
            </p>
            <h1 style={{ fontSize: 30, color: '#1C1007', lineHeight: 1.2, margin: '0 0 16px' }}>
              Something went wrong.
            </h1>
            <p
              style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: 16,
                lineHeight: 1.7,
                color: 'rgba(28,16,7,0.65)',
                margin: '0 0 28px',
              }}
            >
              We hit an unexpected problem. Please try again — if it keeps happening,
              email us at{' '}
              <a href="mailto:hello@tatforanimals.com" style={{ color: '#467826' }}>
                hello@tatforanimals.com
              </a>
              .
            </p>
            <button
              onClick={reset}
              style={{
                minHeight: 52,
                padding: '0 32px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: '#FBF5F3',
                background: '#D4703A',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
