export default function Privacy() {
  return (
    <main
      className="min-h-screen pt-28 pb-24 px-6"
      style={{ backgroundColor: 'oklch(98% 0.016 73.684)' }}
    >
      <div className="max-w-2xl mx-auto">

        <p
          className="text-xs tracking-[0.2em] uppercase font-semibold mb-5"
          style={{ color: '#5E9635' }}
        >
          Legal
        </p>

        <h1
          className="font-serif text-3xl sm:text-4xl font-medium mb-3 leading-tight"
          style={{ color: '#1C1007' }}
        >
          Privacy Policy
        </h1>

        <p className="text-sm mb-12" style={{ color: 'rgba(28,16,7,0.65)' }}>
          Last updated: May 2026
        </p>

        <div className="space-y-10 text-base leading-relaxed" style={{ color: 'rgba(28,16,7,0.65)' }}>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Who we are
            </h2>
            <p>
              TAT for Animals is operated by TATLife®, Inc. When you use this website or
              become a member, you're sharing some information with us. This policy explains
              what we collect, why, and how we protect it.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              What we collect
            </h2>
            <p className="mb-4">
              We only collect what we need to provide your membership:
            </p>
            <ul className="space-y-2 pl-4">
              <li>• Your email address and name (when you create an account)</li>
              <li>• Payment information (processed securely by Stripe — we never see your card details)</li>
              <li>• Your subscription status and billing history</li>
              <li>• Basic usage data (which content you've accessed)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              How we use it
            </h2>
            <ul className="space-y-2 pl-4">
              <li>• To provide access to your membership content</li>
              <li>• To send you webinar invitations, recording notifications, and account emails</li>
              <li>• To manage your subscription and billing</li>
              <li>• To improve the platform over time</li>
            </ul>
            <p className="mt-4">
              We do not sell your information. We do not use it for advertising.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Third-party services
            </h2>
            <p className="mb-4">
              We use a small number of trusted services to run this platform:
            </p>
            <ul className="space-y-2 pl-4">
              <li>• <strong>Stripe</strong> — payment processing and subscription billing</li>
              <li>• <strong>Supabase</strong> — secure account and data storage</li>
              <li>• <strong>Resend</strong> — transactional email delivery</li>
              <li>• <strong>Vimeo</strong> — video hosting and delivery</li>
            </ul>
            <p className="mt-4">
              Each of these services has its own privacy policy and handles your data
              in accordance with applicable law.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Cookies
            </h2>
            <p>
              We use only essential cookies — the kind that keep you logged in and your
              session secure. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Your rights
            </h2>
            <p className="mb-4">
              You can request to access, correct, or delete your personal data at any time.
              To do so, email us at{' '}
              <a href="mailto:customerservice@tatlife.com" style={{ color: '#D4703A' }}>
                customerservice@tatlife.com
              </a>
              .
            </p>
            <p>
              If you cancel your membership, your account data is retained for 30 days
              before being permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Questions
            </h2>
            <p>
              If you have any questions about this policy, reach out at{' '}
              <a href="mailto:customerservice@tatlife.com" style={{ color: '#D4703A' }}>
                customerservice@tatlife.com
              </a>
              .
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
