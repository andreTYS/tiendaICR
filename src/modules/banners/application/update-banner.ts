import type { BannerRepository } from '../domain/banner-repository';
import type { StorageProvider } from '@/modules/media/domain/storage-provider';
import type { SettingsRepository } from '@/modules/settings/domain/settings-repository';
import { BannerUpdateSchema } from '../domain/banner-schemas';
import { assertMaxActive } from '../domain/banner-invariants';
import { ok, err, type Result } from '@/shared/lib/result';

export type UpdateBannerError =
  | 'MAX_ACTIVE_REACHED'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'INVALID_IMAGE'
  | 'STORAGE_FAILURE';

export interface UpdateBannerInput {
  id: string;
  patch: {
    titleEs?: string;
    titleEn?: string;
    descEs?: string;
    descEn?: string;
    ctaLabelEs?: string;
    ctaLabelEn?: string;
    ctaHref?: string;
    isActive?: boolean;
  };
}

export interface UpdateBannerDeps {
  repo: BannerRepository;
  storage: StorageProvider;
  settingsRepo: SettingsRepository;
}

export async function updateBanner(
  input: UpdateBannerInput,
  deps: UpdateBannerDeps,
): Promise<Result<void, UpdateBannerError>> {
  // 1. Verify banner exists
  const existing = await deps.repo.findById(input.id);
  if (!existing) return err('NOT_FOUND');

  // 2. Validate patch
  const parsed = BannerUpdateSchema.safeParse(input.patch);
  if (!parsed.success) return err('VALIDATION');

  // 3. Max active guard — only when transitioning from inactive → active
  const isActivating = parsed.data.isActive === true && !existing.isActive;
  if (isActivating) {
    const settings = await deps.settingsRepo.get();
    const activeCount = await deps.repo.countActive();
    try {
      assertMaxActive(activeCount, settings.maxActiveBanners);
    } catch {
      return err('MAX_ACTIVE_REACHED');
    }
  }

  // 4. Persist
  await deps.repo.update(input.id, parsed.data);
  return ok(undefined);
}
