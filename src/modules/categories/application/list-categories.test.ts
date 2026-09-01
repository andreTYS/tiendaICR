import { describe, it, expect, beforeEach } from 'vitest';
import { listCategories } from './list-categories';
import { InMemoryCategoryRepository } from '../infrastructure/__fakes__/in-memory-category-repository';

describe('listCategories', () => {
  let repo: InMemoryCategoryRepository;

  beforeEach(() => {
    repo = new InMemoryCategoryRepository();
    repo.clear();
  });

  it('returns empty array when no categories exist', async () => {
    const result = await listCategories({ repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual([]);
  });

  it('returns all categories ordered by nameEs', async () => {
    repo.seed({ nameEs: 'Minería', slug: 'mineria' });
    repo.seed({ nameEs: 'Agroindustria', slug: 'agroindustria' });
    repo.seed({ nameEs: 'Hoteles', slug: 'hoteles' });
    const result = await listCategories({ repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((c) => c.nameEs)).toEqual(['Agroindustria', 'Hoteles', 'Minería']);
  });
});
