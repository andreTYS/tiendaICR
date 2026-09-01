import { describe, it, expect, beforeEach } from 'vitest';
import { updateCategory } from './update-category';
import { InMemoryCategoryRepository } from '../infrastructure/__fakes__/in-memory-category-repository';

describe('updateCategory', () => {
  let repo: InMemoryCategoryRepository;

  beforeEach(() => {
    repo = new InMemoryCategoryRepository();
    repo.clear();
  });

  it('updates nameEs and nameEn', async () => {
    const cat = repo.seed({ nameEs: 'Minería', slug: 'mineria' });
    const result = await updateCategory({ id: cat.id, patch: { nameEs: 'Minería Solar', nameEn: 'Solar Mining' } }, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nameEs).toBe('Minería Solar');
    expect(result.value.nameEn).toBe('Solar Mining');
  });

  it('returns NOT_FOUND when category does not exist', async () => {
    const result = await updateCategory({ id: 'nonexistent', patch: { nameEs: 'X' } }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });

  it('returns DUPLICATE_SLUG when updating to an existing slug', async () => {
    const cat1 = repo.seed({ nameEs: 'Hoteles', slug: 'hoteles' });
    repo.seed({ nameEs: 'Minería', slug: 'mineria' });
    const result = await updateCategory({ id: cat1.id, patch: { slug: 'mineria' } }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('DUPLICATE_SLUG');
  });

  it('allows updating slug to the same slug (no-op)', async () => {
    const cat = repo.seed({ nameEs: 'Hoteles', slug: 'hoteles' });
    const result = await updateCategory({ id: cat.id, patch: { slug: 'hoteles' } }, { repo });
    expect(result.ok).toBe(true);
  });

  it('rejects empty nameEs with VALIDATION', async () => {
    const cat = repo.seed({ nameEs: 'Hoteles', slug: 'hoteles' });
    const result = await updateCategory({ id: cat.id, patch: { nameEs: '' } }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('VALIDATION');
  });
});
