import { describe, it, expect, beforeEach } from 'vitest';
import { getCategory } from './get-category';
import { InMemoryCategoryRepository } from '../infrastructure/__fakes__/in-memory-category-repository';

describe('getCategory', () => {
  let repo: InMemoryCategoryRepository;

  beforeEach(() => {
    repo = new InMemoryCategoryRepository();
    repo.clear();
  });

  it('finds category by id', async () => {
    const cat = repo.seed({ nameEs: 'Minería', slug: 'mineria' });
    const result = await getCategory({ id: cat.id }, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.id).toBe(cat.id);
  });

  it('finds category by slug', async () => {
    repo.seed({ nameEs: 'Hoteles', slug: 'hoteles' });
    const result = await getCategory({ slug: 'hoteles' }, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.slug).toBe('hoteles');
  });

  it('returns NOT_FOUND for unknown id', async () => {
    const result = await getCategory({ id: 'nope' }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });

  it('returns NOT_FOUND for unknown slug', async () => {
    const result = await getCategory({ slug: 'ghost' }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });
});
