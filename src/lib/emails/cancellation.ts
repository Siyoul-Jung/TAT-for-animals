import { emailShell } from './layout';

// The "it's really over" email — sent when the subscription actually ends at
// period end (Stripe customer.subscription.deleted). Its near-twin,
// cancellation-scheduled.ts, is what goes out immediately when the member
// schedules the cancellation. The two deliberately read differently: Tapas's
// wording below is final ("has been cancelled"), which would be wrong on the
// scheduled one while the member still has weeks of access (approved
// 2026-09-06). No name here — the copy is Tapas's, word for word.
export function cancellationEmail(): { subject: string; html: string } {
  const subject = `Your TAT for Animals membership has been cancelled`;

  // No CTA by design: someone who just cancelled shouldn't be sold to.
  // The job here is reassurance — confirm it's done, and leave the door open warmly.
  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:30px;font-weight:500;color:#1C1007;line-height:1.3;">
                Your subscription has been cancelled.
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                Wishing you well on your path forward.
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                You're welcome to return anytime.
              </p>`;

  const html = emailShell({
    title: subject,
    eyebrow: 'Membership',
    content,
  });

  return { subject, html };
}
