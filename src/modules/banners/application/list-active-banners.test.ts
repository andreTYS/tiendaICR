import { describe, it, expect, beforeEach } from 'vitest';
import { listActiveBanners } from './list-active-banners';
import { InMemoryBannerRepository } from '../infrastructure/__fakes__/in-memory-banner-repository';

let repo: InMemoryBannerRepository;

beforeEach(() => {
  repo = new InMemoryBannerRepository();
  repo.clear();
});

describe('listActiveBanners', () => {
  it('returns only active banners', async () => {
    repo.seed({ titleEs: 'Active 1', descEs: 'd', imageKey: 'k1', isActive: true, order: 0 });
    repo.seed({ titleEs: 'Inactive', descEs: 'd', imageKey: 'k2', isActive: false, order: 1 });
    repo.seed({ titleEs: 'Active 2', descEs: 'd', imageKey: 'k3', isActive: true, order: 2 });

    const result = await listActiveBanners({ repo });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(2);
    expect(result.value.every((b) => b.isActive)).toBe(true);
  });

  it('returns banners sorted by order ascending', async () => {
    repo.seed({ titleEs: 'B2', descEs: 'd', imageKey: 'k', isActive: true, order: 2 });
    repo.seed({ titleEs: 'B0', descEs: 'd', imageKey: 'k', isActive: true, order: 0 });
    repo.seed({ titleEs: 'B1', descEs: 'd', imageKey: 'k', isActive: true, order: 1 });

    const result = await listActiveBanners({ repo });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((b) => b.titleEs)).toEqual(['B0', 'B1', 'B2']);
  });

  it('returns empty array when no active banners', async () => {
    repo.seed({ titleEs: 'Inactive', descEs: 'd', imageKey: 'k', isActive: false });

    const result = await listActiveBanners({ repo });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(0);
  });

  it('never returns an error', async () => {
    const result = await listActiveBanners({ repo });
    expect(result.ok).toBe(true);
  });
});
