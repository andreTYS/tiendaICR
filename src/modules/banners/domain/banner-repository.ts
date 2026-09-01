import type { Banner, BannerData } from './banner';

export interface BannerRepository {
  create(data: BannerData): Promise<Banner>;
  update(id: string, data: Partial<BannerData>): Promise<Banner>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Banner | null>;
  findActive(): Promise<Banner[]>;
  findAll(): Promise<Banner[]>;
  countActive(): Promise<number>;
  reorder(ids: string[]): Promise<void>;
}
