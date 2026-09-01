import { describe, it, expect, beforeEach } from 'vitest';
import { listAllBanners } from './list-all-banners';
import { InMemoryBannerRepository } from '../infrastructure/__fakes__/in-memory-banner-repository';

let repo: InMemoryBannerRepository;

beforeEach(() => {
  repo = new InMemoryBannerRepository();
  repo.clear();
});

describe('listAllBanners', () => {
  it('returns all banners (active and inactive)', async () => {
    repo.seed({ titleEs: 'Active', descEs: 'd', imageKey: 'k1', isActive: true, order: 0 });
    repo.seed({ titleEs: 'Inactive', descEs: 'd', imageKey: 'k2', isActive: false, order: 1 });

    const result = await listAllBanners({ repo });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(2);
  });

  it('returns banners sorted by order', async () => {
    repo.seed({ titleEs: 'B3', descEs: 'd', imageKey: 'k', isActive: false, order: 3 });
    repo.seed({ titleEs: 'B1', descEs: 'd', imageKey: 'k', isActive: true, order: 1 });
    repo.seed({ titleEs: 'B2', descEs: 'd', imageKey: 'k', isActive: false, order: 2 });

    const result = await listAllBanners({ repo });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((b) => b.titleEs)).toEqual(['B1', 'B2', 'B3']);
  });

  it('returns empty array when no banners exist', async () => {
    const result = await listAllBanners({ repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(0);
  });
});
