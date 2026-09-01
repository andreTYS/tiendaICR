import type { ProjectRepository } from '../domain/project-repository';
import type { Project } from '../domain/project';
import { ok, type Result } from '@/shared/lib/result';

export interface ListProjectsInput {
  categoryId?: string;
}

export interface ListProjectsDeps {
  repo: ProjectRepository;
}

export async function listProjects(
  input: ListProjectsInput,
  deps: ListProjectsDeps,
): Promise<Result<Project[], never>> {
  const projects = await deps.repo.findActive(input.categoryId);
  return ok(projects);
}
