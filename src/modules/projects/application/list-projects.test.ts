import { describe, it, expect, beforeEach } from 'vitest';
import { listProjects } from './list-projects';
import { InMemoryProjectRepository } from '../infrastructure/__fakes__/in-memory-project-repository';

describe('listProjects', () => {
  let repo: InMemoryProjectRepository;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    repo.clear();
  });

  it('returns only active projects', async () => {
    repo.seed({ titleEs: 'Active', slug: 'active', categoryId: 'cat-1', mainImageKey: 'k1', isActive: true });
    repo.seed({ titleEs: 'Inactive', slug: 'inactive', categoryId: 'cat-1', mainImageKey: 'k2', isActive: false });
    const result = await listProjects({}, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(1);
    expect(result.value[0]!.slug).toBe('active');
  });

  it('filters by categoryId', async () => {
    repo.seed({ titleEs: 'Solar', slug: 'solar', categoryId: 'cat-1', mainImageKey: 'k1', isActive: true });
    repo.seed({ titleEs: 'Hotel', slug: 'hotel', categoryId: 'cat-2', mainImageKey: 'k2', isActive: true });
    const result = await listProjects({ categoryId: 'cat-1' }, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(1);
    expect(result.value[0]!.categoryId).toBe('cat-1');
  });

  it('returns empty array when no active projects', async () => {
    const result = await listProjects({}, { repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual([]);
  });
});
