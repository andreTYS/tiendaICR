import type { ProjectRepository } from '../domain/project-repository';
import { ok, err, type Result } from '@/shared/lib/result';

export type ReorderProjectImagesError = 'VALIDATION';

export async function reorderProjectImages(
  input: { projectId: string; imageIds: string[] },
  deps: { repo: ProjectRepository },
): Promise<Result<void, ReorderProjectImagesError>> {
  if (!input.imageIds.length) return err('VALIDATION');
  await deps.repo.reorderImages(input.projectId, input.imageIds);
  return ok(undefined);
}
