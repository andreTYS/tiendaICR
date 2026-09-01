import { ok, err, type Result } from '@/shared/lib/result';
import type { ContactMessage } from '../domain/contact-message';
import type { ContactMessageRepository } from '../domain/contact-message-repository';
import type { EmailSender } from '../domain/email-sender';
import type { ContactError } from '../domain/contact-errors';
import { ContactSubmitSchema } from '../domain/contact-schemas';

interface SubmitInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  body: string;
  ipHash?: string;
}

interface Deps {
  repo: ContactMessageRepository;
  emailSender: EmailSender;
  sendEmail: boolean;
}

export async function submitContactMessage(
  input: SubmitInput,
  deps: Deps,
): Promise<Result<ContactMessage, ContactError>> {
  const parsed = ContactSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return err('VALIDATION' as ContactError);
  }

  const data = parsed.data;
  const message = await deps.repo.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    body: data.body,
    ipHash: input.ipHash,
  });

  if (deps.sendEmail) {
    try {
      await deps.emailSender.sendAdminNotification({
        subject: `Nuevo mensaje de contacto de ${data.name}`,
        text: `De: ${data.name} <${data.email}>\nAsunto: ${data.subject ?? 'Sin asunto'}\n\n${data.body}`,
        html: `<p><strong>De:</strong> ${data.name} &lt;${data.email}&gt;</p><p><strong>Asunto:</strong> ${data.subject ?? 'Sin asunto'}</p><p>${data.body.replace(/\n/g, '<br>')}</p>`,
      });
    } catch {
      // Email failure is non-fatal — message is already persisted
    }
  }

  return ok(message);
}
