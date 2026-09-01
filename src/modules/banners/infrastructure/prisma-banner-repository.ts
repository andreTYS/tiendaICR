import { prisma } from '@/shared/lib/prisma';
import type { BannerRepository } from '../domain/banner-repository';
import type { Banner, BannerData } from '../domain/banner';
import type { Banner as PrismaBanner } from '@prisma/client';

function toDomain(row: PrismaBanner): Banner {
  return {
    id: row.id,
    titleEs: row.titleEs,
    titleEn: row.titleEn ?? undefined,
    descEs: row.descEs,
    descEn: row.descEn ?? undefined,
    imageKey: row.imageKey,
    ctaLabelEs: row.ctaLabelEs ?? undefined,
    ctaLabelEn: row.ctaLabelEn ?? undefined,
    ctaHref: row.ctaHref ?? undefined,
    order: row.order,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const prismaBannerRepository: BannerRepository = {
  async create(data: BannerData): Promise<Banner> {
    const row = await prisma.banner.create({
      data: {
        titleEs: data.titleEs,
        titleEn: data.titleEn,
        descEs: data.descEs,
        descEn: data.descEn,
        imageKey: data.imageKey,
        ctaLabelEs: data.ctaLabelEs,
        ctaLabelEn: data.ctaLabelEn,
        ctaHref: data.ctaHref,
        order: data.order,
        isActive: data.isActive,
      },
    });
    return toDomain(row);
  },

  async update(id: string, data: Partial<BannerData>): Promise<Banner> {
    const row = await prisma.banner.update({
      where: { id },
      data: {
        ...(data.titleEs !== undefined && { titleEs: data.titleEs }),
        ...(data.titleEn !== undefined && { titleEn: data.titleEn }),
        ...(data.descEs !== undefined && { descEs: data.descEs }),
        ...(data.descEn !== undefined && { descEn: data.descEn }),
        ...(data.imageKey !== undefined && { imageKey: data.imageKey }),
        ...(data.ctaLabelEs !== undefined && { ctaLabelEs: data.ctaLabelEs }),
        ...(data.ctaLabelEn !== undefined && { ctaLabelEn: data.ctaLabelEn }),
        ...(data.ctaHref !== undefined && { ctaHref: data.ctaHref }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return toDomain(row);
  },

  async delete(id: string): Promise<void> {
    await prisma.banner.delete({ where: { id } });
  },

  async findById(id: string): Promise<Banner | null> {
    const row = await prisma.banner.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  },

  async findActive(): Promise<Banner[]> {
    const rows = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toDomain);
  },

  async findAll(): Promise<Banner[]> {
    const rows = await prisma.banner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toDomain);
  },

  async countActive(): Promise<number> {
    return prisma.banner.count({ where: { isActive: true } });
  },

  async reorder(ids: string[]): Promise<void> {
    // Use a transaction to update all orders atomically
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.banner.update({ where: { id }, data: { order: index } }),
      ),
    );
  },
};
