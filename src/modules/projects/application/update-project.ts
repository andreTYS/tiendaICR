import type { ProjectRepository } from '../domain/project-repository';
import type { CategoryRepository } from '@/modules/categories/domain/category-repository';
import type { StorageProvider } from '@/modules/media/domain/storage-provider';
import type { Project } from '../domain/project';
import { ProjectUpdateSchema } from '../domain/project-schemas';
import { uploadImage } from '@/modules/media/application/upload-image';
import { ok, err, type Result } from '@/shared/lib/result';

export type UpdateProjectError =
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'DUPLICATE_SLUG'
  | 'CATEGORY_NOT_FOUND'
  | 'INVALID_IMAGE'
  | 'STORAGE_FAILURE';

export interface UpdateProjectInput {
  id: string;
  patch: {
    titleEs?: string;
    titleEn?: string;
    descEs?: string;
    descEn?: string;
    location?: string;
    categoryId?: string;
    slug?: string;
    isActive?: boolean;
    // Optional image replacement
    imageBuffer?: Buffer;
    imageMimeType?: string;
    imageOriginalName?: string;
    imageSize?: number;
  };
}

export interface UpdateProjectDeps {
  repo: ProjectRepository;
  categoryRepo: CategoryRepository;
  storage: StorageProvider;
}

export async function updateProject(
  input: UpdateProjectInput,
  deps: UpdateProjectDeps,
): Promise<Result<Project, UpdateProjectError>> {
  const existing = await deps.repo.findById(input.id);
  if (!existing) return err('NOT_FOUND');

  const { imageBuffer, imageMimeType, imageOriginalName, imageSize, ...textPatch } = input.patch;

  const parsed = ProjectUpdateSchema.safeParse(textPatch);
  if (!parsed.success) return err('VALIDATION');

  // Slug uniqueness check
  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const collision = await deps.repo.findBySlug(parsed.data.slug);
    if (collision) return err('DUPLICATE_SLUG');
    // Create alias for old slug BEFORE updating
    await deps.repo.createAlias(existing.slug, existing.id);
  }

  // Category validation
  if (parsed.data.categoryId && parsed.data.categoryId !== existing.categoryId) {
    const category = await deps.categoryRepo.findById(parsed.data.categoryId);
    if (!category) return err('CATEGORY_NOT_FOUND');
  }

  // Handle main image replacement
  let newImageKey: string | undefined;
  if (imageBuffer && imageMimeType) {
    const uploadResult = await uploadImage(
      { buffer: imageBuffer, mimeType: imageMimeType, originalName: imageOriginalName ?? 'image', size: imageSize ?? imageBuffer.length },
      { storage: deps.storage },
    );
    if (!uploadResult.ok) {
      if (uploadResult.error === 'STORAGE_FAILURE') return err('STORAGE_FAILURE');
      return err('INVALID_IMAGE');
    }
    newImageKey = uploadResult.value.key;
    // Delete old image — best-effort (log warning on failure, don't block update)
    deps.storage.delete(existing.mainImageKey).catch(() => {
      console.warn(`[updateProject] Failed to delete old image: ${existing.mainImageKey}`);
    });
  }

  const updated = await deps.repo.update(input.id, {
    ...parsed.data,
    ...(newImageKey && { mainImageKey: newImageKey }),
  });

  return ok(updated);
}
