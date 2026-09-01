import type { BannerRepository } from '../domain/banner-repository';
import type { StorageProvider } from '@/modules/media/domain/storage-provider';
import type { SettingsRepository } from '@/modules/settings/domain/settings-repository';
import { BannerCreateSchema } from '../domain/banner-schemas';
import { assertMaxActive } from '../domain/banner-invariants';
import { uploadImage } from '@/modules/media/application/upload-image';
import { ok, err, type Result } from '@/shared/lib/result';

export type CreateBannerError =
  | 'MAX_ACTIVE_REACHED'
  | 'INVALID_IMAGE'
  | 'VALIDATION'
  | 'STORAGE_FAILURE';

export interface CreateBannerInput {
  titleEs: string;
  titleEn?: string;
  descEs: string;
  descEn?: string;
  ctaLabelEs?: string;
  ctaLabelEn?: string;
  ctaHref?: string;
  imageBuffer: Buffer;
  imageMimeType: string;
  imageOriginalName: string;
  imageSize: number;
  isActive: boolean;
}

export interface CreateBannerDeps {
  repo: BannerRepository;
  storage: StorageProvider;
  settingsRepo: SettingsRepository;
}

export async function createBanner(
  input: CreateBannerInput,
  deps: CreateBannerDeps,
): Promise<Result<{ id: string }, CreateBannerError>> {
  // 1. Validate text fields
  const parsed = BannerCreateSchema.safeParse({
    titleEs: input.titleEs,
    titleEn: input.titleEn,
    descEs: input.descEs,
    descEn: input.descEn,
    ctaLabelEs: input.ctaLabelEs,
    ctaLabelEn: input.ctaLabelEn,
    ctaHref: input.ctaHref,
    isActive: input.isActive,
  });
  if (!parsed.success) return err('VALIDATION');

  // 2. Check max active before uploading (cheap guard first)
  if (parsed.data.isActive) {
    const settings = await deps.settingsRepo.get();
    const activeCount = await deps.repo.countActive();
    try {
      assertMaxActive(activeCount, settings.maxActiveBanners);
    } catch {
      return err('MAX_ACTIVE_REACHED');
    }
  }

  // 3. Upload image
  const uploadResult = await uploadImage(
    {
      buffer: input.imageBuffer,
      mimeType: input.imageMimeType,
      originalName: input.imageOriginalName,
      size: input.imageSize,
    },
    { storage: deps.storage },
  );

  if (!uploadResult.ok) {
    if (uploadResult.error === 'STORAGE_FAILURE') return err('STORAGE_FAILURE');
    return err('INVALID_IMAGE');
  }

  // 4. Persist banner
  const banner = await deps.repo.create({
    titleEs: parsed.data.titleEs,
    titleEn: parsed.data.titleEn,
    descEs: parsed.data.descEs,
    descEn: parsed.data.descEn,
    ctaLabelEs: parsed.data.ctaLabelEs,
    ctaLabelEn: parsed.data.ctaLabelEn,
    ctaHref: parsed.data.ctaHref,
    imageKey: uploadResult.value.key,
    isActive: parsed.data.isActive,
    order: 0,
  });

  return ok({ id: banner.id });
}
