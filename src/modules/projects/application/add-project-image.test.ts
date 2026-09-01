import { describe, it, expect, beforeEach } from 'vitest';
import { addProjectImage } from './add-project-image';
import { InMemoryProjectRepository } from '../infrastructure/__fakes__/in-memory-project-repository';
import { InMemoryStorageProvider } from '@/modules/media/infrastructure/__fakes__/in-memory-storage-provider';

const fakeBuffer = Buffer.from('img');

describe('addProjectImage', () => {
  let repo: InMemoryProjectRepository;
  let storage: InMemoryStorageProvider;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    storage = new InMemoryStorageProvider();
    repo.clear();
  });

  it('uploads and persists a gallery image', async () => {
    const p = repo.seed({ titleEs: 'Solar', slug: 'solar', categoryId: 'c', mainImageKey: 'k' });
    const result = await addProjectImage(
      { projectId: p.id, imageBuffer: fakeBuffer, imageMimeType: 'image/jpeg', imageOriginalName: 'g.jpg', imageSize: fakeBuffer.length },
      { repo, storage },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.projectId).toBe(p.id);
    expect(storage.size).toBe(1);
  });

  it('returns NOT_FOUND for unknown project', async () => {
    const result = await addProjectImage(
      { projectId: 'ghost', imageBuffer: fakeBuffer, imageMimeType: 'image/jpeg', imageOriginalName: 'g.jpg', imageSize: fakeBuffer.length },
      { repo, storage },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });
});
