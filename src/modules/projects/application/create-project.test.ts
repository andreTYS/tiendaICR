import { describe, it, expect, beforeEach } from 'vitest';
import { createProject } from './create-project';
import { InMemoryProjectRepository } from '../infrastructure/__fakes__/in-memory-project-repository';
import { InMemoryCategoryRepository } from '@/modules/categories/infrastructure/__fakes__/in-memory-category-repository';
import { InMemoryStorageProvider } from '@/modules/media/infrastructure/__fakes__/in-memory-storage-provider';

const fakeBuffer = Buffer.from('fake-image');
const fakeInput = {
  titleEs: 'Planta Solar Minera',
  descEs: 'Descripción del proyecto',
  categoryId: 'cat-1',
  isActive: false,
  imageBuffer: fakeBuffer,
  imageMimeType: 'image/jpeg',
  imageOriginalName: 'main.jpg',
  imageSize: fakeBuffer.length,
};

describe('createProject', () => {
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

  it('creates a project with auto-generated slug', async () => {
    const result = await createProject(fakeInput, { repo, categoryRepo, storage });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.slug).toBe('planta-solar-minera');
    expect(result.value.mainImageKey).toBeTruthy();
  });

  it('rejects when categoryId does not exist', async () => {
    const result = await createProject({ ...fakeInput, categoryId: 'nonexistent' }, { repo, categoryRepo, storage });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('CATEGORY_NOT_FOUND');
  });

  it('rejects empty titleEs with VALIDATION', async () => {
    const result = await createProject({ ...fakeInput, titleEs: '' }, { repo, categoryRepo, storage });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('VALIDATION');
  });

  it('rejects invalid image with INVALID_IMAGE', async () => {
    const result = await createProject(
      { ...fakeInput, imageMimeType: 'application/pdf', imageSize: 100 },
      { repo, categoryRepo, storage },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('INVALID_IMAGE');
  });

  it('handles slug collision by appending suffix', async () => {
    repo.seed({ titleEs: 'Planta Solar Minera', slug: 'planta-solar-minera', categoryId: 'cat-1', mainImageKey: 'k' });
    const result = await createProject(fakeInput, { repo, categoryRepo, storage });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.slug).toBe('planta-solar-minera-2');
  });

  it('uploads main image to storage', async () => {
    await createProject(fakeInput, { repo, categoryRepo, storage });
    expect(storage.size).toBe(1);
  });
});
