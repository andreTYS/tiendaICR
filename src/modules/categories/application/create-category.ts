import type { CategoryRepository } from '../domain/category-repository';
import type { Category } from '../domain/category';
import { CategoryCreateSchema } from '../domain/category-schemas';
import { toSlug } from '@/shared/lib/slug';
import { ok, err, type Result } from '@/shared/lib/result';

export type CreateCategoryError = 'VALIDATION' | 'DUPLICATE_SLUG';

export interface CreateCategoryInput {
  nameEs: string;
  nameEn?: string;
  slug?: string;
}

export interface CreateCategoryDeps {
  repo: CategoryRepository;
}

export async function createCategory(
  input: CreateCategoryInput,
  deps: CreateCategoryDeps,
): Promise<Result<Category, CreateCategoryError>> {
  const parsed = CategoryCreateSchema.safeParse(input);
  if (!parsed.success) return err('VALIDATION');

  const { nameEs, nameEn, slug: providedSlug } = parsed.data;

  // Resolve slug: auto-generate with collision handling
  const baseSlug = providedSlug ? providedSlug : toSlug(nameEs);

  let candidate = baseSlug;
  let suffix = 2;
  while (true) {
    const existing = await deps.repo.findBySlug(candidate);
    if (!existing) break;
    // If explicit slug was provided and it collides — reject immediately
    if (providedSlug) return err('DUPLICATE_SLUG');
    candidate = `${baseSlug}-${suffix++}`;
  }

  const category = await deps.repo.create({ slug: candidate, nameEs, nameEn });
  return ok(category);
}
