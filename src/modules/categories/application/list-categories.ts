import type { CategoryRepository } from '../domain/category-repository';
import type { Category } from '../domain/category';
import { ok, type Result } from '@/shared/lib/result';

export interface ListCategoriesDeps {
  repo: CategoryRepository;
}

export async function listCategories(
  deps: ListCategoriesDeps,
): Promise<Result<Category[], never>> {
  const categories = await deps.repo.findAll();
  return ok(categories);
}
