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

        <a
          href="mailto:hello@tatforanimals.com"
          className="inline-flex items-center gap-2 text-base font-medium transition-opacity hover:opacity-70"
          style={{ color: '#D4703A' }}
        >
          hello@tatforanimals.com
        </a>

        <p
          className="text-sm mt-4"
          style={{ color: 'rgba(28,16,7,0.65)' }}
        >
          We typically respond within 1–2 business days.
        </p>

      </div>
    </main>
  );
}
