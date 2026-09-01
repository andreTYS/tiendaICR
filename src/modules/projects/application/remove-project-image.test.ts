import { describe, it, expect, beforeEach } from 'vitest';
import { removeProjectImage } from './remove-project-image';
import { InMemoryProjectRepository } from '../infrastructure/__fakes__/in-memory-project-repository';
import { InMemoryStorageProvider } from '@/modules/media/infrastructure/__fakes__/in-memory-storage-provider';

describe('removeProjectImage', () => {
  let repo: InMemoryProjectRepository;
  let storage: InMemoryStorageProvider;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    storage = new InMemoryStorageProvider();
    repo.clear();
  });

  it('removes image from storage and repository', async () => {
    const p = repo.seed({ titleEs: 'Solar', slug: 'solar', categoryId: 'c', mainImageKey: 'mk' });
    storage.seed('gallery-key', Buffer.from('img'));
    const img = await repo.addImage(p.id, { imageKey: 'gallery-key', order: 0 });
    const result = await removeProjectImage({ imageId: img.id, imageKey: 'gallery-key' }, { repo, storage });
    expect(result.ok).toBe(true);
    expect(await storage.exists('gallery-key')).toBe(false);
  });
});
