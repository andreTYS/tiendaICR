'use server';

import { auth } from '@/modules/auth/infrastructure/authjs-config';
import { revalidatePath } from 'next/cache';
import { updateSiteContact } from '@/modules/site-contact/application/update-site-contact';
import { prismaSiteContactRepository } from '@/modules/site-contact/infrastructure/prisma-site-contact-repository';
import type { Role } from '@/modules/auth/domain/user-role';

type ActionState = { error?: string; ok?: true } | null;

const FIELDS = [
  'phone',
  'whatsapp',
  'email',
  'addressLine',
  'addressCity',
  'cities',
  'instagramUrl',
  'facebookUrl',
  'linkedinUrl',
  'tiktokUrl',
  'youtubeUrl',
  'twitterUrl',
] as const;

export async function updateSiteContactAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const callerRole = session?.user?.role as Role | undefined;
  if (callerRole !== 'ADMIN' && callerRole !== 'EDITOR') {
    return { error: 'Sin permisos' };
  }

  const data: Record<string, string> = {};
  for (const f of FIELDS) {
    const v = formData.get(f);
    if (v !== null) data[f] = String(v).trim();
  }

  const result = await updateSiteContact(
    { data, callerRole },
    { repo: prismaSiteContactRepository },
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      VALIDATION: 'Datos inválidos — revisa que los enlaces empiecen con http:// o https:// y que el email tenga un formato válido.',
      UNAUTHORIZED: 'Sin permisos',
    };
    return { error: messages[result.error] ?? result.error };
  }

  // Revalidate every surface that consumes site contact info.
  revalidatePath('/', 'layout');
  revalidatePath('/en', 'layout');
  revalidatePath('/contacto');
  revalidatePath('/en/contacto');
  revalidatePath('/admin/contacto');
  return { ok: true };
}
