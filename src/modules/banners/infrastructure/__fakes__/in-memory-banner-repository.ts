import type { Banner, BannerData } from '../../domain/banner';
import type { BannerRepository } from '../../domain/banner-repository';

let idCounter = 1;

export class InMemoryBannerRepository implements BannerRepository {
  private banners: Banner[] = [];

  async create(data: BannerData): Promise<Banner> {
    const banner: Banner = {
      ...data,
      id: String(idCounter++),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.banners.push(banner);
    return { ...banner };
  }

  async update(id: string, data: Partial<BannerData>): Promise<Banner> {
    const index = this.banners.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Banner not found: ${id}`);
    this.banners[index] = { ...this.banners[index]!, ...data, updatedAt: new Date() };
    return { ...this.banners[index]! };
  }

  async delete(id: string): Promise<void> {
    this.banners = this.banners.filter((b) => b.id !== id);
  }

  async findById(id: string): Promise<Banner | null> {
    return this.banners.find((b) => b.id === id) ?? null;
  }

  async findActive(): Promise<Banner[]> {
    return this.banners
      .filter((b) => b.isActive)
      .sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime())
      .map((b) => ({ ...b }));
  }

  async findAll(): Promise<Banner[]> {
    return [...this.banners]
      .sort((a, b) => a.order - b.order)
      .map((b) => ({ ...b }));
  }

  async countActive(): Promise<number> {
    return this.banners.filter((b) => b.isActive).length;
  }

  async reorder(ids: string[]): Promise<void> {
    ids.forEach((id, index) => {
      const banner = this.banners.find((b) => b.id === id);
      if (banner) banner.order = index;
    });
  }

  /** Test helpers */
  seed(banner: Partial<Banner> & { titleEs: string; descEs: string; imageKey: string }): Banner {
    const b: Banner = {
      id: String(idCounter++),
      titleEs: banner.titleEs,
      titleEn: banner.titleEn,
      descEs: banner.descEs,
      descEn: banner.descEn,
      imageKey: banner.imageKey,
      ctaLabelEs: banner.ctaLabelEs,
      ctaLabelEn: banner.ctaLabelEn,
      ctaHref: banner.ctaHref,
      order: banner.order ?? 0,
      isActive: banner.isActive ?? false,
      createdAt: banner.createdAt ?? new Date(),
      updatedAt: banner.updatedAt ?? new Date(),
    };
    this.banners.push(b);
    return b;
  }

  clear(): void {
    this.banners = [];
  }
}
