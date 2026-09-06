import { emailShell, escapeHtml, firstNameOf } from './layout';

// Sent the moment a cancellation is scheduled, not when it actually takes
// effect — that's cancellation.ts, which fires weeks later at period end.
// Without this one, a member who cancels gets no confirmation at all until
// the period genuinely ends. Call sites: the Stripe webhook
// (customer.subscription.updated, on the cancel_at null→set transition) and
// /api/paypal/cancel (the dashboard's PayPal cancel button).
export function cancellationScheduledEmail(
  name: string | null,
  accessUntil: string,
): { subject: string; html: string } {
  const firstName = firstNameOf(name);
  const subject = `Your cancellation is scheduled`;

  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:30px;font-weight:500;color:#1C1007;line-height:1.3;">
                We're sorry to see you go${firstName ? `, ${escapeHtml(firstName)}` : ''}.
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                Your cancellation has been scheduled.
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                You'll keep full access until <strong style="font-weight:600;color:#1C1007;">${accessUntil}</strong>, then your membership will end. You're welcome to return anytime.
              </p>`;

  const html = emailShell({
    title: subject,
    eyebrow: 'Membership',
    content,
  });

  return { subject, html };
}
