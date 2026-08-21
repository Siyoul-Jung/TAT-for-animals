import Link from 'next/link';
import { BOOKING_URL } from '@/lib/links';
import ContactForm from './ContactForm';

export default function Contact() {
  return (
    <main
      className="min-h-screen pt-28 pb-24 px-6"
      style={{ backgroundColor: 'oklch(98% 0.016 73.684)' }}
    >
      <div className="max-w-2xl mx-auto">

        <p
          className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5"
          style={{ color: '#467826' }}
        >
          Contact
        </p>

        <h1
          className="font-serif text-3xl sm:text-4xl font-medium mb-6 leading-tight"
          style={{ color: '#1C1007' }}
        >
          Get in touch.
        </h1>

        <p
          className="text-base leading-relaxed mb-10"
          style={{ color: 'rgba(28,16,7,0.65)' }}
        >
          Whether you have a question about membership, need help with your account,
          or just want to share how TAT has helped your animal — we'd love to hear from you.
        </p>

        <ContactForm />

        <p
          className="text-sm mt-6"
          style={{ color: 'rgba(28,16,7,0.65)' }}
        >
          Prefer email? Write to us directly at{' '}
          <a
            href="mailto:hello@tatforanimals.com"
            className="font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: '#467826' }}
          >
            hello@tatforanimals.com
          </a>
          . We typically respond within 1–2 business days.
        </p>

        <div
          className="mt-10 pt-8 space-y-3 text-base leading-relaxed"
          style={{ borderTop: '1px solid #F2EAE0', color: 'rgba(28,16,7,0.65)' }}
        >
          <p>
            Many common questions are already answered in our{' '}
            <Link
              href="/faq"
              className="underline underline-offset-2"
              style={{ color: '#467826' }}
            >
              FAQ
            </Link>
            .
          </p>
          <p>
            Prefer to work with Tapas one-on-one? You can{' '}
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: '#467826' }}
            >
              book a private session ↗
            </a>
            .
          </p>
          {/* Same warm invitation as the dashboard/library links (Tapas, 2026-08-20:
              "repeat the same warm invitation... in our Contact form text"). Members-only
              destination — a guest who clicks is routed to join by /share-story itself. */}
          <p>
            How has TAT helped your animal, and you? We&rsquo;d love to hear it — you can{' '}
            <Link
              href="/share-story"
              className="underline underline-offset-2"
              style={{ color: '#467826' }}
            >
              share your story
            </Link>
            , and with your okay, we&rsquo;ll share it to encourage others.
          </p>
        </div>

      </div>
    </main>
  );
}
