import { describe, it, expect, beforeEach } from 'vitest';
import { reorderBanners } from './reorder-banners';
import { InMemoryBannerRepository } from '../infrastructure/__fakes__/in-memory-banner-repository';

let repo: InMemoryBannerRepository;

beforeEach(() => {
  repo = new InMemoryBannerRepository();
  repo.clear();
});

describe('reorderBanners', () => {
  it('persists new order for existing banners', async () => {
    const b1 = repo.seed({ titleEs: 'B1', descEs: 'd', imageKey: 'k', order: 0 });
    const b2 = repo.seed({ titleEs: 'B2', descEs: 'd', imageKey: 'k', order: 1 });
    const b3 = repo.seed({ titleEs: 'B3', descEs: 'd', imageKey: 'k', order: 2 });

    // Reverse order
    const result = await reorderBanners(
      { orderedIds: [b3.id, b2.id, b1.id] },
      { repo },
    );

    expect(result.ok).toBe(true);

    const all = await repo.findAll();
    const ordered = all.sort((a, b) => a.order - b.order);
    expect(ordered.map((b) => b.id)).toEqual([b3.id, b2.id, b1.id]);
  });

  it('rejects empty orderedIds with VALIDATION', async () => {
    const result = await reorderBanners({ orderedIds: [] }, { repo });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('VALIDATION');
  });

  it('returns ok with a single id', async () => {
    const b = repo.seed({ titleEs: 'B', descEs: 'd', imageKey: 'k' });
    const result = await reorderBanners({ orderedIds: [b.id] }, { repo });
    expect(result.ok).toBe(true);
  });
});
