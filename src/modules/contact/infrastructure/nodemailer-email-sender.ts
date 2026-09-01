/**
 * Nodemailer email sender — flag-gated by CONTACT_EMAIL_ENABLED=true.
 * If disabled, exports noopEmailSender (no-op) as the default.
 *
 * Decision: open-questions-resolved #2 — SMTP optional, flag-gated.
 */
import type { EmailSender, EmailNotification } from '../domain/email-sender';

/** No-op sender used when CONTACT_EMAIL_ENABLED is false/unset */
export const noopEmailSender: EmailSender = {
  async sendAdminNotification(_notification: EmailNotification): Promise<void> {
    // intentionally empty — email is disabled
  },
};

/** Build the real nodemailer sender. Called lazily to avoid import errors when nodemailer is absent. */
async function buildNodemailerSender(): Promise<EmailSender> {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return {
    async sendAdminNotification(notification: EmailNotification): Promise<void> {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
        to: process.env.SMTP_USER, // notify the admin account
        subject: notification.subject,
        text: notification.text,
        html: notification.html,
      });
    },
  };
}

/**
 * Returns the active email sender based on CONTACT_EMAIL_ENABLED env var.
 * Call this once at the composition root (server action).
 */
export async function getEmailSender(): Promise<EmailSender> {
  if (process.env.CONTACT_EMAIL_ENABLED === 'true') {
    return buildNodemailerSender();
  }
  return noopEmailSender;
}
