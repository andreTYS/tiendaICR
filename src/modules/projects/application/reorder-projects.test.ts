import { describe, it, expect, beforeEach } from 'vitest';
import { reorderProjects } from './reorder-projects';
import { InMemoryProjectRepository } from '../infrastructure/__fakes__/in-memory-project-repository';

describe('reorderProjects', () => {
  let repo: InMemoryProjectRepository;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    repo.clear();
  });

  it('reorders projects by provided ids', async () => {
    const p1 = repo.seed({ titleEs: 'A', slug: 'a', categoryId: 'c', mainImageKey: 'k', order: 0 });
    const p2 = repo.seed({ titleEs: 'B', slug: 'b', categoryId: 'c', mainImageKey: 'k', order: 1 });
    const result = await reorderProjects({ orderedIds: [p2.id, p1.id] }, { repo });
    expect(result.ok).toBe(true);
    const all = await repo.findAll();
    expect(all[0]!.id).toBe(p2.id);
    expect(all[1]!.id).toBe(p1.id);
  });

  it('rejects empty id list with VALIDATION', async () => {
    const result = await reorderProjects({ orderedIds: [] }, { repo });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('VALIDATION');
  });
});
