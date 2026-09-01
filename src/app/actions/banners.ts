'use server';

import { auth } from '@/modules/auth/infrastructure/authjs-config';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createBanner } from '@/modules/banners/application/create-banner';
import { updateBanner } from '@/modules/banners/application/update-banner';
import { deleteBanner } from '@/modules/banners/application/delete-banner';
import { reorderBanners } from '@/modules/banners/application/reorder-banners';
import { prismaBannerRepository } from '@/modules/banners/infrastructure/prisma-banner-repository';
import { localDiskStorage } from '@/modules/media/infrastructure/local-disk-storage';
import { prismaSettingsRepository } from '@/modules/settings/infrastructure/prisma-settings-repository';
import type { Role } from '@/modules/auth/domain/user-role';

type ActionState = { error?: string } | null;

async function getRole(): Promise<Role | null> {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!role || !['ADMIN', 'EDITOR'].includes(role)) return null;
  return role;
}

function invalidateBanners() {
  revalidateTag('banners', { expire: 0 });
  revalidatePath('/admin/banners');
  revalidatePath('/');
  revalidatePath('/en');
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createBannerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const file = formData.get('image') as File | null;
  if (!file || file.size === 0) return { error: 'La imagen es obligatoria' };

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await createBanner(
    {
      titleEs: String(formData.get('titleEs') ?? ''),
      titleEn: (formData.get('titleEn') as string) || undefined,
      descEs: String(formData.get('descEs') ?? ''),
      descEn: (formData.get('descEn') as string) || undefined,
      ctaLabelEs: (formData.get('ctaLabelEs') as string) || undefined,
      ctaLabelEn: (formData.get('ctaLabelEn') as string) || undefined,
      ctaHref: (formData.get('ctaHref') as string) || undefined,
      isActive: formData.get('isActive') === 'on',
      imageBuffer: buffer,
      imageMimeType: file.type,
      imageOriginalName: file.name,
      imageSize: file.size,
    },
    {
      repo: prismaBannerRepository,
      storage: localDiskStorage,
      settingsRepo: prismaSettingsRepository,
    },
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      MAX_ACTIVE_REACHED: 'Límite de banners activos alcanzado',
      INVALID_IMAGE: 'Imagen inválida (formato o tamaño)',
      VALIDATION: 'Datos inválidos',
      STORAGE_FAILURE: 'Error al guardar la imagen',
    };
    return { error: messages[result.error] ?? result.error };
  }

  invalidateBanners();
  redirect('/admin/banners');
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateBannerAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await updateBanner(
    {
      id,
      patch: {
        titleEs: (formData.get('titleEs') as string) || undefined,
        titleEn: (formData.get('titleEn') as string) || undefined,
        descEs: (formData.get('descEs') as string) || undefined,
        descEn: (formData.get('descEn') as string) || undefined,
        ctaLabelEs: (formData.get('ctaLabelEs') as string) || undefined,
        ctaLabelEn: (formData.get('ctaLabelEn') as string) || undefined,
        ctaHref: (formData.get('ctaHref') as string) || undefined,
        isActive:
          formData.has('isActive') ? formData.get('isActive') === 'on' : undefined,
      },
    },
    {
      repo: prismaBannerRepository,
      storage: localDiskStorage,
      settingsRepo: prismaSettingsRepository,
    },
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      NOT_FOUND: 'Banner no encontrado',
      MAX_ACTIVE_REACHED: 'Límite de banners activos alcanzado',
      VALIDATION: 'Datos inválidos',
    };
    return { error: messages[result.error] ?? result.error };
  }

  invalidateBanners();
  redirect('/admin/banners');
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteBannerAction(id: string): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await deleteBanner(
    { id },
    { repo: prismaBannerRepository, storage: localDiskStorage },
  );

  if (!result.ok) return { error: 'Banner no encontrado' };

  invalidateBanners();
  return null;
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export async function reorderBannersAction(input: {
  orderedIds: string[];
}): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await reorderBanners(input, { repo: prismaBannerRepository });
  if (!result.ok) return { error: 'Error al reordenar' };

  invalidateBanners();
  return null;
}

// ─── Toggle active ────────────────────────────────────────────────────────────

export async function toggleActiveAction(input: {
  id: string;
  isActive: boolean;
}): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await updateBanner(
    { id: input.id, patch: { isActive: input.isActive } },
    {
      repo: prismaBannerRepository,
      storage: localDiskStorage,
      settingsRepo: prismaSettingsRepository,
    },
  );

  if (!result.ok) {
    if (result.error === 'MAX_ACTIVE_REACHED')
      return { error: 'Límite de banners activos alcanzado' };
    return { error: result.error };
  }

  invalidateBanners();
  return null;
}
