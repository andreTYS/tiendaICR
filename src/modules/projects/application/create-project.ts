import type { ProjectRepository } from '../domain/project-repository';
import type { CategoryRepository } from '@/modules/categories/domain/category-repository';
import type { StorageProvider } from '@/modules/media/domain/storage-provider';
import type { Project } from '../domain/project';
import { ProjectCreateSchema } from '../domain/project-schemas';
import { uploadImage } from '@/modules/media/application/upload-image';
import { toSlug } from '@/shared/lib/slug';
import { ok, err, type Result } from '@/shared/lib/result';

export type CreateProjectError =
  | 'VALIDATION'
  | 'DUPLICATE_SLUG'
  | 'CATEGORY_NOT_FOUND'
  | 'INVALID_IMAGE'
  | 'STORAGE_FAILURE';

export interface CreateProjectInput {
  titleEs: string;
  titleEn?: string;
  descEs: string;
  descEn?: string;
  location?: string;
  categoryId: string;
  slug?: string;
  isActive: boolean;
  imageBuffer: Buffer;
  imageMimeType: string;
  imageOriginalName: string;
  imageSize: number;
}

export interface CreateProjectDeps {
  repo: ProjectRepository;
  categoryRepo: CategoryRepository;
  storage: StorageProvider;
}

export async function createProject(
  input: CreateProjectInput,
  deps: CreateProjectDeps,
): Promise<Result<Project, CreateProjectError>> {
  const parsed = ProjectCreateSchema.safeParse({
    titleEs: input.titleEs,
    titleEn: input.titleEn,
    descEs: input.descEs,
    descEn: input.descEn,
    location: input.location,
    categoryId: input.categoryId,
    slug: input.slug,
    isActive: input.isActive,
  });
  if (!parsed.success) return err('VALIDATION');

  // Verify category exists
  const category = await deps.categoryRepo.findById(parsed.data.categoryId);
  if (!category) return err('CATEGORY_NOT_FOUND');

  // Upload main image
  const uploadResult = await uploadImage(
    { buffer: input.imageBuffer, mimeType: input.imageMimeType, originalName: input.imageOriginalName, size: input.imageSize },
    { storage: deps.storage },
  );
  if (!uploadResult.ok) {
    if (uploadResult.error === 'STORAGE_FAILURE') return err('STORAGE_FAILURE');
    return err('INVALID_IMAGE');
  }

  // Resolve slug with collision handling
  const baseSlug = parsed.data.slug ? parsed.data.slug : toSlug(parsed.data.titleEs);
  let candidate = baseSlug;
  let suffix = 2;
  while (true) {
    const existing = await deps.repo.findBySlug(candidate);
    if (!existing) break;
    if (parsed.data.slug) return err('DUPLICATE_SLUG');
    candidate = `${baseSlug}-${suffix++}`;
  }

  const project = await deps.repo.create({
    slug: candidate,
    titleEs: parsed.data.titleEs,
    titleEn: parsed.data.titleEn,
    descEs: parsed.data.descEs,
    descEn: parsed.data.descEn,
    location: parsed.data.location,
    categoryId: parsed.data.categoryId,
    mainImageKey: uploadResult.value.key,
    isActive: parsed.data.isActive,
    order: 0,
  });

  return ok(project);
}
