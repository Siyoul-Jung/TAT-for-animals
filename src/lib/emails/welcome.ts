import { emailShell, emailButton } from './layout';

type Plan = 'subscriber' | 'pro_subscriber';

const PLAN_NAMES: Record<Plan, string> = {
  subscriber: 'The Calm Library',
  pro_subscriber: 'The Calm Circle',
};

const LIBRARY_URL = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tatforanimals.com'}/library`;

export function welcomeEmail(name: string | null, plan: Plan): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] ?? 'there';
  const planName = PLAN_NAMES[plan];
  const isCircle = plan === 'pro_subscriber';

  const subject = `Welcome to TAT for Animals, ${firstName}`;

  // What they get — one calm line, adapts to the tier (no decorative list).
  const summary = isCircle
    ? 'Your full video library and monthly live webinars with Tapas are ready whenever you are.'
    : 'Your full video library is ready whenever you are.';

  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:30px;font-weight:500;color:#1C1007;line-height:1.3;">
                Welcome, ${firstName}.
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                You've joined <strong style="font-weight:600;">${planName}</strong>.
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                ${summary}
              </p>
              ${emailButton(LIBRARY_URL, 'Go to your library &rarr;')}`;

  const html = emailShell({
    title: subject,
    eyebrow: 'Welcome',
    content,
    footerNote: 'Cancel anytime from your account settings.',
  });

  return { subject, html };
}
