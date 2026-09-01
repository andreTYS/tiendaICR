import type { BannerRepository } from '../domain/banner-repository';
import { ReorderBannersSchema } from '../domain/banner-schemas';
import { ok, err, type Result } from '@/shared/lib/result';

export type ReorderBannersError = 'VALIDATION';

export async function reorderBanners(
  input: { orderedIds: string[] },
  deps: { repo: BannerRepository },
): Promise<Result<void, ReorderBannersError>> {
  const parsed = ReorderBannersSchema.safeParse(input);
  if (!parsed.success) return err('VALIDATION');

  await deps.repo.reorder(parsed.data.orderedIds);
  return ok(undefined);
}
