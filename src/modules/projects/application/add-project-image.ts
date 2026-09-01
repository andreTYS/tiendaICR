import type { ProjectRepository } from '../domain/project-repository';
import type { ProjectImage } from '../domain/project-image';
import type { StorageProvider } from '@/modules/media/domain/storage-provider';
import { uploadImage } from '@/modules/media/application/upload-image';
import { ok, err, type Result } from '@/shared/lib/result';

export type AddProjectImageError = 'NOT_FOUND' | 'INVALID_IMAGE' | 'STORAGE_FAILURE';

export interface AddProjectImageInput {
  projectId: string;
  imageBuffer: Buffer;
  imageMimeType: string;
  imageOriginalName: string;
  imageSize: number;
  alt?: string;
}

export async function addProjectImage(
  input: AddProjectImageInput,
  deps: { repo: ProjectRepository; storage: StorageProvider },
): Promise<Result<ProjectImage, AddProjectImageError>> {
  const project = await deps.repo.findById(input.projectId);
  if (!project) return err('NOT_FOUND');

  const uploadResult = await uploadImage(
    { buffer: input.imageBuffer, mimeType: input.imageMimeType, originalName: input.imageOriginalName, size: input.imageSize },
    { storage: deps.storage },
  );
  if (!uploadResult.ok) {
    if (uploadResult.error === 'STORAGE_FAILURE') return err('STORAGE_FAILURE');
    return err('INVALID_IMAGE');
  }

  const nextOrder = project.images.length;
  const image = await deps.repo.addImage(input.projectId, {
    imageKey: uploadResult.value.key,
    alt: input.alt,
    order: nextOrder,
  });

  return ok(image);
}
