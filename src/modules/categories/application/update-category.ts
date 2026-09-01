import type { CategoryRepository } from '../domain/category-repository';
import type { Category } from '../domain/category';
import { CategoryUpdateSchema } from '../domain/category-schemas';
import { ok, err, type Result } from '@/shared/lib/result';

export type UpdateCategoryError = 'NOT_FOUND' | 'DUPLICATE_SLUG' | 'VALIDATION';

export interface UpdateCategoryInput {
  id: string;
  patch: {
    nameEs?: string;
    nameEn?: string;
    slug?: string;
  };
}

export interface UpdateCategoryDeps {
  repo: CategoryRepository;
}

export async function updateCategory(
  input: UpdateCategoryInput,
  deps: UpdateCategoryDeps,
): Promise<Result<Category, UpdateCategoryError>> {
  const existing = await deps.repo.findById(input.id);
  if (!existing) return err('NOT_FOUND');

  const parsed = CategoryUpdateSchema.safeParse(input.patch);
  if (!parsed.success) return err('VALIDATION');

  const patch = parsed.data;

  // Slug uniqueness: only check if slug actually changes
  if (patch.slug && patch.slug !== existing.slug) {
    const collision = await deps.repo.findBySlug(patch.slug);
    if (collision) return err('DUPLICATE_SLUG');
  }

  const updated = await deps.repo.update(input.id, patch);
  return ok(updated);
}
