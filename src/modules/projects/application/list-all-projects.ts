import type { ProjectRepository } from '../domain/project-repository';
import type { Project } from '../domain/project';
import { ok, type Result } from '@/shared/lib/result';

export interface ListAllProjectsDeps {
  repo: ProjectRepository;
}

export async function listAllProjects(
  deps: ListAllProjectsDeps,
): Promise<Result<Project[], never>> {
  const projects = await deps.repo.findAll();
  return ok(projects);
}
