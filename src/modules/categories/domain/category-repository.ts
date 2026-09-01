import type { Category, CategoryData } from './category';

export interface CategoryRepository {
  create(data: CategoryData): Promise<Category>;
  update(id: string, data: Partial<CategoryData>): Promise<Category>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  countProjectsForCategory(categoryId: string): Promise<number>;
}
