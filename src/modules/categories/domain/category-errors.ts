export class CategoryNotFoundError extends Error {
  constructor(id: string) {
    super(`Category not found: ${id}`);
    this.name = 'CategoryNotFoundError';
  }
}

export class CategoryInUseError extends Error {
  constructor(id: string, projectCount: number) {
    super(`Category ${id} is in use by ${projectCount} project(s)`);
    this.name = 'CategoryInUseError';
  }
}

export class DuplicateCategorySlugError extends Error {
  constructor(slug: string) {
    super(`Category slug already exists: ${slug}`);
    this.name = 'DuplicateCategorySlugError';
  }
}
