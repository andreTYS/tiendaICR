'use server';

import { createHash } from 'crypto';
import { headers } from 'next/headers';
import { submitContactMessage } from '@/modules/contact/application/submit-contact-message';
import { prismaContactRepository } from '@/modules/contact/infrastructure/prisma-contact-repository';
import { getEmailSender } from '@/modules/contact/infrastructure/nodemailer-email-sender';
import { markContactAsRead } from '@/modules/contact/application/mark-contact-as-read';
import { deleteContactMessage } from '@/modules/contact/application/delete-contact-message';
import { revalidatePath } from 'next/cache';

export interface ContactActionResult {
  success: boolean;
  error?: string;
}

function hashIp(ip: string): string {
  const secret = process.env.AUTH_SECRET ?? 'default-secret';
  return createHash('sha256')
    .update(ip + secret)
    .digest('hex')
    .slice(0, 16);
}

export async function submitContact(
  formData: FormData,
): Promise<ContactActionResult> {
  const hdrs = await headers();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    hdrs.get('x-real-ip') ??
    'unknown';

  const ipHash = hashIp(ip);
  const emailSender = await getEmailSender();
  const sendEmail = process.env.CONTACT_EMAIL_ENABLED === 'true';

  const result = await submitContactMessage(
    {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: formData.get('phone') ? String(formData.get('phone')) : undefined,
      subject: formData.get('subject')
        ? String(formData.get('subject'))
        : undefined,
      body: String(formData.get('message') ?? formData.get('body') ?? ''),
      ipHash,
    },
    { repo: prismaContactRepository, emailSender, sendEmail },
  );

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  revalidatePath('/admin/mensajes');
  return { success: true };
}

export async function markContactAsReadAction(id: string): Promise<void> {
  await markContactAsRead({ id }, { repo: prismaContactRepository });
  revalidatePath('/admin/mensajes');
}

export async function deleteContactAction(id: string): Promise<void> {
  await deleteContactMessage({ id }, { repo: prismaContactRepository });
  revalidatePath('/admin/mensajes');
}
