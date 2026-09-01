import { describe, it, expect, beforeEach } from 'vitest';
import { listAllProjects } from './list-all-projects';
import { InMemoryProjectRepository } from '../infrastructure/__fakes__/in-memory-project-repository';

describe('listAllProjects', () => {
  let repo: InMemoryProjectRepository;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    repo.clear();
  });

  it('returns all projects including inactive', async () => {
    repo.seed({ titleEs: 'Active', slug: 'active', categoryId: 'c', mainImageKey: 'k', isActive: true });
    repo.seed({ titleEs: 'Inactive', slug: 'inactive', categoryId: 'c', mainImageKey: 'k', isActive: false });
    const result = await listAllProjects({ repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(2);
  });
});
