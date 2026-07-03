import { emailShell, escapeHtml, firstNameOf } from './layout';

// The "it's really over" email — sent when the subscription actually ends at
// period end (Stripe customer.subscription.deleted). Its near-twin,
// cancellation-scheduled.ts, is what goes out immediately when the member
// schedules the cancellation; edit copy in both when changing either.
export function cancellationEmail(name: string | null): { subject: string; html: string } {
  const firstName = firstNameOf(name);
  const subject = `Your TAT for Animals membership has been cancelled`;

  // No CTA by design: someone who just cancelled shouldn't be sold to.
  // The job here is reassurance — confirm it's done, and leave the door open warmly.
  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:30px;font-weight:500;color:#1C1007;line-height:1.3;">
                We're sorry to see you go, ${escapeHtml(firstName)}.
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                Your membership has been cancelled.
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                You'll keep full access until the end of your current billing period. You're welcome to return anytime.
              </p>`;

  const html = emailShell({
    title: subject,
    eyebrow: 'Membership',
    content,
  });

  return { subject, html };
}
