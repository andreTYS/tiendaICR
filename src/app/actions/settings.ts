'use server';

import { auth } from '@/modules/auth/infrastructure/authjs-config';
import { revalidatePath, revalidateTag } from 'next/cache';
import { updateSettings } from '@/modules/settings/application/update-settings';
import { prismaSettingsRepository } from '@/modules/settings/infrastructure/prisma-settings-repository';
import { prismaBannerRepository } from '@/modules/banners/infrastructure/prisma-banner-repository';
import type { Role } from '@/modules/auth/domain/user-role';

type ActionState = { error?: string } | null;

export async function updateSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const callerRole = session?.user?.role as Role | undefined;
  if (callerRole !== 'ADMIN') return { error: 'Sin permisos' };

  const rawMaxActive = formData.get('maxActiveBanners');
  const rawAnim = formData.get('animIntensity');
  const maxActiveBanners =
    rawMaxActive !== null ? parseInt(String(rawMaxActive), 10) : undefined;
  const animIntensity =
    rawAnim !== null ? parseFloat(String(rawAnim)) : undefined;

  const result = await updateSettings(
    {
      data: {
        heroDisplayMode: (formData.get('heroDisplayMode') as string) || undefined,
        maxActiveBanners:
          maxActiveBanners !== undefined && !isNaN(maxActiveBanners)
            ? maxActiveBanners
            : undefined,
        animIntensity:
          animIntensity !== undefined && !isNaN(animIntensity)
            ? animIntensity
            : undefined,
        defaultLocale: (formData.get('defaultLocale') as string) || undefined,
      },
      callerRole: 'ADMIN',
    },
    {
      repo: prismaSettingsRepository,
      countActiveBanners: () => prismaBannerRepository.countActive(),
    },
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      VALIDATION: 'Datos inválidos',
      WOULD_DEACTIVATE_BANNERS:
        'El nuevo máximo es menor que el número de banners activos actuales',
    };
    return { error: messages[result.error] ?? result.error };
  }

  revalidateTag('banners', { expire: 0 });
  revalidatePath('/admin/settings');
  revalidatePath('/');
  revalidatePath('/en');
  return null;
}
