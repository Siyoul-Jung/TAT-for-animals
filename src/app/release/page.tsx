import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Participant Release and License Agreement — TAT for Animals',
};

export default function Release() {
  return (
    <main
      className="min-h-screen pt-28 pb-24 px-6"
      style={{ backgroundColor: 'oklch(98% 0.016 73.684)' }}
    >
      <div className="max-w-2xl mx-auto">

        <p
          className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5"
          style={{ color: '#38601E' }}
        >
          Legal
        </p>

        <h1
          className="font-serif text-3xl sm:text-4xl font-medium mb-3 leading-tight"
          style={{ color: '#1C1007' }}
        >
          TATLife&reg; Participant Release and License Agreement
        </h1>

        <p className="text-base leading-relaxed mb-10" style={{ color: 'rgba(28,16,7,0.65)' }}>
          For submissions of stories, photos, and related content (e.g., animal/TAT experiences)
        </p>

        <p className="text-base leading-relaxed mb-8" style={{ color: '#1C1007' }}>
          Thank you for sharing your experience with Tapas Acupressure Technique&reg; (TAT&reg;).
          Before you submit your story, please read and agree to the terms below.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-xl font-medium mb-2" style={{ color: '#1C1007' }}>
              1. What You&rsquo;re Submitting
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#1C1007' }}>
              This release applies to any story, testimonial, photo, video, or other content
              (&ldquo;Submission&rdquo;) that you voluntarily provide to TATLife&reg;, Inc.
              (&ldquo;TATLife,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) through our website,
              forms, email, or social media, describing your or your animal&rsquo;s experience
              with TAT.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-2" style={{ color: '#1C1007' }}>
              2. Your Grant of Rights
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#1C1007' }}>
              By submitting your story and/or photos, you grant TATLife a non-exclusive,
              worldwide, royalty-free, perpetual license to use, reproduce, edit, excerpt, and
              publish your Submission &mdash; including your name, your animal&rsquo;s name, and
              any photos or videos you provide &mdash; for marketing, educational, and promotional
              purposes. This includes use on our websites, social media, email newsletters, print
              materials, and other promotional channels.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-2" style={{ color: '#1C1007' }}>
              3. No Obligation to Use
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#1C1007' }}>
              Submitting your story does not guarantee it will be published or featured. TATLife
              may choose, at its sole discretion, whether, when, and how to use any Submission,
              and may decline to use it for any reason.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-2" style={{ color: '#1C1007' }}>
              4. Editing
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#1C1007' }}>
              TATLife may edit your Submission for length, clarity, or format (for example,
              shortening a story for a testimonial page). We will not materially change the
              meaning of your story without your consent.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-2" style={{ color: '#1C1007' }}>
              5. Your Confirmation
            </h2>
            <p className="text-base leading-relaxed mb-3" style={{ color: '#1C1007' }}>
              By submitting, you confirm that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed" style={{ color: '#1C1007' }}>
              <li>
                The Submission is your own original content (or you have the right to share it,
                including permission from anyone else identifiable in a photo or video);
              </li>
              <li>The information you&rsquo;re sharing is true to your own experience;</li>
              <li>
                You are 18 years of age or older, or a parent/guardian has provided this consent
                on behalf of a minor.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-2" style={{ color: '#1C1007' }}>
              6. Compensation
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#1C1007' }}>
              Submissions are voluntary. No payment or compensation will be provided for the use
              of your story, name, or photos.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-2" style={{ color: '#1C1007' }}>
              7. Revoking Permission
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#1C1007' }}>
              You may withdraw your permission at any time by emailing{' '}
              <a
                href="mailto:tapas@tatforanimals.com"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                style={{ color: '#38601E' }}
              >
                tapas@tatforanimals.com
              </a>{' '}
              and requesting removal. We will make reasonable efforts to remove your Submission
              from future use, but this may not be possible for materials already printed,
              distributed, or shared by third parties.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium mb-2" style={{ color: '#1C1007' }}>
              8. No Health Claims
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#1C1007' }}>
              TAT is not a substitute for veterinary or medical care. Your story reflects your
              personal experience and is not a claim that TAT will produce the same results for
              others.
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}
