import type { CategoryRepository } from '../domain/category-repository';
import type { Category } from '../domain/category';
import { ok, err, type Result } from '@/shared/lib/result';

export type GetCategoryError = 'NOT_FOUND';

export interface GetCategoryInput {
  id?: string;
  slug?: string;
}

export interface GetCategoryDeps {
  repo: CategoryRepository;
}

export async function getCategory(
  input: GetCategoryInput,
  deps: GetCategoryDeps,
): Promise<Result<Category, GetCategoryError>> {
  let category: Category | null = null;

  if (input.id) {
    category = await deps.repo.findById(input.id);
  } else if (input.slug) {
    category = await deps.repo.findBySlug(input.slug);
  }

  if (!category) return err('NOT_FOUND');
  return ok(category);
}
