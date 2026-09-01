import { z } from 'zod';

export const BannerCreateSchema = z.object({
  titleEs: z.string().min(1, { error: 'Title in Spanish is required' }),
  titleEn: z.string().optional(),
  descEs: z.string().min(1, { error: 'Description in Spanish is required' }),
  descEn: z.string().optional(),
  ctaLabelEs: z.string().optional(),
  ctaLabelEn: z.string().optional(),
  ctaHref: z.string().optional(),
  isActive: z.boolean().default(false),
});

export type BannerCreateInput = z.infer<typeof BannerCreateSchema>;

export const BannerUpdateSchema = BannerCreateSchema.partial();
export type BannerUpdateInput = z.infer<typeof BannerUpdateSchema>;

export const ReorderBannersSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});
export type ReorderBannersInput = z.infer<typeof ReorderBannersSchema>;
