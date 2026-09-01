import { describe, it, expect, beforeEach } from 'vitest';
import { getProjectBySlug } from './get-project-by-slug';
import { InMemoryProjectRepository } from '../infrastructure/__fakes__/in-memory-project-repository';

describe('getProjectBySlug', () => {
  let repo: InMemoryProjectRepository;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    repo.clear();
  });

  it('returns found project for active slug', async () => {
    repo.seed({ titleEs: 'Solar', slug: 'solar', categoryId: 'cat-1', mainImageKey: 'k1', isActive: true });
    const result = await getProjectBySlug({ slug: 'solar' }, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.type).toBe('found');
    if (result.value.type !== 'found') return;
    expect(result.value.project.slug).toBe('solar');
  });

  it('returns aliased result when slug is an old alias', async () => {
    const p = repo.seed({ titleEs: 'Solar', slug: 'solar-v2', categoryId: 'cat-1', mainImageKey: 'k1', isActive: true });
    await repo.createAlias('solar', p.id);
    const result = await getProjectBySlug({ slug: 'solar' }, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.type).toBe('aliased');
    if (result.value.type !== 'aliased') return;
    expect(result.value.currentSlug).toBe('solar-v2');
  });

  it('returns NOT_FOUND for completely unknown slug', async () => {
    const result = await getProjectBySlug({ slug: 'ghost' }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });
});
