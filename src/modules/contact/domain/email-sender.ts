export interface EmailNotification {
  subject: string;
  text: string;
  html?: string;
}

/** Port — implemented by NodemailerEmailSender in infra (flag-gated) */
export interface EmailSender {
  sendAdminNotification(notification: EmailNotification): Promise<void>;
}
