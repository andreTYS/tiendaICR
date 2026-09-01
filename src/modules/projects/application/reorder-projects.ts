import type { ProjectRepository } from '../domain/project-repository';
import { ReorderProjectsSchema } from '../domain/project-schemas';
import { ok, err, type Result } from '@/shared/lib/result';

export type ReorderProjectsError = 'VALIDATION';

export async function reorderProjects(
  input: { orderedIds: string[] },
  deps: { repo: ProjectRepository },
): Promise<Result<void, ReorderProjectsError>> {
  const parsed = ReorderProjectsSchema.safeParse(input);
  if (!parsed.success) return err('VALIDATION');
  await deps.repo.reorder(parsed.data.orderedIds);
  return ok(undefined);
}
