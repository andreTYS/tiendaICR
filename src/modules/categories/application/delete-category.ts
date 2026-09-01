import type { CategoryRepository } from '../domain/category-repository';
import { ok, err, type Result } from '@/shared/lib/result';

export type DeleteCategoryError = 'NOT_FOUND' | 'CATEGORY_IN_USE';

export interface DeleteCategoryInput {
  id: string;
}

export interface DeleteCategoryDeps {
  repo: CategoryRepository;
}

export async function deleteCategory(
  input: DeleteCategoryInput,
  deps: DeleteCategoryDeps,
): Promise<Result<void, DeleteCategoryError>> {
  const existing = await deps.repo.findById(input.id);
  if (!existing) return err('NOT_FOUND');

  const projectCount = await deps.repo.countProjectsForCategory(input.id);
  if (projectCount > 0) return err('CATEGORY_IN_USE');

  await deps.repo.delete(input.id);
  return ok(undefined);
}
