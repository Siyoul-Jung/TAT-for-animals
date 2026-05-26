export default function Terms() {
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
          Terms of Service
        </h1>

        <p className="text-sm mb-12" style={{ color: 'rgba(28,16,7,0.40)' }}>
          Last updated: May 2026
        </p>

        <div className="space-y-10 text-base leading-relaxed" style={{ color: 'rgba(28,16,7,0.65)' }}>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Overview
            </h2>
            <p>
              These terms govern your use of tatforanimals.com and your membership with
              TATLife®, Inc. By creating an account or subscribing, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Membership & billing
            </h2>
            <ul className="space-y-3 pl-4">
              <li>• Memberships are billed monthly and renew automatically on your billing date.</li>
              <li>• You can cancel at any time — your access continues until the end of the current billing period.</li>
              <li>• We offer two membership tiers: The Calm Library ($27/month) and The Calm Circle ($47/month).</li>
              <li>• Prices are listed in USD and may be subject to applicable taxes.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Refunds
            </h2>
            <p>
              Because our content is delivered digitally and immediately upon subscription,
              we generally do not offer refunds. If you believe there has been a billing error
              or have a special circumstance, please contact us at{' '}
              <a href="mailto:customerservice@tatlife.com" style={{ color: '#D4703A' }}>
                customerservice@tatlife.com
              </a>{' '}
              and we'll do our best to help.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Content access
            </h2>
            <ul className="space-y-3 pl-4">
              <li>• All video content is for personal, non-commercial use only.</li>
              <li>• You may not share, redistribute, record, or resell any content from this platform.</li>
              <li>• Access to content is tied to your active membership. Cancellation ends access at the close of your billing period.</li>
              <li>• We reserve the right to update, add, or remove content from the library over time.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Your account
            </h2>
            <p>
              You are responsible for keeping your login credentials secure. Please do not
              share your account with others — memberships are for individual use.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Animal Care Disclaimer
            </h2>
            <p className="mb-4">
              The information, techniques, and guidance provided through TATLife&apos;s TAT® for Animals
              content — including streaming videos, webinar recordings, written guides, and Certified TAT
              Professional or Trainer sessions — are offered for educational and wellness support purposes
              only. Tapas Acupressure Technique® (TAT®) is a complementary wellness modality and is not
              a substitute for professional veterinary care, diagnosis, or treatment.
            </p>
            <p className="mb-4">By accessing or using any TAT® for Animals content, you acknowledge and agree to the following:</p>
            <ul className="space-y-3 pl-4">
              <li>• <strong style={{ color: '#1C1007' }}>Not veterinary advice.</strong> Nothing in this content constitutes veterinary medical advice, and no veterinarian-client-patient relationship is created by your use of TATLife materials.</li>
              <li>• <strong style={{ color: '#1C1007' }}>Consult your veterinarian.</strong> Always seek the guidance of a licensed veterinarian for any health concerns, injuries, illnesses, behavioral issues, or medical conditions affecting your animal. Do not delay or disregard professional veterinary advice based on anything you learn through TAT® for Animals content.</li>
              <li>• <strong style={{ color: '#1C1007' }}>Individual results vary.</strong> Animals respond differently to wellness practices. TATLife makes no guarantees, representations, or warranties — express or implied — regarding specific outcomes for any individual animal.</li>
              <li>• <strong style={{ color: '#1C1007' }}>Assumption of risk.</strong> You assume full responsibility for how you apply TAT® techniques with your animal. TATLife, its founder, Certified TAT Professionals, and Trainers are not liable for any injury, harm, or adverse outcome to you or your animal arising from the use of this content.</li>
              <li>• <strong style={{ color: '#1C1007' }}>Scope of practice.</strong> Certified TAT Professionals and Trainers are not licensed veterinarians unless separately credentialed as such. Certified TAT Professionals and Trainers offering TAT® for Animals sessions do so within the scope of their TAT® training only and are not providing veterinary services.</li>
              <li>• <strong style={{ color: '#1C1007' }}>Emergency situations.</strong> If your animal is experiencing a medical emergency, contact a licensed veterinarian or emergency animal hospital immediately. TAT® is not appropriate as a sole response to acute illness or injury.</li>
            </ul>
            <p className="mt-4">
              TATLife reserves the right to update this disclaimer at any time. Continued use of TAT® for
              Animals content constitutes acceptance of the current disclaimer.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Changes to these terms
            </h2>
            <p>
              We may update these terms from time to time. If we make significant changes,
              we'll notify you by email. Continued use of the platform after changes
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#1C1007' }}>
              Contact
            </h2>
            <p>
              Questions about these terms? Email us at{' '}
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
