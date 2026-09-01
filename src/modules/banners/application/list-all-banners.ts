import type { BannerRepository } from '../domain/banner-repository';
import type { Banner } from '../domain/banner';
import { ok, type Result } from '@/shared/lib/result';

export async function listAllBanners(deps: {
  repo: BannerRepository;
}): Promise<Result<Banner[], never>> {
  const banners = await deps.repo.findAll();
  return ok(banners);
}
