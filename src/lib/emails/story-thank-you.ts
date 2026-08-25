import { emailShell, escapeHtml, firstNameOf } from './layout';

export function storyThankYouEmail(name: string | null): { subject: string; html: string } {
  const firstName = firstNameOf(name);
  const subject = `Thank you for sharing your story, ${firstName}`;

  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:28px;font-weight:500;color:#1C1007;line-height:1.3;">
                Thank you, ${escapeHtml(firstName)}.
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                Your story means so much to us — and to every animal and person it might touch.
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                Tapas reads every story herself, and may reach out if she&rsquo;d like to share yours to
                encourage others on the same path.
              </p>`;

  const html = emailShell({
    title: subject,
    eyebrow: 'Thank You',
    content,
    footerNote: 'You received this because you shared your story with TAT for Animals.',
  });

  return { subject, html };
}
