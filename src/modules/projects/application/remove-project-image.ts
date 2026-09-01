import type { ProjectRepository } from '../domain/project-repository';
import type { StorageProvider } from '@/modules/media/domain/storage-provider';
import { ok, err, type Result } from '@/shared/lib/result';

export type RemoveProjectImageError = 'NOT_FOUND' | 'STORAGE_FAILURE';

export async function removeProjectImage(
  input: { imageId: string; imageKey: string },
  deps: { repo: ProjectRepository; storage: StorageProvider },
): Promise<Result<void, RemoveProjectImageError>> {
  // Delete from storage first
  await deps.storage.delete(input.imageKey).catch(() => {
    console.warn(`[removeProjectImage] Failed to delete image: ${input.imageKey}`);
  });

  await deps.repo.removeImage(input.imageId);
  return ok(undefined);
}
