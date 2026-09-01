export interface Banner {
  id: string;
  titleEs: string;
  titleEn?: string;
  descEs: string;
  descEn?: string;
  imageKey: string;
  ctaLabelEs?: string;
  ctaLabelEn?: string;
  ctaHref?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BannerData = Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>;

export function createBannerData(input: {
  titleEs: string;
  titleEn?: string;
  descEs: string;
  descEn?: string;
  imageKey: string;
  ctaLabelEs?: string;
  ctaLabelEn?: string;
  ctaHref?: string;
  isActive?: boolean;
  order?: number;
}): BannerData {
  return {
    titleEs: input.titleEs,
    titleEn: input.titleEn,
    descEs: input.descEs,
    descEn: input.descEn,
    imageKey: input.imageKey,
    ctaLabelEs: input.ctaLabelEs,
    ctaLabelEn: input.ctaLabelEn,
    ctaHref: input.ctaHref,
    isActive: input.isActive ?? false,
    order: input.order ?? 0,
  };
}
