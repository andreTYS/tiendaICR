export class ProjectNotFoundError extends Error {
  constructor(slug: string) {
    super(`Project not found: ${slug}`);
    this.name = 'ProjectNotFoundError';
  }
}

export class DuplicateProjectSlugError extends Error {
  constructor(slug: string) {
    super(`Project slug already exists: ${slug}`);
    this.name = 'DuplicateProjectSlugError';
  }
}

export class CategoryNotFoundError extends Error {
  constructor(categoryId: string) {
    super(`Category not found: ${categoryId}`);
    this.name = 'CategoryNotFoundError';
  }
}
