import { describe, it, expect, beforeEach } from 'vitest';
import { deleteBanner } from './delete-banner';
import { InMemoryBannerRepository } from '../infrastructure/__fakes__/in-memory-banner-repository';
import { InMemoryStorageProvider } from '@/modules/media/infrastructure/__fakes__/in-memory-storage-provider';

let repo: InMemoryBannerRepository;
let storage: InMemoryStorageProvider;

beforeEach(() => {
  repo = new InMemoryBannerRepository();
  repo.clear();
  storage = new InMemoryStorageProvider();
});

describe('deleteBanner', () => {
  it('deletes an existing banner and its image', async () => {
    storage.seed('2024/01/img.jpg', Buffer.from('data'));
    const banner = repo.seed({
      titleEs: 'Test',
      descEs: 'Desc',
      imageKey: '2024/01/img.jpg',
    });

    const result = await deleteBanner({ id: banner.id }, { repo, storage });

    expect(result.ok).toBe(true);
    expect(await repo.findById(banner.id)).toBeNull();
    expect(await storage.exists('2024/01/img.jpg')).toBe(false);
  });

  it('returns NOT_FOUND when banner does not exist', async () => {
    const result = await deleteBanner({ id: 'ghost' }, { repo, storage });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });

  it('deletes the banner row even if image is already missing from storage', async () => {
    // imageKey points to non-existent file — should still delete the row gracefully
    const banner = repo.seed({
      titleEs: 'Test',
      descEs: 'Desc',
      imageKey: 'missing/img.jpg',
    });

    const result = await deleteBanner({ id: banner.id }, { repo, storage });
    expect(result.ok).toBe(true);
    expect(await repo.findById(banner.id)).toBeNull();
  });
});
