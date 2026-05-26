import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = 'TAT for Animals <hello@tatforanimals.com>';
