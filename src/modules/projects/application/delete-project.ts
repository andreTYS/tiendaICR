import type { ProjectRepository } from '../domain/project-repository';
import type { StorageProvider } from '@/modules/media/domain/storage-provider';
import { ok, err, type Result } from '@/shared/lib/result';

export type DeleteProjectError = 'NOT_FOUND';

export interface DeleteProjectDeps {
  repo: ProjectRepository;
  storage: StorageProvider;
}

export async function deleteProject(
  input: { id: string },
  deps: DeleteProjectDeps,
): Promise<Result<void, DeleteProjectError>> {
  const project = await deps.repo.findById(input.id);
  if (!project) return err('NOT_FOUND');

  // Delete all gallery images from storage
  for (const image of project.images) {
    await deps.storage.delete(image.imageKey).catch(() => {
      console.warn(`[deleteProject] Failed to delete gallery image: ${image.imageKey}`);
    });
  }

  // Delete main image from storage
  await deps.storage.delete(project.mainImageKey).catch(() => {
    console.warn(`[deleteProject] Failed to delete main image: ${project.mainImageKey}`);
  });

  // Delete project row (cascades aliases + images in DB)
  await deps.repo.delete(input.id);

  return ok(undefined);
}
