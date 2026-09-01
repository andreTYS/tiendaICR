import { describe, it, expect, beforeEach } from 'vitest';
import { deleteProject } from './delete-project';
import { InMemoryProjectRepository } from '../infrastructure/__fakes__/in-memory-project-repository';
import { InMemoryStorageProvider } from '@/modules/media/infrastructure/__fakes__/in-memory-storage-provider';

describe('deleteProject', () => {
  let repo: InMemoryProjectRepository;
  let storage: InMemoryStorageProvider;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    storage = new InMemoryStorageProvider();
    repo.clear();
  });

  it('deletes an existing project', async () => {
    const p = repo.seed({ titleEs: 'Solar', slug: 'solar', categoryId: 'cat-1', mainImageKey: 'key1' });
    storage.seed('key1', Buffer.from('img'));
    const result = await deleteProject({ id: p.id }, { repo, storage });
    expect(result.ok).toBe(true);
    expect(await repo.findById(p.id)).toBeNull();
  });

  it('returns NOT_FOUND for unknown project', async () => {
    const result = await deleteProject({ id: 'ghost' }, { repo, storage });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });

  it('deletes main image from storage', async () => {
    const p = repo.seed({ titleEs: 'Solar', slug: 'solar', categoryId: 'cat-1', mainImageKey: 'main-key' });
    storage.seed('main-key', Buffer.from('img'));
    await deleteProject({ id: p.id }, { repo, storage });
    expect(await storage.exists('main-key')).toBe(false);
  });
});
