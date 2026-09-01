import { describe, it, expect, beforeEach } from 'vitest';
import { deleteCategory } from './delete-category';
import { InMemoryCategoryRepository } from '../infrastructure/__fakes__/in-memory-category-repository';

describe('deleteCategory', () => {
  let repo: InMemoryCategoryRepository;

  beforeEach(() => {
    repo = new InMemoryCategoryRepository();
    repo.clear();
  });

  it('deletes a category with no projects', async () => {
    const cat = repo.seed({ nameEs: 'Minería', slug: 'mineria' });
    const result = await deleteCategory({ id: cat.id }, { repo });
    expect(result.ok).toBe(true);
    expect(await repo.findById(cat.id)).toBeNull();
  });

  it('returns NOT_FOUND when category does not exist', async () => {
    const result = await deleteCategory({ id: 'ghost' }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });

  it('returns CATEGORY_IN_USE when projects are associated', async () => {
    const cat = repo.seed({ nameEs: 'Hoteles', slug: 'hoteles' });
    repo.setProjectCount(cat.id, 3);
    const result = await deleteCategory({ id: cat.id }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('CATEGORY_IN_USE');
  });
});
