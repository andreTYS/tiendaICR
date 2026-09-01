import { describe, it, expect, beforeEach } from 'vitest';
import { updateProject } from './update-project';
import { InMemoryProjectRepository } from '../infrastructure/__fakes__/in-memory-project-repository';
import { InMemoryCategoryRepository } from '@/modules/categories/infrastructure/__fakes__/in-memory-category-repository';
import { InMemoryStorageProvider } from '@/modules/media/infrastructure/__fakes__/in-memory-storage-provider';

describe('updateProject', () => {
  let repo: InMemoryProjectRepository;
  let categoryRepo: InMemoryCategoryRepository;
  let storage: InMemoryStorageProvider;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    categoryRepo = new InMemoryCategoryRepository();
    storage = new InMemoryStorageProvider();
    repo.clear();
    categoryRepo.clear();
    categoryRepo.seed({ nameEs: 'Minería', slug: 'mineria', id: 'cat-1' });
  });

  it('updates text fields', async () => {
    const p = repo.seed({ titleEs: 'Solar', slug: 'solar', categoryId: 'cat-1', mainImageKey: 'key1' });
    const result = await updateProject(
      { id: p.id, patch: { titleEs: 'Solar Actualizado', titleEn: 'Updated Solar' } },
      { repo, categoryRepo, storage },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.titleEs).toBe('Solar Actualizado');
  });

  it('returns NOT_FOUND for unknown project', async () => {
    const result = await updateProject({ id: 'ghost', patch: { titleEs: 'X' } }, { repo, categoryRepo, storage });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });

  it('creates slug alias when slug changes', async () => {
    const p = repo.seed({ titleEs: 'Solar', slug: 'solar', categoryId: 'cat-1', mainImageKey: 'key1' });
    await updateProject({ id: p.id, patch: { slug: 'solar-v2' } }, { repo, categoryRepo, storage });
    const alias = await repo.findAliasBySlug('solar');
    expect(alias).not.toBeNull();
    expect(alias?.currentSlug).toBe('solar-v2');
  });

  it('returns DUPLICATE_SLUG when slug conflicts', async () => {
    const p1 = repo.seed({ titleEs: 'Solar', slug: 'solar', categoryId: 'cat-1', mainImageKey: 'k1' });
    repo.seed({ titleEs: 'Eolico', slug: 'eolico', categoryId: 'cat-1', mainImageKey: 'k2' });
    const result = await updateProject({ id: p1.id, patch: { slug: 'eolico' } }, { repo, categoryRepo, storage });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('DUPLICATE_SLUG');
  });
});
