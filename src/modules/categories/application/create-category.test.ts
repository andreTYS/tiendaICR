import { describe, it, expect, beforeEach } from 'vitest';
import { createCategory } from './create-category';
import { InMemoryCategoryRepository } from '../infrastructure/__fakes__/in-memory-category-repository';

describe('createCategory', () => {
  let repo: InMemoryCategoryRepository;

  beforeEach(() => {
    repo = new InMemoryCategoryRepository();
    repo.clear();
  });

  it('creates a category with auto-generated slug from nameEs', async () => {
    const result = await createCategory({ nameEs: 'Minería' }, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.slug).toBe('mineria');
    expect(result.value.nameEs).toBe('Minería');
  });

  it('uses provided slug when given', async () => {
    const result = await createCategory({ nameEs: 'Hoteles', slug: 'hoteles-lujo' }, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.slug).toBe('hoteles-lujo');
  });

  it('stores optional nameEn', async () => {
    const result = await createCategory({ nameEs: 'Agroindustria', nameEn: 'Agro Industry' }, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nameEn).toBe('Agro Industry');
  });

  it('rejects empty nameEs with VALIDATION', async () => {
    const result = await createCategory({ nameEs: '' }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('VALIDATION');
  });

  it('rejects explicit duplicate slug with DUPLICATE_SLUG', async () => {
    repo.seed({ nameEs: 'Minería', slug: 'mineria' });
    const result = await createCategory({ nameEs: 'Otro nombre', slug: 'mineria' }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('DUPLICATE_SLUG');
  });

  it('appends -2 on slug collision and retries', async () => {
    repo.seed({ nameEs: 'Minería', slug: 'mineria' });
    repo.seed({ nameEs: 'Minería 2', slug: 'mineria-2' });
    const result = await createCategory({ nameEs: 'Minería' }, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.slug).toBe('mineria-3');
  });
});
