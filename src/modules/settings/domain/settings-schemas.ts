import { z } from 'zod';

export const UpdateSettingsSchema = z.object({
  heroDisplayMode: z
    .enum(['banners-only', 'banners-over-animation', 'animation-only'])
    .optional(),
  maxActiveBanners: z.number().int().min(0).optional(),
  animIntensity: z.number().min(0).max(5).optional(),
  defaultLocale: z.enum(['es', 'en']).optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
