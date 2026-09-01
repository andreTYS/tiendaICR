import type { ProjectRepository } from '../domain/project-repository';
import type { Project } from '../domain/project';
import { ok, err, type Result } from '@/shared/lib/result';

export type GetProjectBySlugError = 'NOT_FOUND';

export type GetProjectBySlugOutput =
  | { type: 'found'; project: Project }
  | { type: 'aliased'; currentSlug: string };

export async function getProjectBySlug(
  input: { slug: string },
  deps: { repo: ProjectRepository },
): Promise<Result<GetProjectBySlugOutput, GetProjectBySlugError>> {
  // Primary lookup by slug
  const project = await deps.repo.findBySlug(input.slug);
  if (project) {
    return ok({ type: 'found', project });
  }

  // Fallback: check alias table
  const alias = await deps.repo.findAliasBySlug(input.slug);
  if (alias) {
    return ok({ type: 'aliased', currentSlug: alias.currentSlug });
  }

  return err('NOT_FOUND');
}
