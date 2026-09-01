import { prisma } from '@/shared/lib/prisma';
import type { CategoryRepository } from '../domain/category-repository';
import type { Category, CategoryData } from '../domain/category';
import type { Category as PrismaCategory } from '@prisma/client';

function toDomain(row: PrismaCategory): Category {
  return {
    id: row.id,
    slug: row.slug,
    nameEs: row.nameEs,
    nameEn: row.nameEn ?? undefined,
  };
}

export const prismaCategoryRepository: CategoryRepository = {
  async create(data: CategoryData): Promise<Category> {
    const row = await prisma.category.create({
      data: { slug: data.slug, nameEs: data.nameEs, nameEn: data.nameEn },
    });
    return toDomain(row);
  },

  async update(id: string, data: Partial<CategoryData>): Promise<Category> {
    const row = await prisma.category.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.nameEs !== undefined && { nameEs: data.nameEs }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
      },
    });
    return toDomain(row);
  },

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  },

  async findById(id: string): Promise<Category | null> {
    const row = await prisma.category.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  },

  async findBySlug(slug: string): Promise<Category | null> {
    const row = await prisma.category.findUnique({ where: { slug } });
    return row ? toDomain(row) : null;
  },

  async findAll(): Promise<Category[]> {
    const rows = await prisma.category.findMany({ orderBy: { nameEs: 'asc' } });
    return rows.map(toDomain);
  },

  async countProjectsForCategory(categoryId: string): Promise<number> {
    return prisma.project.count({ where: { categoryId } });
  },
};
