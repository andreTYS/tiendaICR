import type { BannerRepository } from '../domain/banner-repository';
import type { StorageProvider } from '@/modules/media/domain/storage-provider';
import { ok, err, type Result } from '@/shared/lib/result';

export type DeleteBannerError = 'NOT_FOUND';

export async function deleteBanner(
  input: { id: string },
  deps: { repo: BannerRepository; storage: StorageProvider },
): Promise<Result<void, DeleteBannerError>> {
  const banner = await deps.repo.findById(input.id);
  if (!banner) return err('NOT_FOUND');

  // Best-effort image cleanup — don't fail if image is already gone
  const imageExists = await deps.storage.exists(banner.imageKey);
  if (imageExists) {
    await deps.storage.delete(banner.imageKey);
  }

  await deps.repo.delete(input.id);
  return ok(undefined);
}
