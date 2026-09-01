import { prisma } from '@/shared/lib/prisma';
import type { ProjectRepository } from '../domain/project-repository';
import type { Project, ProjectData } from '../domain/project';
import type { ProjectImage, ProjectImageData } from '../domain/project-image';
import type {
  Project as PrismaProject,
  ProjectImage as PrismaProjectImage,
  ProjectSlugAlias as PrismaAlias,
} from '@prisma/client';

type PrismaProjectWithRelations = PrismaProject & { images: PrismaProjectImage[] };

function imageToDomain(row: PrismaProjectImage): ProjectImage {
  return {
    id: row.id,
    projectId: row.projectId,
    imageKey: row.imageKey,
    alt: row.alt ?? undefined,
    order: row.order,
  };
}

function toDomain(row: PrismaProjectWithRelations): Project {
  return {
    id: row.id,
    slug: row.slug,
    titleEs: row.titleEs,
    titleEn: row.titleEn ?? undefined,
    descEs: row.descEs,
    descEn: row.descEn ?? undefined,
    location: row.location ?? undefined,
    categoryId: row.categoryId,
    mainImageKey: row.mainImageKey,
    order: row.order,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    images: row.images.map(imageToDomain).sort((a, b) => a.order - b.order),
  };
}

const include = { images: { orderBy: { order: 'asc' as const } } };

export const prismaProjectRepository: ProjectRepository = {
  async create(data: ProjectData): Promise<Project> {
    const row = await prisma.project.create({
      data: {
        slug: data.slug,
        titleEs: data.titleEs,
        titleEn: data.titleEn,
        descEs: data.descEs,
        descEn: data.descEn,
        location: data.location,
        categoryId: data.categoryId,
        mainImageKey: data.mainImageKey,
        order: data.order,
        isActive: data.isActive,
      },
      include,
    });
    return toDomain(row);
  },

  async update(id: string, data: Partial<ProjectData>): Promise<Project> {
    const row = await prisma.project.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.titleEs !== undefined && { titleEs: data.titleEs }),
        ...(data.titleEn !== undefined && { titleEn: data.titleEn }),
        ...(data.descEs !== undefined && { descEs: data.descEs }),
        ...(data.descEn !== undefined && { descEn: data.descEn }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.mainImageKey !== undefined && { mainImageKey: data.mainImageKey }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include,
    });
    return toDomain(row);
  },

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  },

  async findById(id: string): Promise<Project | null> {
    const row = await prisma.project.findUnique({ where: { id }, include });
    return row ? toDomain(row) : null;
  },

  async findBySlug(slug: string): Promise<Project | null> {
    const row = await prisma.project.findUnique({ where: { slug }, include });
    return row ? toDomain(row) : null;
  },

  async findActive(categoryId?: string): Promise<Project[]> {
    const rows = await prisma.project.findMany({
      where: { isActive: true, ...(categoryId && { categoryId }) },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include,
    });
    return rows.map(toDomain);
  },

  async findAll(): Promise<Project[]> {
    const rows = await prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include,
    });
    return rows.map(toDomain);
  },

  async reorder(ids: string[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.project.update({ where: { id }, data: { order: index } }),
      ),
    );
  },

  async addImage(projectId: string, data: Omit<ProjectImageData, 'projectId'>): Promise<ProjectImage> {
    const row = await prisma.projectImage.create({
      data: { projectId, imageKey: data.imageKey, alt: data.alt, order: data.order },
    });
    return imageToDomain(row);
  },

  async removeImage(imageId: string): Promise<void> {
    await prisma.projectImage.delete({ where: { id: imageId } });
  },

  async reorderImages(projectId: string, imageIds: string[]): Promise<void> {
    await prisma.$transaction(
      imageIds.map((id, index) =>
        prisma.projectImage.update({ where: { id, projectId }, data: { order: index } }),
      ),
    );
  },

  async findAliasBySlug(alias: string): Promise<{ currentSlug: string } | null> {
    const row = await prisma.projectSlugAlias.findUnique({
      where: { alias },
      include: { project: { select: { slug: true } } },
    });
    if (!row) return null;
    return { currentSlug: row.project.slug };
  },

  async createAlias(alias: string, projectId: string): Promise<void> {
    await prisma.projectSlugAlias.upsert({
      where: { alias },
      update: { projectId },
      create: { alias, projectId },
    });
  },

  async deleteAliasesByProjectId(projectId: string): Promise<void> {
    await prisma.projectSlugAlias.deleteMany({ where: { projectId } });
  },
};
