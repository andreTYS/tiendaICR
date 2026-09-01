import type { Category, CategoryData } from '../../domain/category';
import type { CategoryRepository } from '../../domain/category-repository';

let idCounter = 1;

export class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Category[] = [];
  private projectCounts: Map<string, number> = new Map();

  async create(data: CategoryData): Promise<Category> {
    const category: Category = {
      ...data,
      id: String(idCounter++),
    };
    this.categories.push(category);
    return { ...category };
  }

  async update(id: string, data: Partial<CategoryData>): Promise<Category> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Category not found: ${id}`);
    this.categories[index] = { ...this.categories[index]!, ...data };
    return { ...this.categories[index]! };
  }

  async delete(id: string): Promise<void> {
    this.categories = this.categories.filter((c) => c.id !== id);
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.find((c) => c.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categories.find((c) => c.slug === slug) ?? null;
  }

  async findAll(): Promise<Category[]> {
    return [...this.categories].sort((a, b) => a.nameEs.localeCompare(b.nameEs));
  }

  async countProjectsForCategory(categoryId: string): Promise<number> {
    return this.projectCounts.get(categoryId) ?? 0;
  }

  /** Test helpers */
  seed(category: Partial<Category> & { nameEs: string; slug: string }): Category {
    const c: Category = {
      id: category.id ?? String(idCounter++),
      slug: category.slug,
      nameEs: category.nameEs,
      nameEn: category.nameEn,
    };
    this.categories.push(c);
    return c;
  }

  setProjectCount(categoryId: string, count: number): void {
    this.projectCounts.set(categoryId, count);
  }

  clear(): void {
    this.categories = [];
    this.projectCounts.clear();
  }
}
